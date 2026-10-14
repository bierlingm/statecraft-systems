// prosserhorsehotel-mail: Email Routing Worker for hello@ and listings@prosserhorsehotel.com.
// Forwards every message to Ben (prosserhorsehotel@gmail.com) and Moritz (moritzbierling@hey.com).
// Both must be verified Email Routing destinations; a failed forward to one never blocks the other.
const TO = ['prosserhorsehotel@gmail.com', 'moritzbierling@hey.com'];
export default {
  async email(message) {
    let ok = 0;
    for (const to of TO) {
      try { await message.forward(to); ok++; } catch (e) { console.error('[phh-mail] forward failed', to, e?.message); }
    }
    if (!ok) message.setReject('Temporarily unable to deliver');
  },
};
