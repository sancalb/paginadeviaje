import { refreshGoogleReviewsCache, googleReviewsImportLimits } from "../lib/google-reviews.mjs";

const simulateError = process.argv.includes("--simulate-error");

function argValue(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

const maxPages = argValue("max-pages") || undefined;
const maxReviewsPerBranch = argValue("max-reviews-per-branch") || undefined;
const limits = googleReviewsImportLimits({ maxPages, maxReviewsPerBranch });

refreshGoogleReviewsCache({ simulateError, ...limits })
  .then((data) => {
    console.log(`Google reviews cache imported at ${data.updatedAt}`);
    console.log(`Limits: ${limits.maxPages} pages, ${limits.maxReviewsPerBranch} reviews per branch`);
    console.log(JSON.stringify(data.importReport || {}, null, 2));
  })
  .catch((error) => {
    console.error(error.message);
    if (error.details) {
      console.error(JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  });
