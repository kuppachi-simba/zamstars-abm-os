
/* ============================================================
   26. ACCOUNT INTELLIGENCE: THE WORKSPACE

   Two screens in one view. With no account selected you get the
   portfolio: where every account sits, what is missing across the
   book, and the queue of accounts worth a person's time this week.
   Select one and you get its workspace, eight tabs deep.
   ============================================================ */

const ITABS = [
  ['over',  'Overview'],
  ['res',   'Research'],
  ['sites', 'Properties'],
  ['ppl',   'Committee'],
  ['strat', 'Strategy'],
  ['jrn',   'Journey'],
  ['src',   'Sources'],
  ['brief', 'Brief']
];

function iAcct(){
  const a = liveAccounts().filter(x=>x.id===ISEL.acct)[0];
  return a ? accIntel(a) : null;
}
function rArea(a,k){ if(!a.research[k]) a.research[k] = { st:'none', note:'' }; return a.research[k]; }
function ap(a, rest){ return 'accounts.'+a.id+'.'+rest; }

/* small shared bits ------------------------------------------------ */
function iPill(text, colour){
  return '<span class="pill" style="background:'+mix(colour,.12)+';color:'+colour+'">'+esc(text)+'</span>';
}
function iBar(v, max, colour){
  return '<span class="ibar"><i style="width:'+clamp(v/(max||10)*100,0,100)+'%;background:'+colour+'"></i></span>';
}
function iSelect(path, opts, live){
  return tsel(path, opts.map(o=>[o[0],o[1]]), live, 'mini');
}

/* ============================================================
   THE PORTFOLIO VIEW
   ============================================================ */
