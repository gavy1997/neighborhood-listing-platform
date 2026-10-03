import { z } from "zod";

export const PropertySchema = z.object({
  bathrooms: z.number().min(0),
  square_feet: z.number().positive(),
  amenities: z.array(z.string()),
  local_sponsors: z.array(
    z.object({
      sponsor_id: z.string().uuid(),
    })
  ),
});

export function parsePropertyPayload(data: unknown) {
  return PropertySchema.parse(data);
}