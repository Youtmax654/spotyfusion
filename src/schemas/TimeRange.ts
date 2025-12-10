import z from "zod";

export const statsSearchSchema = z.object({
  range: z.enum(["short_term", "medium_term", "long_term"]).default("short_term"),
});

export type TimeRangeType = z.infer<typeof statsSearchSchema>["range"];
