const SB_URL="https://ulycivxmrkbuwbrxbzgd.supabase.co";
const SB_ANON_KEY="sb_publishable_kiLaJIXU3-QjP_agL7pNvQ_kTHL2y3y";
const db=(window.supabase&&SB_URL.startsWith("https://")&&SB_ANON_KEY!=="YOUR_SUPABASE_ANON_KEY")?window.supabase.createClient(SB_URL,SB_ANON_KEY):null;

const CONTACT={
email:"tanishhdumbbo@gmail.com",
discord:"https://discord.com/users/1465283869195501670",
instagram:"https://www.instagram.com/tanishhhg?evlk=MTQxaGNlMDlwNGRnYg=="
};

const TEAM=[
{name:"Tanish",role:"Founder & Lead Developer",detail:"Discord development, website design and Roblox game development."},
{name:"Weirdmine",role:"Developer",detail:"Development team staff."},
{name:"Sky",role:"Helper · Team Staff",detail:"Community assistance and team support."}
];

const page=new URLSearchParams(location.search).get("page")||"home";
const app=document.getElementById("app");
document.getElementById("year").textContent=new Date().getFullYear();

document.querySelectorAll("[data-page]").forEach(a=>a.classList.toggle("active",a.dataset.page===page));

document.getElementById("menu").onclick=()=>document.getElementById("nav").classList.toggle("open");

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function rows(table,query){
if(!db)return [];
let q=db.from(table).select("*");
if(query)q=query(q);
let {data,error}=await q;
if(error){console.warn(error);return []}
return data||[];
}

function shell(kicker,title,desc,body){
return `<section class="page"><div class="page-intro"><div class="eyebrow">${kicker}</div><h1 class="page-title">${title}</h1><p class="muted">${desc}</p></div>${body}</section>`;
}

function contactCards(){
return `<div class="grid">
<article class="card"><div class="iconbox">✉</div><h3>Email</h3><p>${CONTACT.email}</p><a class="btn" href="mailto:${CONTACT.email}">Email Tanish ↗</a></article>
<article class="card"><div class="iconbox">◈</div><h3>Discord</h3><p>Connect with Tanish on Discord.</p><a class="btn" target="_blank" rel="noopener" href="${CONTACT.discord}">Open Discord ↗</a></article>
<article class="card"><div class="iconbox">◎</div><h3>Instagram</h3><p>Follow Tanish on Instagram.</p><a class="btn" target="_blank" rel="noopener" href="${CONTACT.instagram}">Open Instagram ↗</a></article>
</div>`;
}

async function render(){

if(page==="home"){
app.innerHTML=`<section class="hero"><div><div class="eyebrow">Digital creator · Developer</div><h1>Think.<br><span class="gradient">Design. Build.</span></h1><p class="lead">I'm Tanish — building organised Discord communities, designing modern websites and developing Roblox game experiences.</p><div class="actions"><a class="btn" href="?page=projects">Explore my work ↗</a><a class="btn alt" href="?page=contact">Start a project</a></div><div class="pills"><span class="pill">Discord Development</span><span class="pill">Website Design</span><span class="pill">Roblox Game Development</span></div></div><div class="hero-card"><div class="monogram">T.</div><h3>Creative mind. Builder mindset.</h3><p>Turning ideas into digital experiences, one detail at a time.</p></div></section><section class="section"><div class="section-head"><div><div class="eyebrow">What I do</div><h2>Built for the digital world.</h2></div><a class="btn alt" href="?page=services">All services ↗</a></div><div class="grid">${serviceCards()}</div></section><section class="section"><div class="section-head"><div><div class="eyebrow">Latest updates</div><h2>What's new.</h2></div><a class="btn alt" href="?page=news">All news ↗</a></div><div id="homeNews" class="grid"><div class="empty">News posts will appear here.</div></div></section>`;

const news=await rows("news",q=>q.eq("published",true).order("created_at",{ascending:false}).limit(3));

document.getElementById("homeNews").innerHTML=news.length?news.map(n=>`<article class="card"><div class="tag">${esc(n.category||"Update")}</div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></article>`).join(""):`<div class="empty">New updates will appear here soon.</div>`;
return;
}

if(page==="projects"){
let projects=await rows("projects",q=>q.eq("published",true).order("created_at",{ascending:false}));
app.innerHTML=shell("Selected work","Ideas into experiences.","A selection of Discord, website and Roblox projects.",projects.length?`<div class="grid">${projects.map(p=>`<article class="card"><div class="tag">${esc(p.category||"Project")}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.url?`<a class="btn alt" href="${esc(p.url)}" target="_blank" rel="noopener">View project ↗</a>`:""}</article>`).join("")}</div>`:`<div class="empty">Projects will be published here soon.</div>`);
return;
}

