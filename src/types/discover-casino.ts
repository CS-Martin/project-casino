import { z } from 'zod';

export const DiscoverCasinoSchema = z.object({
  state_abbreviation: z.string(),
  casinos: z.array(
    z.object({
      casino_name: z.string(),
      website: z.string(),
      license_status: z.enum(['active', 'pending', 'unknown']),
      source_url: z.string(),
    })
  ),
});

export type DiscoverCasino = z.infer<typeof DiscoverCasinoSchema>;
