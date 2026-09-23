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
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#151c18;color:#eeeede;font:16px/1.7 system-ui,sans-serif}
main{max-width:34rem;text-align:center}
h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:500;letter-spacing:-.04em;line-height:1.15;margin:0 0 18px}
p{color:#b4c0b5;margin:0 0 18px}
button{font:inherit;font-weight:600;font-size:15px;cursor:pointer;border:0;border-radius:2px;
padding:14px 26px;background:#b3d0af;color:#152318}
button:disabled{opacity:.6;cursor:default}
a{color:#b3d0af}
.err{color:#e3b9b9}
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
    <p>It opens from the link you were sent. If you have it on another device, open it there — or ask Moritz for a new one.</p>
    <p><a href="/">Statecraft Systems</a></p>`, 401);
};
