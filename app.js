const app=document.getElementById("app"), sheet=document.getElementById("sheet"), sheetBody=document.getElementById("sheetBody");
const state={screen:"household",sub:null,profile:null,tab:"Daily"};

const daily=[
 ["Make beds & clear clutter","Bedrooms"],["Wipe counters & table","Kitchen & dining"],
 ["Do dishes / load dishwasher","Kitchen"],["Tidy main living area","Pick up & reset"],["1 load of laundry","Wash, dry or fold"]
];
const weekly=[["Bathrooms","Sink, toilet, tub & towels"],["Floors","Vacuum, sweep & mop"],["Bedding & linens","Sheets, towels & refresh"],["Kitchen deep reset","Fridge check, fronts & sink"]];
const monthly=[["Appliance care","Wipe, inspect & maintain"],["Dust overlooked places","Fans, vents & trim"],["Declutter one small zone","A drawer, shelf or basket"],["Home supply check","Restock household basics"]];
const seasonal=[["Seasonal home reset","Rotate clothing & household items"],["Safety check","Detectors, emergency supplies"],["Outdoor transition","Porch, garden & weather prep"],["Deep clean rotation","Choose one neglected area"]];

function nav(active="household"){
 document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===active));
}
function back(title="Household"){return `<div class="topbar"><button class="iconbtn" data-action="back">‹</button><div class="title">${title}</div><button class="iconbtn">•••</button></div>`}
function household(){
 nav(); app.innerHTML=`<section class="page">
  <div class="eyebrow">Gathered</div><h1>Household</h1><p class="sub">The practical side of tending home & family.</p>
  <div class="section-head"><b>Our family</b><button data-open="family">View all ›</button></div>
  <div class="family-strip">
   ${["Emi","David","Clayton","Levi"].map(n=>`<button class="person" data-profile="${n}"><span class="avatar">${n[0]}</span><small>${n}</small></button>`).join("")}
   <button class="person"><span class="avatar">＋</span><small>Add</small></button>
  </div>
  <div class="section-head"><b>Household areas</b></div>
  <div class="grid">
   <button class="tile" data-open="home"><span class="symbol">⌂</span><h3>Home</h3><p>Repairs, projects, maintenance & systems</p></button>
   <button class="tile" data-open="cleaning"><span class="symbol">✓</span><h3>Cleaning & Resets</h3><p>Daily, weekly, monthly & seasonal</p></button>
   <button class="tile" data-open="family"><span class="symbol">○</span><h3>Family</h3><p>Profiles, routines, growth & memories</p></button>
   <button class="tile" data-open="rhythm"><span class="symbol">◷</span><h3>Household Rhythm</h3><p>Meals, outings, supplies & hospitality</p></button>
  </div>
  <div class="section-head" style="margin-top:28px"><b>Home knowledge</b></div>
  <button class="feature" data-open="stewardship" style="width:100%;text-align:left"><div class="eyebrow">Next to learn</div><h2>Know where your main water shutoff is</h2><p>Emergency knowledge worth finding before you need it.</p></button>
 </section>`; wire();
}
function family(){
 app.innerHTML=`<section class="page">${back("Family")}<h1>Our family</h1><p class="sub">Profiles, rhythms, and memories for everyone in our family.</p>
 ${[["Emi","Your profile"],["David","Husband"],["Clayton","Son · Growing & learning"],["Levi","Son · Growing & learning"]].map(([n,s])=>`<button class="row" data-profile="${n}" style="width:100%;text-align:left"><span class="avatar">${n[0]}</span><span class="grow"><h3>${n}</h3><p>${s}</p></span><span class="chev">›</span></button>`).join("")}
 <button class="add-task">＋ Add family member</button></section>`; wire();
}
function clayton(){
 app.innerHTML=`<section class="page">${back("Family")}
 <div class="profile-hero"><span class="avatar">C</span><div><h1>Clayton</h1><p>Growing, learning & becoming.</p></div></div>
 <div class="profile-tabs"><button>Overview</button><button class="active">Growing & Learning</button><button>Routines</button><button>Favorites</button><button>Notes</button></div>
 <div class="learning-card"><div class="eyebrow">Growing & learning</div><h3>Development with purpose, not pressure.</h3><p>Keep age-appropriate learning ideas, goals, milestones, observations and questions together in one calm place.</p></div>
 <div class="section-head"><b>Right now</b><button>View all ›</button></div>
 <div class="row"><div class="grow"><h3>Learning ideas</h3><p>Play-based, age-appropriate activities you can choose from.</p></div><span class="chev">›</span></div>
 <div class="row"><div class="grow"><h3>Goals & next skills</h3><p>Skills you're gently working toward for his next stage.</p></div><span class="chev">›</span></div>
 <div class="row"><div class="grow"><h3>Milestones</h3><p>Track what you're noticing over time without turning childhood into a checklist.</p></div><span class="chev">›</span></div>
 <div class="row"><div class="grow"><h3>Observations & concerns</h3><p>Save patterns, questions and things you want to revisit.</p></div><span class="chev">›</span></div>
 <div class="section-head"><b>This week's gentle goals</b><button>＋ Add</button></div>
 <div class="goal"><span class="dot"></span><div class="grow"><b>Practice telling a simple story</b><small>Use pictures or something that happened today: beginning → middle → end.</small></div></div>
 <div class="goal"><span class="dot"></span><div class="grow"><b>Build independence into one routine</b><small>Let him choose and complete one manageable step himself.</small></div></div>
 </section>`; wire();
}
function cleaning(){
 const lists={Daily:daily,Weekly:weekly,Monthly:monthly,Seasonal:seasonal}, items=lists[state.tab];
 app.innerHTML=`<section class="page">${back("Household")}<h1>Cleaning & Resets</h1><p class="sub">Simple rhythms to keep home clean and calm.</p>
 <div class="tabs">${Object.keys(lists).map(t=>`<button class="${state.tab===t?"active":""}" data-tab="${t}">${t}</button>`).join("")}</div>
 <div class="section-head"><b>${state.tab} reset</b><button>Reorder</button></div>
 <div>${items.map((x,i)=>`<label class="checkrow"><input type="checkbox" data-check="${state.tab}-${i}"><span class="grow"><b>${x[0]}</b><small>${x[1]}</small></span><span style="color:#aaa">☰</span></label>`).join("")}</div>
 <button class="add-task">＋ Add task</button></section>`; wire(); restoreChecks();
}
function home(){
 app.innerHTML=`<section class="page">${back("Household")}<h1>Home</h1><p class="sub">Care for the place you've been given.</p>
 ${[["Repairs & Projects","Fix · improve · dream"],["Maintenance","Seasonal & routine care"],["Systems & Appliances","HVAC · water · electrical"],["Home Reference","Paint, measurements, manuals & more"],["History","What was done and when"],["Home Stewardship","Essential homeowner know-how"]].map(x=>`<div class="row"><div class="grow"><h3>${x[0]}</h3><p>${x[1]}</p></div><span class="chev">›</span></div>`).join("")}</section>`; wire();
}
function rhythm(){
 app.innerHTML=`<section class="page">${back("Household")}<h1>Household Rhythm</h1><p class="sub">The recurring things that help family life move more gently.</p>
 ${[["Daily Rhythms","Morning · afternoon · evening"],["Meal Planning","Plan · prep · recipes"],["Grocery & Supplies","Lists · essentials"],["Family Prep & Checklists","Outings · travel · events"],["Hospitality","Welcome others well"]].map(x=>`<div class="row"><div class="grow"><h3>${x[0]}</h3><p>${x[1]}</p></div><span class="chev">›</span></div>`).join("")}</section>`; wire();
}
function stewardship(){
 app.innerHTML=`<section class="page">${back("Household")}<div class="eyebrow">Home stewardship</div><h1>Find your main water shutoff</h1><p class="sub">Find this before you ever need it.</p>
 <div class="section-head"><b>What you're looking for</b></div>
 <div class="row"><div class="grow"><h3>Gate valve</h3><p>A round wheel-style handle attached to the incoming water line.</p></div></div>
 <div class="row"><div class="grow"><h3>Ball valve</h3><p>A straight lever handle; usually a quarter-turn to open or close.</p></div></div>
 <div class="section-head"><b>Where to look first</b></div>
 ${["Where the main water line enters your home","Basement or foundation wall facing the street","Near the water meter","Utility room or crawl space"].map((x,i)=>`<div class="checkrow"><b>${i+1}.</b><span>${x}</span></div>`).join("")}
 <div class="learning-card" style="margin-top:22px"><b>Don't force a stuck valve.</b><p>If it is corroded, leaking, unfamiliar, or needs excessive force, stop and contact a plumber or your water utility.</p></div>
 <button class="primary" id="saveLocation">Save where mine is located</button></section>`; wire();
}
function today(){
 nav("today");
 const tasks=JSON.parse(localStorage.getItem("gathered_today_tasks")||'[{"text":"Start one load of laundry","done":false},{"text":"Water seedlings","done":false}]');
 const done=tasks.filter(x=>x.done).length;
 const dinner=localStorage.getItem("gathered_dinner")||"Chicken soup + sourdough";
 app.innerHTML=`<section class="page">
  <div class="eyebrow">Gathered</div><h1>Good morning,<br>Emi</h1><p class="sub">${new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric"}).format(new Date())}</p>
  <div class="today-card"><div class="eyebrow">Gathered rhythm</div><div class="rhythm-line">${["M","T","W","T","F","S","S"].map((d,i)=>`<span class="daydot ${i===3?"done":""}">${d}<i>${i===3?"✓":""}</i></span>`).join("")}</div><p style="font-size:12px">A gentle record of showing up—not another requirement.</p></div>
  <div class="today-card soft"><div class="eyebrow">Today's focus</div><h2>${localStorage.getItem("gathered_focus")||"Reset the kitchen before dinner."}</h2><button class="primary" id="openReset">Start 10-minute reset</button></div>
  <div class="section-head"><b>Today at a glance</b></div>
  <div class="today-card">
    <button class="today-row" id="todayTending" style="width:100%;border-left:0;border-right:0;border-top:0;background:none;text-align:left"><span>✓</span><span class="grow"><b>Tending</b><small>${done} of ${tasks.length} tasks done</small></span><span class="chev">›</span></button>
    <button class="today-row" id="todayDinner" style="width:100%;border-left:0;border-right:0;border-top:0;background:none;text-align:left"><span>♨</span><span class="grow"><b>Dinner</b><small>${dinner}</small></span><span class="chev">›</span></button>
    <button class="today-row" data-go-household style="width:100%;border-left:0;border-right:0;border-top:0;background:none;text-align:left"><span>⌂</span><span class="grow"><b>For your home</b><small>Household, maintenance & family</small></span><span class="chev">›</span></button>
    <button class="today-row" id="todayScripture" style="width:100%;border:0;background:none;text-align:left"><span>✝</span><span class="grow"><b>Scripture</b><small>Colossians 3:23</small></span><span class="chev">›</span></button>
  </div>
 </section>`;
 document.getElementById("openReset").onclick=resetSheet;
 document.getElementById("todayTending").onclick=tendingSheet;
 document.getElementById("todayDinner").onclick=dinnerSheet;
 document.querySelector("[data-go-household]").onclick=household;
 document.getElementById("todayScripture").onclick=faith;
}
function tendingSheet(){
 const tasks=JSON.parse(localStorage.getItem("gathered_today_tasks")||'[{"text":"Start one load of laundry","done":false},{"text":"Water seedlings","done":false}]');
 sheetBody.innerHTML=`<div class="sheet"><div class="topbar"><div></div><button class="iconbtn" id="closeSheet">×</button></div><div class="eyebrow">Tending</div><h2>Today's tending</h2><div class="reset-list">${tasks.map((t,i)=>`<label><input type="checkbox" data-tend="${i}" ${t.done?"checked":""}><span>${t.text}</span></label>`).join("")}</div><input id="newTend" placeholder="Add something small"><button class="primary" id="addTend">Add to today</button></div>`;
 sheet.showModal(); document.getElementById("closeSheet").onclick=()=>sheet.close();
 document.querySelectorAll("[data-tend]").forEach(x=>x.onchange=()=>{tasks[+x.dataset.tend].done=x.checked;localStorage.setItem("gathered_today_tasks",JSON.stringify(tasks))});
 document.getElementById("addTend").onclick=()=>{let v=document.getElementById("newTend").value.trim();if(v){tasks.push({text:v,done:false});localStorage.setItem("gathered_today_tasks",JSON.stringify(tasks));sheet.close();today()}};
}
function resetSheet(){
 const items=["Gather dishes","Clear counters","Start one load (laundry or dishwasher)","Wipe counters","Reset the living area"];
 let st=JSON.parse(localStorage.getItem("gathered_reset")||"{}");
 sheetBody.innerHTML=`<div class="sheet"><div class="topbar"><div></div><button class="iconbtn" id="closeSheet">×</button></div><div class="eyebrow">10-minute reset</div><h2>Kitchen reset</h2><p style="color:var(--muted)">Just enough to make tomorrow easier.</p><div class="reset-list">${items.map((x,i)=>`<label><input type="checkbox" data-reset="${i}" ${st[i]?"checked":""}><span>${x}</span></label>`).join("")}</div><button class="primary" id="tendedRoom">I tended this room</button></div>`;
 sheet.showModal(); document.getElementById("closeSheet").onclick=()=>sheet.close();
 document.querySelectorAll("[data-reset]").forEach(x=>x.onchange=()=>{st[x.dataset.reset]=x.checked;localStorage.setItem("gathered_reset",JSON.stringify(st))});
 document.getElementById("tendedRoom").onclick=()=>sheet.close();
}
function dinnerSheet(){
 sheetBody.innerHTML=`<div class="sheet"><div class="topbar"><div></div><button class="iconbtn" id="closeSheet">×</button></div><div class="eyebrow">Dinner</div><h2>What's for dinner?</h2><input id="dinnerInput" value="${localStorage.getItem("gathered_dinner")||"Chicken soup + sourdough"}"><button class="primary" id="saveDinner">Save dinner</button></div>`;
 sheet.showModal(); document.getElementById("closeSheet").onclick=()=>sheet.close(); document.getElementById("saveDinner").onclick=()=>{localStorage.setItem("gathered_dinner",document.getElementById("dinnerInput").value);sheet.close();today()};
}
function faith(){
 nav("today");
 app.innerHTML=`<section class="page">${back("Today")}<div class="eyebrow" style="text-align:center">Today's word</div><h1 style="font-size:42px;text-align:center;margin-top:8px">Colossians 3:23</h1><div class="faith-verse">“Whatever you do, work heartily, as for the Lord and not for men.”</div><p style="text-align:center;color:var(--muted)">World English Bible · public domain</p><div class="pill-actions"><button>Reflect</button><button>Highlight</button><button>Note</button></div><div class="section-head" style="margin-top:30px"><b>Go deeper</b></div>${[["Read Colossians 3","Read the full chapter"],["My Notes","Thoughts & prayers"],["Previous Scriptures","Your daily journey"],["Bible Lessons","Grow in the Word"]].map(x=>`<div class="row"><div class="grow"><h3>${x[0]}</h3><p>${x[1]}</p></div><span class="chev">›</span></div>`).join("")}</section>`; wire(); document.querySelector("[data-action=back]").onclick=today;
}
function commonplace(){
 nav("commonplace");app.innerHTML=`<section class="page"><div class="eyebrow">Commonplace</div><h1>Things worth keeping.</h1><p class="sub">Notes, ideas, recipes, memories and anything you don't want to lose.</p><div class="learning-card"><h3>Your gathered inbox</h3><p>Quick-add items will eventually be organized here. The deeper Commonplace build is still ahead.</p></div></section>`;
}
function seasonal(){
 nav("seasonal");app.innerHTML=`<section class="page"><div class="eyebrow">Seasonal</div><h1>August at home.</h1><p class="sub">Garden, seasonal care, traditions and what matters in this season.</p><div class="learning-card"><h3>Seasonal is next to deepen</h3><p>The visual foundation is here; the full seasonal content library is still on the roadmap.</p></div></section>`;
}
function placeholder(name){({today,commonplace,seasonal}[name]||household)()}
function restoreChecks(){document.querySelectorAll("[data-check]").forEach(c=>{c.checked=localStorage.getItem("gathered_check_"+c.dataset.check)==="1";c.onchange=()=>localStorage.setItem("gathered_check_"+c.dataset.check,c.checked?"1":"0")})}
function wire(){
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>({family,cleaning,home,rhythm,stewardship}[b.dataset.open]||household)());
 document.querySelectorAll("[data-profile]").forEach(b=>b.onclick=()=>b.dataset.profile==="Clayton"?clayton():showProfile(b.dataset.profile));
 document.querySelectorAll("[data-action=back]").forEach(b=>b.onclick=household);
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;cleaning()});
 const sl=document.getElementById("saveLocation"); if(sl) sl.onclick=()=>openSheet("Save shutoff location",true);
}
function showProfile(name){app.innerHTML=`<section class="page">${back("Family")}<div class="profile-hero"><span class="avatar">${name[0]}</span><div><h1>${name}</h1><p>Family profile</p></div></div><div class="row"><div class="grow"><h3>Profile details</h3><p>Routines, notes, favorites and important information will live here.</p></div><span class="chev">›</span></div></section>`;wire()}
function openSheet(title, location=false){
 sheetBody.innerHTML=`<div class="sheet"><div class="topbar"><div></div><button class="iconbtn" id="closeSheet">×</button></div><h2>${title}</h2>${location?`<textarea id="loc" rows="4" placeholder="Example: Basement, front foundation wall, beside water meter">${localStorage.getItem("gathered_water_location")||""}</textarea><button class="primary" id="saveLoc">Save location</button>`:`<input id="quickText" placeholder="What do you want to remember?"><button class="primary" id="saveQuick">Save to Commonplace</button>`}</div>`;
 sheet.showModal(); document.getElementById("closeSheet").onclick=()=>sheet.close();
 if(location) document.getElementById("saveLoc").onclick=()=>{localStorage.setItem("gathered_water_location",document.getElementById("loc").value);sheet.close()}
 else document.getElementById("saveQuick").onclick=()=>{const a=JSON.parse(localStorage.getItem("gathered_inbox")||"[]");a.unshift({text:document.getElementById("quickText").value,createdAt:new Date().toISOString()});localStorage.setItem("gathered_inbox",JSON.stringify(a));sheet.close()}
}
document.getElementById("quickAdd").onclick=()=>openSheet("Quick add");
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>({household,today,commonplace,seasonal}[b.dataset.nav]||household)());
household();
