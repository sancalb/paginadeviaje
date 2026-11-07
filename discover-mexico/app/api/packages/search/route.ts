import {
  ApiError,
  checkOrigin,
  failure,
  json,
  readJson,
} from "../../../../lib/server/http";
import {
  packageSearchSchema,
  searchPackages,
} from "../../../../lib/server/packages";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkOrigin(request, process.env.APP_ORIGIN);
    const parsed = packageSearchSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(422, "PACKAGE_SEARCH_INVALID");
    return json(await searchPackages(parsed.data));
  } catch (error) {
    return failure(error);
  }
}
