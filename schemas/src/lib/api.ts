import { PropertySchema, PropertyListing } from "../schemas/property";

// Unsafe fetch example (for demonstration / assignment submission)
export async function fetchPropertyUnsafe(id: string): Promise<PropertyListing> {
  const response = await fetch(`/api/properties/${id}`);
  const rawData = await response.json();
  return rawData as PropertyListing; // Unsafe assertion
}

// Safe boundary defense example
export function parsePropertyPayload(input: unknown): PropertyListing {
  const result = PropertySchema.safeParse(input);

  if (!result.success) {
    console.error("Payload rejected at boundary:", result.error.format());
    throw new Error("Validation Failed: Invalid property payload");
  }

  return result.data as PropertyListing;
}