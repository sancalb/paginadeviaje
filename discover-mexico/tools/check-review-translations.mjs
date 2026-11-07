// Run from Discover: node --experimental-strip-types --import ./lib/server/tests/register.mjs tools/check-review-translations.mjs --audit
import { open, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { destinations } from "../data/content.ts";
import { getReviews } from "../lib/server/reviews.ts";
import {
  attachReviewTranslation,
  loadReviewTranslations,
  reviewSourceTextHash,
  reviewTranslationId,
} from "../lib/server/review-translations.ts";

const root = fileURLToPath(new URL("../", import.meta.url));

/** Execute the actual selector, not a separately maintained approximate copy. */
export async function createHomeReviewSelector() {
  const source = await readFile(resolve(root, "components/reviews.tsx"), "utf8");
  const ast = ts.createSourceFile("reviews.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ["safeUrl", "normalize", "destinationMatchers", "matchDestination", "combineReviews"];
  const nodes = ast.statements.filter((node) =>
    ts.isFunctionDeclaration(node)
      ? names.includes(node.name?.text)
      : ts.isVariableStatement(node) && node.declarationList.declarations.some(
        (declaration) => names.includes(declaration.name.getText(ast)),
      ),
  );
  if (nodes.length !== names.length || ast.parseDiagnostics.length)
    throw new Error("SELECTOR_UNAVAILABLE");
  const js = ts.transpileModule(nodes.map((node) => node.getText(ast)).join("\n"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return runInNewContext(`${js}\n;combineReviews;`, { destinations, URL }, { timeout: 1000 });
}

async function readBoundedJson(path, limit) {
  const file = await open(path, "r");
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > limit) throw new Error("AUDIT_INPUT_INVALID");
    const chunks = [];
    let size = 0;
    for (;;) {
      const buffer = Buffer.alloc(Math.min(65536, limit + 1 - size));
      const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      size += bytesRead;
      if (size > limit) throw new Error("AUDIT_INPUT_INVALID");
      chunks.push(buffer.subarray(0, bytesRead));
    }
    const bytes = Buffer.concat(chunks);
    return { data: JSON.parse(bytes.toString("utf8")), sha256: reviewSourceTextHash(bytes.toString("utf8")) };
  } finally {
    await file.close();
  }
}

/** Reports counts only, never reviews, author identities, URLs, contacts or paths. */
export async function auditReviewTranslations({
  cachePath = resolve(root, "../storage/google-reviews-cache.json"),
  translationsPath = process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH || resolve(root, "data/review-translations.json"),
} = {}) {
  const snapshot = await readBoundedJson(cachePath, 4 * 1024 * 1024);
  const translations = await loadReviewTranslations(translationsPath);
  const cacheReviews = Object.values(snapshot.data.branches).flatMap((branch) => branch.reviews || []);
  // The publication schema and config order matter, not just the raw cache order.
  // Supply the snapshot once and an empty service env so this audit never fetches.
  const published = await getReviews({
    env: {
      GOOGLE_REVIEWS_CACHE_PATH: cachePath,
      GOOGLE_REVIEWS_CONFIG_PATH: resolve(root, "../config/google-reviews-branches.json"),
    },
    translations: {},
    readFile: async (path, limit) => resolve(path) === resolve(cachePath)
      ? snapshot.data
      : (await readBoundedJson(path, limit)).data,
    transport: async () => { throw new Error("AUDIT_NETWORK_FORBIDDEN"); },
  });
  const select = await createHomeReviewSelector();
  const home = select(published.branches);
  const matches = (review) => Boolean(attachReviewTranslation(review, translations).translation);
  const homeTranslated = home.filter(matches).length;
  const cacheTranslated = cacheReviews.filter(matches).length;
  const homeIds = new Set(home.map(reviewTranslationId));
  const matchedIds = new Set(cacheReviews.filter(matches).map(reviewTranslationId));
  const ids = Object.keys(translations);
  return {
    cache: {
      sha256: snapshot.sha256,
      total: cacheReviews.length,
      withText: cacheReviews.filter((review) => review.text?.trim()).length,
      translated: cacheTranslated,
      originalFallback: cacheReviews.length - cacheTranslated,
    },
    home: {
      selected: home.length,
      mexicoPrioritized: home.filter((review) => review.mexico).length,
      translated: homeTranslated,
      originalFallback: home.length - homeTranslated,
    },
    records: {
      total: ids.length,
      matchedInCache: ids.filter((id) => matchedIds.has(id)).length,
      unmatched: ids.filter((id) => !matchedIds.has(id)).length,
      outsideHome: ids.filter((id) => !homeIds.has(id)).length,
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3 || process.argv[2] !== "--audit") {
    console.error("Usage: node --experimental-strip-types --import ./lib/server/tests/register.mjs tools/check-review-translations.mjs --audit");
    process.exitCode = 2;
  } else {
    try {
      const result = await auditReviewTranslations();
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.home.selected === 10 && result.home.translated === 10 &&
        result.records.total === 10 && result.records.unmatched === 0 &&
        result.records.outsideHome === 0 ? 0 : 1;
    } catch {
      console.error("REVIEW_TRANSLATIONS_AUDIT_FAILED");
      process.exitCode = 1;
    }
  }
}
