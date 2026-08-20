
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)) }
};

// Clean out earlier PWA experiments.
(async () => {
  try {
    if ('serviceWorker' in navigator) {
      for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    }
    if ('caches' in window) {
      for (const k of await caches.keys()) await caches.delete(k);
    }
  } catch(e) {}
})();

const defaults = {
  anchor: "Reset the kitchen before dinner.",
  dinner: "Chicken soup + sourdough",
  tending: [
    {id:"t1", text:"Start one load of laundry", done:false, type:"tending"},
    {id:"t2", text:"Water seedlings", done:false, type:"tending"}
  ],
  commonplace: [
    {id:"c1", title:"Emotion coaching notes", collection:"Parenting", tags:["research","toddlers"]},
    {id:"c2", title:"Colossians 3:23", collection:"Faith", tags:["scripture"]},
    {id:"c3", title:"Sourdough discard waffles", collection:"Food", tags:["recipe"]}
  ],
  rooms:["Kitchen","Living Room","Bathroom","Primary Bedroom","Kids' Room","Laundry","Porch","Garden"],
  projects:[
    {id:"p1", title:"Repair bathroom trim", room:"Bathroom", status:"Planning"}
  ],
  references:[
    {id:"r1", label:"Main water shutoff", value:"Location not saved yet"}
  ],
  stewardship:[
    {
      id:"s1",
      title:"Find your main water shutoff",
      why:"Knowing where it is can save time during a plumbing emergency.",
      cadence:"One-time setup",
      difficulty:"Beginner",
      done:false
    },
    {
      id:"s2",
      title:"Check dryer vent path",
      why:"Lint buildup can reduce dryer efficiency and contribute to fire risk.",
      cadence:"Periodic",
      difficulty:"Beginner",
      done:false
    },
    {
      id:"s3",
      title:"Check under sinks for slow leaks",
      why:"Small leaks can quietly damage cabinets, floors, and framing.",
      cadence:"Monthly-ish",
      difficulty:"Beginner",
      done:false
    }
  ],
  seasonal:[
    {title:"Late-summer garden check", category:"Garden", body:"Harvest what is ready, note what worked, and keep an eye on anything stressed by heat."},
    {title:"Freezer inventory", category:"Kitchen", body:"A quick freezer check now makes fall meal planning easier."},
    {title:"Notice the evening light", category:"Notice", body:"Days are shortening. Take one evening outside before the season shifts."}
  ],
  specialIdeas:[
    "Slice peaches after dinner and eat them outside.",
    "Light a candle at dinner tonight.",
    "Let the boys pick something small for the table.",
    "Put on music during the evening reset."
  ]
};

function ensure(key, value){
  if(localStorage.getItem(key) === null) store.set(key, value);
}
Object.entries(defaults).forEach(([k,v]) => ensure("g_"+k,v));

$('#dateLine').textContent = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date());
$('#anchorText').textContent = store.get('g_anchor', defaults.anchor);
$('#dinnerText').textContent = store.get('g_dinner', defaults.dinner);
$('#specialIdea').textContent = store.get('g_special', defaults.specialIdeas[0]);

// Navigation
$$('[data-go]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const target=btn.dataset.go;
    $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===target));
    $$('[data-go]').forEach(n=>n.classList.toggle('active',n.dataset.go===target));
    renderAll();
  });
});

// Generic dialog
const gd=$('#genericDialog');
$('#dialogClose').onclick=()=>gd.close();
function openDialog(title, bodyHtml, eyebrow="GATHERED"){
  $('#dialogEyebrow').textContent=eyebrow;
  $('#dialogTitle').textContent=title;
  $('#dialogBody').innerHTML=bodyHtml;
  gd.showModal();
}

// Today
$('#changeAnchorBtn').onclick=()=>{
  const current=store.get('g_anchor',defaults.anchor);
  const next=prompt('What is today anchored around?', current);
  if(next && next.trim()){
    store.set('g_anchor',next.trim());
    $('#anchorText').textContent=next.trim();
  }
};

function renderTending(){
  const items=store.get('g_tending',defaults.tending);
  $('#todayTending').innerHTML = items.length ? items.map(i=>`
    <label class="check-row">
      <input type="checkbox" data-tend-id="${i.id}" ${i.done?'checked':''}>
      <span>${escapeHtml(i.text)}</span>
    </label>`).join('') : `<p class="muted small">Nothing needs tending right now.</p>`;
  $$('[data-tend-id]').forEach(cb=>cb.onchange=()=>{
    const arr=store.get('g_tending',[]);
    const found=arr.find(x=>x.id===cb.dataset.tendId);
    if(found) found.done=cb.checked;
    store.set('g_tending',arr);
  });
}
$('#addTendingBtn').onclick=()=>{
  openDialog('Add something to tend',`
    <div class="field-label">What needs attention?</div>
    <input id="newTendingText" type="text" placeholder="Mop kitchen floor">
    <button class="primary-button" id="saveTendingBtn">Add to Today</button>
  `,'TENDING');
  setTimeout(()=>{
    $('#saveTendingBtn').onclick=()=>{
      const text=$('#newTendingText').value.trim();
      if(!text) return;
      const arr=store.get('g_tending',[]);
      arr.push({id:'t'+Date.now(),text,done:false,type:'tending'});
      store.set('g_tending',arr);
      gd.close(); renderTending();
    };
  },0);
};

