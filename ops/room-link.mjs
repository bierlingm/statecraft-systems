#!/usr/bin/env node
/**
 * Mint an invite link for a project room. The link is good for 30 days; tapping it leaves
 * a 180-day cookie on that device.
 *
 *   PNW_ROOM_SECRET=... node ops/room-link.mjs ben
 *   RUNCIBLE_ROOM_SECRET=... ROOM=runcible node ops/room-link.mjs guest
 *
 * The secret is the same value set on the Pages project:
 *   npx wrangler pages secret put PNW_ROOM_SECRET --project-name statecraft-systems
 */
import { webcrypto as crypto } from 'node:crypto';

const who = process.argv[2] || 'guest';
const origin = process.argv[3] || 'https://statecraft.systems';
const ROOMS = { pnw: 'PNW_ROOM_SECRET', runcible: 'RUNCIBLE_ROOM_SECRET' };
const room = process.env.ROOM || 'pnw';
const secretVar = ROOMS[room];
if (!secretVar) { console.error(`Unknown ROOM ${room}. Known: ${Object.keys(ROOMS).join(', ')}`); process.exit(1); }
const secret = process.env[secretVar];
if (!secret) { console.error(`Set ${secretVar} (the value on the Pages project).`); process.exit(1); }

const enc = new TextEncoder();
const b64url = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const TTL = 30 * 24 * 3600;

const payload = b64url(enc.encode(JSON.stringify({ k: 'invite', i: who, e: Math.floor(Date.now() / 1000) + TTL })));
const key = await crypto.subtle.importKey('raw', enc.encode(`${secret}#${room}-room`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
console.log(`${origin}/${room}/?k=${encodeURIComponent(`${payload}.${b64url(new Uint8Array(sig))}`)}`);
