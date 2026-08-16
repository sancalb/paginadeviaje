import { refreshGoogleReviewsCache } from "../lib/google-reviews.mjs";

const simulateError = process.argv.includes("--simulate-error");

refreshGoogleReviewsCache({ simulateError })
  .then((data) => {
    console.log(`Google reviews cache updated at ${data.updatedAt}`);
    Object.entries(data.branches || {}).forEach(([key, branch]) => {
      const label = branch.name || key;
      const reviews = Array.isArray(branch.reviews) ? branch.reviews.length : 0;
      console.log(`${label}: ${reviews} resenas normalizadas`);
    });
    if (data.importReport) {
      console.log(JSON.stringify(data.importReport, null, 2));
    }
  })
  .catch((error) => {
    console.error(error.message);
    if (error.details) {
      console.error(JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  });