function vAccIntelPortfolio(){
  const r = intelRoll(), q = intelQueue(6);
  let h = '';

  h += '<div class="grid4" style="margin-bottom:16px">'+
    tileHTML('Accounts in the book', r.n, TIER_SPEC.t1.label+' '+r.byTier.t1+' &middot; T2 '+r.byTier.t2+' &middot; T3 '+r.byTier.t3, 'vi')+
    tileHTML('Research complete', r.avgCover+'%', r.started+' of '+r.n+' accounts have any research at all', 'te')+
    tileHTML('Engaged or better', r.engaged, r.multi+' multi threaded &middot; '+r.opps+' at opportunity', 'pk')+
    tileHTML('Live triggers open', r.openTrig, 'Reasons to call somebody this week', 'go')+
  '</div>';

  /* The honest panel. Everything here is a reason not to trust the book. */
  h += '<div class="card"><header><h3>What is wrong with the book right now</h3>'+
    '<span class="hint">Read this before the pretty numbers above</span></header><div class="body">'+
    '<div class="grid4">'+
      flawHTML(r.unsourced, 'findings with no source', 'Any of these could reach a buyer and none can be defended.', C.pink)+
      flawHTML(r.gapAcc,    'accounts missing a core role', 'The people who decide are not on the map.', C.violet)+
      flawHTML(r.stale,     'research areas gone stale', 'Old facts presented as current is how credibility goes.', '#8A6206')+
      flawHTML(r.noOwner,   'accounts with no owner', 'Nobody is accountable for moving these.', C.ink3)+
    '</div>'+
    (r.hyps > r.facts && r.facts>0
      ? '<div class="inbox" style="margin-top:14px"><b>The book leans on assumption.</b> '+r.hyps+
        ' hypotheses against '+r.facts+' verified facts. That is a story about the market rather than a case built on it.</div>'
      : '')+
  '</div></div>';

  /* Journey distribution */
  h += '<div class="card"><header><h3>Where the accounts actually are</h3>'+
    '<span class="hint">Stage moves when a person moves it, never automatically</span></header><div class="body tight">'+
    '<table class="tbl"><thead><tr><th style="width:170px">Stage</th><th style="width:70px" class="num">Accounts</th>'+
    '<th>Spread</th><th>What has to be true to leave this stage</th></tr></thead><tbody>';
  const mx = Math.max.apply(null, JSTAGES.map(s=>r.byStage[s.n]).concat([1]));
  JSTAGES.forEach(s=>{
    const n = r.byStage[s.n];
    h += '<tr'+(n?'':' style="opacity:.45"')+'>'+
      '<td><b style="color:'+s.c+'">'+s.n+'</b> &nbsp;'+esc(s.nav)+'</td>'+
      '<td class="num">'+n+'</td>'+
      '<td style="width:180px">'+iBar(n, mx, s.c)+'</td>'+
      '<td class="tiny muted">'+esc(s.gate[0])+'</td></tr>';
  });
  h += '</tbody></table></div></div>';

  /* The queue */
  h += '<div class="card"><header><h3>Worth your time this week</h3>'+
    '<span class="hint">Ranked by how urgent the top recommendation is, then by what is at stake</span></header><div class="body tight">';
  if(!q.length) h += '<div class="empty">No accounts yet. Add them on The Account List, then research them here.</div>';
  else {
    h += '<table class="tbl"><thead><tr><th>Account</th><th style="width:52px">Tier</th>'+
      '<th style="width:120px">Stage</th><th style="width:64px" class="num">Research</th>'+
      '<th>Next best action, and why</th><th style="width:34px"></th></tr></thead><tbody>';
    q.forEach(row=>{
      const a = row.a, t = iTier(a), js = jStage(a), cov = areaCover(a);
      h += '<tr>'+
        '<td><a href="#" data-act="iopen" data-id="'+a.id+'"><b>'+esc(a.name)+'</b></a>'+
          (a.owner?'<div class="tiny muted">'+esc(a.owner)+'</div>':'<div class="tiny" style="color:'+C.pink+'">no owner</div>')+'</td>'+
        '<td>'+iPill(TIERSHORT[t], TIER_SPEC[t].c)+(tierIsOverridden(a)?'<span class="tiny muted" title="Set by a person, not by the score"> set</span>':'')+'</td>'+
        '<td class="tiny"><b style="color:'+js.c+'">'+js.n+'</b> '+esc(js.nav)+'</td>'+
        '<td class="num">'+cov.pct+'%</td>'+
        '<td>'+(row.top
            ? '<b>'+esc(row.top.act)+'</b> '+iPill(URG[row.top.urg][0], URG[row.top.urg][1])+
              '<div class="tiny muted">'+esc(row.top.why)+'</div>'
            : '<span class="tiny muted">Nothing pressing. Keep it warm.</span>')+'</td>'+
        '<td><button class="editbtn" data-act="iopen" data-id="'+a.id+'">Open</button></td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div></div>';
  return h;
}
function tileHTML(k,v,d,cls){
  return '<div class="tile '+cls+'"><div class="k">'+esc(k)+'</div><div class="v">'+v+'</div><div class="d">'+d+'</div></div>';
}
function flawHTML(n, label, why, colour){
  const good = n===0;
  return '<div style="border-left:3px solid '+(good?C.teal:colour)+';padding-left:11px">'+
    '<div style="font-size:23px;font-weight:750;color:'+(good?C.teal:colour)+';line-height:1.1">'+n+'</div>'+
    '<div style="font-size:11.5px;font-weight:650;margin-top:2px">'+esc(label)+'</div>'+
    '<div class="tiny muted" style="margin-top:3px">'+(good?'Clean.':esc(why))+'</div></div>';
}

/* ============================================================
   THE ACCOUNT WORKSPACE
   ============================================================ */
function vAccIntel(){
  const a = iAcct();
  if(!a) return vAccIntelPortfolio();

  const t = iTier(a), js = jStage(a), spec = TIER_SPEC[t];
  let h = '';

  /* header */
  h += '<div class="iwhead">'+
    '<button class="editbtn" data-act="iclose">&lsaquo; All accounts</button>'+
    '<div class="iwname"><h2>'+esc(a.name)+'</h2>'+
      '<div class="tiny muted">'+esc(a.city||'')+(a.incumbent?' &middot; incumbent: '+esc(a.incumbent):'')+'</div></div>'+
    '<div class="spacer" style="flex:1"></div>'+
    iPill(spec.label+', '+spec.mode.toLowerCase(), spec.c)+' '+
    iPill(js.n+' '+js.nav, js.c)+' '+
    iPill(ACCST_L[a.status], ACCST_C[a.status])+
  '</div>';

  h += '<div class="itabs">'+ITABS.map(x=>
      '<button class="itab'+(ISEL.tab===x[0]?' on':'')+'" data-act="itab" data-t="'+x[0]+'">'+x[1]+'</button>'
    ).join('')+'</div>';

  const F = { over:iOver, res:iRes, sites:iSites, ppl:iPeople, strat:iStrat, jrn:iJourney, src:iSources, brief:iBrief };
  h += (F[ISEL.tab]||iOver)(a);
  return h;
}

/* ---------- OVERVIEW ---------- */
function iOver(a){
  const s = subScores(a), b = bottleneck(a), nba = nbaFor(a), cov = areaCover(a), t = iTier(a);
  let h = '';

  /* next best actions first, because that is what the screen is for */
  h += '<div class="card"><header><h3>What to do next</h3>'+
    '<span class="hint">Rules over what you have entered. Nothing here was fetched and nothing gets sent</span></header><div class="body">';
  if(!nba.length){
    h += '<div class="calcbox">Nothing is flagged. The research is current, the committee has no core gaps, '+
      'and there is no open trigger going unanswered. Keep it warm and watch for a trigger.</div>';
  } else {
    nba.forEach(n=>{
      h += '<div class="nba" style="border-left-color:'+URG[n.urg][1]+'">'+
        '<div class="split"><b>'+esc(n.act)+'</b>'+iPill(URG[n.urg][0], URG[n.urg][1])+'</div>'+
        '<div class="tiny muted" style="margin-top:4px">'+esc(n.why)+'</div></div>';
    });
  }
  h += '<div class="hlp">Recommendations are advice. A person decides, and nothing leaves this app.</div>';
  h += '</div></div>';

  /* the five sub scores */
  h += '<div class="card"><header><h3>Five separate scores, deliberately not added up</h3>'+
    '<span class="hint">A great account you cannot reach and a reachable account nobody needs would average the same</span>'+
    '</header><div class="body"><div class="grid3">';
  SUBSCORES.forEach(x=>{
    const v = s[x.k], weak = x.k===b.key;
    h += '<div class="subsc'+(weak?' weak':'')+'" style="border-left-color:'+x.c+'">'+
      '<div class="k">'+esc(x.n)+(weak?' <span class="tiny" style="color:'+C.pink+'">weakest</span>':'')+'</div>'+
      '<div class="v" style="color:'+x.c+'">'+fmt(v)+'<small>/10</small></div>'+
      iBar(v,10,x.c)+
      '<div class="tiny muted" style="margin-top:5px">'+esc(x.q)+'</div></div>';
  });
  h += '</div>';
  h += '<div class="calcbox" style="margin-top:14px"><b>The thing holding this account back is '+
    esc(b.name.toLowerCase())+', at '+fmt(b.val)+' out of 10.</b> '+esc(b.q)+
    ' Work on that before spending anything else here.</div>';
  h += '</div></div>';

  /* tier and status */
  h += '<div class="grid2">';
  h += '<div class="card"><header><h3>Tier</h3><span class="hint">The score suggests, a person decides</span></header><div class="body">'+
    '<div class="split"><div><div class="tiny muted">Score says</div><b>'+TIER_SPEC[tierOf(a)].label+
      '</b> <span class="tiny muted">('+fmt(scoreOf(a))+' out of 100)</span></div>'+
    '<div style="text-align:right"><div class="tiny muted">Running as</div>'+
      iSelect(ap(a,'tierSet'), [['','Use the score'],['t1','Tier 1'],['t2','Tier 2'],['t3','Tier 3']], true)+'</div></div>';
  if(a.tierSet){
    h += '<div class="inbox" style="margin-top:11px"><div class="tiny" style="font-weight:700;margin-bottom:5px">'+
      'Why this account is not being run at the tier its score suggests</div>'+
      ta(ap(a,'tierWhy'),'A reason a colleague would accept. This is kept in the history.')+'</div>';
  }
  if((a.tierHist||[]).length){
    h += '<div class="tiny muted" style="margin-top:10px"><b>History.</b> '+
      a.tierHist.slice(-3).map(x=>esc(x.at+': '+TIERSHORT[x.from]+' to '+TIERSHORT[x.to]+(x.why?', '+x.why:''))).join('<br>')+'</div>';
  }
  h += '<div class="hlp">'+esc(TIER_SPEC[t].mode)+'. '+esc(TIER_SPEC[t].vol)+'. Reviewed '+
    esc(TIER_SPEC[t].review.toLowerCase())+'. '+esc(TIER_SPEC[t].goal)+'</div>';
  h += '</div></div>';

  h += '<div class="card"><header><h3>Status and ownership</h3></header><div class="body">'+
    '<div class="kv">'+
      '<dt>Status</dt><dd>'+iSelect(ap(a,'status'), ACC_STATUS.map(x=>[x[0],x[1]]), true)+'</dd>'+
      '<dt>Owner</dt><dd>'+ti(ap(a,'owner'),'Who is accountable for moving this')+'</dd>'+
      '<dt>Next step</dt><dd>'+ti(ap(a,'nextStep'),'The specific thing that happens next')+'</dd>'+
      '<dt>By when</dt><dd>'+ti(ap(a,'nextBy'),'2026-09-15','inp mono')+'</dd>'+
    '</div>';
  if(a.status!=='active'){
    h += '<div class="inbox" style="margin-top:11px"><div class="tiny" style="font-weight:700;margin-bottom:5px">'+
      'Reason, so nobody restarts this by accident</div>'+
      ta(ap(a,'statusWhy'),'Say what changed and what would have to change back.')+
      '<div class="chips" style="margin-top:8px">'+DISQ_REASONS.slice(0,6).map(x=>
        '<button class="chip add" data-act="idisqr" data-v="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div></div>';
  }
  h += '<div class="hlp">Research completeness for '+esc(TIER_SPEC[t].label)+' is <b>'+cov.pct+'%</b>. '+
    (cov.miss? cov.miss+' area'+(cov.miss>1?'s':'')+' untouched.' : 'Every required area has been started.')+'</div>';
  h += '</div></div>';
  h += '</div>';

  return h;
}

/* ---------- RESEARCH ---------- */
function iRes(a){
  const t = iTier(a), cov = areaCover(a), must = {}; cov.must.forEach(k=>must[k]=1);
  let h = '';

  h += '<div class="card"><header><h3>The '+esc(TIER_SPEC[t].label)+' research standard</h3>'+
    '<span class="hint">'+cov.must.length+' areas required at this tier, '+cov.pct+'% covered</span></header>'+
    '<div class="body"><div class="covbar">'+
      '<i style="width:'+cov.pct+'%;background:'+(cov.pct>=80?C.teal:cov.pct>=50?C.gold:C.pink)+'"></i></div>'+
    '<div class="tiny muted" style="margin-top:7px">Complete '+cov.ok+' &middot; partly '+cov.part+
      ' &middot; needs checking '+cov.chk+' &middot; stale '+cov.stale+' &middot; untouched '+cov.miss+
      '. Partly done and needs checking each count half, stale counts nothing.</div></div></div>';

  RESEARCH_AREAS.forEach(area=>{
    const req = !!must[area.k], r = rArea(a, area.k);
    const st = r.st||'none';
    const fs = (a.findings||[]).filter(f=>f.area===area.k && f.ver!=='no');
    h += '<div class="card area'+(req?'':' opt')+'"><header>'+
      '<span class="adot" style="background:'+AREA_ST_C[st]+'"></span>'+
      '<h3>'+esc(area.n)+'</h3>'+
      (req?'':'<span class="pill" style="background:var(--paper);color:var(--ink3)">not required at '+TIERSHORT[t]+'</span>')+
      '<span class="hint">'+esc(area.q)+'</span>'+
      '<div class="spacer" style="flex:1"></div>'+
      iSelect(ap(a,'research.'+area.k+'.st'), AREA_ST.map(x=>[x[0],x[1]]), true)+
      '</header><div class="body">';

    h += '<div class="grid2"><div>'+
      '<div class="tiny" style="font-weight:700;margin-bottom:5px">What to look for</div>'+
      '<ul class="asks">'+area.ask.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div>'+
      '<div class="tiny" style="font-weight:700;margin-bottom:5px">Working notes</div>'+
      ta(ap(a,'research.'+area.k+'.note'),'Rough notes. Anything you would defend goes below as a finding.')+
      '</div></div>';

    h += '<div class="findhead"><b>'+fs.length+' finding'+(fs.length===1?'':'s')+'</b>'+
      '<button class="chip add" data-act="ifadd" data-area="'+area.k+'">+ Add a finding</button></div>';
    if(fs.length) h += fs.map(f=>findingHTML(a,f)).join('');
    h += '</div></div>';
  });
  return h;
}

function findingHTML(a,f){
  const src = f.srcId ? srcById(a,f.srcId) : null;
  const p = ap(a,'findings.'+f.id+'.');
  return '<div class="finding" style="border-left-color:'+KIND_C[f.kind||'hyp']+'">'+
    '<div class="split">'+
      '<div style="flex:1;min-width:0">'+ti(p+'title','What you found, in one line','inp b')+'</div>'+
      '<button class="xbtn" data-act="ifdel" data-id="'+f.id+'" title="Delete">&times;</button>'+
    '</div>'+
    ta(p+'text','Why it matters commercially. Not what the article said, what it means for this deal.')+
    '<div class="fmeta">'+
      iSelect(p+'kind', FIND_KIND.map(x=>[x[0],x[1]]), true)+
      iSelect(p+'ver',  VERIFY.map(x=>[x[0],x[1]]), true)+
      iSelect(p+'conf', CONF, true)+
      iSelect(p+'srcId', [['','No source yet']].concat((a.sources||[]).map(s=>[s.id, (s.publisher||s.title||'source')])), true)+
      (src ? '<span class="pill" style="background:'+mix(SRCQ_C[src.q||'1'],.12)+';color:'+SRCQ_C[src.q||'1']+'">'+esc(SRCQ_L[src.q||'1'])+'</span>'
           : '<span class="pill" style="background:'+mix(C.pink,.12)+';color:'+C.pink+'">unsourced</span>')+
    '</div>'+
    (!f.srcId ? '<div class="tiny" style="color:'+C.pink+';margin-top:5px">This cannot go in front of a buyer until it has a source.</div>' : '')+
    (f.kind==='hyp' ? '<div class="tiny muted" style="margin-top:5px">A hypothesis is a question in disguise. Put it to them in discovery rather than asserting it.</div>' : '')+
  '</div>';
}

/* ---------- PROPERTIES ---------- */
function iSites(a){
  const sites = a.sites||[];
  let h = '<div class="card"><header><h3>Properties and sites</h3>'+
    '<span class="hint">The opportunity is a building, not a company. One account, many chances to start</span>'+
    '</header><div class="body tight">';
  if(!sites.length){
    h += '<div class="empty">No properties recorded.<br><span class="tiny">Until one is named there is nothing concrete to offer an assessment on.</span></div>';
  } else {
    h += '<table class="tbl"><thead><tr><th>Property</th><th style="width:120px">Type</th>'+
      '<th style="width:130px">Status</th><th style="width:110px">We hold</th>'+
      '<th style="width:110px">Key date</th><th style="width:130px">Opportunity</th><th style="width:34px"></th></tr></thead><tbody>';
    sites.forEach(s=>{
      const p = ap(a,'sites.'+s.id+'.');
      h += '<tr>'+
        '<td>'+ti(p+'name','Property name')+
          '<div style="margin-top:4px">'+ti(p+'city','City or area','inp tiny')+'</div></td>'+
        '<td>'+iSelect(p+'type', SITE_TYPE, false)+'</td>'+
        '<td>'+iSelect(p+'status', SITE_STATUS.map(x=>[x[0],x[1]]), true)+'</td>'+
        '<td>'+iSelect(p+'owner', SITE_HOLD, false)+'</td>'+
        '<td>'+ti(p+'date','2027-03','inp mono tiny')+'</td>'+
        '<td>'+iSelect(p+'opp', SITE_OPP, true)+'</td>'+
        '<td><button class="xbtn" data-act="isdel" data-id="'+s.id+'">&times;</button></td></tr>'+
        '<tr class="subrow"><td colspan="7">'+
          ta(p+'need','What this specific building needs, and what we would find if we surveyed it.')+
        '</td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div><button class="addrow" data-act="isadd">+ Add a property</button></div>';

  if(sites.length){
    const byStatus = {};
    sites.forEach(s=>{ const k=s.status||'plan'; byStatus[k]=(byStatus[k]||0)+1; });
    h += '<div class="card"><header><h3>Where the timing is</h3>'+
      '<span class="hint">Handover due is the moment to be in the room, and it happens once per building</span>'+
      '</header><div class="body"><div class="chips">'+
      SITE_STATUS.filter(s=>byStatus[s[0]]).map(s=>
        '<span class="chip" style="border-color:'+mix(s[2],.35)+';color:'+s[2]+'"><b>'+byStatus[s[0]]+'</b> '+esc(s[1])+'</span>'
      ).join('')+'</div>'+
      (byStatus.hand ? '<div class="inbox" style="margin-top:12px"><b>'+byStatus.hand+
        ' propert'+(byStatus.hand>1?'ies are':'y is')+' at handover.</b> Once a building is handed over the specification is set and the cost of changing it lands on somebody. Before handover it is a line in a plan.</div>' : '')+
      '</div></div>';
  }
  return h;
}

/* ---------- COMMITTEE ---------- */
function iPeople(a){
  const t = iTier(a), people = a.people||[], gaps = roleGaps(a), held = rolesHeld(a);
  const want = TIER_SPEC[t].people;
  let h = '';

  h += '<div class="card"><header><h3>Role coverage</h3>'+
    '<span class="hint">'+TIER_SPEC[t].label+' wants '+want[0]+' to '+want[1]+' people mapped. You have '+livePeople(a).length+
    '</span></header><div class="body"><div class="rolegrid">';
  BUY_ROLES.forEach(r=>{
    const has = !!held[r[0]], core = !!r[4];
    h += '<div class="rolebox'+(has?' has':core?' gap':'')+'" style="border-color:'+(has?mix(r[3],.45):'var(--line)')+'">'+
      '<div class="rn" style="color:'+(has?r[3]:'var(--ink3)')+'">'+esc(r[1])+
        (core?' <span class="tiny" style="opacity:.7">core</span>':'')+'</div>'+
      '<div class="tiny muted">'+esc(r[2])+'</div>'+
      '<div class="rs">'+(has
        ? livePeople(a).filter(p=>p.role===r[0]).map(p=>esc(p.name||'unnamed')).join(', ')
        : '<span style="color:'+(core?C.pink:'var(--ink3)')+'">'+(core?'missing':'not mapped')+'</span>')+'</div>'+
    '</div>';
  });
  h += '</div>';
  if(gaps.length){
    h += '<div class="inbox" style="margin-top:14px"><b>'+gaps.length+' core role'+(gaps.length>1?'s are':' is')+' missing: '+
      esc(gaps.map(g=>ROLE2_L[g].toLowerCase()).join(', '))+'.</b> Working harder on the people you already know will not close this. '+
      'The missing roles are the ones who can say no.</div>';
  } else {
    h += '<div class="calcbox" style="margin-top:14px"><b>Every core role is mapped.</b> This account can progress on merit rather than on one relationship.</div>';
  }
  h += '</div></div>';

  h += '<div class="card"><header><h3>The people</h3>'+
    '<span class="hint">Never infer anything personal. Professional interests are hypotheses until they say so</span>'+
    '</header><div class="body tight">';
  if(!people.length){
    h += '<div class="empty">Nobody mapped yet.</div>';
  } else {
    h += '<table class="tbl"><thead><tr><th style="width:150px">Name</th><th>Title</th>'+
      '<th style="width:140px">Buying role</th><th style="width:96px">Influence</th>'+
      '<th style="width:96px">Relationship</th><th style="width:110px">Owner</th>'+
      '<th style="width:88px">Verified</th><th style="width:34px"></th></tr></thead><tbody>';
    people.forEach(p=>{
      const pp = ap(a,'people.'+p.id+'.');
      h += '<tr'+(p.sup==='1'?' style="opacity:.45"':'')+'>'+
        '<td>'+ti(pp+'name','Full name')+'</td>'+
        '<td>'+ti(pp+'title','Verified job title')+'</td>'+
        '<td>'+iSelect(pp+'role', [['','Not set']].concat(BUY_ROLES.map(r=>[r[0],r[1]])), true)+'</td>'+
        '<td>'+iSelect(pp+'infl', LEVEL, false)+'</td>'+
        '<td>'+iSelect(pp+'rel', STRENGTH, true)+'</td>'+
        '<td>'+ti(pp+'owner','Ours')+'</td>'+
        '<td>'+ti(pp+'verAt','2026-08','inp mono tiny')+'</td>'+
        '<td><button class="xbtn" data-act="ipdel" data-id="'+p.id+'">&times;</button></td></tr>'+
        '<tr class="subrow"><td colspan="8">'+
          '<div class="grid2" style="gap:8px;margin-bottom:8px">'+
            ti(pp+'email','Public business email')+
            ti(pp+'phone','Public business phone')+
            ti(pp+'linkedin','LinkedIn or public profile URL')+
            ti(pp+'contactStatus','Verified, role only, or needs checking')+
          '</div>'+
          ti(pp+'contactSource','Where this contact detail came from')+
        '</td></tr>'+
        '<tr class="subrow"><td colspan="8">'+
          ta(pp+'care','What this person is measured on, and what would make their year easier. Evidence, not guesswork.')+
        '</td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div><button class="addrow" data-act="ipadd">+ Add a person</button></div>';
  return h;
}

/* ---------- STRATEGY ---------- */
const STRAT_FIELDS = [
  ['objective','Account objective','What commercial outcome do we want here? Name it in money or in buildings.'],
  ['thesis',   'Account thesis','Why should this company need what our client sells? One sentence a salesperson could say out loud.'],
  ['whyNow',   'Why now','What makes this quarter different from last quarter?'],
  ['priority', 'Where we start','The property, region or business unit the first opportunity lives in.'],
  ['value',    'Value hypothesis','What measurable business value might be created, and how would they check it?'],
  ['champion', 'Champion plan','Who could carry this internally, and what do they get out of it?'],
  ['access',   'Access route','Direct, introduction, partner, event or inbound. How do we get in the room?'],
  ['proof',    'Proof plan','Which case study, number or person builds belief for this specific buyer?'],
  ['offer',    'The offer','Assessment, workshop, benchmark or pilot. Something concrete, not a meeting request.'],
  ['obstacles','Obstacles','Incumbent, budget, authority, timing, technical or legal. Write the real ones.'],
  ['success',  'Success criteria','What progression counts as this working?'],
  ['exit',     'Exit criteria','When do we stop, pause or move to nurture? Write this while you are calm.']
];
function iStrat(a){
  const st = a.strategy, t = iTier(a);
  let h = '';
  if(t==='t3'){
    h += '<div class="card"><div class="body"><div class="calcbox"><b>This account is running as Tier 3.</b> '+
      'A full canvas is not required until it is promoted. Fill the thesis and the offer, leave the rest.</div></div></div>';
  }
  h += '<div class="card"><header><h3>Account strategy</h3>'+
    '<span class="hint">If a colleague read only this, could they run the account?</span></header><div class="body">';
  h += '<div class="grid2">';
  STRAT_FIELDS.forEach((f,i)=>{
    const filled = String(st[f[0]]||'').trim()!=='';
    h += '<div class="sfield'+(filled?' filled':'')+'">'+
      '<div class="sf-k">'+esc(f[1])+(filled?'':' <span class="tiny" style="color:var(--ink3)">empty</span>')+'</div>'+
      ta(ap(a,'strategy.'+f[0]), f[2])+
    '</div>';
  });
  h += '</div></div></div>';

  h += '<div class="card"><header><h3>Discovery questions</h3>'+
    '<span class="hint">The questions that would turn your hypotheses into facts</span></header><div class="body">'+
    bulletList(a, 'strategy.questions', 'A question you would actually ask in the room')+
    '<div class="hlp">Write one for every hypothesis on the research tab. A hypothesis you never test becomes a fact by repetition, which is how proposals end up wrong.</div>'+
    '</div></div>';
  return h;
}
function bulletList(a, path, ph){
  const arr = arrPath(ap(a,path))||[];
  let h = '<div class="stack">';
  arr.forEach((v,i)=>{
    h += '<div class="split" style="gap:8px">'+ti(ap(a,path+'.'+i), ph)+
      '<button class="xbtn" data-act="ibdel" data-p="'+path+'" data-i="'+i+'">&times;</button></div>';
  });
  h += '</div><button class="chip add" style="margin-top:8px" data-act="ibadd" data-p="'+path+'">+ Add</button>';
  return h;
}

/* ---------- JOURNEY ---------- */
function iJourney(a){
  const cur_ = num(a.jstage), t = iTier(a);
  let h = '';

  h += '<div class="card"><header><h3>Where this account is</h3>'+
    '<span class="hint">Activity from one person rolls up but never moves the stage on its own</span>'+
    '</header><div class="body tight"><div class="jladder">';
  JSTAGES.forEach(s=>{
    const state = s.n<cur_?'past':s.n===cur_?'now':'ahead';
    h += '<div class="jstep '+state+'">'+
      '<div class="jn" style="'+(state==='ahead'?'':'background:'+s.c+';color:#fff;border-color:'+s.c)+'">'+s.n+'</div>'+
      '<div class="jbody">'+
        '<div class="split"><b>'+esc(s.nav)+'</b>'+
          (state==='now'?'<span class="pill" style="background:'+mix(s.c,.14)+';color:'+s.c+'">here now</span>':
           state==='ahead'?'<button class="editbtn" data-act="ijset" data-n="'+s.n+'">Move here</button>':
           '<button class="editbtn" data-act="ijset" data-n="'+s.n+'">Move back</button>')+
        '</div>'+
        '<div class="tiny muted">'+esc(s.d)+'</div>'+
        (state==='now' ? '<div class="jgate"><div class="tiny" style="font-weight:700;margin-bottom:4px">'+
            'Before this account leaves this stage</div><ul class="asks">'+
            s.gate.map(g=>'<li>'+esc(g)+'</li>').join('')+'</ul></div>' : '')+
      '</div></div>';
  });
  h += '</div></div></div>';

  if((a.jhist||[]).length){
    h += '<div class="card"><header><h3>How it got here</h3></header><div class="body tight">'+
      '<table class="tbl"><thead><tr><th style="width:100px">Date</th><th style="width:200px">Move</th><th>Evidence given</th></tr></thead><tbody>'+
      a.jhist.slice().reverse().map(x=>'<tr><td class="mono tiny">'+esc(x.at)+'</td>'+
        '<td class="tiny">'+esc(JSTAGES[x.from].nav)+' to <b>'+esc(JSTAGES[x.to].nav)+'</b></td>'+
        '<td class="tiny'+(x.evidence?'':' muted')+'">'+esc(x.evidence||'none recorded')+'</td></tr>').join('')+
      '</tbody></table></div></div>';
  }

  /* triggers */
  const trigs = a.trigs||[];
  h += '<div class="card"><header><h3>Triggers</h3>'+
    '<span class="hint">'+openTrigs(a).length+' open. A trigger with no action beside it is a missed quarter</span>'+
    '</header><div class="body tight">';
  if(!trigs.length){
    h += '<div class="empty">No triggers recorded.<br><span class="tiny">An account with no trigger has no reason to move this quarter, which is worth knowing.</span></div>';
  } else {
    h += '<table class="tbl"><thead><tr><th style="width:170px">Type</th><th>What happened</th>'+
      '<th style="width:100px">Date</th><th style="width:100px">Window ends</th>'+
      '<th style="width:96px">Strength</th><th style="width:120px">Status</th><th style="width:34px"></th></tr></thead><tbody>';
    trigs.forEach(x=>{
      const p = ap(a,'trigs.'+x.id+'.');
      h += '<tr>'+
        '<td>'+iSelect(p+'type', TRIG_TYPE, false)+'</td>'+
        '<td>'+ti(p+'desc','What happened, in their words where possible')+'</td>'+
        '<td>'+ti(p+'date','2026-08-01','inp mono tiny')+'</td>'+
        '<td>'+ti(p+'expiry','2026-11-01','inp mono tiny')+'</td>'+
        '<td>'+iSelect(p+'strength', TRIG_STR, true)+'</td>'+
        '<td>'+iSelect(p+'status', TRIG_ST, true)+'</td>'+
        '<td><button class="xbtn" data-act="itdel" data-id="'+x.id+'">&times;</button></td></tr>'+
        '<tr class="subrow"><td colspan="7">'+ti(p+'action','What we should do about it, and by when')+'</td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div><button class="addrow" data-act="itadd">+ Add a trigger</button></div>';
  return h;
}

/* ---------- SOURCES ---------- */
function iSources(a){
  const sources = a.sources||[], fs = findStats(a);
  let h = '';

  h += '<div class="card"><header><h3>Evidence quality</h3></header><div class="body"><div class="grid4">'+
    tileHTML('Findings', fs.live, fs.facts+' fact, '+fs.infs+' inferred, '+fs.hyps+' hypothesis', 'vi')+
    tileHTML('Verified', fs.verified, 'Checked by a person, not just entered', 'te')+
    tileHTML('No source', fs.unsourced, fs.unsourced? 'These cannot be used externally':'Everything is sourced', fs.unsourced?'pk':'te')+
    tileHTML('Sources held', sources.length, 'On this account', 'go')+
  '</div></div></div>';

  h += '<div class="card"><header><h3>Source library</h3>'+
    '<span class="hint">Retrieval date matters as much as publication date</span></header><div class="body tight">';
  if(!sources.length){
    h += '<div class="empty">No sources yet.<br><span class="tiny">Add one before writing findings, so each finding can point at something.</span></div>';
  } else {
    h += '<table class="tbl"><thead><tr><th style="width:150px">Publisher</th><th>Title</th>'+
      '<th style="width:150px">Type</th><th style="width:96px">Published</th>'+
      '<th style="width:96px">Accessed</th><th style="width:150px">Quality</th><th style="width:34px"></th></tr></thead><tbody>';
    sources.forEach(s=>{
      const p = ap(a,'sources.'+s.id+'.'), used = (a.findings||[]).filter(f=>f.srcId===s.id).length;
      h += '<tr>'+
        '<td>'+ti(p+'publisher','Who published it')+'</td>'+
        '<td>'+ti(p+'title','Headline or document name')+
          '<div style="margin-top:4px">'+ti(p+'url','https://','inp tiny mono')+'</div></td>'+
        '<td>'+iSelect(p+'type', SRC_TYPE, false)+'</td>'+
        '<td>'+ti(p+'pub','2026-06','inp mono tiny')+'</td>'+
        '<td>'+ti(p+'acc','2026-08','inp mono tiny')+'</td>'+
        '<td>'+iSelect(p+'q', SRC_Q.map(x=>[x[0],x[1]]), true)+
          '<div class="tiny muted" style="margin-top:3px">'+used+' finding'+(used===1?'':'s')+'</div></td>'+
        '<td><button class="xbtn" data-act="isrcdel" data-id="'+s.id+'">&times;</button></td></tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div><button class="addrow" data-act="isrcadd">+ Add a source</button></div>';

  h += '<div class="card"><header><h3>The hierarchy we rank against</h3></header><div class="body tight">'+
    '<table class="tbl"><tbody>'+SRC_Q.map(s=>'<tr><td style="width:44px"><b style="color:'+s[3]+'">'+s[0]+'</b></td>'+
      '<td style="width:180px"><b>'+esc(s[1])+'</b></td><td class="tiny muted">'+esc(s[2])+'</td></tr>').join('')+
    '</tbody></table></div></div>';
  return h;
}

/* ---------- BRIEF ---------- */
function iBrief(a){
  const b = briefData(a), t = iTier(a), js = jStage(a), nba = nbaFor(a);
  let h = '<div class="rowend" style="margin-bottom:12px">'+
    '<button class="tbtn" data-act="ibrief">Open printable brief</button></div>';

  h += '<div class="card brief"><div class="body">';
  h += '<h2 style="margin:0 0 3px">'+esc(a.name)+'</h2>'+
    '<div class="tiny muted">'+esc(TIER_SPEC[t].label)+' &middot; '+esc(TIER_SPEC[t].mode.toLowerCase())+' &middot; stage '+js.n+' '+esc(js.nav)+
    ' &middot; owner '+esc(a.owner||'unassigned')+' &middot; prepared '+today()+'</div>';

  h += brSec('Why this account matters', a.strategy.thesis || '<span class="muted">No thesis written. Everything below is research without an argument.</span>');
  if(a.strategy.whyNow) h += brSec('Why now', esc(a.strategy.whyNow));

  if(b.trigs.length){
    h += '<h4>Live triggers</h4><ul class="asks">'+b.trigs.map(x=>
      '<li><b>'+esc(x.desc||'untitled')+'</b> <span class="tiny muted">'+esc(x.date||'')+
      (x.action?' &middot; '+esc(x.action):'')+'</span></li>').join('')+'</ul>';
  }

  if(b.sites.length){
    h += '<h4>Where we would start</h4><ul class="asks">'+b.sites.slice(0,6).map(s=>
      '<li><b>'+esc(s.name||'unnamed')+'</b> <span class="tiny muted">'+esc(s.city||'')+
      (s.status?' &middot; '+esc(SITE_ST_L[s.status]):'')+(s.need?'. '+esc(s.need):'')+'</span></li>').join('')+'</ul>';
  }

  h += '<h4>What we know</h4>';
  h += b.facts.length
    ? '<ul class="asks">'+b.facts.map(f=>'<li><b>'+esc(f.title)+'</b>'+(f.text?'. '+esc(f.text):'')+
        (f.srcId?' <span class="tiny muted">['+esc((srcById(a,f.srcId)||{}).publisher||'source')+']</span>':
         ' <span class="tiny" style="color:'+C.pink+'">[no source]</span>')+'</li>').join('')+'</ul>'
    : '<p class="muted tiny">Nothing recorded as fact yet.</p>';

  if(b.infs.length){
    h += '<h4>What we think follows</h4><ul class="asks">'+b.infs.map(f=>
      '<li>'+esc(f.title)+(f.text?'. '+esc(f.text):'')+'</li>').join('')+'</ul>';
  }

  h += '<h4>What we are guessing</h4>';
  h += b.hyps.length
    ? '<ul class="asks">'+b.hyps.map(f=>'<li>'+esc(f.title)+(f.text?'. '+esc(f.text):'')+'</li>').join('')+
      '</ul><p class="tiny muted">These are hypotheses. Nobody should say them to the client as fact.</p>'
    : '<p class="muted tiny">Nothing flagged as a guess, which is either rigour or optimism.</p>';

  if(a.strategy.questions && a.strategy.questions.length){
    h += '<h4>Questions that would settle it</h4><ul class="asks">'+
      a.strategy.questions.filter(q=>String(q).trim()).map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>';
  }

  h += '<h4>Who we still need</h4>';
  h += b.gaps.length
    ? '<p>'+esc(b.gaps.map(g=>ROLE2_L[g]).join(', '))+'. <span class="tiny muted">Core roles with nobody mapped against them.</span></p>'
    : '<p class="tiny muted">Every core role is mapped.</p>';

  if(nba.length){
    h += '<h4>Next three actions</h4><ol class="asks">'+nba.map(n=>
      '<li><b>'+esc(n.act)+'</b> <span class="tiny muted">'+esc(n.why)+'</span></li>').join('')+'</ol>';
  }

  h += '<div class="calcbox" style="margin-top:16px"><b>Confidence in this brief.</b> Research '+b.cover.pct+
    '% complete for '+esc(TIER_SPEC[t].label)+'. '+b.facts.length+' verified facts, '+b.hyps.length+' hypotheses'+
    (b.unver.length? ', '+b.unver.length+' finding'+(b.unver.length>1?'s':'')+' still unreviewed':'')+
    '. '+(b.cover.stale? b.cover.stale+' area'+(b.cover.stale>1?'s':'')+' marked stale.':'No stale areas.')+'</div>';

  h += '</div></div>';
  return h;
}
function brSec(t, body){ return '<h4>'+esc(t)+'</h4><p>'+body+'</p>'; }
