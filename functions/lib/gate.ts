/**
 * Gate factory for project rooms (/pnw/*, /runcible/*). Nothing under it is served without a session cookie.
 *
 * Three cases:
 *   - signed in            -> serve the page, and renew the cookie so the device stays in
 *   - arriving with ?k=... -> show a one-tap page that POSTs the token to the room's session endpoint
 *   - neither              -> a short private notice, 401, no detail about what is here
 *
 * The invite is redeemed by a POST from that page, never by the bare GET, so a link-preview
 * fetch (WhatsApp, iMessage, a mail scanner) cannot consume the invite or collect the cookie.
 */
import { PNW, Room, RoomEnv, guestFrom, ready, sessionCookie } from './room';

/** The PNW gate styling, verbatim from the original middleware. */
export const PNW_STYLE = `/* Same identity as the room: overcast ground, graphite ink, oversize-load orange. */
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#eef0ee;color:#1b1f1d;
font:17px/1.62 system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
main{max-width:34rem;text-align:center}
h1{font-size:clamp(1.8rem,4.4vw,2.6rem);font-weight:700;letter-spacing:-.035em;
line-height:1.12;margin:0 0 18px}
p{color:#535a55;margin:0 0 18px}
button{font:inherit;font-size:12px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;
cursor:pointer;border:2px solid #c2410c;padding:13px 24px;background:#c2410c;color:#eef0ee}
button:hover:not(:disabled){background:#9c3409;border-color:#9c3409}
button:disabled{opacity:.55;cursor:default}
a{color:#c2410c;text-underline-offset:4px}
.err{color:#c2410c}
form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:24px 0 8px}
input{font:inherit;padding:12px 14px;min-width:15rem;flex:1 1 15rem;
border:1px solid #9ba39c;background:#e4e7e4;color:#1b1f1d}
input:focus{outline:2px solid #c2410c;outline-offset:2px;border-color:#c2410c}
.msg{font-size:15px;color:#535a55}
`;

const page = (style: string, title: string, body: string, status: number, cookie?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${title}</title>
<style>
${style}</style></head><body><main>${body}</main></body></html>`, { status, headers });
};

export const roomGate = (room: Room = PNW, style: string = PNW_STYLE): PagesFunction<RoomEnv> => async (ctx) => {
  const url = new URL(ctx.request.url);
  const token = url.searchParams.get('k');

  if (!ready(ctx.env, room)) {
    return page(style, 'Not set up', '<h1>Not set up yet.</h1><p>This room has no sign-in secret configured. Tell Moritz.</p>', 503);
  }

  const who = await guestFrom(ctx.env, ctx.request, room);
  if (who) {
    // Signed in. Serve the real page and slide the cookie forward.
    const res = await ctx.next();
    const out = new Response(res.body, res);
    out.headers.append('Set-Cookie', await sessionCookie(ctx.env, who, ctx.request.url, room));
    out.headers.set('Cache-Control', 'no-store, private');
    return out;
  }

  if (token) {
    return page(style, 'Open the room', `
      <h1>Welcome.</h1>
      <p>One tap and this device stays signed in — no password, nothing to remember.</p>
      <p><button id="go">Open the project room</button></p>
      <p class="err" id="err" hidden></p>
      <script>
        var b=document.getElementById('go'), e=document.getElementById('err');
        b.addEventListener('click', function(){
          b.disabled=true; b.textContent='Opening…';
          fetch('${room.endpoint}',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({action:'redeem',token:${JSON.stringify(token)}})})
            .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); })
            .then(function(o){
              if(o.ok){ location.replace('/${room.path}/'); return; }
              e.hidden=false; e.textContent=o.j.error||'That link did not work.';
              b.disabled=false; b.textContent='Try again';
            })
            .catch(function(){ e.hidden=false; e.textContent='Something went wrong. Try again.'; b.disabled=false; b.textContent='Try again'; });
        });
      </script>`, 200);
  }

  if (!room.emailSubject) {
    return page(style, 'Private', `
    <h1>This page is private.</h1>
    <p>It opens from the link you were sent. If you need a fresh one, ask Moritz.</p>
    <p><a href="/">Statecraft Systems</a></p>`, 401);
  }

  return page(style, 'Private', `
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
        fetch('${room.endpoint}',{method:'POST',headers:{'Content-Type':'application/json'},
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

/** Runcible gate styling: warm paper, near-black ink, deep blue accent. */
export const RUNCIBLE_STYLE = `:root{color-scheme:light}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#FBFAF7;color:#14161B;
font:17px/1.62 system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
main{max-width:34rem;text-align:center}
h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.8rem,4.4vw,2.6rem);font-weight:400;letter-spacing:-.02em;
line-height:1.12;margin:0 0 18px}
p{color:#5A606B;margin:0 0 18px}
button{font:inherit;font-size:15px;font-weight:500;cursor:pointer;border:0;border-radius:8px;padding:12px 22px;background:#1F3FB8;color:#fff}
button:hover:not(:disabled){background:#162E8A}
button:disabled{opacity:.55;cursor:default}
a{color:#1F3FB8;text-underline-offset:4px}
.err{color:#B42318}
`;
