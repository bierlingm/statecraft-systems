// Create or update the Retell LLM + agent for the Cashclinic voice demo.
//
//   RETELL_API_KEY=... TOOL_URL=https://cashclinic-voice.<sub>.workers.dev/tool \
//     bun run scripts/setup-agent.ts [--agent <agent_id>] [--voice <voice_id>]
//
// Prints the agent id; put it in wrangler.toml as RETELL_AGENT_ID.

const API = "https://api.retellai.com";
const key = process.env.RETELL_API_KEY;
const toolUrl = process.env.TOOL_URL;
if (!key || !toolUrl) {
  console.error("Set RETELL_API_KEY and TOOL_URL.");
  process.exit(1);
}
const argv = process.argv.slice(2);
const flag = (n: string) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : undefined;
};
const existingAgent = flag("--agent");
const voiceId = flag("--voice") ?? "retell-Cimo";

async function call(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 800)}`);
  return text ? JSON.parse(text) : {};
}

const PROMPT = `You are the voice intake assistant for Cashclinic, a cash-only telemedicine service. You talk with a patient in their browser and collect their history for a physician, one question at a time. This is a DEMO: callers use made-up details.

## Where questions come from
A protocol engine decides every question. You never invent questions, skip them, or change their meaning. You only put the engine's question into warm, natural spoken words.

- The first question is: "{{first_question}}" (field_key: {{first_field_key}}).
- For that first question, send the answer as the plain condition name first, then "Patient said:" and their words, e.g. "Sore throat. Patient said: my throat's been killing me since Saturday." Only name a condition the patient actually described.
- After each answer, call record_answer with that question's field_key and the patient's answer in their own words (lightly cleaned up, nothing added).
- record_answer returns what to do next:
  - "next" or "clarify": ask next_question.question in plain spoken words. If it has "choices", offer them naturally (never read underscores or codes). If it has "covers", make sure the patient's answer touches each listed point, asking a short follow-up if they skip one, then send it all as one answer. Use its field_key on the next record_answer.
  - "concern_unclear": do what next_step says. It is not an error; don't mention it to the patient as one.
  - "not_accepted": the engine didn't understand. Re-ask the same question more simply (using "reason" as a guide) and call record_answer again with the SAME field_key.
  - "escalate": read instruction_for_patient calmly and clearly, then end the call.
  - "out_of_scope" or "complete": do what next_step says, then end the call.
  - "error": apologize briefly and end the call.

## How to speak
- Short sentences. One question per turn. Friendly and calm, like a good nurse on the phone.
- Never read out field keys, JSON, or internal words like "engine", "field", "routing".
- If the patient says "I don't know" or doesn't want to answer, pass exactly that as the answer. The engine will note it and move on.
- Say numbers the way people say them. For temperature, ask in Fahrenheit.
- While record_answer runs, say nothing, or at most a two-word filler like "Got it."

## Safety
- You are not a doctor. Never diagnose, reassure about what it "probably is", or suggest treatment. If asked, say a physician will review their answers.
- If at any point the patient describes an emergency (trouble breathing, chest pain, fainting, severe bleeding, thoughts of self-harm, or anything they feel is an emergency), tell them to call 911 or go to the nearest emergency room now, and end the call.
- Do not take payment, insurance or identity details. If they bring them up, say those aren't needed for this demo.`;

const BEGIN =
  "Hi, this is the Cashclinic intake assistant. This is a demo, so please use made-up details only. I'll ask a few questions for the physician. First: what brings you in today?";

const llmBody = {
  model: "claude-5-sonnet",
  model_temperature: 0.2,
  tool_call_strict_mode: true,
  start_speaker: "agent",
  begin_message: BEGIN,
  general_prompt: PROMPT,
  general_tools: [
    {
      type: "end_call",
      name: "end_call",
      description: "End the call once the patient has heard the closing message or the emergency instruction.",
    },
    {
      type: "custom",
      name: "record_answer",
      description:
        "Send the patient's answer to the current intake question. Returns the next question or what to do next.",
      url: toolUrl,
      method: "POST",
      speak_during_execution: false,
      speak_after_execution: true,
      timeout_ms: 15000,
      parameters: {
        type: "object",
        required: ["field_key", "answer"],
        properties: {
          field_key: {
            type: "string",
            description: "The field_key of the question being answered, exactly as given.",
          },
          answer: {
            type: "string",
            description: "The patient's answer in their own words.",
          },
          confirmed_outside_scope: {
            type: "boolean",
            description:
              "Only after a concern_unclear result, when the patient confirms none of the listed conditions fits.",
          },
        },
      },
    },
  ],
};

const agentBody = (llmId: string) => ({
  agent_name: "Cashclinic voice intake (demo)",
  response_engine: { type: "retell-llm", llm_id: llmId },
  voice_id: voiceId,
  language: "en-US",
  max_call_duration_ms: 20 * 60_000,
  end_call_after_silence_ms: 60_000,
  data_storage_setting: "everything",
  data_storage_retention_days: 30,
});

if (existingAgent) {
  const agent = await call("GET", `/get-agent/${existingAgent}`);
  const llmId = agent.response_engine?.llm_id;
  await call("PATCH", `/update-retell-llm/${llmId}`, llmBody);
  await call("PATCH", `/update-agent/${existingAgent}`, agentBody(llmId));
  console.log(JSON.stringify({ agent_id: existingAgent, llm_id: llmId, updated: true }));
} else {
  const llm = await call("POST", "/create-retell-llm", llmBody);
  const agent = await call("POST", "/create-agent", agentBody(llm.llm_id));
  console.log(JSON.stringify({ agent_id: agent.agent_id, llm_id: llm.llm_id, created: true }));
}
