/**
 * Session endpoint for the PNW project room (see ../lib/room.ts).
 *
 *   GET  /api/pnw-session                        -> { who } or 401
 *   POST /api/pnw-session { action: "redeem", token }  -> sets the session cookie
 *   POST /api/pnw-session { action: "signout" }        -> clears it
 *
 * Redemption is POST-only so a link preview or mail scanner cannot spend the invite.
 * JSON content type is required: a cross-site form cannot send it without a preflight,
 * which this endpoint never grants.
 */
import { RoomEnv, clearedCookie, guestFrom, ready, redeemInvite, sessionCookie } from '../lib/room';

const json = (data: unknown, status = 200, cookie?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(JSON.stringify(data), { status, headers });
};

export const onRequestGet: PagesFunction<RoomEnv> = async (ctx) => {
  const who = await guestFrom(ctx.env, ctx.request);
  return who ? json({ who }) : json({ error: 'Not signed in' }, 401);
};

export const onRequestPost: PagesFunction<RoomEnv> = async (ctx) => {
  if (!ready(ctx.env)) return json({ error: 'Sign-in is not set up on the server yet.' }, 503);
  if (!(ctx.request.headers.get('Content-Type') || '').includes('application/json')) return json({ error: 'Send JSON' }, 415);

  let raw: Record<string, unknown>;
  try { raw = await ctx.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (raw.action === 'signout') return json({ ok: true }, 200, clearedCookie(ctx.request.url));

  if (raw.action === 'redeem') {
    const who = await redeemInvite(ctx.env, String(raw.token ?? '').slice(0, 800));
    if (!who) return json({ error: 'That link has expired or is not valid. Ask Moritz for a new one.' }, 401);
    return json({ ok: true, who }, 200, await sessionCookie(ctx.env, who, ctx.request.url));
  }

  return json({ error: 'Unknown action' }, 400);
};
