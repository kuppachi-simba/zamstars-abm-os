/* ============================================================
   2. HELPERS
   ============================================================ */
const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const uid = (p)=> (p||'x')+'-'+Math.random().toString(36).slice(2,8);
const esc = (s)=> String(s==null?'':s).replace(/&(?!(amp|lt|gt|quot|#39|rsaquo|lsaquo|nbsp|mdash|ndash|uarr|darr|times);)/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const clamp = (v,a,b)=> Math.max(a,Math.min(b,v));
const num = (v,d)=>{ const n=parseFloat(v); return isNaN(n)?(d||0):n; };
const fmt = (n)=> (n==null||isNaN(n))?'-':Math.round(n*100)/100===Math.round(n)?Math.round(n).toLocaleString('en-IN'):(Math.round(n*10)/10).toLocaleString('en-IN');
const money = (n)=>{
  n = num(n,0);
  if(n>=10000000) return '₹'+(n/10000000).toFixed(n%10000000===0?0:2)+' Cr';
  if(n>=100000)  return '₹'+(n/100000).toFixed(n%100000===0?0:1)+' L';
  if(n>=1000)    return '₹'+(n/1000).toFixed(0)+'k';
  return '₹'+fmt(n);
};
const today = ()=> new Date().toISOString().slice(0,10);
const pct = (a,b)=> b?Math.round(a/b*100):0;

function toast(msg){
  const t=$('#toast'); t.innerHTML=msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('on'),3600);
}
function mix(hex,alpha){
  const h=String(hex||'#30302F').replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return 'rgba('+r+','+g+','+b+','+alpha+')';
}

/* ---------- the weighted account score ----------
   Has to survive being called during hydration, when the client is not in
   the store yet, so it falls back to the default weights. */
const DEFAULT_W = {}; SCORE_FACTORS.forEach(f=>DEFAULT_W[f.k]=f.w);
function weights(){
  const c = (typeof S!=='undefined' && S.clients) ? S.clients[S.current] : null;
  if(!c) return DEFAULT_W;
  if(!c.weights){ c.weights={}; SCORE_FACTORS.forEach(f=>c.weights[f.k]=f.w); }
  return c.weights;
}
function wSum(w){ let s=0; SCORE_FACTORS.forEach(f=>s+=num(w[f.k])); return s||100; }
function weightSum(){ return wSum(weights()); }
function scoreOf(a, wIn){
  const w = wIn || weights(), tot = wSum(w);
  let s=0; SCORE_FACTORS.forEach(f=>{ s += clamp(num(a[f.k]),0,10) * num(w[f.k]); });
  /* normalise to 0-100 whatever the weights add up to, then round to 1dp so a
     float artefact can never flip a tier boundary */
  return Math.round((s / tot) * 100)/10;
}
function tierOf(a, wIn){
  const s = scoreOf(a, wIn);
  return s>=TIER_BANDS.t1 ? 't1' : s>=TIER_BANDS.t2 ? 't2' : 't3';
}
const TIERLBL   = { t1:'Tier 1 · 1:1', t2:'Tier 2 · 1:Few', t3:'Tier 3 · 1:Many' };
const TIERPILL  = { t1:'t1p', t2:'t2p', t3:'t3p' };
const TIERSHORT = { t1:'T1', t2:'T2', t3:'T3' };
const TIERS = ['t1','t2','t3'];

/* ---------- budget allocation ----------
   The client gives one number. We split it across the tiers, with Tier 1
   getting the most because Tier 1 is where the evidence is, then across the
   live plays in each tier by effort weight.
   Type a number over a play and it becomes FIXED, so the rest of that tier
   redistributes around it. Switch a play off and its money goes back into
   the pool instead of being stranded. */
const TIER_SPLIT_DEFAULT = { t1:50, t2:32, t3:18 };

function tierSplit(c){
  c = c || cur();
  if(!c.tierSplit) c.tierSplit = Object.assign({}, TIER_SPLIT_DEFAULT);
  return c.tierSplit;
}
function splitSum(c){ const s = tierSplit(c); let n=0; TIERS.forEach(k=>n+=num(s[k])); return n||100; }
function tierTarget(k, c){
  c = c || cur();
  return Math.round(num(c.objective.budget) * num(tierSplit(c)[k]) / splitSum(c));
}
function tierActual(k, c){
  c = c || cur();
  let n=0; c.plays.forEach(p=>{ if(p.tier===k && p.on) n+=num(p.budget); }); return n;
}
function tierLocked(k, c){
  c = c || cur();
  let n=0; c.plays.forEach(p=>{ if(p.tier===k && p.on && p.lock) n+=num(p.budget); }); return n;
}
/* returns a per-tier report so the UI can explain itself */
function allocateBudget(c){
  c = c || cur();
  const report = {};
  TIERS.forEach(k=>{
    const target = tierTarget(k, c);
    const live   = c.plays.filter(p=>p.tier===k && p.on);
    const fixed  = live.filter(p=>p.lock);
    const auto   = live.filter(p=>!p.lock);
    let lockedSum = 0; fixed.forEach(p=>lockedSum+=num(p.budget));
    const remaining = target - lockedSum;
    report[k] = { target:target, live:live.length, fixed:fixed.length, auto:auto.length,
                  lockedSum:lockedSum, over: remaining<0 };
    if(!auto.length) return;
    const pool = Math.max(0, remaining);
    let ws = 0; auto.forEach(p=>ws+=num(p.weight));
    if(!ws){ auto.forEach(p=>p.weight=1); ws = auto.length; }
    let given = 0;
    auto.forEach(p=>{ p.budget = Math.round(pool * num(p.weight) / ws); given += p.budget; });
    /* the rounding remainder goes on the heaviest auto play, so tier totals come out exact */
    const diff = pool - given;
    if(diff){
      const big = auto.slice().sort((a,b)=>num(b.weight)-num(a.weight))[0];
      big.budget = Math.max(0, num(big.budget) + diff);
    }
  });
  c._alloc = report;
  return report;
}

/* ============================================================
   3. HYDRATION: turn a compact spec into a working programme
   ============================================================ */
function hydrate(spec){
  const c = {
    id: spec.id, name: spec.name, short: spec.short, url: spec.url,
    archetype: spec.archetype, industry: spec.industry, hq: spec.hq, contact: spec.contact,
    exec: JSON.parse(JSON.stringify(spec.exec||{why:[],how:[]})),
    successMetrics: [], metricsNote: spec.metricsNote||'',
    profile: JSON.parse(JSON.stringify(spec.profile||{})),
    objective: JSON.parse(JSON.stringify(spec.objective||{})),
    icpFit: (spec.icpFit||[]).slice(), disqualify: (spec.disqualify||[]).slice(),
    segments: JSON.parse(JSON.stringify(spec.segments||[])),
    personas: JSON.parse(JSON.stringify(spec.personas||[])),
    coreMessage: spec.coreMessage||'',
    umbrellas: JSON.parse(JSON.stringify(spec.umbrellas||[])),
    hooks: (spec.hooks||[]).slice(),
    method: spec.method||'',
    lens: JSON.parse(JSON.stringify(spec.lens||{})),
    weights: {},
    accounts:[], signals:[], journey:[], plays:[], roadmap:[], kpis:[], assets:[], sla:[], deps:[],
    signoff:{}, clientNotes:{},
    exec_:{ entries:[] }
  };
  SCORE_FACTORS.forEach(f=>c.weights[f.k]=f.w);

  /* success metrics */
  (spec.successMetrics||[]).forEach(m=>{
    c.successMetrics.push({ id:uid('sm'), metric:m[0], target:m[1], how:m[2], owner:m[3]||'' });
  });

  /* accounts */
  (spec.accounts||[]).forEach(a=>{
    c.accounts.push({ id:uid('a'), name:a[0], seg:a[1], city:a[2], incumbent:a[3],
      pot:a[4], fit:a[5], trig:a[6], geo:a[7], brand:a[8], rel:a[9], eng:a[10],
      note:a[11]||'', owner:'', stage:0, touches:0, meetings:0, roles:[] });
  });

  /* triggers */
  DEFAULT_SIGNALS.forEach(s=>{
    c.signals.push({ id:uid('sg'), name:s[0], source:s[1], weight:s[2],
      meaning:(spec.signalTweak&&spec.signalTweak[s[0]])||s[3], decay:s[4]||'', on:true });
  });

  /* journey */
  if(spec.journey){
    spec.journey.forEach(j=>{
      c.journey.push({ id:uid('j'), name:j.name, vg:j.vg, mindset:j.mindset, question:j.question,
        thinks:j.thinks, does:j.does, channels:(j.channels||[]).slice(), assets:(j.assets||[]).slice(),
        kpi:j.kpi, owner:j.owner, friction:j.friction, gen:false });
    });
  } else c.journey = generateJourney(spec.archetype);

  if(!c.personas.length) c.personas = generatePersonas(spec.archetype, c);

  /* plays */
  c.tierSplit = Object.assign({}, TIER_SPLIT_DEFAULT);
  PLAY_TEMPLATES.forEach(p=>{
    const tw = (spec.playTweaks&&spec.playTweaks[p[1]])||{};
    const nm = tw.name || p[1];
    c.plays.push({ id:uid('p'), tier:p[0], name:nm, channel:p[2], asset:p[3], effort:p[4],
      weight:p[5], desc:tw.desc||p[6], cta:tw.cta||p[7], best:tw.best||p[8],
      on: spec.selectedPlays ? spec.selectedPlays.indexOf(nm)>-1 : true,
      budget:0, lock:false, owner:'ZAMSTARS' });
  });
  allocateBudget(c);

  /* roadmap */
  ROADMAP_TEMPLATE.forEach(r=>{
    c.roadmap.push({ id:uid('r'), phase:r[0], week:r[1], activity:r[2], format:r[3], owner:r[4], output:r[5], status:'Planned' });
  });

  /* asset kit */
  ASSET_KIT.forEach(a=>{
    c.assets.push({ id:uid('as'), name:a[0], type:a[1], owner:a[2], status:'Not started' });
  });

  /* sla + dependencies */
  SLA_DEFAULT.forEach(s=>c.sla.push({ id:uid('sl'), trigger:s[0], response:s[1] }));
  DEPENDENCIES.forEach(d=>c.deps.push({ id:uid('dp'), text:d, done:false }));

  /* kpis */
  KPI_TEMPLATES.forEach(k=>{
    const ov = (spec.kpiOverrides&&spec.kpiOverrides[k[1]])||[null,null];
    c.kpis.push({ id:uid('k'), layer:k[0], vg:LAYERS[k[0]].vg, metric:k[1], def:k[2], unit:k[3],
      baseline: ov[0]==null?'':ov[0], target: ov[1]==null?'':ov[1], current:'', owner:'' });
  });

  if(spec.id==='demo') seedDemo(c);
  return c;
}
function tierWeightSum(t){ let s=0; PLAY_TEMPLATES.forEach(p=>{ if(p[0]===t) s+=p[5]; }); return s||1; }

function generateJourney(key){
  const arch = ARCHETYPES[key] || ARCHETYPES.infra;
  return arch.journey.map(row=>({
    id:uid('j'), name:row[0], vg:row[3], mindset:row[1], question:row[2],
    thinks:row[1], does:'Draft. What do they actually do at this stage?',
    channels:['LinkedIn','Email'], assets:['Draft. What does the work here?'],
    kpi:'Draft. Which single number proves this stage happened?',
    owner:'ZAMSTARS', friction:'Draft. What really gets in the way here?', gen:true
  }));
}
function generatePersonas(key, c){
  const t = PERSONA_TEMPLATES[key] || PERSONA_TEMPLATES.infra;
  const segIds = (c.segments||[]).filter(s=>s.on).map(s=>s.id);
  return t.map(p=>({ id:uid('pe'), role:p[0], crole:p[1], colour:ROLE_COL[p[1]]||C.ink, segs:segIds.slice(),
    goal:'Draft. What does this person actually want?',
    pain:'Draft. What is the problem they own?',
    pitch:'Draft. One sentence that would move them.',
    objection:'Draft. What will they push back on?',
    proof:'Draft. The evidence that answers that.',
    content:(COMMERCIAL_ROLES.filter(r=>r[0]===p[1])[0]||[])[3]||'',
    channels:['LinkedIn','Email'], gen:true }));
}

/* ---- seeded activity, so nobody is ever presenting an empty dashboard ---- */
function seedDemo(c){
  const by = {}; c.accounts.forEach(a=>by[a.name]=a);
  const set = (n, stage, touches, meetings, roles, owner)=>{
    const a = by[n]; if(!a) return;
    a.stage=stage; a.touches=touches; a.meetings=meetings; a.roles=roles||[]; a.owner=owner||'';
  };
  set('Ashcroft Hotels',7,13,5,['econ','tech','ops','proc','champ'],'Group Accounts');
  set('Harbourline REIT',5,11,3,['econ','champ','proj','proc'],'North Property');
  set('Kingsway Retail Group',4,9,2,['econ','ops','champ'],'Retail Desk');
  set('Castlebrook Estates',4,8,2,['econ','proj'],'South Property');
  set('Trentham Logistics',3,6,1,['tech','ops'],'Fleet Desk');
  set('Silverbrook Centres',3,6,1,['econ','champ'],'Retail Desk');
  set('Vantage Office Group',3,5,1,['econ'],'South Property');
  set('Belmont Collection',2,4,1,['champ','ops'],'Group Accounts');
  set('Pemberton Property',2,4,1,['proj','econ'],'North Property');
  set('Ardent Systems',2,3,0,['ops'],'Corporate Desk');
  set('Grayling Developments',2,3,0,['proj'],'North Property');
  set('Halden Malls',1,2,0,['champ'],'Retail Desk');
  set('Beckworth Financial',1,2,0,['ops'],'Corporate Desk');
  set('Rivergate Resorts',1,2,0,['champ'],'Group Accounts');
  set('Oakfield Distribution',1,1,0,['tech'],'Fleet Desk');
  set('Corvin Technologies',1,1,0,['ops'],'Corporate Desk');
  set('Northmoor Estates',1,1,0,['champ'],'North Property');
  c.accounts.forEach(a=>{ if(!a.owner) a.owner = tierOf(a, c.weights)==='t3'?'':'Unassigned'; });

  const pick = (n)=> c.plays.filter(p=>p.name===n)[0];
  const log = (playName, metric, value, date, note)=>{
    const p = pick(playName); if(!p) return;
    c.exec_.entries.push({ id:uid('e'), date:date, playId:p.id, metric:metric, value:value, note:note||'' });
  };
  log('Free site and grid assessment','Health checks accepted',6,'2026-07-28','Harbourline, Kingsway, Castlebrook, Ashcroft, Silverbrook, Trentham');
  log('Free site and grid assessment','Health checks completed',4,'2026-08-11','Harbourline Salford, Ashcroft Birmingham, Kingsway Leeds, Castlebrook Bristol');
  log('Move fast on a trigger','Triggers we hit inside two days',9,'2026-08-11','7 of 9 met the two day commitment');
  log('Move fast on a trigger','Meetings that came from a trigger',4,'2026-08-11','Grayling, Pemberton, Rivergate, Oakfield');
  log('Build them their own page','Page visits from people on the map',24,'2026-08-11','Harbourline 9, Kingsway 6, Castlebrook 5, Vantage 4');
  log('Write to them, on paper','Letters dispatched',5,'2026-07-14','All Tier 1 accounts');
  log('Write to them, on paper','Replies received',2,'2026-08-04','Harbourline and Ashcroft');
  log('Post them their own car park','Mailers dispatched',7,'2026-07-21','Tier 1 and top of Tier 2');
  log('Post them their own car park','Meetings from mailer',3,'2026-08-11','Kingsway, Pemberton, Silverbrook');
  log('Message the committee directly','Messages sent to people on the map',210,'2026-08-11','Mapped roles only, no open targeting');
  log('Message the committee directly','Replies',27,'2026-08-11','12.9% reply rate');
  log('Put ten peers in a room','Invitations sent',22,'2026-08-04','Manchester property cluster');
  log('Put ten peers in a room','Confirmed attendees',9,'2026-08-14','7 of 9 from Tier 1 or 2');
  log('Write the one document their sector needs','Downloads from target accounts',31,'2026-08-11','The offices guide performed best');
  log('Let them price their own problem','Completions',26,'2026-08-11','14 from named accounts');
  log('Catch them while they are searching','Qualified form fills',8,'2026-08-11','Grid capacity and funding model terms');
  log('Stay visible to the whole list','Accounts reached',18,'2026-08-11','91% list match rate');
  log('Advertise around the business parks','Impressions inside target precincts',124000,'2026-08-11','Manchester, Leeds, Bristol, Reading');
  log('Have a point of view in public','Engagement from target accounts',180,'2026-08-11','The parking as an asset piece did best');
  log('Let the field do the talking','Field posts published',31,'2026-08-11','Install and go-live stories');
  log('Pack the proof together','Pack opens by target accounts',19,'2026-08-11','Retail pack strongest');
  log('Standardise the portfolio','Benchmark workshops booked',3,'2026-08-11','Harbourline, Kingsway, Ashcroft');
  log('Get in before the design is frozen','Pre-design sessions booked',4,'2026-08-11','Pemberton, Grayling, Castlebrook, Trentham');

  const A={}; c.assets.forEach(a=>A[a.name]=a);
  const st=(n,v)=>{ if(A[n]) A[n].status=v; };
  st('The master pitch document','Ready');
  st('One-pager for the first priority sector','Ready');
  st('One-pager for the second priority sector','In review');
  st('The health check offer and its scorecard template','Ready');
  st('Pre-handover checklist for projects teams','Ready');
  st('First case study, written around an outcome','Ready');
  st('Second case study, written around an outcome','In production');
  st('The deck for Tier 1 meetings','Ready');
  st('How the architecture works, in plain terms','In review');
  st('Answers to the security, install and SLA questions','In production');
  st('The total cost of ownership model','In production');
  st('Email and LinkedIn sequences, one per role','Ready');
  st('Landing pages, one per sector','In review');
  st('Battlecards for the sales team','In production');
  st('The account research template','Ready');
  st('Everything needed to run a roundtable','Ready');
  st('A deck the internal champion can present as their own','Not started');

  c.deps.forEach((d,i)=>{ d.done = i<3; });
  c.roadmap.forEach(r=>{
    if(r.phase<=4) r.status='Done';
    else if(r.phase===5) r.status='In progress';
  });
  c.roadmap.filter(r=>r.owner==='Client'&&r.phase===5).forEach(r=>r.status='Blocked');

  c.signoff = { exec:true, foundation:true, icp:true, accounts:true, committee:true, intel:true, journey:true, messaging:true, plays:false, roadmap:false, measure:false };
  c.clientNotes = {
    exec:'Head of Marketing agreed the framing straight away and wants the line about marketing and sales running this together written into the SOW. Pushed back on the engagement target, wants 60% rather than 50%. Agreed, as long as we establish the baselines in week one.',
    foundation:'Confirmed the revenue share model. Warned us that "charging infrastructure" tests badly with property people, who respond to "making the car park earn". Use their words.',
    icp:'Healthcare and residential parked for phase two. Agreed to lead with offices, since one portfolio agreement is worth a dozen single sites. They wrote the last disqualifier themselves: if sales will not chase it this quarter, take it off the list.',
    accounts:'They asked us to add Pemberton and Grayling. Ashcroft moved from acquisition to expansion, which changed the shape of the whole plan. They want reference value dropped from 10 to 5, parked until the sales director has a view.',
    committee:'We had missed the projects director entirely, and he is the person who has killed two previous deals over programme risk. Now the second priority. They also told us finance gets involved much earlier than we assumed.',
    intel:'They watch planning portals themselves. We take hiring, news, property press and anything behavioural. They accepted the two working day response commitment, though they admitted it is closer to three weeks today.',
    journey:'They named getting it approved as the stage that loses the most deals, with a median of nine weeks sitting in legal. So the precedent pack moved from week six to week two.',
    messaging:'Core message approved. The line about the car park being the largest thing you own that earns nothing went straight into the landlord pitch. They banned "sustainable mobility solutions" from the whole programme on the grounds that every competitor says it.'
  };
}

/* ============================================================
   4. STORE
   ============================================================ */
const KEY = 'zamstars.abmos.v2';
const S = {
  clients:{}, order:[], current:'demo', stage:'exec',
  lensPersona:'all', jSel:0, presenter:false, editThesis:false,
  playTier:'all', roadPhase:'all', acctSeg:'all', acctTier:'all', kpiLayer:'all'
};

function baseline(){
  S.clients={}; S.order=[];
  SHIPPED.forEach(sp=>{ S.clients[sp.id]=hydrate(sp); S.order.push(sp.id); });
  S.current='demo'; S.stage='exec';
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({ clients:S.clients, order:S.order, current:S.current, stage:S.stage })); }
  catch(e){ /* file:// or private mode. The session still works, it just will not persist. */ }
}
function normalise(c){
  ['accounts','signals','journey','plays','roadmap','kpis','segments','personas','umbrellas','hooks','assets','sla','deps','successMetrics','icpFit','disqualify'].forEach(k=>{ if(!Array.isArray(c[k])) c[k]=[]; });
  if(!c.exec_) c.exec_={entries:[]};
  if(!c.exec) c.exec={why:[],how:[]};
  if(!Array.isArray(c.exec.why)) c.exec.why=[];
  if(!Array.isArray(c.exec.how)) c.exec.how=[];
  if(!c.signoff) c.signoff={};
  if(!c.clientNotes) c.clientNotes={};
  if(!c.lens) c.lens={};
  if(!c.weights){ c.weights={}; SCORE_FACTORS.forEach(f=>c.weights[f.k]=f.w); }
  if(!c.tierSplit) c.tierSplit = Object.assign({}, TIER_SPLIT_DEFAULT);
  c.accounts.forEach(a=>{ if(!Array.isArray(a.roles)) a.roles=[]; if(a.touches==null) a.touches=num(a.engaged); });
  c.kpis.forEach(k=>{ if(k.current==null) k.current=''; if(!k.layer) k.layer='eng'; });
  /* Programmes saved before the allocator existed had frozen play budgets that
     stranded the share of any switched-off play, so their totals will not add up
     until we redistribute once. */
  const legacyPlays = c.plays.some(p=>p.lock===undefined);
  c.plays.forEach(p=>{ if(p.lock==null) p.lock=false; if(p.budget==null) p.budget=0; });
  if(legacyPlays && c.plays.length) allocateBudget(c);
  /* Account Intelligence fields. Declared in 10-intel-store.js, hoisted, and
     safe to call from here: every field it adds is optional, so a programme
     saved before that module existed opens with empty research rather than
     an error. */
  if(typeof normIntel==='function') normIntel(c);
}
function load(){
  let raw=null;
  try{ raw = localStorage.getItem(KEY); }catch(e){}
  if(!raw){ baseline(); return false; }
  try{
    const d = JSON.parse(raw);
    if(!d.clients || !d.order || !d.order.length) throw 0;
    S.clients=d.clients; S.order=d.order;
    S.current = d.clients[d.current] ? d.current : d.order[0];
    S.stage = STAGE_IX[d.stage]!=null ? d.stage : 'exec';
    S.order.forEach(id=>{ if(S.clients[id]) normalise(S.clients[id]); });
    return true;
  }catch(e){ baseline(); return false; }
}
const cur = ()=> S.clients[S.current];
function resetClient(){
  const sp = SHIPPED.filter(s=>s.id===S.current)[0];
  if(!sp){ toast('You created this client during the session, so there is no shipped baseline to go back to.'); return; }
  S.clients[S.current] = hydrate(sp); save(); render();
  toast('<b>'+esc(sp.name)+'</b> reset to the shipped baseline.');
}