if(page==="services"){
app.innerHTML=shell("What I do","Services built around your ideas.","Choose a service and tell me what you're planning.",`<div class="grid">${serviceCards()}</div><div class="actions"><a class="btn" href="?page=budget">Plan your budget ↗</a></div>`);
return;
}

if(page==="team"){
app.innerHTML=shell("The people behind the work","Meet the team.","A small creative and development team.",`<div class="grid">${TEAM.map((m,i)=>`<article class="card"><div class="iconbox">${i===0?"✦":"◈"}</div><h3>${m.name}</h3><span class="team-role">${m.role}</span><p>${m.detail}</p>${i===1?`<a href="https://discord.com/users/1449633180494729400" target="_blank" rel="noopener" class="muted">Discord profile ↗</a>`:i===2?`<a href="https://discord.com/users/1541710506715250707" target="_blank" rel="noopener" class="muted">Discord profile ↗</a>`:""}</article>`).join("")}</div>`);
return;
}

if(page==="about"){
app.innerHTML=shell("About Tanish","The person behind the pixels.","I enjoy turning ideas into polished digital experiences.",`<article class="card"><h3>Hey, I'm Tanish.</h3><p>I work across Discord server development, website design and Roblox game development. My focus is creating clear, memorable and useful digital experiences — from organised online communities to interactive websites and game worlds.</p><p>I care about clean design, thoughtful details and making things easy to use.</p></article>`);
return;
}

if(page==="contact"){
app.innerHTML=shell("Let's connect","Have a project in mind?","Reach out through any of these links. You can also send a project brief with your budget.",contactCards()+`<div class="actions"><a class="btn" href="?page=budget">Send project brief ↗</a></div>`);
return;
}

if(page==="reviews"){
let reviews=await rows("reviews",q=>q.eq("status","approved").order("created_at",{ascending:false}));
app.innerHTML=shell("Client feedback","Reviews & testimonials.","Feedback from people who have worked with Tanish.",`<div class="two"><div>${reviews.length?reviews.map(r=>`<article class="card review"><div class="stars">${"★".repeat(Number(r.rating)||5)}</div><blockquote>“${esc(r.message)}”</blockquote><div class="person">— ${esc(r.name)}</div><p>${esc(r.service||"")}</p></article>`).join(""):`<div class="empty">No published reviews yet. Be the first to share feedback.</div>`}</div><form class="card" id="reviewForm"><h3>Leave a review</h3><div class="field"><label>Name</label><input name="name" maxlength="70" required></div><div class="field"><label>Service</label><select name="service"><option>Discord Development</option><option>Website Design</option><option>Roblox Game Development</option><option>Other</option></select></div><div class="field"><label>Rating</label><select name="rating"><option value="5">★★★★★ — 5</option><option value="4">★★★★ — 4</option><option value="3">★★★ — 3</option><option value="2">★★ — 2</option><option value="1">★ — 1</option></select></div><div class="field"><label>Your review</label><textarea name="message" maxlength="1200" required></textarea></div><button class="btn">Submit for approval</button><p class="muted" id="reviewStatus">Reviews appear publicly only after admin approval.</p></form></div>`);

document.getElementById("reviewForm").onsubmit=async e=>{
e.preventDefault();
await submitRow("reviews",Object.fromEntries(new FormData(e.target)),e.target);
};
return;
}

if(page==="qa"){
let qs=await rows("questions",q=>q.eq("status","answered").order("created_at",{ascending:false}));
app.innerHTML=shell("Questions & answers","Ask Tanish.","Ask a question about services, projects, availability or working together.",`<div class="two"><div>${qs.length?qs.map(q=>`<article class="card"><h3>${esc(q.question)}</h3><p>${esc(q.answer)}</p><small class="muted">Asked by ${esc(q.name||"Visitor")}</small></article>`).join(""):`<div class="empty">No public answers yet. Ask the first question.</div>`}</div><form class="card" id="qForm"><h3>Ask a question</h3><div class="field"><label>Your name (optional)</label><input name="name" maxlength="70"></div><div class="field"><label>Your question</label><textarea name="question" maxlength="1000" required></textarea></div><button class="btn">Send question</button><p class="muted" id="qStatus">Questions are reviewed before publication.</p></form></div>`);

document.getElementById("qForm").onsubmit=async e=>{
e.preventDefault();
await submitRow("questions",Object.fromEntries(new FormData(e.target)),e.target);
};
return;
}

