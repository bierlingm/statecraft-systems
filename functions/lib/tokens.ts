/**
 * Signed links, so someone can open a private page from their phone without a password.
 *
 * A token is `<payload>.<signature>`, where the payload is base64url JSON
 * { k: kind, i: id, e: expiry-epoch-seconds } and the signature is HMAC-SHA256 over the
 * payload using the room's secret. Nothing secret is inside the token; it is a capability
 * to open one room, and it expires.
 *
 * Ported from prosser-house/functions/lib/tokens.ts — same shape, different secret, so a
 * token for one project can never open another.
 */

export type TokenKind = 'invite' | 'session';

const KINDS: readonly string[] = ['invite', 'session'];

export interface TokenClaims { kind: TokenKind; id: string; expires: number }

const enc = new TextEncoder();

const b64url = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of view) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const unb64url = (s: string): Uint8Array => {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signToken(secret: string, kind: TokenKind, id: string, ttlSeconds: number): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ k: kind, i: id, e: Math.floor(Date.now() / 1000) + ttlSeconds })));
  const sig = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

/** Claims when the signature is valid and the token has not expired. */
export async function verifyToken(secret: string, token: string | null | undefined): Promise<TokenClaims | null> {
  if (!secret || !token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  let sig: Uint8Array;
  try { sig = unb64url(token.slice(dot + 1)); } catch { return null; }
  let ok = false;
  try { ok = await crypto.subtle.verify('HMAC', await key(secret), sig as unknown as BufferSource, enc.encode(payload)); } catch { return null; }
  if (!ok) return null;
  let claims: { k?: string; i?: string; e?: number };
  try { claims = JSON.parse(new TextDecoder().decode(unb64url(payload))); } catch { return null; }
  if (!claims.k || !claims.i || typeof claims.e !== 'number') return null;
  if (claims.e * 1000 < Date.now()) return null;
  if (!KINDS.includes(claims.k)) return null;
  return { kind: claims.k as TokenKind, id: claims.i, expires: claims.e };
}
