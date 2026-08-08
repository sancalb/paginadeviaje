import { refreshGoogleReviewsCache } from "../lib/google-reviews.mjs";

const simulateError = process.argv.includes("--simulate-error");

refreshGoogleReviewsCache({ simulateError })
  .then((data) => {
    console.log(`Google reviews cache updated at ${data.updatedAt}`);
  })
  .catch((error) => {
    console.error(error.message);
    if (error.details) {
      console.error(JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  });

