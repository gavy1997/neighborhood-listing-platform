import { parsePropertyPayload } from "../lib/api.ts";
describe("Boundary Defense - parsePropertyPayload", () => {
  // Valid Payload Test
  test("passes validation with valid property data", () => {
    const validPayload = {
      bathrooms: 2,
      square_feet: 1200,
      amenities: ["parking", "pool"],
      local_sponsors: [
        {
          sponsor_id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Local Cafe",
        },
      ],
    };

    const result = parsePropertyPayload(validPayload);
    expect(result).toEqual(validPayload);
  });

  // Example A Test: Type Mismatch / Runtime Crash Risk
  test("rejects Example A payload due to missing amenities array (Type Mismatch)", () => {
    const payloadExampleA = {
      bathrooms: 2,
      square_feet: 1200,
      local_sponsors: [],
    };

    expect(() => parsePropertyPayload(payloadExampleA)).toThrow(
      "Validation Failed: Invalid property payload"
    );
  });

  // Example B Test: Domain/Business Invariant Violation
  test("rejects Example B payload due to negative numbers and invalid UUID (Domain Invariant)", () => {
    const payloadExampleB = {
      bathrooms: -3,
      square_feet: -500,
      amenities: [""],
      local_sponsors: [
        {
          sponsor_id: "not-a-valid-uuid",
          name: "",
        },
      ],
    };

    expect(() => parsePropertyPayload(payloadExampleB)).toThrow(
      "Validation Failed: Invalid property payload"
    );
  });
});