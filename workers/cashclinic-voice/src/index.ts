/**
 * Cashclinic voice — Retell voice front end for the shadow intake engine.
 *
 * The protocol engine (cashclinic-shadow) stays the source of truth for which
 * question comes next and how answers are parsed. Retell only speaks the
 * engine's questions and hands the patient's own words back through
 * record_answer. A completed voice intake lands in the same physician review
 * queue as a typed one.
 *
 * Routes:
 *   POST /web-call   { code } — code is the existing physician access password
 *                    (checked against the shadow API). Starts an engine session
 *                    and a Retell web call; returns the browser access token.
 *   POST /tool       Retell custom-function webhook (X-Retell-Signature).
 *   GET  /health
 *
 * Synthetic / made-up patients only: no HIPAA agreement is in place.
 */

export interface Env {
  RETELL_API_KEY?: string;
  RETELL_AGENT_ID: string;
  SHADOW_API: string;
  ALLOWED_ORIGIN: string;
}

const DONT_KNOW = /\b(don'?t know|do not know|not sure|unsure|no idea|can'?t remember|don'?t remember|rather not|prefer not|skip)\b/i;
const WEB_CALL_LIMIT = 6; // per IP per hour
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

interface Question {
  fieldKey: string;
  text: string;
  answerType: string;
  options?: string[];
  parts?: Array<{ key: string; label: string; answerType: string; options?: string[] }>;
}

interface AnswerResponse {
  routingState: string;
  sufficiencyState: string;
  complete: boolean;
  question: Question | null;
  escalationInstruction: string;
  detectedComplaintLabel: string | null;
}

function corsHeaders(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = env.ALLOWED_ORIGIN || "https://statecraft.systems";
  const allowed =
    origin === allow ||
    origin === "https://www.statecraft.systems" ||
    origin.endsWith(".statecraft-systems.pages.dev") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : allow,
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

function clientIp(req: Request): string {
  return req.headers.get("CF-Connecting-IP") || "unknown";
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || now >= b.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (b.count >= WEB_CALL_LIMIT) return false;
  b.count += 1;
  return true;
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** Retell signature: "v=<ms>,d=<hex HMAC-SHA256(body + ms, apiKey)>". */
async function verifyRetell(rawBody: string, header: string | null, apiKey: string): Promise<boolean> {
  const m = /^v=(\d+),d=([0-9a-f]+)$/.exec(header ?? "");
  if (!m) return false;
  const ts = Number(m[1]);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(apiKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody + m[1]));
  return timingSafeEqualStr(hex(sig), m[2]);
}

async function shadow(env: Env, path: string, body: unknown, token?: string): Promise<Response> {
  return fetch(`${env.SHADOW_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
}

/** The existing physician password doubles as the demo access code. */
async function accessCodeOk(env: Env, code: string): Promise<boolean> {
  if (!code || code.length > 500) return false;
  const res = await shadow(env, "/auth/physician/login", { password: code });
  if (!res.ok) return false;
  const { token } = (await res.json()) as { token?: string };
  if (token) await shadow(env, "/auth/physician/logout", {}, token).catch(() => undefined);
  return true;
}

/** What the voice agent needs to know about a question, without internal keys. */
function describe(q: Question): Record<string, unknown> {
  const d: Record<string, unknown> = { field_key: q.fieldKey, question: q.text, answer_type: q.answerType };
  if (q.options?.length) d.choices = q.options.map((o) => o.replace(/_/g, " "));
  if (q.parts?.length) d.covers = q.parts.map((p) => p.label);
  if (q.answerType === "number" && /°F/.test(q.text)) d.note = "Temperature in Fahrenheit.";
  return d;
}

async function handleWebCall(req: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  if (!env.RETELL_API_KEY || !env.RETELL_AGENT_ID) {
    return json(503, { error: "voice demo not configured" }, cors);
  }
  if (!rateLimitOk(clientIp(req))) {
    return json(429, { error: "Too many calls from this connection. Try again in an hour." }, cors);
  }
  let body: { code?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { error: "invalid json" }, cors);
  }
  if (!(await accessCodeOk(env, String(body.code ?? "").trim()))) {
    return json(401, { error: "That access code isn't right." }, cors);
  }

  const s = await shadow(env, "/intake/session", {});
  if (!s.ok) return json(502, { error: "intake engine unavailable" }, cors);
  const session = (await s.json()) as {
    sessionId: string;
    encounterId: string;
    token: string;
    question: Question;
  };

  const rc = await fetch("https://api.retellai.com/v3/create-web-call", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RETELL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: env.RETELL_AGENT_ID,
      metadata: { encounter_id: session.encounterId },
      retell_llm_dynamic_variables: {
        session_id: session.sessionId,
        session_token: session.token,
        first_field_key: session.question.fieldKey,
        first_question: session.question.text,
      },
    }),
  });
  if (!rc.ok) {
    const t = await rc.text();
    return json(502, { error: `Retell error ${rc.status}`, detail: t.slice(0, 300) }, cors);
  }
  const call = (await rc.json()) as {
    access_token: string;
    call_id: string;
    transport?: string;
    ice_servers?: unknown[];
  };
  return json(
    200,
    {
      access_token: call.access_token,
      call_id: call.call_id,
      transport: call.transport ?? "gateway",
      ice_servers: call.ice_servers ?? [],
      encounter_id: session.encounterId,
    },
    cors,
  );
}

/** true = routed, false = out of scope, null = couldn't tell (engine error). */
async function probeRoutes(env: Env, fieldKey: string, answer: string): Promise<boolean | null> {
  const s = await shadow(env, "/intake/session", {});
  if (!s.ok) return null;
  const { sessionId, token } = (await s.json()) as { sessionId: string; token: string };
  const r = await shadow(env, `/intake/session/${encodeURIComponent(sessionId)}/answer`, { fieldKey, freeText: answer }, token);
  if (!r.ok) return null;
  const d = (await r.json()) as AnswerResponse;
  return !(d.routingState === "out_of_scope" || d.sufficiencyState === "outside_scope");
}

async function recordAnswer(env: Env, vars: Record<string, string>, args: Record<string, unknown>): Promise<unknown> {
  const sessionId = vars.session_id;
  const token = vars.session_token;
  const fieldKey = String(args.field_key ?? "").slice(0, 200);
  const answer = String(args.answer ?? "").slice(0, 4000).trim();
  if (!sessionId || !token) return { result: "error", say: "The intake session is missing. Apologize and end the call." };
  if (!fieldKey || !answer) return { result: "not_accepted", reason: "field_key and answer are both required." };

  // Spoken complaints are wordier than typed ones and the engine's router can
  // miss them ("my throat's been sore" vs "sore throat"). Route the chief
  // complaint on a throwaway session first, so a miss costs a re-ask instead
  // of ending the real intake as out of scope.
  if (fieldKey === vars.first_field_key && args.confirmed_outside_scope !== true) {
    const routed = await probeRoutes(env, fieldKey, answer);
    if (routed === false) {
      return {
        result: "concern_unclear",
        next_step:
          "Ask which of these is closest to what's going on: a sore throat, a sinus infection, a cough, a red or irritated eye, or a skin rash. " +
          "If one fits, call record_answer again with that condition named first, then 'Patient said:' and their words. " +
          "If none fits, call record_answer again with confirmed_outside_scope set to true.",
      };
    }
  }

  const submit = () =>
    shadow(env, `/intake/session/${encodeURIComponent(sessionId)}/answer`, { fieldKey, freeText: answer }, token);
  let res = await submit();
  // The engine accepts "don't know" only on the second try at a question
  // ("if you don't know ... tell us and we'll move on"). On the phone the
  // patient already said it once, so say it again for them instead of
  // making them repeat themselves.
  if (res.status === 400 && DONT_KNOW.test(answer)) res = await submit();
  if (res.status === 400 || res.status === 409) {
    const e = (await res.json().catch(() => ({}))) as { message?: string };
    return {
      result: "not_accepted",
      reason: e.message ?? "The answer wasn't understood.",
      next_step: "Ask the same question again in plain words, then call record_answer with the same field_key.",
    };
  }
  if (res.status === 401) return { result: "error", say: "The session timed out. Apologize and end the call." };
  if (!res.ok) return { result: "error", say: "Something went wrong on our side. Apologize and end the call." };

  const d = (await res.json()) as AnswerResponse;

  if (d.escalationInstruction && d.sufficiencyState === "escalation_required") {
    await shadow(env, `/intake/session/${encodeURIComponent(sessionId)}/complete`, {}, token).catch(() => undefined);
    return {
      result: "escalate",
      instruction_for_patient: d.escalationInstruction,
      next_step: "Read the instruction to the patient calmly and clearly, say their answers go to a physician as a priority, then end the call.",
    };
  }
  if (d.routingState === "out_of_scope" || d.sufficiencyState === "outside_scope") {
    return {
      result: "out_of_scope",
      next_step: "Explain kindly that this service only handles a few common conditions and this concern isn't one of them, suggest they contact their doctor's office or another care provider, then end the call.",
    };
  }
  if (d.complete || !d.question) {
    await shadow(env, `/intake/session/${encodeURIComponent(sessionId)}/complete`, {}, token).catch(() => undefined);
    return {
      result: "complete",
      next_step: "Thank the patient, tell them their intake has been sent to a physician for review, then end the call.",
    };
  }
  return {
    result: d.routingState === "awaiting_clarification" ? "clarify" : "next",
    concern: d.detectedComplaintLabel,
    next_question: describe(d.question),
  };
}

async function handleTool(req: Request, env: Env): Promise<Response> {
  if (!env.RETELL_API_KEY) return json(503, { error: "not configured" });
  const raw = await req.text();
  if (raw.length > 512 * 1024) return json(413, { error: "too large" });
  if (!(await verifyRetell(raw, req.headers.get("X-Retell-Signature"), env.RETELL_API_KEY))) {
    return json(401, { error: "bad signature" });
  }
  let body: {
    name?: string;
    args?: Record<string, unknown>;
    call?: { agent_id?: string; retell_llm_dynamic_variables?: Record<string, string> };
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid json" });
  }
  if (env.RETELL_AGENT_ID && body.call?.agent_id !== env.RETELL_AGENT_ID) {
    return json(403, { error: "unknown agent" });
  }
  if (body.name !== "record_answer") return json(400, { error: "unknown function" });
  const out = await recordAnswer(env, body.call?.retell_llm_dynamic_variables ?? {}, body.args ?? {});
  return json(200, out);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/health") {
      return json(200, { ok: true, configured: Boolean(env.RETELL_API_KEY && env.RETELL_AGENT_ID) }, cors);
    }
    if (url.pathname === "/web-call" && req.method === "POST") return handleWebCall(req, env, cors);
    if (url.pathname === "/tool" && req.method === "POST") return handleTool(req, env);
    return json(404, { error: "not found" }, cors);
  },
};
