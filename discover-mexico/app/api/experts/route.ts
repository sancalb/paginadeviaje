import { approvedExpertProfiles } from "../../../lib/server/experts";
import { json } from "../../../lib/server/http";

export const runtime = "nodejs";

export async function GET() {
  return json({ experts: await approvedExpertProfiles() });
}
