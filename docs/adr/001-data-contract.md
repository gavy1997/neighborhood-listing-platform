# ADR 001: Data Contract and Amenities Normalization

## Context
We need a robust data contract between AI-generated data, backend APIs, and React UI components for property listings. A key architectural decision is how to structure `amenities`.

## Decision
We choose **Controlled Values** for `amenities` within the schema runtime while allowing flexibility via join tables or lists in relational persistence.

## Alternatives Considered
1. **Free Text Strings**: Highly flexible for AI generation, but leads to UI inconsistency (e.g., "Air Conditioning" vs "AC" vs "central ac").
2. **Controlled Values/Enums**: Enforces UI consistency and allows predictable filtering, but requires AI prompt alignment.
3. **Normalized Join Table**: Ideal for relational database schemas, but adds overhead for lightweight client contract exchange.

## Consequences
- The JSON Schema & Zod schema enforce a strict enum list for `amenities` during contract exchange.
- Synthetic prompts must explicitly list accepted amenity enums.
- UI components can dependably map amenity tags to icons.