$('#editMealBtn').onclick=()=>{
  openDialog('Tonight’s dinner',`
    <div class="field-label">Dinner</div>
    <input id="mealInput" type="text" value="${escapeAttr(store.get('g_dinner',defaults.dinner))}">
    <button class="primary-button" id="saveMealBtn">Save dinner</button>
  `,'MEALS');
  setTimeout(()=>{
    $('#saveMealBtn').onclick=()=>{
      const v=$('#mealInput').value.trim();
      if(v){ store.set('g_dinner',v); $('#dinnerText').textContent=v; }
      gd.close();
    };
  },0);
};

// Reset feature
$('#resetBtn').onclick=()=>{
  const saved=store.get('g_reset',{});
  openDialog('Just enough for now.',`
    <p class="dialog-copy">You do not have to finish the house.</p>
    <div id="resetList">
      ${['Gather dishes and cups','Put away obvious clutter','Start one load of laundry','Wipe kitchen counters','Reset the living room']
        .map((x,i)=>`<label class="check-row"><input type="checkbox" data-r="${i}" ${saved[i]?'checked':''}>${x}</label>`).join('')}
    </div>
    <button class="secondary-button" id="clearResetBtn">Start fresh</button>
    <p class="tiny center" id="resetMsg"></p>
  `,'10-MINUTE RESET');
  const update=()=>{
    const state={}; $$('[data-r]').forEach(b=>state[b.dataset.r]=b.checked); store.set('g_reset',state);
    const done=$$('[data-r]').filter(b=>b.checked).length;
    $('#resetMsg').textContent=done===5?'Done for now. That counts. 🌿':`${done} of 5 done.`;
  };
  $$('[data-r]').forEach(b=>b.onchange=update);
  $('#clearResetBtn').onclick=()=>{ $$('[data-r]').forEach(b=>b.checked=false); update(); };
  update();
};

$('#simplifyBtn').onclick=()=>{
  openDialog('What kind of day is it?',`
    <div class="pill-row">
      ${['Normal','Busy','Low Energy','Sick','Outing'].map(x=>`<button class="pill" data-mode="${x}">${x}</button>`).join('')}
    </div>
    <p class="dialog-copy" id="modeCopy">Choose a mode and Gathered will narrow your focus.</p>
  `,'SIMPLIFY TODAY');
  $$('[data-mode]').forEach(b=>b.onclick=()=>{
    const m=b.dataset.mode; store.set('g_mode',m);
    $$('.pill').forEach(p=>p.classList.toggle('selected',p===b));
    const messages={
      Normal:'Your full Today view stays visible.',
      Busy:'Keep the essentials visible and let the rest wait.',
      'Low Energy':'Focus on food, safety, and one or two home basics.',
      Sick:'Only true essentials matter today.',
      Outing:'Prioritize what needs to happen before and after you leave.'
    };
    $('#modeCopy').textContent=messages[m];
  });
};

