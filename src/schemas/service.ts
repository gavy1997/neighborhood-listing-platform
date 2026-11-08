import { z } from 'zod';

export const serviceContractSchema = z.object({
  title: z.string(),
  hourly_rate: z.number(),
  duration_minutes: z.number(),
  coverage_radius_miles: z.number(),
});

export type ServiceContract = z.infer<typeof serviceContractSchema>;
