const form=document.querySelector('#review');
const status=document.querySelector('#review-status');
const key='prosserhorsehotel-review-v1';
const labels={name:'Your name',parking:'How the six rig spaces work',care:'Nightly and weekly horse care',monthly:'Weekly/monthly pricing and pet rules',assets:'Photos, domain and contact details',cost:'Recurring software budget',notes:'Other corrections or priorities'};
let draft={};
try{draft=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
for(const [name,value] of Object.entries(draft)){if(form.elements[name])form.elements[name].value=value}
function answers(){return Object.fromEntries(new FormData(form))}
form.addEventListener('input',()=>{try{localStorage.setItem(key,JSON.stringify(answers()));status.textContent='Draft saved on this device. Send below when ready.'}catch{status.textContent='Device storage is unavailable. Keep this page open until you send.'}});
form.addEventListener('submit',async event=>{
event.preventDefault();
const data=answers();
if(!Object.entries(data).some(([k,v])=>k!=='name'&&v.trim())){status.textContent='Add at least one answer or correction first.';return}
const text=Object.entries(data).filter(([,v])=>v.trim()).map(([k,v])=>labels[k]+':\n'+v.trim()).join('\n\n');
location.href='mailto:ops@statecraft.systems?subject='+encodeURIComponent('Prosser Horse Hotel — project-room answers')+'&body='+encodeURIComponent(text);
status.textContent='Email draft opened. Send it from your email app; this page has not sent your answers.';
});
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(Object.entries(answers()).filter(([,v])=>v.trim()).map(([k,v])=>labels[k]+':\n'+v.trim()).join('\n\n'));status.textContent='Copied. Paste these answers into your reply to Moritz.'}catch{status.textContent='Copy is unavailable. Select your answers and copy them manually.'}});
