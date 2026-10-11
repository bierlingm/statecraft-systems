/** Session endpoint for the Runcible project room. Same contract as ./pnw-session.ts. */
import { RUNCIBLE } from '../lib/room';
import { sessionGet, sessionPost } from '../lib/session';

export const onRequestGet = sessionGet(RUNCIBLE);
export const onRequestPost = sessionPost(RUNCIBLE);
