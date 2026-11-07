import credits from "../../data/image-credits.json";
export function GET() {
  return Response.json(credits);
}
