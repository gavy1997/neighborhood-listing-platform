import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, { message: 'Title must be at least 5 characters long' }),
  hourly_rate: z
    .number({ required_error: 'Hourly rate is required' })
    .min(0, { message: 'Hourly rate must be non-negative' }),
  duration_minutes: z
    .number({ required_error: 'Duration is required' })
    .int({ message: 'Duration must be a whole number' })
    .min(15, { message: 'Minimum service duration is 15 minutes' }),
  coverage_radius_miles: z
    .number({ required_error: 'Coverage radius is required' })
    .int({ message: 'Coverage radius must be an integer' })
    .positive({ message: 'Coverage radius must be greater than 0' }),
}).strict(); // Strictly reject unallowed keys

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

import { z } from 'zod';

export const serviceContractSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }),
  hourly_rate: z.number().min(0, { message: "Hourly rate cannot be negative." }),
  duration_minutes: z.number().int().min(15, { message: "Duration must be an integer of at least 15 minutes." }),
  coverage_radius_miles: z.number().int().positive({ message: "Coverage radius must be a positive integer." }),
  status: z.enum(['draft', 'pending', 'approved', 'suspended']).optional().default('draft')
}).strict(); // Strictly disallows unrecognized extra properties

export type ServiceContractInput = z.infer<typeof serviceContractSchema>;