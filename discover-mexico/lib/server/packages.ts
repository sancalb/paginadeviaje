import { z } from "zod";
import { ApiError } from "./http";
import { isDay } from "./inquiry-schema";
import { occupancySchema } from "./pricing";

export const packageSearchSchema = z
  .object({
    origin: z.string().regex(/^[A-Z]{3}$/),
    destination: z.string().regex(/^[A-Z]{3}$/),
    start: z.string().refine(isDay),
    end: z.string().refine(isDay),
    occupancy: occupancySchema,
    currency: z.literal("USD"),
  })
  .strict()
  .refine((value) => value.end > value.start);

export type PackageSearch = z.infer<typeof packageSearchSchema>;

export async function searchPackages(_request: PackageSearch): Promise<never> {
  // The audited backend does not bind hotel occupancy or supply an FX/expiry/revalidation contract.
  // Do not forward visitors to it, even when a backend URL happens to be configured.
  throw new ApiError(503, "PACKAGE_BACKEND_CONTRACT_UNSAFE");
}

export async function revalidatePackage(): Promise<never> {
  throw new ApiError(503, "PACKAGE_REVALIDATION_NOT_CONNECTED");
}
