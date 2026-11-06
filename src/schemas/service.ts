import { z } from 'zod';

export const serviceContractSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  hourly_rate: z.number({ invalid_type_error: "Hourly rate must be a number" }),
  duration_minutes: z.number({ invalid_type_error: "Duration must be a number" }),
  coverage_radius_miles: z.number({ invalid_type_error: "Coverage radius must be a number" }),
});

export type ServiceContract = z.infer<typeof serviceContractSchema>;