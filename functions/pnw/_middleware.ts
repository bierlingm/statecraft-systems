/**
 * Gate for /pnw/*. Nothing under it is served without a session cookie.
 *
 * Three cases:
 *   - signed in            -> serve the page, and renew the cookie so the device stays in
 *   - arriving with ?k=... -> show a one-tap page that POSTs the token to /api/pnw-session
 *   - neither              -> a short private notice, 401, no detail about what is here
 *
 * The invite is redeemed by a POST from that page, never by the bare GET, so a link-preview
 * fetch (WhatsApp, iMessage, a mail scanner) cannot consume the invite or collect the cookie.
 */
import { RoomEnv, guestFrom, ready, sessionCookie } from '../lib/room';

const page = (title: string, body: string, status: number, cookie?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${title}</title>
<style>
/* Same identity as the room itself: warm stone, oxblood, Berkeley Mono. */
@font-face{font-family:Berkeley;src:url('/fonts/BerkeleyMono-Regular.otf') format('opentype');font-weight:400;font-display:swap}
@font-face{font-family:Berkeley;src:url('/fonts/BerkeleyMono-Bold.otf') format('opentype');font-weight:700;font-display:swap}
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#f5f0e6;color:#2b2824;font:17px/1.65 Charter,Georgia,'Times New Roman',serif}
main{max-width:34rem;text-align:center}
h1{font-family:Berkeley,ui-monospace,monospace;font-size:clamp(1.7rem,4vw,2.4rem);
font-weight:400;letter-spacing:-.035em;line-height:1.15;margin:0 0 18px}
p{color:#5c554c;margin:0 0 18px}
button{font-family:Berkeley,ui-monospace,monospace;font-size:13px;font-weight:700;
letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border:1px solid #8c2a1a;
padding:13px 24px;background:#8c2a1a;color:#f5f0e6}
button:hover:not(:disabled){background:#6d1f13}
button:disabled{opacity:.6;cursor:default}
a{color:#8c2a1a;text-underline-offset:4px}
.err{color:#8c2a1a}
form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:24px 0 8px}
input{font:inherit;padding:12px 14px;min-width:15rem;flex:1 1 15rem;
border:1px solid #b8b1a3;background:#ebe5d9;color:#2b2824}
input:focus{outline:2px solid #8c2a1a;outline-offset:2px;border-color:#8c2a1a}
.msg{font-size:15px;color:#5c554c}
</style></head><body><main>${body}</main></body></html>`, { status, headers });
};

export const onRequest: PagesFunction<RoomEnv> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const token = url.searchParams.get('k');

  if (!ready(ctx.env)) {
    return page('Not set up', '<h1>Not set up yet.</h1><p>This room has no sign-in secret configured. Tell Moritz.</p>', 503);
  }

  const who = await guestFrom(ctx.env, ctx.request);
  if (who) {
    // Signed in. Serve the real page and slide the cookie forward.
    const res = await ctx.next();
    const out = new Response(res.body, res);
    out.headers.append('Set-Cookie', await sessionCookie(ctx.env, who, ctx.request.url));
    out.headers.set('Cache-Control', 'no-store, private');
    return out;
  }

  if (token) {
    return page('Open the room', `
      <h1>Welcome.</h1>
      <p>One tap and this device stays signed in — no password, nothing to remember.</p>
      <p><button id="go">Open the project room</button></p>
      <p class="err" id="err" hidden></p>
      <script>
        var b=document.getElementById('go'), e=document.getElementById('err');
        b.addEventListener('click', function(){
          b.disabled=true; b.textContent='Opening…';
          fetch('/api/pnw-session',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({action:'redeem',token:${JSON.stringify(token)}})})
            .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); })
            .then(function(o){
              if(o.ok){ location.replace('/pnw/'); return; }
              e.hidden=false; e.textContent=o.j.error||'That link did not work.';
              b.disabled=false; b.textContent='Try again';
            })
            .catch(function(){ e.hidden=false; e.textContent='Something went wrong. Try again.'; b.disabled=false; b.textContent='Try again'; });
        });
      </script>`, 200);
  }

  return page('Private', `
    <h1>This page is private.</h1>
    <p>It opens from the link you were sent. If your address is on the list, send yourself a fresh one.</p>
    <form id="f" autocomplete="on">
      <input id="e" type="email" name="email" placeholder="you@example.com" autocomplete="email" required aria-label="Your email address">
      <button type="submit">Send me a link</button>
    </form>
    <p id="m" class="msg" hidden></p>
    <p><a href="/">Statecraft Systems</a></p>
    <script>
      var f=document.getElementById('f'), e=document.getElementById('e'), m=document.getElementById('m');
      f.addEventListener('submit', function(ev){
        ev.preventDefault();
        var b=f.querySelector('button'); b.disabled=true; b.textContent='Sending…';
        fetch('/api/pnw-session',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'link',email:e.value})})
          .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
          .then(function(o){
            m.hidden=false;
            m.textContent = o.ok
              ? 'If that address is on the list, a link is on its way. It works for 30 minutes.'
              : (o.j.error || 'That did not work.');
            m.className = o.ok ? 'msg' : 'msg err';
            b.disabled=false; b.textContent='Send me a link';
          })
          .catch(function(){ m.hidden=false; m.className='msg err'; m.textContent='Something went wrong.'; b.disabled=false; b.textContent='Send me a link'; });
      });
    </script>`, 401);
};
