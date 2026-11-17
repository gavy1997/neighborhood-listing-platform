import { isIP } from 'node:net'
import { z } from 'zod'

const blockedSuffixes = [
  '.localhost',
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.test',
  '.invalid',
  '.example',
  '.onion',
]

export const SponsorDestinationUrlSchema = z
  .string()
  .trim()
  .url()
  .superRefine((value, ctx) => {
    let url: URL

    try {
      url = new URL(value)
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Destination must be a public HTTPS URL.',
      })
      return
    }

    const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()

    const isLocalOrReservedHost =
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      blockedSuffixes.some((suffix) => hostname.endsWith(suffix)) ||
      !hostname.includes('.') ||
      hostname.endsWith('.')

    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.port !== '' ||
      isIP(hostname) !== 0 ||
      isLocalOrReservedHost
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Destination must be a public HTTPS URL.',
      })
    }
  })