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
}

export const INVITE_TTL = 30 * 24 * 3600;      // an invite link is good for 30 days
export const SESSION_TTL = 180 * 24 * 3600;    // and then the device stays in for 180
const COOKIE = 'pnw_room';

const secretFor = (env: RoomEnv) => (env.PNW_ROOM_SECRET ? `${env.PNW_ROOM_SECRET}#pnw-room` : '');

export const ready = (env: RoomEnv) => !!env.PNW_ROOM_SECRET;

export const inviteLink = async (env: RoomEnv, who: string, origin: string) =>
  `${origin}/pnw/?k=${encodeURIComponent(await signToken(secretFor(env), 'invite', who, INVITE_TTL))}`;

/** The name an invite was issued to, if the link is genuine and unexpired. */
export async function redeemInvite(env: RoomEnv, token: string): Promise<string | null> {
  const claims = await verifyToken(secretFor(env), token);
  return claims && claims.kind === 'invite' ? claims.id : null;
}

export async function sessionCookie(env: RoomEnv, who: string, requestUrl: string): Promise<string> {
  const t = await signToken(secretFor(env), 'session', who, SESSION_TTL);
  return `${COOKIE}=${t}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; SameSite=Lax${secure(requestUrl)}`;
}

export const clearedCookie = (requestUrl: string) =>
  `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure(requestUrl)}`;

const secure = (url: string) => (new URL(url).protocol === 'https:' ? '; Secure' : '');

function cookieValue(req: Request): string | null {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(req.headers.get('Cookie') || '');
  return m ? m[1] : null;
}

/** Who is asking, or null. Rotating PNW_ROOM_SECRET signs everyone out everywhere. */
export async function guestFrom(env: RoomEnv, req: Request): Promise<string | null> {
  const claims = await verifyToken(secretFor(env), cookieValue(req));
  return claims && claims.kind === 'session' ? claims.id : null;
}
