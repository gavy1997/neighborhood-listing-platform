import { z } from 'zod'

export const ServiceCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(2000),
    neighborhood: z.string().trim().min(1).max(120),
    coverage_radius_miles: z.number().finite().nonnegative(),
    price: z.number().finite().nonnegative(),
    category_ids: z.array(z.string().uuid()).min(1).max(10),
  })
  .strict()

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>