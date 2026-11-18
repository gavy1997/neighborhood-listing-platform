import { z } from 'zod'

export const ServiceCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().optional(),
  location: z.string().optional(),
})

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>
