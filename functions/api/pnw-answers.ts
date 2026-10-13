/**
 * What has been answered in the PNW room so far, so the room can mark it.
 *
 *   GET /api/pnw-answers -> { latest: [{ reviewer, received_at, progress, picks, fields }] }
 *
 * The answers live on Moritz's Zo (see Projects/pnw-intake/README.md there). That route is
 * public, so it only returns them to a caller holding PNW_INTAKE_TOKEN — this function is
 * the only thing that holds it, and it will not call unless the request carries a valid room
 * session. Ben's answers therefore stay behind the same gate as the room itself.
 */
import { RoomEnv, guestFrom, ready } from '../lib/room';

interface AnswersEnv extends RoomEnv {
  /** Shared secret with the Zo route; same value as pnw-intake/.read-token. */
  PNW_INTAKE_TOKEN?: string;
}

const UPSTREAM = 'https://bierlingm.zo.space/api/pnw/answers';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private' },
  });

export const onRequestGet: PagesFunction<AnswersEnv> = async (ctx) => {
  if (!ready(ctx.env)) return json({ error: 'Sign-in is not set up on the server yet.' }, 503);

  const who = await guestFrom(ctx.env, ctx.request);
  if (!who) return json({ error: 'Not signed in' }, 401);
  if (!ctx.env.PNW_INTAKE_TOKEN) return json({ error: 'Not configured', latest: [] }, 503);

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM, {
      headers: { 'X-PNW-Token': ctx.env.PNW_INTAKE_TOKEN, Origin: new URL(ctx.request.url).origin },
    });
  } catch (e) {
    console.error('[pnw-answers] upstream unreachable', e);
    return json({ error: 'Could not read the answers', latest: [] }, 502);
  }
  if (!upstream.ok) {
    console.error('[pnw-answers] upstream said', upstream.status);
    return json({ error: 'Could not read the answers', latest: [] }, 502);
  }

  const body = (await upstream.json()) as { latest?: unknown };
  return json({ ok: true, who, latest: Array.isArray(body.latest) ? body.latest : [] });
};