// Stewardship
function renderStewardship(){
  const items=store.get('g_stewardship',defaults.stewardship);
  const first=items.find(x=>!x.done) || items[0];
  $('#stewardshipToday').innerHTML = first ? `
    <h3>${escapeHtml(first.title)}</h3>
    <p class="muted small">${escapeHtml(first.why)}</p>
    <div class="item-meta">${escapeHtml(first.cadence)} · ${escapeHtml(first.difficulty)}</div>
    <div class="item-actions">
      <button data-steward-info="${first.id}">Learn</button>
      <button data-steward-done="${first.id}">${first.done?'Completed':'Mark done'}</button>
    </div>` : `<p class="muted small">Nothing due right now.</p>`;

  $('#stewardshipList').innerHTML = items.map(x=>`
    <div class="item-card">
      <div class="item-top">
        <div>
          <strong>${escapeHtml(x.title)}</strong>
          <div class="item-meta">${escapeHtml(x.cadence)} · ${escapeHtml(x.difficulty)}</div>
        </div>
        <span class="status">${x.done?'Done':'Tending'}</span>
      </div>
      <p class="muted small">${escapeHtml(x.why)}</p>
      <div class="item-actions">
        <button data-steward-info="${x.id}">Why / how</button>
        <button data-steward-done="${x.id}">${x.done?'Undo':'Mark done'}</button>
      </div>
    </div>`).join('');

  $$('[data-steward-info]').forEach(b=>b.onclick=()=>{
    const x=store.get('g_stewardship',[]).find(i=>i.id===b.dataset.stewardInfo);
    if(!x) return;
    openDialog(x.title,`
      <p class="dialog-copy">${escapeHtml(x.why)}</p>
      <div class="field-label">Typical rhythm</div>
      <p class="dialog-copy">${escapeHtml(x.cadence)}</p>
      <div class="field-label">Difficulty</div>
      <p class="dialog-copy">${escapeHtml(x.difficulty)}</p>
      <div class="field-label">How Gathered will improve this later</div>
      <p class="dialog-copy">Manufacturer-specific guidance, seasonal timing, your home's systems, and a saved maintenance history.</p>
    `,'HOME STEWARDSHIP');
  });

  $$('[data-steward-done]').forEach(b=>b.onclick=()=>{
    const arr=store.get('g_stewardship',[]);
    const x=arr.find(i=>i.id===b.dataset.stewardDone);
    if(x) x.done=!x.done;
    store.set('g_stewardship',arr); renderStewardship();
  });
}

// Commonplace
let cpFilter='All';
function renderCommonplace(){
  const items=store.get('g_commonplace',defaults.commonplace);
  const cats=['All',...new Set(items.map(x=>x.collection))];
  $('#commonplaceFilters').innerHTML=cats.map(c=>`<button class="pill ${c===cpFilter?'selected':''}" data-cpf="${c}">${c}</button>`).join('');
  const filtered=cpFilter==='All'?items:items.filter(x=>x.collection===cpFilter);
  $('#commonplaceList').innerHTML=filtered.length?filtered.map(x=>`
    <div class="item-card">
      <strong>${escapeHtml(x.title)}</strong>
      <div class="item-meta">${escapeHtml(x.collection)}${x.tags?.length?' · '+x.tags.map(escapeHtml).join(' · '):''}</div>
    </div>`).join(''):`<p class="muted">Nothing saved here yet.</p>`;
  $$('[data-cpf]').forEach(b=>b.onclick=()=>{cpFilter=b.dataset.cpf;renderCommonplace()});
}
$('#addCommonplaceBtn').onclick=()=>{
  openDialog('Save to Commonplace',`
    <div class="field-label">Title</div>
    <input id="cpTitle" type="text" placeholder="Something worth remembering">
    <div class="field-label">Collection</div>
    <select id="cpCollection">
      <option>Parenting</option><option>Faith</option><option>Food</option><option>Homemaking</option><option>Garden</option><option>Kids & Learning</option><option>Other</option>
    </select>
    <div class="field-label">Tags (comma separated)</div>
    <input id="cpTags" type="text" placeholder="research, toddlers">
    <button class="primary-button" id="saveCpBtn">Save</button>
  `,'COMMONPLACE');
  setTimeout(()=>{
    $('#saveCpBtn').onclick=()=>{
      const title=$('#cpTitle').value.trim(); if(!title) return;
      const arr=store.get('g_commonplace',[]);
      arr.unshift({id:'c'+Date.now(),title,collection:$('#cpCollection').value,tags:$('#cpTags').value.split(',').map(x=>x.trim()).filter(Boolean)});
      store.set('g_commonplace',arr); gd.close(); renderCommonplace();
    };
  },0);
};

// Seasonal
function renderSeasonal(){
  const items=store.get('g_seasonal',defaults.seasonal);
  $('#seasonalList').innerHTML=items.map(x=>`
    <div class="item-card">
      <div class="item-top">
        <strong>${escapeHtml(x.title)}</strong><span class="status">${escapeHtml(x.category)}</span>
      </div>
      <p class="muted small">${escapeHtml(x.body)}</p>
    </div>`).join('');
}

// Rooms
function renderRooms(){
  const rooms=store.get('g_rooms',defaults.rooms);
  $('#roomList').innerHTML=rooms.map(r=>`<button class="room-chip" data-room="${escapeAttr(r)}">${escapeHtml(r)}</button>`).join('');
  $$('[data-room]').forEach(b=>b.onclick=()=>openDialog(b.dataset.room,`<p class="dialog-copy">This room will eventually collect its tending tasks, maintenance, projects, measurements, and reference notes in one place.</p>`,'ROOM'));
}
$('#addRoomBtn').onclick=()=>{
  openDialog('Add a room or area',`
    <input id="roomInput" type="text" placeholder="Mudroom">
    <button class="primary-button" id="saveRoomBtn">Add room</button>
  `,'HOUSEHOLD');
  setTimeout(()=>$('#saveRoomBtn').onclick=()=>{
    const v=$('#roomInput').value.trim(); if(!v)return;
    const arr=store.get('g_rooms',[]); arr.push(v); store.set('g_rooms',arr); gd.close(); renderRooms();
  },0);
};

