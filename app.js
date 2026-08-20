const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={g(k,f){try{let v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch{return f}},s(k,v){localStorage.setItem(k,JSON.stringify(v))}};
const D={
anchor:"Reset the kitchen before dinner.",
tasks:[{id:1,text:"Start one load of laundry",done:false},{id:2,text:"Water seedlings",done:false}],
dinner:"Chicken soup + sourdough",
rhythm:[],
reset:{},
stewardship:[
{id:"water",title:"Find your main water shutoff",why:"Know where it is before a plumbing emergency.",cadence:"One-time setup",difficulty:"Beginner",done:false},
{id:"sinks",title:"Check under sinks for slow leaks",why:"Small leaks can quietly damage cabinets and floors.",cadence:"Monthly-ish",difficulty:"Beginner",done:false},
{id:"dryer",title:"Check the dryer vent path",why:"Lint buildup can reduce efficiency and contribute to fire risk.",cadence:"Periodic",difficulty:"Beginner",done:false},
{id:"alarms",title:"Review smoke & CO alarms",why:"Know what you have, where they are, and what the manufacturer recommends for testing and replacement.",cadence:"Periodic",difficulty:"Beginner",done:false},
{id:"gutters",title:"Inspect gutters & downspouts",why:"Good drainage helps keep water away from the roof, siding, and foundation.",cadence:"Seasonal",difficulty:"Beginner",done:false}
],
rooms:["Kitchen","Living Room","Bathroom","Primary Bedroom","Kids' Room","Laundry","Porch","Garden"],
systems:[
{id:1,name:"Furnace / HVAC",detail:"Filter size not saved yet"},
{id:2,name:"Water heater",detail:"Type / model not saved yet"},
{id:3,name:"Washer & dryer",detail:"Model information not saved yet"}
],
projects:[{id:1,title:"Repair bathroom trim",room:"Bathroom",status:"Planning"}],
refs:[{id:1,label:"Main water shutoff",value:"Location not saved yet"}],
history:[],
knowledge:[
{title:"Know where your main water shutoff is",sub:"Emergency knowledge"},
{title:"Know what furnace filter your home uses",sub:"Useful home reference"},
{title:"Know where your electrical panel is",sub:"Emergency knowledge"}
]
};
Object.entries(D).forEach(([k,v])=>{if(localStorage.getItem("gh_"+k)===null)S.s("gh_"+k,v)});
$('#dateLine').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date());
function nav(t){$$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===t));$$('[data-go]').forEach(x=>x.classList.toggle('active',x.dataset.go===t));renderAll()}
$$('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));
$$('[data-house-section]').forEach(b=>b.onclick=()=>nav(b.dataset.houseSection));
const sheet=$('#sheet');$('#closeSheet').onclick=()=>sheet.close();function openSheet(h){$('#sheetBody').innerHTML=h;sheet.showModal()}
function mark(){let a=S.g('gh_rhythm',[]),t=new Date().toISOString().slice(0,10);if(!a.includes(t)){a.push(t);S.s('gh_rhythm',a)}renderRhythm()}
function renderRhythm(){let a=S.g('gh_rhythm',[]),set=new Set(a),n=new Date(),m=new Date(n),dow=(n.getDay()+6)%7;m.setDate(n.getDate()-dow);m.setHours(0,0,0,0);let week=0;$('#rhythmWeek').innerHTML=['M','T','W','T','F','S','S'].map((d,i)=>{let q=new Date(m);q.setDate(m.getDate()+i);let k=q.toISOString().slice(0,10),done=set.has(k);if(done)week++;return `<div class="rhythm-day ${done?'done':''}">${d}<span></span></div>`}).join('');$('#rhythmText').textContent=`${week} days in rhythm this week`;let p=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;$('#monthText').textContent=`${a.filter(x=>x.startsWith(p)).length} tended this month`}
function renderToday(){let a=S.g('gh_anchor',D.anchor);$('#anchorText').innerHTML=esc(a).replace(' before dinner.','<br>before dinner.');let t=S.g('gh_tasks',D.tasks),done=t.filter(x=>x.done).length;$('#tendingSummary').textContent=`${done} of ${t.length} tasks done`;$('#dinnerText').textContent=S.g('gh_dinner',D.dinner);let next=S.g('gh_stewardship',D.stewardship).find(x=>!x.done);$('#homeSummary').textContent=next?next.title:"Everything current for now"}
$('#changeAnchorBtn').onclick=()=>openSheet(`<div class="eyebrow">TODAY'S FOCUS</div><h2>What matters most today?</h2><input id="anchorIn" value="${ea(S.g('gh_anchor',D.anchor))}"><button class="cta" id="anchorSave">Save focus</button>`);
document.addEventListener('click',e=>{if(e.target.id==='anchorSave'){S.s('gh_anchor',$('#anchorIn').value.trim()||D.anchor);mark();renderToday();sheet.close()}});
$('#openTending').onclick=()=>openTending();
function openTending(){let t=S.g('gh_tasks',D.tasks),done=t.filter(x=>x.done).length;openSheet(`<div class="eyebrow">TENDING</div><h2>Today's tending</h2><div class="meta-row"><span>${done} of ${t.length} complete</span><span>Keep it light</span></div><div class="checklist">${t.map(x=>`<label class="checkitem"><input type="checkbox" data-task="${x.id}" ${x.done?'checked':''}><span>${esc(x.text)}</span></label>`).join('')}</div><input id="newTask" placeholder="Add something small"><button class="cta" id="addTask">Add to today</button>`)}
document.addEventListener('change',e=>{if(e.target.dataset.task){let t=S.g('gh_tasks',D.tasks),x=t.find(v=>String(v.id)===e.target.dataset.task);if(x)x.done=e.target.checked;S.s('gh_tasks',t);mark();renderToday()}});
document.addEventListener('click',e=>{if(e.target.id==='addTask'){let v=$('#newTask').value.trim();if(v){let t=S.g('gh_tasks',D.tasks);t.push({id:Date.now(),text:v,done:false});S.s('gh_tasks',t);mark();renderToday();sheet.close();openTending()}}});
$('#resetBtn').onclick=()=>openReset();
function openReset(){let s=S.g('gh_reset',{}),items=['Gather dishes','Clear counters','Start one load (laundry or dishwasher)','Wipe counters','Reset the living area'],done=Object.values(s).filter(Boolean).length;openSheet(`<div class="eyebrow">10-MINUTE RESET</div><h2>Kitchen reset</h2><p style="color:var(--muted);font-family:Georgia,serif;margin:6px 0 0">Just enough to make tomorrow easier.</p><div class="checklist">${items.map((x,i)=>`<label class="checkitem"><input data-reset="${i}" type="checkbox" ${s[i]?'checked':''}><span>${x}</span></label>`).join('')}</div><div class="progress"><span style="width:${done/5*100}%"></span></div><div class="meta-row"><span>${done} of 5</span><span>${done===5?'Room tended ✓':''}</span></div><button class="cta" id="resetDone">I tended this room</button>`)}
document.addEventListener('change',e=>{if(e.target.dataset.reset!==undefined){let s=S.g('gh_reset',{});s[e.target.dataset.reset]=e.target.checked;S.s('gh_reset',s);mark();sheet.close();openReset()}});
document.addEventListener('click',e=>{if(e.target.id==='resetDone'){mark();sheet.close()}});
$('#openDinner').onclick=()=>openSheet(`<div class="eyebrow">DINNER</div><h2>What's for dinner?</h2><input id="din" value="${ea(S.g('gh_dinner',D.dinner))}"><button class="cta" id="saveDinner">Save dinner</button>`);
document.addEventListener('click',e=>{if(e.target.id==='saveDinner'){S.s('gh_dinner',$('#din').value.trim());mark();renderToday();sheet.close()}});
function renderHousehold(){let st=S.g('gh_stewardship',D.stewardship),next=st.find(x=>!x.done)||st[0];$('#nextStewardshipTitle').textContent=next?next.title:"Everything current";$('#nextStewardshipWhy').textContent=next?next.why:"Nothing needs attention right now.";$('#learnNext').onclick=()=>next&&openStewardship(next.id);$('#completeNext').onclick=()=>next&&toggleSteward(next.id);$('#knowledgeList').innerHTML=S.g('gh_knowledge',D.knowledge).map(x=>`<div class="knowledge-card"><strong>${esc(x.title)}</strong><small>${esc(x.sub)}</small></div>`).join('')}
function renderStewardship(){let st=S.g('gh_stewardship',D.stewardship);$('#stewardshipList').innerHTML=st.map(x=>`<button class="list-card" data-steward="${x.id}" style="text-align:left;width:100%"><div class="meta-row"><strong>${esc(x.title)}</strong><span>${x.done?'Done ✓':esc(x.cadence)}</span></div><small>${esc(x.why)}</small></button>`).join('');$$('[data-steward]').forEach(b=>b.onclick=()=>openStewardship(b.dataset.steward))}
function openStewardship(id){let x=S.g('gh_stewardship',D.stewardship).find(v=>v.id===id);if(!x)return;if(id==='water')return waterGuide(x);openSheet(`<div class="eyebrow">HOME STEWARDSHIP</div><h2>${esc(x.title)}</h2><p style="color:var(--muted);line-height:1.5">${esc(x.why)}</p><div class="meta-row"><span>${esc(x.cadence)}</span><span>${esc(x.difficulty)}</span></div><div class="note-box">Gathered will eventually add manufacturer-specific guidance when that matters, rather than pretending one schedule fits every home.</div><button class="cta" data-complete-steward="${x.id}">${x.done?'Mark not done':'Mark complete'}</button>`)}
function waterGuide(x){openSheet(`<div class="eyebrow">HOME STEWARDSHIP</div><h2>Find your main water shutoff</h2><p style="color:var(--muted);line-height:1.5">Find this before you ever need it.</p><div class="section-title">WHAT IT MAY LOOK LIKE</div><div class="visual-guide"><div class="valve-mini"><div class="wheel-art"><span></span></div><strong>Gate valve</strong><small>round wheel</small></div><div class="valve-mini"><div class="lever-art"><span></span></div><strong>Ball valve</strong><small>straight lever</small></div></div><div class="section-title">WHERE TO LOOK</div><ol class="guide-list"><li>Where the main water line enters your home</li><li>Basement or foundation wall facing the street</li><li>Near the water meter</li><li>Utility room or crawl space</li></ol><div class="note-box"><b>Don't force a stuck valve.</b> If it's corroded, leaking, unfamiliar, or requires excessive force, stop and contact a plumber or your water utility.</div><div class="eyebrow">SAVE YOUR LOCATION</div><input id="waterLoc" value="${ea(S.g('gh_waterLoc',''))}" placeholder="Basement, front wall beside meter"><textarea id="waterNote" placeholder="Optional note">${ea(S.g('gh_waterNote',''))}</textarea><button class="cta" id="saveWater">Save to my home</button>`)}
document.addEventListener('click',e=>{let id=e.target.dataset.completeSteward;if(id){toggleSteward(id);sheet.close()}if(e.target.id==='saveWater'){S.s('gh_waterLoc',$('#waterLoc').value.trim());S.s('gh_waterNote',$('#waterNote').value.trim());let refs=S.g('gh_refs',D.refs),r=refs.find(x=>x.label==='Main water shutoff');if(r)r.value=S.g('gh_waterLoc','Location saved');S.s('gh_refs',refs);let st=S.g('gh_stewardship',D.stewardship),w=st.find(x=>x.id==='water');if(w&&!w.done){w.done=true;w.completedAt=new Date().toISOString();S.s('gh_stewardship',st);addHistory('Main water shutoff located')}mark();renderAll();sheet.close()}});
function toggleSteward(id){let st=S.g('gh_stewardship',D.stewardship),x=st.find(v=>v.id===id);if(!x)return;x.done=!x.done;if(x.done){x.completedAt=new Date().toISOString();addHistory(x.title)}S.s('gh_stewardship',st);mark();renderAll()}
function addHistory(title){let h=S.g('gh_history',[]);h.unshift({id:Date.now(),title,date:new Date().toISOString()});S.s('gh_history',h)}
function renderRooms(){let a=S.g('gh_rooms',D.rooms);$('#roomsGrid').innerHTML=a.map(r=>`<button class="room-card"><strong>${esc(r)}</strong><small>Open room</small></button>`).join('')}
$('#addRoomBtn').onclick=()=>openSheet(`<div class="eyebrow">ROOMS & AREAS</div><h2>Add a space</h2><input id="roomIn" placeholder="Mudroom"><button class="cta" id="saveRoom">Add room</button>`);
document.addEventListener('click',e=>{if(e.target.id==='saveRoom'){let v=$('#roomIn').value.trim();if(v){let a=S.g('gh_rooms',D.rooms);a.push(v);S.s('gh_rooms',a);renderRooms();sheet.close()}}});
function renderSystems(){let a=S.g('gh_systems',D.systems);$('#systemsList').innerHTML=a.map(x=>`<button class="list-card" style="text-align:left;width:100%"><strong>${esc(x.name)}</strong><small>${esc(x.detail)}</small></button>`).join('')}
$('#addSystemBtn').onclick=()=>openSheet(`<div class="eyebrow">SYSTEMS & APPLIANCES</div><h2>Add equipment</h2><input id="sysName" placeholder="Dishwasher"><input id="sysDetail" placeholder="Model, filter, useful detail"><button class="cta" id="saveSystem">Save</button>`);
document.addEventListener('click',e=>{if(e.target.id==='saveSystem'){let n=$('#sysName').value.trim();if(n){let a=S.g('gh_systems',D.systems);a.push({id:Date.now(),name:n,detail:$('#sysDetail').value.trim()||'No details saved yet'});S.s('gh_systems',a);renderSystems();sheet.close()}}});
function renderProjects(){let a=S.g('gh_projects',D.projects);$('#projectsList').innerHTML=a.map(x=>`<div class="list-card"><div class="meta-row"><strong>${esc(x.title)}</strong><span>${esc(x.status)}</span></div><small>${esc(x.room||'No room')}</small></div>`).join('')}
$('#addProjectBtn').onclick=()=>openSheet(`<div class="eyebrow">PROJECTS & REPAIRS</div><h2>Add a project</h2><input id="projTitle" placeholder="Repair bathroom trim"><input id="projRoom" placeholder="Room or area"><button class="cta" id="saveProject">Save project</button>`);
document.addEventListener('click',e=>{if(e.target.id==='saveProject'){let v=$('#projTitle').value.trim();if(v){let a=S.g('gh_projects',D.projects);a.unshift({id:Date.now(),title:v,room:$('#projRoom').value.trim(),status:'Planning'});S.s('gh_projects',a);renderProjects();sheet.close()}}});
function renderRefs(){let a=S.g('gh_refs',D.refs);$('#referenceList').innerHTML=a.map(x=>`<div class="list-card"><strong>${esc(x.label)}</strong><small>${esc(x.value)}</small></div>`).join('')}
$('#addReferenceBtn').onclick=()=>openSheet(`<div class="eyebrow">HOME REFERENCE</div><h2>Save something useful</h2><input id="refLabel" placeholder="Furnace filter size"><input id="refValue" placeholder="16 × 25 × 1"><button class="cta" id="saveRef">Save reference</button>`);
document.addEventListener('click',e=>{if(e.target.id==='saveRef'){let l=$('#refLabel').value.trim();if(l){let a=S.g('gh_refs',D.refs);a.unshift({id:Date.now(),label:l,value:$('#refValue').value.trim()});S.s('gh_refs',a);renderRefs();sheet.close()}}});
function renderHistory(){let a=S.g('gh_history',[]);$('#historyList').innerHTML=a.length?a.map(x=>`<div class="list-card"><strong>${esc(x.title)}</strong><small>${new Date(x.date).toLocaleDateString()}</small></div>`).join(''):`<div class="placeholder-card">Completed home care will appear here automatically.</div>`}
$('#quickAdd').onclick=()=>openSheet(`<div class="eyebrow">QUICK ADD</div><h2>Get it out of your head.</h2><input id="quickIn" placeholder="Something that needs tending..."><button class="cta" id="quickSave">Add to Today</button>`);
document.addEventListener('click',e=>{if(e.target.id==='quickSave'){let v=$('#quickIn').value.trim();if(v){let a=S.g('gh_tasks',D.tasks);a.push({id:Date.now(),text:v,done:false});S.s('gh_tasks',a);mark();renderToday();sheet.close()}}});
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}function ea(v=''){return esc(v)}
function renderAll(){renderRhythm();renderToday();renderHousehold();renderStewardship();renderRooms();renderSystems();renderProjects();renderRefs();renderHistory()}
renderAll();