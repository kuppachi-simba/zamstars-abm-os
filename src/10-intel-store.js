
/* ============================================================
   25. ACCOUNT INTELLIGENCE: STATE, MIGRATION AND SCORING

   Every field this module adds is optional and back filled here, so a
   programme saved before the module existed opens without error and
   simply shows empty research. Delete these source files and the app
   returns to its previous behaviour with the data ignored, not lost.

   Note on naming: an account already had a "stage", which is where the
   buyer sits in the client's own customer journey. The ABM programme
   stage is "jstage". They are different questions and they are kept
   apart deliberately.
   ============================================================ */

const ISEL = { acct:null, tab:'over', q:'', filt:'' };

function accIntel(a){
  if(!a) return a;
  if(!a.research) a.research = {};
  ['sources','findings','sites','people','trigs','tierHist','jhist'].forEach(k=>{
    if(!Array.isArray(a[k])) a[k] = [];
  });
  if(!a.strategy) a.strategy = { objective:'', thesis:'', whyNow:'', priority:'', value:'',
    champion:'', access:'', proof:'', offer:'', obstacles:'', success:'', exit:'', questions:[] };
  if(!Array.isArray(a.strategy.questions)) a.strategy.questions = [];
  if(a.jstage == null) a.jstage = 0;
  if(!a.status) a.status = 'active';
  if(a.statusWhy == null) a.statusWhy = '';
  if(a.tierSet == null) a.tierSet = '';
  if(a.tierWhy == null) a.tierWhy = '';
  if(a.nextStep == null) a.nextStep = '';
  if(a.nextBy == null) a.nextBy = '';
  a.people.forEach(p=>{
    ['email','phone','linkedin','contactSource','contactStatus'].forEach(k=>{
      if(p[k] == null) p[k] = '';
    });
  });
  return a;
}
function normIntel(c){ (c.accounts||[]).forEach(accIntel); }

/* ---------- tier, with the human allowed to overrule the maths ---------- */
function iTier(a){ return (a && a.tierSet) ? a.tierSet : tierOf(a); }
function tierIsOverridden(a){ return !!(a && a.tierSet && a.tierSet !== tierOf(a)); }

function setTier(a, t, why){
  const from = iTier(a);
  if(from === t && a.tierSet === t) return;
  a.tierHist.push({ from:from, to:t, why:why||'', at:today() });
  a.tierSet = t; a.tierWhy = why||'';
}

/* ---------- research coverage against the tier standard ---------- */
function areaState(a, k){ const r = a.research[k]; return (r && r.st) ? r.st : 'none'; }

function areaCover(a){
  const t = iTier(a), must = TIER_SPEC[t].must;
  let ok=0, part=0, chk=0, stale=0, miss=0;
  must.forEach(k=>{
    const s = areaState(a,k);
    if(s==='ok'||s==='na') ok++;
    else if(s==='part') part++;
    else if(s==='chk'){ chk++; }
    else if(s==='old'){ stale++; }
    else miss++;
  });
  const n = must.length || 1;
  /* Partly done counts half. Needs checking counts half, because the work
     exists but cannot be relied on yet. Stale counts nothing. */
  const score = Math.round(((ok + part*0.5 + chk*0.5) / n) * 100);
  return { pct:score, ok:ok, part:part, chk:chk, stale:stale, miss:miss, n:n, must:must };
}

/* ---------- committee coverage ---------- */
function livePeople(a){ return (a.people||[]).filter(p=>p.sup!=='1'); }
function rolesHeld(a){ const s={}; livePeople(a).forEach(p=>{ if(p.role) s[p.role]=1; }); return s; }
function roleGaps(a){
  const held = rolesHeld(a);
  if(iTier(a)==='t3') return CORE_ROLES.slice(0,2).filter(r=>!held[r]);
  return CORE_ROLES.filter(r=>!held[r]);
}
function engagedPeople(a){ return livePeople(a).filter(p=>num(p.eng)>=2).length; }

/* ---------- triggers ---------- */
function openTrigs(a){
  const t = today();
  return (a.trigs||[]).filter(x=> x.status==='open' && (!x.expiry || x.expiry >= t));
}
function trigForce(a){
  let s=0; openTrigs(a).forEach(x=> s += num(x.strength,1)); return s;
}

/* ---------- findings ---------- */
function findStats(a){
  const f = a.findings||[];
  const live = f.filter(x=>x.ver!=='no');
  return {
    n:f.length, live:live.length,
    facts: live.filter(x=>x.kind==='fact').length,
    infs:  live.filter(x=>x.kind==='inf').length,
    hyps:  live.filter(x=>x.kind==='hyp').length,
    verified: live.filter(x=>x.ver==='ok').length,
    unsourced: live.filter(x=>!x.srcId).length,
    needs: live.filter(x=>x.ver==='chk'||x.ver==='new').length,
    outdated: live.filter(x=>x.ver==='old').length
  };
}
function srcById(a,id){ return (a.sources||[]).filter(s=>s.id===id)[0]; }

/* ---------- the five sub scores ----------
   Each returns 0 to 10 and each shows its inputs in the UI. Nothing is
   blended into a single number, because a great account we cannot reach
   and a reachable account nobody needs would score identically. */
