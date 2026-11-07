import { failure, json } from "../../../lib/server/http";
import { getPromotions } from "../../../lib/server/promotions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json({ promotions: await getPromotions() });
  } catch (error) {
    return failure(error);
  }
}
