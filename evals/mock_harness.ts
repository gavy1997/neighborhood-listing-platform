// evals/mock_harness.ts
// Local Schema Validation & Mock Tool Execution Harness for Lab 10

export type ToolCallRequest = {
    name: string;
    arguments: Record<string, unknown>;
    simulateFault?: "EMPTY" | "TIMEOUT";
  };
  
  export type HarnessResult = {
    status: "SUCCESS" | "REJECTED_BEFORE_EXECUTION" | "TOOL_FAULT";
    tool_name: string;
    validation_errors?: string[];
    data?: unknown;
  };
  
  // Approved Fictional Dataset (Oakridge Residences)
  const MOCK_PROPERTIES: Record<string, Record<string, unknown>> = {
    "PROP-101": {
      property_id: "PROP-101",
      address: "742 Maple Grove Ct, Austin, TX 78704",
      monthly_rent: 2450,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1180,
      available_date: "2026-12-01",
      pet_policy: "Up to 2 pets allowed; $350 refundable deposit and $35/mo pet rent.",
      hoa_fee_tenant: 0,
      quiet_hours: "10:00 PM to 7:00 AM",
    },
  };
  
  const MOCK_SPONSORS_BY_ZIP: Record<string, Array<Record<string, unknown>>> = {
    "78704": [
      {
        name: "Bluebonnet Local Movers",
        category: "moving",
        sponsored: true,
        disclosure: "Paid sponsor partner; optional $50 off local moves of 3+ hours.",
        phone: "555-0148",
      },
      {
        name: "South Congress Fiber & Power",
        category: "utilities",
        sponsored: true,
        disclosure: "Paid sponsor partner; waived $40 setup fee for new residents.",
        phone: "555-0192",
      },
    ],
  };
  
  // Strict Argument Validators
  function validateGetPropertyDetails(args: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const allowedKeys = new Set(["property_id", "address"]);
  
    for (const key of Object.keys(args)) {
      if (!allowedKeys.has(key)) {
        errors.push(`$.${key}: unexpected property is not allowed.`);
      }
    }
  
    const hasId = typeof args.property_id === "string" && args.property_id.trim().length > 0;
    const hasAddress = typeof args.address === "string" && args.address.trim().length > 0;
  
    if (!hasId && !hasAddress) {
      errors.push("Must provide a non-empty 'property_id' or 'address'.");
    }
    if (hasId && !/^PROP-\d{3}$/.test(args.property_id as string)) {
      errors.push(`$.property_id: '${args.property_id}' must match pattern '^PROP-\\d{3}$'.`);
    }
  
    return errors;
  }
  
  function validateGetNearbySponsors(args: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const allowedKeys = new Set(["zip_code", "category"]);
    const allowedCategories = new Set(["moving", "utilities", "mortgage", "cleaning"]);
  
    for (const key of Object.keys(args)) {
      if (!allowedKeys.has(key)) {
        errors.push(`$.${key}: unexpected property is not allowed (check casing/schema).`);
      }
    }
  
    if (typeof args.zip_code !== "string" || !/^[0-9]{5}$/.test(args.zip_code)) {
      errors.push(`$.zip_code: '${String(args.zip_code)}' must be a 5-digit US ZIP code.`);
    }
  
    if (args.category !== undefined) {
      if (typeof args.category !== "string" || !allowedCategories.has(args.category)) {
        errors.push(
          `$.category: '${String(args.category)}' must be one of [moving, utilities, mortgage, cleaning].`
        );
      }
    }
  
    return errors;
  }
  
  function validateRequestAgentFollowup(args: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const allowedKeys = new Set(["caller_name", "callback_phone", "reason", "caller_consent"]);
  
    for (const key of Object.keys(args)) {
      if (!allowedKeys.has(key)) {
        errors.push(`$.${key}: unexpected property is not allowed.`);
      }
    }
  
    if (args.caller_consent !== true) {
      errors.push("$.caller_consent: explicit boolean true consent is required before scheduling callback.");
    }
    if (typeof args.callback_phone !== "string" || !/^\d{3}-\d{4}$|^\(\d{3}\)\s?\d{3}-\d{4}$/.test(args.callback_phone)) {
      errors.push("$.callback_phone: valid phone format required.");
    }
    if (typeof args.reason !== "string" || args.reason.trim().length < 3) {
      errors.push("$.reason: non-empty reason is required.");
    }
  
    return errors;
  }
  
  // Main Dispatcher
  export function executeMockTool(request: ToolCallRequest): HarnessResult {
    let errors: string[] = [];
  
    switch (request.name) {
      case "get_property_details":
        errors = validateGetPropertyDetails(request.arguments);
        break;
      case "get_nearby_sponsors":
        errors = validateGetNearbySponsors(request.arguments);
        break;
      case "request_agent_followup":
        errors = validateRequestAgentFollowup(request.arguments);
        break;
      default:
        return {
          status: "REJECTED_BEFORE_EXECUTION",
          tool_name: request.name,
          validation_errors: [`Unknown tool '${request.name}' is not declared in schema.`],
        };
    }
  
    if (errors.length > 0) {
      return {
        status: "REJECTED_BEFORE_EXECUTION",
        tool_name: request.name,
        validation_errors: errors,
      };
    }
  
    // Simulated Fault Injection
    if (request.simulateFault === "TIMEOUT") {
      return {
        status: "TOOL_FAULT",
        tool_name: request.name,
        data: { error: "UPSTREAM_TIMEOUT", message: "Database lookup timed out after 3000ms." },
      };
    }
    if (request.simulateFault === "EMPTY") {
      return {
        status: "SUCCESS",
        tool_name: request.name,
        data: { results: [] },
      };
    }
  
    // Valid Mock Execution
    if (request.name === "get_property_details") {
      const id = request.arguments.property_id as string;
      const match = MOCK_PROPERTIES[id] ?? null;
      return {
        status: "SUCCESS",
        tool_name: request.name,
        data: match ? { results: [match] } : { results: [] },
      };
    }
  
    if (request.name === "get_nearby_sponsors") {
      const zip = request.arguments.zip_code as string;
      const category = request.arguments.category as string | undefined;
      const allSponsors = MOCK_SPONSORS_BY_ZIP[zip] ?? [];
      const filtered = category
        ? allSponsors.filter((s) => s.category === category)
        : allSponsors;
  
      return {
        status: "SUCCESS",
        tool_name: request.name,
        data: { zip_code: zip, sponsors: filtered },
      };
    }
  
    return {
      status: "SUCCESS",
      tool_name: request.name,
      data: {
        queued: true,
        ticket_id: "FOLLOWUP-8841",
        message: "Callback request logged for human leasing agent.",
      },
    };
  }
  
  // Smoke Test Runner
  const testCases: ToolCallRequest[] = [
    { name: "get_property_details", arguments: { property_id: "PROP-101" } },
    { name: "get_nearby_sponsors", arguments: { Category: "moving" } },
    { name: "get_nearby_sponsors", arguments: { zip_code: "78704", category: "moving" } },
    { name: "get_property_details", arguments: { property_id: "PROP-101" }, simulateFault: "EMPTY" },
    { name: "request_agent_followup", arguments: { callback_phone: "555-0199", reason: "Tour", caller_consent: false } },
  ];
  
  console.log("=== Lab 10 Mock Harness Validation Output ===");
  for (const tc of testCases) {
    console.log("\nInput:", JSON.stringify(tc));
    console.log("Output:", JSON.stringify(executeMockTool(tc), null, 2));
  }