import { z } from "zod";

export const pageNumber = z.number().int().min(1);
export const pageSize = z.number().int().min(1).max(100);
export const sortDirection = z.enum(["asc", "desc"]);
export const platform = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export const nonEmptyString = z.string().trim().min(1);
export const httpUrl = z.string().url().refine(value => /^https?:\/\//i.test(value), "Expected an HTTP or HTTPS URL");

// Range fields use several naming conventions in the upstream APIs.
export function validateRanges(params: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "number") continue;
    let upperKey: string | undefined;
    if (key.endsWith("_min")) upperKey = key.slice(0, -4) + "_max";
    else if (key.startsWith("min_")) upperKey = "max_" + key.slice(4);
    else if (key.endsWith("_start")) upperKey = key.slice(0, -6) + "_end";
    else if (key === "start_time") upperKey = "end_time";
    const upper = upperKey ? params[upperKey] : undefined;
    if (typeof upper === "number" && value > upper) {
      throw new Error(`${key} must be less than or equal to ${upperKey}`);
    }
  }
}
