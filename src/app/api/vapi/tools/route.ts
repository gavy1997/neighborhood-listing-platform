import { NextRequest, NextResponse } from "next/server";
import { executeMockTool, type ToolCallRequest } from "../../../../../evals/mock_harness";

const MAX_BODY_BYTES = 16 * 1024;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.VAPI_TOOL_SECRET;
  if (!expected) return false;

  const headerSecret = req.headers.get("x-vapi-secret");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  return headerSecret === expected || bearerToken === expected;
}

function compactForSpeech(toolName: string, data: unknown): Record<string, unknown> {
  const record = (data ?? {}) as Record<string, unknown>;

  if (toolName === "get_property_details") {
    const results = Array.isArray(record.results) ? record.results : [];
    if (results.length === 0) {
      return { found: false, message: "No verified listing found for that property." };
    }
    const item = results[0] as Record<string, unknown>;
    return {
      found: true,
      property_id: item.property_id,
      address: item.address,
      rent_monthly: item.rent_monthly ?? item.rent,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      available: item.available ?? true,
    };
  }

  if (toolName === "get_nearby_sponsors") {
    const sponsors = Array.isArray(record.sponsors) ? record.sponsors : [];
    if (sponsors.length === 0) {
      return { found: false, message: "No approved sponsors found for that category and ZIP." };
    }
    const first = sponsors[0] as Record<string, unknown>;
    return {
      found: true,
      disclosure: "Paid sponsor partner",
      name: first.name,
      category: first.category,
      promo: first.promo ?? first.offer ?? null,
    };
  }

  if (toolName === "request_agent_followup") {
    return {
      queued: Boolean(record.queued),
      ticket_id: record.ticket_id,
      message: "Callback request logged for a human leasing agent.",
    };
  }

  return record;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
  }

  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  // Optional header/query fault injection for Step 13 failure testing
  const faultHeader = req.headers.get("x-simulate-fault");
  const simulateFault =
    faultHeader === "TIMEOUT" || faultHeader === "EMPTY" ? faultHeader : undefined;

  // Support both Vapi's message.toolCalls format and direct single-tool JSON calls
  const message = body.message as Record<string, unknown> | undefined;
  const vapiToolCalls = Array.isArray(message?.toolCalls) ? message.toolCalls : null;

  if (vapiToolCalls) {
    const results = vapiToolCalls.map((tc: Record<string, unknown>) => {
      const id = String(tc.id ?? "unknown");
      const fn = (tc.function ?? tc) as Record<string, unknown>;
      const name = String(fn.name ?? "");
      const rawArgs =
        typeof fn.arguments === "string"
          ? JSON.parse(fn.arguments)
          : ((fn.arguments ?? {}) as Record<string, unknown>);

      const harnessRes = executeMockTool({
        name,
        arguments: rawArgs,
        simulateFault,
      } as ToolCallRequest);

      if (harnessRes.status === "REJECTED_BEFORE_EXECUTION") {
        return {
          toolCallId: id,
          result: JSON.stringify({
            ok: false,
            error: "INVALID_ARGUMENTS",
            details: harnessRes.validation_errors,
          }),
        };
      }

      if (harnessRes.status === "TOOL_FAULT") {
        return {
          toolCallId: id,
          result: JSON.stringify({
            ok: false,
            error: "TOOL_UNAVAILABLE",
            message: "Lookup service temporarily unavailable.",
          }),
        };
      }

      return {
        toolCallId: id,
        result: JSON.stringify({
          ok: true,
          ...compactForSpeech(name, harnessRes.data),
        }),
      };
    });

    return NextResponse.json({ results }, { status: 200 });
  }

  // Direct call format (for curl/unit tests): { "name": "...", "arguments": { ... } }
  const name = typeof body.name === "string" ? body.name : "";
  const args = (body.arguments ?? {}) as Record<string, unknown>;
  const harnessRes = executeMockTool({
    name,
    arguments: args,
    simulateFault,
  } as ToolCallRequest);

  if (harnessRes.status === "REJECTED_BEFORE_EXECUTION") {
    return NextResponse.json(
      { ok: false, error: "INVALID_ARGUMENTS", details: harnessRes.validation_errors },
      { status: 400 }
    );
  }

  if (harnessRes.status === "TOOL_FAULT") {
    return NextResponse.json(
      { ok: false, error: "TOOL_UNAVAILABLE", message: "Lookup service temporarily unavailable." },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { ok: true, ...compactForSpeech(name, harnessRes.data) },
    { status: 200 }
  );
}