import { describe, expect, test } from 'vitest'
import { SponsorDestinationUrlSchema } from '../lib/sponsorUrl'

describe('Sponsor destination URL validation', () => {
  test('accepts a public HTTPS URL with a path and query', () => {
    expect(
      SponsorDestinationUrlSchema.safeParse(
        'https://sub.example.co.uk/community?source=sidebar',
      ).success,
    ).toBe(true)
  })

  test.each([
    'http://example.com',
    'javascript:alert(1)',
    'https://127.0.0.1',
    'https://[::1]/',
    'https://[::ffff:127.0.0.1]/',
    'https://2130706433/',
    'https://user:pass@example.com/',
    'https://example.com:8443/',
    'https://intranet/',
    'https://printer.local/',
    'https://server.internal/',
    'https://server.lan/',
    'https://server.home/',
    'https://server.corp/',
  ])('rejects unsafe URL: %s', (url) => {
    expect(SponsorDestinationUrlSchema.safeParse(url).success).toBe(false)
  })
})