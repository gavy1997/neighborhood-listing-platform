import { describe, expect, test } from 'vitest'
import { parsePropertyPayload } from '../lib/api'

describe('Boundary Defense - parsePropertyPayload', () => {
  test('passes validation with valid property data', () => {
    const validPayload = {
      bathrooms: 2,
      square_feet: 1200,
      amenities: ['parking', 'pool'],
      local_sponsors: [
        { sponsor_id: '123e4567-e89b-12d3-a456-426614174000' },
      ],
    }

    const result = parsePropertyPayload(validPayload)
    expect(result).toEqual(validPayload)
  })

  test('rejects a payload missing amenities', () => {
    const payloadExampleA = {
      bathrooms: 2,
      square_feet: 1200,
      local_sponsors: [],
    }

    expect(() => parsePropertyPayload(payloadExampleA)).toThrow()
  })

  test('rejects invalid values and sponsor ID', () => {
    const payloadExampleB = {
      bathrooms: -3,
      square_feet: -500,
      amenities: [''],
      local_sponsors: [{ sponsor_id: 'not-a-valid-uuid' }],
    }

    expect(() => parsePropertyPayload(payloadExampleB)).toThrow()
  })
})