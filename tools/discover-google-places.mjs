import { reviewBranches, searchInitialCandidates } from "../lib/google-reviews.mjs";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function scoreCandidate(branch, candidate) {
  let score = 0;
  const expectedPhone = normalizeDigits(branch.phone).slice(-10);
  const candidatePhone = normalizeDigits(candidate.phone).slice(-10);

  if (expectedPhone && candidatePhone && expectedPhone === candidatePhone) {
    score += 5;
  }

  const expectedAddress = normalizeText(branch.address);
  const candidateAddress = normalizeText(candidate.address);
  const addressTokens = expectedAddress
    .split(/[,\s]+/)
    .filter((token) => token.length >= 4)
    .slice(0, 10);

  for (const token of addressTokens) {
    if (candidateAddress.includes(token)) {
      score += 1;
    }
  }

  const expectedName = normalizeText(branch.expectedName);
  const candidateName = normalizeText(candidate.name);
  if (candidateName.includes("deviaje")) score += 3;
  if (branch.label && candidateName.includes(normalizeText(branch.label))) score += 2;
  if (expectedName && candidateName === expectedName) score += 3;
  if (candidate.kgmid === branch.kgmid) score += 8;

  return score;
}

async function main() {
  if (!process.env.SEARCHAPI_API_KEY) {
    throw new Error("SEARCHAPI_API_KEY is required to discover candidates.");
  }

  const engines = ["google_maps", "google_local"];

  for (const [branchKey, branch] of Object.entries(reviewBranches)) {
    const candidates = [];

    for (const engine of engines) {
      const results = await searchInitialCandidates(engine, branch.discoveryQuery);
      candidates.push(
        ...results.map((candidate) => ({
          ...candidate,
          engine,
          score: scoreCandidate(branch, candidate),
          phoneMatches:
            normalizeDigits(candidate.phone).slice(-10) === normalizeDigits(branch.phone).slice(-10),
          addressMatches: normalizeText(candidate.address).includes(normalizeText(branch.address).split(",")[0]),
        }))
      );
    }

    candidates.sort((a, b) => b.score - a.score);

    console.log(`\n${branch.label} (${branchKey})`);
    console.log(`Expected kgmid: ${branch.kgmid}`);
    console.table(
      candidates.slice(0, 8).map((candidate) => ({
        engine: candidate.engine,
        score: candidate.score,
        name: candidate.name,
        kgmid: candidate.kgmid,
        phone: candidate.phone,
        address: candidate.address,
        phoneMatches: candidate.phoneMatches,
        addressMatches: candidate.addressMatches,
      }))
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

