/**
 * Cashclinic API — provisional doctor-report generation (access-gated)
 *
 * Routes:
 *   POST /auth       Validate access password; returns ok if authorized.
 *   POST /generate   Requires Authorization: Bearer <ACCESS_PASSWORD>
 *   GET  /health     Unauthenticated liveness check.
 *   GET  /status     Public mode flag (auth_required: true).
 *
 * Secrets:
 *   ANTHROPIC_API_KEY
 *   ACCESS_PASSWORD   — shared access code for authorized parties
 */

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ACCESS_PASSWORD?: string;
  ALLOWED_ORIGIN: string;
}

const MAX_BODY_BYTES = 200 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // per IP per minute for /generate

/** Simple in-memory rate limit (resets on isolate recycle). */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

/** Constant-time-ish compare for short secrets. */
function secretsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function extractBearer(req: Request): string {
  const h = req.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : "";
}

function isAuthorized(req: Request, env: Env): boolean {
  const expected = env.ACCESS_PASSWORD || "";
  if (!expected) return false;
  const token = extractBearer(req);
  return token.length > 0 && secretsEqual(token, expected);
}

function clientIp(req: Request): string {
  return (
    req.headers.get("CF-Connecting-IP") ||
    req.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
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
          service: "cashclinic-api",
          auth_required: true,
          mode: env.ANTHROPIC_API_KEY ? "anthropic" : "unavailable",
          access_configured: Boolean(env.ACCESS_PASSWORD),
        },
        cors
      );
    }

    if (url.pathname === "/auth" && req.method === "POST") {
      if (!env.ACCESS_PASSWORD) {
        return json(503, { error: "ACCESS_PASSWORD not configured" }, cors);
      }
      let body: { password?: string };
      try {
        body = (await req.json()) as typeof body;
      } catch {
        return json(400, { error: "invalid json" }, cors);
      }
      const password = sanitize(body.password, 500);
      if (!password || !secretsEqual(password, env.ACCESS_PASSWORD)) {
        return json(401, { error: "invalid access code" }, cors);
      }
      return json(
        200,
        {
          ok: true,
          // Client stores this and sends as Bearer on subsequent calls.
          // Same value as the password; not a separate session store.
          token: password,
        },
        cors
      );
    }

    if (url.pathname === "/generate" && req.method === "POST") {
      if (!env.ACCESS_PASSWORD) {
        return json(503, { error: "ACCESS_PASSWORD not configured" }, cors);
      }
      if (!isAuthorized(req, env)) {
        return json(401, { error: "unauthorized" }, cors);
      }

      const ip = clientIp(req);
      if (!rateLimitOk(ip)) {
        return json(429, { error: "rate limit exceeded; try again in a minute" }, cors);
      }

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