function subScores(a){
  const t = iTier(a);
  const fit = (num(a.pot)+num(a.fit)+num(a.geo))/3;

  const tf = trigForce(a);
  const timing = clamp((num(a.trig)*0.6) + Math.min(tf,6)*0.8, 0, 10);

  const intent = clamp(num(a.eng)*0.7 + Math.min(num(a.touches),8)*0.2 + Math.min(num(a.meetings),3)*0.7, 0, 10);

  const want = TIER_SPEC[t].people[0] || 1;
  const have = livePeople(a).length;
  const gaps = roleGaps(a).length;
  const coreN = (t==='t3') ? 2 : CORE_ROLES.length;
  const cover = clamp((Math.min(have/want,1)*5) + ((coreN-gaps)/coreN)*5, 0, 10);

  let relSum=0; livePeople(a).forEach(p=> relSum += num(p.rel));
  const access = clamp(num(a.rel)*0.6 + Math.min(relSum,10)*0.4, 0, 10);

  return { fit:r1(fit), timing:r1(timing), intent:r1(intent), cover:r1(cover), access:r1(access) };
}
function r1(n){ return Math.round(n*10)/10; }

/* The weakest sub score, which is the thing actually holding the account
   back. More useful to a team than an average. */
function bottleneck(a){
  const s = subScores(a);
  let worst = SUBSCORES[0], wv = 99;
  SUBSCORES.forEach(x=>{ if(s[x.k] < wv){ wv = s[x.k]; worst = x; } });
  return { key:worst.k, name:worst.n, val:wv, q:worst.q };
}

/* ---------- journey ---------- */
function jStage(a){ return JSTAGES[clamp(num(a.jstage),0,9)]; }
function setJStage(a, n, evidence){
  const from = num(a.jstage);
  n = clamp(n,0,9);
  if(n===from) return;
  a.jhist.push({ from:from, to:n, evidence:evidence||'', at:today() });
  a.jstage = n;
}

/* ---------- next best action ----------
   Rules run over what has actually been entered. Nothing here fetches
   anything, and nothing here sends anything. Each recommendation carries
   the rule that produced it so a user can disagree with the rule rather
   than with the machine. */
function nbaModel(a){
  const cov = areaCover(a), fs = findStats(a), ss = subScores(a);
  return { a:a, tier:iTier(a), st:num(a.jstage), gaps:roleGaps(a),
    openTrig:openTrigs(a).length, cover:cov.pct, stale:cov.stale,
    facts:fs.facts, hyps:fs.hyps, unsourced:fs.unsourced,
    sites:(a.sites||[]).length, people:livePeople(a).length,
    engaged:engagedPeople(a), touches:num(a.touches),
    intent:ss.intent, access:ss.access };
}
function nbaFor(a){
  const m = nbaModel(a), out = [];
  NBA_RULES.forEach(r=>{
    let hit=false;
    try{ hit = r.when(m); }catch(e){ hit=false; }
    if(!hit) return;
    out.push({ k:r.k, urg:r.urg,
      act: typeof r.act==='function' ? r.act(m) : r.act,
      why: typeof r.why==='function' ? r.why(m) : r.why });
  });
  out.sort((x,y)=> y.urg-x.urg);
  /* One account should not present eleven equally urgent instructions.
     Three is what a person will actually do this week. */
  return out.slice(0,3);
}

/* ---------- portfolio rollups for the module dashboard ---------- */
function intelAccounts(){
  return liveAccounts().map(accIntel);
}
function intelRoll(){
  const la = intelAccounts();
  const byStage = {}; JSTAGES.forEach(s=>byStage[s.n]=0);
  const byTier  = { t1:0,t2:0,t3:0 };
  let covSum=0, unsourced=0, stale=0, gapAcc=0, noOwner=0, trig=0, disq=0, hyp=0, fact=0, started=0;
  la.forEach(a=>{
    byStage[clamp(num(a.jstage),0,9)]++;
    byTier[iTier(a)]++;
    const c=areaCover(a); covSum+=c.pct; stale+=c.stale;
    if(c.pct>0 || (a.findings||[]).length) started++;
    const f=findStats(a); unsourced+=f.unsourced; hyp+=f.hyps; fact+=f.facts;
    if(roleGaps(a).length) gapAcc++;
    if(!String(a.owner||'').trim()) noOwner++;
    trig += openTrigs(a).length;
    if(a.status==='disq') disq++;
  });
  const n = la.length||1;
  return { n:la.length, byStage:byStage, byTier:byTier, avgCover:Math.round(covSum/n), started:started,
    unsourced:unsourced, stale:stale, gapAcc:gapAcc, noOwner:noOwner, openTrig:trig,
    disq:disq, hyps:hyp, facts:fact,
    engaged: la.filter(a=>num(a.jstage)>=4).length,
    multi: la.filter(a=>num(a.jstage)>=5).length,
    opps: la.filter(a=>num(a.jstage)>=7).length };
}

/* Accounts most worth a person's attention this week: urgency of the top
   recommendation first, then how much is at stake. */
function intelQueue(limit){
  const rows = intelAccounts().filter(a=>a.status!=='disq').map(a=>{
    const n = nbaFor(a);
    return { a:a, top:n[0]||null, urg:n[0]?n[0].urg:0, n:n.length, pot:num(a.pot) };
  });
  rows.sort((x,y)=> (y.urg-x.urg) || (y.pot-x.pot));
  return rows.slice(0, limit||8);
}

/* ---------- the account brief ----------
   Assembled from verified findings only, with everything unproven pushed
   into its own section rather than smuggled into the narrative. */
function briefData(a){
  const live = (a.findings||[]).filter(f=>f.ver!=='no');
  return {
    facts: live.filter(f=>f.kind==='fact'),
    infs:  live.filter(f=>f.kind==='inf'),
    hyps:  live.filter(f=>f.kind==='hyp'),
    unver: live.filter(f=>f.ver==='new'||f.ver==='chk'),
    trigs: openTrigs(a),
    gaps:  roleGaps(a),
    cover: areaCover(a),
    sub:   subScores(a),
    sites: (a.sites||[]).filter(s=>s.opp!=='lost')
  };
}
