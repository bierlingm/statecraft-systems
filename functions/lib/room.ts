/**
 * Who may open a project room.
 *
 * Same idea as prosser-house's owner sign-in: no password, a signed link, and a long-lived
 * HttpOnly cookie on the device that opens it. The difference is delivery — statecraft.systems
 * is not onboarded to Cloudflare Email Sending, and a room has exactly one guest who we are
 * already talking to, so the invite link is sent by hand (WhatsApp) rather than self-served
 * by typing an address. Everything after that first tap is identical.
 *
 * To add self-service later: onboard the zone to Email Sending (or bind the prosser mailer),
 * and add a POST { action: "link", email } that checks an allow-list — see
 * prosser-house/functions/api/owner.ts.
 */
import { signToken, verifyToken } from './tokens';

export interface RoomEnv {
  /** HMAC secret for room invite and session tokens. */
  PNW_ROOM_SECRET?: string;
  /** HMAC secret for the Runcible room. */
  RUNCIBLE_ROOM_SECRET?: string;
  /** Comma-separated addresses allowed to sign themselves in. `Name <addr>` also works. */
  ROOM_EMAILS?: string;
  /** Cloudflare API token with Email Sending: Send, for the REST send endpoint. */
  CF_EMAIL_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
}

export const INVITE_TTL = 30 * 24 * 3600;      // a hand-sent invite is good for 30 days
export const EMAIL_TTL = 30 * 60;              // one you mail yourself, 30 minutes
export const SESSION_TTL = 180 * 24 * 3600;    // and then the device stays in for 180

/** One gated room: its path, cookie, session endpoint, key element and secret. */
export interface Room {
  /** Path segment, e.g. 'pnw' serves /pnw/. */
  path: string;
  cookie: string;
  /** Session endpoint, e.g. '/api/pnw-session'. */
  endpoint: string;
  /** Element mixed into the HMAC key, so a token for one room never opens another. */
  key: string;
  secretVar: 'PNW_ROOM_SECRET' | 'RUNCIBLE_ROOM_SECRET';
  /** Subject for self-served link emails; rooms without one are invite-only. */
  emailSubject?: string;
}

export const PNW: Room = {
  path: 'pnw', cookie: 'pnw_room', endpoint: '/api/pnw-session', key: 'pnw-room',
  secretVar: 'PNW_ROOM_SECRET', emailSubject: 'Your link to the PNW Mobile Homes project room',
};

export const RUNCIBLE: Room = {
  path: 'runcible', cookie: 'runcible_room', endpoint: '/api/runcible-session', key: 'runcible-room',
  secretVar: 'RUNCIBLE_ROOM_SECRET',
};

const secretFor = (env: RoomEnv, room: Room = PNW) => (env[room.secretVar] ? `${env[room.secretVar]}#${room.key}` : '');

export const ready = (env: RoomEnv, room: Room = PNW) => !!env[room.secretVar];

export const inviteLink = async (env: RoomEnv, who: string, origin: string, ttl = INVITE_TTL, room: Room = PNW) =>
  `${origin}/${room.path}/?k=${encodeURIComponent(await signToken(secretFor(env, room), 'invite', who, ttl))}`;

/** The name an invite was issued to, if the link is genuine and unexpired. */
export async function redeemInvite(env: RoomEnv, token: string, room: Room = PNW): Promise<string | null> {
  const claims = await verifyToken(secretFor(env, room), token);
  return claims && claims.kind === 'invite' ? claims.id : null;
}

export async function sessionCookie(env: RoomEnv, who: string, requestUrl: string, room: Room = PNW): Promise<string> {
  const t = await signToken(secretFor(env, room), 'session', who, SESSION_TTL);
  return `${room.cookie}=${t}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; SameSite=Lax${secure(requestUrl)}`;
}

export const clearedCookie = (requestUrl: string, room: Room = PNW) =>
  `${room.cookie}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure(requestUrl)}`;

const secure = (url: string) => (new URL(url).protocol === 'https:' ? '; Secure' : '');

function cookieValue(req: Request, room: Room = PNW): string | null {
  const m = new RegExp(`(?:^|;\\s*)${room.cookie}=([^;]+)`).exec(req.headers.get('Cookie') || '');
  return m ? m[1] : null;
}

export const normalEmail = (v: unknown) => String(v ?? '').trim().toLowerCase().slice(0, 200);

/** Allow-list entries are `address` or `Name <address>`. */
function allowed(env: RoomEnv): { email: string; name: string }[] {
  return (env.ROOM_EMAILS || '').split(',').map((entry) => {
    const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(entry);
    return m ? { email: normalEmail(m[2]), name: m[1] } : { email: normalEmail(entry), name: '' };
  }).filter((o) => o.email);
}

export const isAllowedEmail = (env: RoomEnv, email: string) =>
  !!email && allowed(env).some((o) => o.email === normalEmail(email));

/** The name to greet them by; the address when no name is on file. */
export const nameFor = (env: RoomEnv, email: string) =>
  allowed(env).find((o) => o.email === normalEmail(email))?.name || normalEmail(email);

/** Self-service sign-in is only on when there is a token, an account and an allow-list. */
export const mailReady = (env: RoomEnv, room: Room = PNW) => !!room.emailSubject && !!(env.CF_EMAIL_TOKEN && env.CF_ACCOUNT_ID && allowed(env).length);

/**
 * Cloudflare Email Sending, over its REST API rather than a binding: Pages Functions have
 * no send_email binding, and the REST route avoids adding a mailer Worker and a service
 * binding (which would mean putting a wrangler.toml in front of a Git-built Pages project).
 */
export async function sendLinkEmail(env: RoomEnv, to: string, link: string, room: Room = PNW): Promise<void> {
  const body = {
    from: 'Statecraft Systems <rooms@notifications.statecraft.systems>',
    to,
    subject: room.emailSubject,
    text: `Open the project room:\n\n${link}\n\nThe link works for 30 minutes. Tapping it keeps that device signed in, so you only do this once.`,
    html: `<p>Open the project room:</p><p><a href="${link}">${link}</a></p>`
      + `<p style="color:#666">The link works for 30 minutes. Tapping it keeps that device signed in, so you only do this once.</p>`,
  };
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_EMAIL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`send failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

/** Who is asking, or null. Rotating PNW_ROOM_SECRET signs everyone out everywhere. */
export async function guestFrom(env: RoomEnv, req: Request, room: Room = PNW): Promise<string | null> {
  const claims = await verifyToken(secretFor(env, room), cookieValue(req, room));
  return claims && claims.kind === 'session' ? claims.id : null;
}
