/**
 * Cashclinic API — provisional doctor-report generation
 *
 * Routes:
 *   POST /generate   Public. Accepts intake text (+ optional document text) and
 *                    returns a structured provisional report via Anthropic.
 *   GET  /health     Unauthenticated liveness check.
 *   GET  /status     Returns mode info (does not expose secrets).
 *
 * Secret: ANTHROPIC_API_KEY
 */

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGIN: string;
}

const MAX_BODY_BYTES = 200 * 1024; // 200 KB

const SYSTEM_PROMPT = `You are a clinical documentation assistant for a PROTOTYPE cash-only telemedicine intake system (Cashclinic).

Your job: turn messy patient-provided history into a structured report for RAPID physician review of EASY / cookie-cutter encounters only.

Rules:
1. Do NOT invent symptoms, diagnoses, medications, allergies, or labs not supported by the input.
2. If information is missing, list it under "Gaps / Clarifications Needed" — never fill gaps with assumptions.
3. Mark every clinical interpretation as PROVISIONAL — physician must review before any care decision.
4. Prefer plain clinical language a physician can scan in under 60 seconds.
5. This is a processing layer only; you are not the medical record of truth.
6. If the case appears complex, high-risk, emergency, or not cookie-cutter, say so clearly under "Triage / Complexity".

Output EXACTLY this Markdown structure:

# Cashclinic Intake Report (PROVISIONAL)

## Patient-provided summary
(1–3 sentences)

## Chief concern
...

## History of present illness
...

## Relevant history (as stated)
- Past medical:
- Medications:
- Allergies:
- Social / other:

## Extracted entities (from input only)
- Symptoms:
- Medications mentioned:
- Conditions mentioned:
- Other:

## Gaps / Clarifications Needed
- ...

## Provisional considerations for physician (NOT a diagnosis)
- ...

## Suggested next steps for physician workflow (NOT orders)
- ...

## Triage / Complexity
(easy cookie-cutter | needs more info | escalate / in-person recommended)

## Disclaimer
Provisional AI-assisted draft for physician review only. Not medical advice. Not a medical record of truth. Processing layer only — durable storage is the physician's HIPAA-compliant system.`;

function corsHeaders(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = env.ALLOWED_ORIGIN || "https://statecraft.systems";
  const allowed =
    origin === allow ||
    origin === "https://www.statecraft.systems" ||
    origin.endsWith(".pages.dev") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  return {
    "Access-Control-Allow-Origin": allowed ? origin || allow : allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function sanitize(s: unknown, max = 40000): string {
  if (typeof s !== "string") return "";
  return s.slice(0, max).trim();
}

async function callAnthropic(apiKey: string, userContent: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${t.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return data.content?.map((c) => c.text || "").join("\n") || "";
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(env, req);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health") {
      return json(200, { ok: true, service: "cashclinic-api" }, cors);
    }

    if (url.pathname === "/status") {
      return json(
        200,
        {
          mode: env.ANTHROPIC_API_KEY ? "anthropic" : "unavailable",
          service: "cashclinic-api",
        },
        cors
      );
    }

    if (url.pathname === "/generate" && req.method === "POST") {
      const len = Number(req.headers.get("Content-Length") ?? "0");
      if (len > MAX_BODY_BYTES) {
        return json(413, { error: "payload too large" }, cors);
      }

      if (!env.ANTHROPIC_API_KEY) {
        return json(503, { error: "ANTHROPIC_API_KEY not configured" }, cors);
      }

      let body: {
        chiefConcern?: string;
        freeText?: string;
        documentText?: string;
        documentName?: string;
      };
      try {
        body = (await req.json()) as typeof body;
      } catch {
        return json(400, { error: "invalid json" }, cors);
      }

      const chiefConcern = sanitize(body.chiefConcern, 500);
      const freeText = sanitize(body.freeText, 40000);
      const documentText = sanitize(body.documentText, 40000);
      const documentName = sanitize(body.documentName, 200);

      if (!chiefConcern && !freeText && !documentText) {
        return json(400, { error: "Provide free text, chief concern, or document text." }, cors);
      }

      const userContent = [
        chiefConcern ? `Chief concern (patient form field): ${chiefConcern}` : "",
        freeText ? `Patient free-text history:\n${freeText}` : "",
        documentText
          ? `Attached document (${documentName || "upload"}):\n${documentText}`
          : "",
        "Generate the structured provisional report now.",
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const report = await callAnthropic(env.ANTHROPIC_API_KEY, userContent);
        return json(
          200,
          {
            mode: "anthropic",
            report,
            generatedAt: new Date().toISOString(),
            note: "Processing layer only. Not stored as medical record. Download for local use / physician review.",
          },
          cors
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        return json(500, { error: message }, cors);
      }
    }

    return json(404, { error: "not found" }, cors);
  },
};