/* ============================================================
   5. DERIVED METRICS
   ============================================================ */
function activeSegs(){ return cur().segments.filter(s=>s.on); }
function activeSegIds(){ return activeSegs().map(s=>s.id); }
function liveAccounts(){
  const ids = activeSegIds();
  return cur().accounts.filter(a=> ids.indexOf(a.seg)>-1 );
}
function segById(id){ return cur().segments.filter(s=>s.id===id)[0]; }
function personaById(id){ return cur().personas.filter(p=>p.id===id)[0]; }
function tierCounts(){ const t={t1:0,t2:0,t3:0}; liveAccounts().forEach(a=>t[tierOf(a)]++); return t; }
function playBudget(){ let n=0; cur().plays.forEach(p=>{ if(p.on) n+=num(p.budget); }); return n; }

function readiness(){
  const c=cur(), build=BUILD_STAGES();
  let done=0, part=0;
  build.forEach(s=>{
    if(c.signoff[s.id]) done++;
    else if((c.clientNotes[s.id]||'').trim().length>10) part++;
  });
  return Math.round((done + part*0.4) / build.length * 100);
}
function stageState(id){
  const c=cur();
  if(c.signoff[id]) return 'done';
  if((c.clientNotes[id]||'').trim().length>10) return 'part';
  return '';
}
function funnelData(){
  const c=cur(), la=liveAccounts(), out=[];
  c.journey.forEach((j,i)=>{
    out.push({ name:j.name, vg:j.vg,
      at: la.filter(a=>num(a.stage)===i).length,
      atOrPast: la.filter(a=>num(a.stage)>=i).length });
  });
  return out;
}
/* the coverage layer, which is really about how good the list is */
function coverage(){
  const la = liveAccounts(), n = la.length;
  const owned   = la.filter(a=>String(a.owner||'').trim()!=='' && a.owner!=='Unassigned').length;
  const mapped  = la.filter(a=>(a.roles||[]).length>0).length;
  const three   = la.filter(a=>(a.roles||[]).length>=3).length;
  const priority = la.filter(a=>tierOf(a)!=='t3');
  const pThree  = priority.filter(a=>(a.roles||[]).length>=3).length;
  let roleTotal=0; la.forEach(a=>roleTotal+=(a.roles||[]).length);
  return { n, owned, mapped, three, priority:priority.length, pThree,
    ownedPct:pct(owned,n), mappedPct:pct(mapped,n), threePct:pct(three,n), pThreePct:pct(pThree,priority.length),
    avgRoles: n? Math.round(roleTotal/n*10)/10 : 0 };
}
function execTotals(){
  const la=liveAccounts();
  const touched = la.filter(a=>num(a.touches)>0).length;
  const meetings = la.reduce((s,a)=>s+num(a.meetings),0);
  return { total:la.length, touched, meetings,
    validated: la.filter(a=>num(a.stage)>=4).length,
    commercial: la.filter(a=>num(a.stage)>=5).length,
    live: la.filter(a=>num(a.stage)>=6).length,
    ref: la.filter(a=>num(a.stage)>=8).length,
    engRate: pct(touched, la.length) };
}
function latestReading(needle){
  const c=cur(); let v=null, d='';
  c.exec_.entries.forEach(en=>{
    if(String(en.metric).toLowerCase().indexOf(needle)>-1 && en.date>=d){ d=en.date; v=num(en.value); }
  });
  return v;
}
function assetReady(){
  const c=cur();
  return { ready:c.assets.filter(a=>a.status==='Ready').length, total:c.assets.length,
    blocked:c.assets.filter(a=>a.status==='Not started').length };
}
