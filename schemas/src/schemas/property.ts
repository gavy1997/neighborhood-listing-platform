import { z } from "zod";

export const PropertySchema = z.object({
  property_id: z.string().uuid(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/),
  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  square_feet: z.number().int().nonnegative(),
  amenities: z.array(z.string().min(1)),
  local_sponsors: z.array(
    z.object({
      sponsor_id: z.string().uuid(),
      name: z.string().min(1),
    })
  ),
});

export type Property = z.infer<typeof PropertySchema>;