// Projects
function renderProjects(){
  const items=store.get('g_projects',defaults.projects);
  $('#projectList').innerHTML=items.length?items.map(x=>`
    <div class="item-card">
      <div class="item-top"><strong>${escapeHtml(x.title)}</strong><span class="status">${escapeHtml(x.status)}</span></div>
      <div class="item-meta">${escapeHtml(x.room||'No room')}</div>
    </div>`).join(''):`<p class="muted small">No projects yet.</p>`;
}
$('#addProjectBtn').onclick=()=>{
  openDialog('Add a project',`
    <div class="field-label">Project</div><input id="projTitle" type="text" placeholder="Repair bathroom trim">
    <div class="field-label">Room</div><input id="projRoom" type="text" placeholder="Bathroom">
    <button class="primary-button" id="saveProjBtn">Save project</button>
  `,'PROJECTS');
  setTimeout(()=>$('#saveProjBtn').onclick=()=>{
    const t=$('#projTitle').value.trim(); if(!t)return;
    const arr=store.get('g_projects',[]); arr.unshift({id:'p'+Date.now(),title:t,room:$('#projRoom').value.trim(),status:'Planning'});
    store.set('g_projects',arr); gd.close(); renderProjects();
  },0);
};

// Reference
function renderReferences(){
  const items=store.get('g_references',defaults.references);
  $('#referenceList').innerHTML=items.map(x=>`
    <div class="item-card"><strong>${escapeHtml(x.label)}</strong><div class="item-meta">${escapeHtml(x.value)}</div></div>`).join('');
}
$('#addReferenceBtn').onclick=()=>{
  openDialog('Add home reference',`
    <div class="field-label">What is it?</div><input id="refLabel" type="text" placeholder="Furnace filter size">
    <div class="field-label">Value / location</div><input id="refValue" type="text" placeholder="16 × 25 × 1">
    <button class="primary-button" id="saveRefBtn">Save reference</button>
  `,'HOME REFERENCE');
  setTimeout(()=>$('#saveRefBtn').onclick=()=>{
    const l=$('#refLabel').value.trim(); if(!l)return;
    const arr=store.get('g_references',[]); arr.unshift({id:'r'+Date.now(),label:l,value:$('#refValue').value.trim()});
    store.set('g_references',arr); gd.close(); renderReferences();
  },0);
};

// Quick Add
let quickType='Inbox';
$('#quickAddOpen').onclick=()=>{renderInbox();$('#quickAddDialog').showModal();setTimeout(()=>$('#quickAddText').focus(),100)};
$('#quickAddClose').onclick=()=>$('#quickAddDialog').close();
$$('[data-quick-type]').forEach(b=>b.onclick=()=>{quickType=b.dataset.quickType;$$('[data-quick-type]').forEach(x=>x.classList.toggle('selected',x===b))});
$('#saveQuickAdd').onclick=()=>{
  const text=$('#quickAddText').value.trim(); if(!text)return;
  if(quickType==='Tending'){
    const arr=store.get('g_tending',[]); arr.push({id:'t'+Date.now(),text,done:false,type:'tending'}); store.set('g_tending',arr); renderTending();
  } else if(quickType==='Commonplace'){
    const arr=store.get('g_commonplace',[]); arr.unshift({id:'c'+Date.now(),title:text,collection:'Other',tags:[]}); store.set('g_commonplace',arr); renderCommonplace();
  } else {
    const arr=store.get('g_inbox',[]); arr.unshift({id:'i'+Date.now(),text,type:quickType,createdAt:new Date().toISOString()}); store.set('g_inbox',arr);
  }
  $('#quickAddText').value=''; $('#quickSaved').textContent='Saved.'; renderInbox();
};
function renderInbox(){
  const arr=store.get('g_inbox',[]);
  $('#recentInbox').innerHTML=arr.slice(0,4).map(x=>`<div class="mini-item">${escapeHtml(x.text)} <span class="tiny">· ${escapeHtml(x.type)}</span></div>`).join('');
}

// Helpers
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function escapeAttr(v=''){return escapeHtml(v).replace(/`/g,'&#096;')}

function renderAll(){
  renderTending(); renderStewardship(); renderCommonplace(); renderSeasonal(); renderRooms(); renderProjects(); renderReferences();
}
renderAll();
