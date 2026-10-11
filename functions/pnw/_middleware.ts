/** Gate for /pnw/*. See ../lib/gate.ts. */
import { PNW } from '../lib/room';
import { roomGate } from '../lib/gate';

export const onRequest = roomGate(PNW);