if(page==="news"){
let news=await rows("news",q=>q.eq("published",true).order("created_at",{ascending:false}));
app.innerHTML=shell("Announcements","News & updates.","The latest projects, releases and announcements.",news.length?`<div class="grid">${news.map(n=>`<article class="card"><div class="tag">${esc(n.category||"Update")}</div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><small class="muted">${new Date(n.created_at).toLocaleDateString()}</small></article>`).join("")}</div>`:`<div class="empty">No updates published yet. Check back soon.</div>`);
return;
}

if(page==="budget"){
app.innerHTML=shell("Project inquiry","Let's plan your project.","Choose a budget range or enter your own amount. This helps Tanish understand your requirements.",`<form class="card form-card" id="budgetForm"><div class="field"><label>Your name</label><input name="name" required maxlength="70"></div><div class="field"><label>Email or Discord username</label><input name="contact" required maxlength="120"></div><div class="field"><label>What do you need?</label><select name="service"><option>Discord Server Development</option><option>Website Design</option><option>Roblox Game Development</option><option>Other</option></select></div><div class="field"><label>Select a budget (INR)</label><select id="budgetPreset"><option value="Not decided">Not decided</option><option>₹500–₹1,000</option><option>₹1,000–₹3,000</option><option>₹3,000–₹5,000</option><option>₹5,000–₹10,000</option><option>₹10,000+</option><option value="custom">Enter my own budget</option></select></div><div class="field" id="customBudget" hidden><label>Custom budget (INR)</label><input id="customAmount" type="number" min="1" placeholder="Enter amount"></div><div class="field"><label>Project details</label><textarea name="details" required maxlength="2000"></textarea></div><button class="btn">Send project request</button><p class="muted" id="budgetStatus">Your request will be sent privately to the admin.</p></form>`);

const preset=document.getElementById("budgetPreset");
const custom=document.getElementById("customBudget");
preset.onchange=()=>custom.hidden=preset.value!=="custom";

document.getElementById("budgetForm").onsubmit=async e=>{
e.preventDefault();
let d=Object.fromEntries(new FormData(e.target));
d.budget=preset.value==="custom"?"₹"+document.getElementById("customAmount").value:preset.value;
if(preset.value==="custom"&&!document.getElementById("customAmount").value){
document.getElementById("budgetStatus").textContent="Enter your custom budget.";
return;
}
await submitRow("budgets",d,e.target);
};
return;
}

app.innerHTML=shell("Page not found","That page isn't here.","Use the navigation above to explore TanishGG.",`<a class="btn" href="index.html">Back home</a>`);
}

function serviceCards(){
return [
{i:"◈",t:"Discord Server Development",d:"Custom servers, roles, permissions, bots, embeds and community systems."},
{i:"⌘",t:"Website Design",d:"Responsive portfolios, landing pages and business websites."},
{i:"🎮",t:"Roblox Game Development",d:"Game concepts, interactive experiences and Roblox development."},
{i:"✳",t:"UI / UX & Creative Development",d:"Clear interfaces, front-end builds, interactions and polished details."}
].map(s=>`<article class="card"><div class="iconbox">${s.i}</div><h3>${s.t}</h3><p>${s.d}</p></article>`).join("");
}

async function submitRow(table,data,form){
const status=form.querySelector("p[id$='Status']");
if(!db){
status.textContent="Connect Supabase in assets/app.js to enable submissions.";
return;
}
const {error}=await db.from(table).insert(data);
status.textContent=error?"Could not submit right now. Please try again.":"Submitted successfully! It will appear after review.";
if(!error)form.reset();
}

render();

// AI assistant
const chat=document.getElementById("chat");
document.getElementById("aiOpen").onclick=()=>chat.classList.add("open");
document.getElementById("aiClose").onclick=()=>chat.classList.remove("open");

const log=document.getElementById("chatLog");

function bubble(t,who){
const p=document.createElement("p");
p.className=who;
p.textContent=t;
log.appendChild(p);
log.scrollTop=log.scrollHeight;
}

document.getElementById("chatForm").onsubmit=async e=>{
e.preventDefault();

const input=document.getElementById("chatInput");
const q=input.value.trim();
if(!q)return;

bubble(q,"user");
input.value="";

let answer=`You can contact Tanish at ${CONTACT.email}, through Discord or Instagram. Services include Discord development, website design and Roblox game development. Use the Contact or Budget page to send a project request.`;

if(db){
try{
const {data,error}=await db.functions.invoke("ask-ai",{body:{question:q}});
if(!error&&data?.answer)answer=data.answer;
else if(error)console.warn("AI function error:",error);
}catch(error){
console.warn("AI request failed:",error);
}
}

bubble(answer,"bot");
};
  
