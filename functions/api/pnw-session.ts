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
import { PNW } from '../lib/room';
import { sessionGet, sessionPost } from '../lib/session';

export const onRequestGet = sessionGet(PNW);
export const onRequestPost = sessionPost(PNW);
