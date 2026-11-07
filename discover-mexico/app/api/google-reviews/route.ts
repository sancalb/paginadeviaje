import { failure, json } from "../../../lib/server/http";
import {
  getReviews,
  REVIEW_REVALIDATE_SECONDS,
} from "../../../lib/server/reviews";

export const runtime = "nodejs";
export const revalidate = 604800;
export const dynamic = "force-static";

export async function GET() {
  try {
    const reviews = await getReviews();
    return json(reviews, 200, {
      "Cache-Control": `public, max-age=0, s-maxage=${REVIEW_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    });
  } catch (error) {
    return failure(error);
  }
}
