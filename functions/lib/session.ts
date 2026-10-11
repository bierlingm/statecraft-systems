/**
 * Session endpoint factory for project rooms (see ./room.ts). One instance per room.
 *
 *   GET  /api/pnw-session                        -> { who } or 401
 *   POST /api/pnw-session { action: "redeem", token }  -> sets the session cookie
 *   POST /api/pnw-session { action: "signout" }        -> clears it
 *
 * Redemption is POST-only so a link preview or mail scanner cannot spend the invite.
 * JSON content type is required: a cross-site form cannot send it without a preflight,
 * which this endpoint never grants.
 */
import {
  EMAIL_TTL, PNW, Room, RoomEnv, clearedCookie, guestFrom, inviteLink, isAllowedEmail, mailReady, nameFor,
  normalEmail, ready, redeemInvite, sendLinkEmail, sessionCookie,
} from './room';

const json = (data: unknown, status = 200, cookie?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(JSON.stringify(data), { status, headers });
};

export const sessionGet = (room: Room = PNW): PagesFunction<RoomEnv> => async (ctx) => {
  const who = await guestFrom(ctx.env, ctx.request, room);
  return who ? json({ who }) : json({ error: 'Not signed in' }, 401);
};

export const sessionPost = (room: Room = PNW): PagesFunction<RoomEnv> => async (ctx) => {
  if (!ready(ctx.env, room)) return json({ error: 'Sign-in is not set up on the server yet.' }, 503);
  if (!(ctx.request.headers.get('Content-Type') || '').includes('application/json')) return json({ error: 'Send JSON' }, 415);

  let raw: Record<string, unknown>;
  try { raw = await ctx.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (raw.action === 'signout') return json({ ok: true }, 200, clearedCookie(ctx.request.url, room));

  if (raw.action === 'redeem') {
    const who = await redeemInvite(ctx.env, String(raw.token ?? '').slice(0, 800), room);
    if (!who) return json({ error: 'That link has expired or is not valid. Ask Moritz for a new one.' }, 401);
    return json({ ok: true, who }, 200, await sessionCookie(ctx.env, who, ctx.request.url, room));
  }

  if (raw.action === 'link') {
    if (!mailReady(ctx.env, room)) return json({ error: 'Emailed links are not switched on yet. Ask Moritz for a link.' }, 503);
    const email = normalEmail(raw.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "That doesn't look like an email address." }, 400);
    // Same answer either way, so this cannot be used to discover who has access.
    if (isAllowedEmail(ctx.env, email)) {
      try {
        await sendLinkEmail(ctx.env, email, await inviteLink(ctx.env, nameFor(ctx.env, email), new URL(ctx.request.url).origin, EMAIL_TTL, room), room);
      } catch (e) {
        console.error('[room] link email failed', e);
        return json({ error: 'The email did not go out. Ask Moritz for a link instead.' }, 502);
      }
    }
    return json({ ok: true, sent: true });
  }

  return json({ error: 'Unknown action' }, 400);
};
