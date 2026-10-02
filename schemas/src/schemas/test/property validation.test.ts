import { PropertySchema } from "../src/schemas/property";

const validRecord = {
  property_id: "123e4567-e89b-12d3-a456-426614174000",
  street: "100 Main St",
  city: "Downey",
  state: "CA",
  zip_code: "90241",
  price: 500000,
  bedrooms: 2,
  bathrooms: 2,
  square_feet: 1200,
  amenities: ["Parking"],
  local_sponsors: []
};

describe("PropertySchema Validation", () => {
  it("passes for a valid record", () => {
    expect(PropertySchema.safeParse(validRecord).success).toBe(true);
  });

  it("fails when property_id is missing", () => {
    const { property_id, ...invalid } = validRecord;
    expect(PropertySchema.safeParse(invalid).success).toBe(false);
  });

  it("fails on negative price", () => {
    const invalid = { ...validRecord, price: -100 };
    expect(PropertySchema.safeParse(invalid).success).toBe(false);
  });

  it("fails on malformed ZIP code", () => {
    const invalid = { ...validRecord, zip_code: "9024" };
    expect(PropertySchema.safeParse(invalid).success).toBe(false);
  });

  it("fails when an unknown field is present (strict validation)", () => {
    const invalid = { ...validRecord, extra_field: "unexpected" };
    const StrictPropertySchema = PropertySchema.strict();
    expect(StrictPropertySchema.safeParse(invalid).success).toBe(false);
  });
});