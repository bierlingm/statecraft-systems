/** Gate for /runcible/*. Invite-link only; see ../lib/gate.ts. */
import { RUNCIBLE } from '../lib/room';
import { RUNCIBLE_STYLE, roomGate } from '../lib/gate';

export const onRequest = roomGate(RUNCIBLE, RUNCIBLE_STYLE);
