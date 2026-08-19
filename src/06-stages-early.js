/* ============================================================
   6. PATH BINDING
   One dot-path syntax for everything:
     "profile.whatTheyDo"      object field
     "accounts.a-1x2y.pot"     array member looked up by id
     "journey.3.name"          array member by index
     "hooks"                   an array itself
   data-live="1" re-renders the stage after the change.
   ============================================================ */
function walk(node, key){
  if(node==null) return undefined;
  if(Array.isArray(node)) return /^\d+$/.test(key) ? node[+key] : node.filter(x=>x&&x.id===key)[0];
  return node[key];
}
function resolvePath(path){
  const p = String(path).split('.');
  let o = cur();
  for(let i=0;i<p.length-1;i++){ o = walk(o,p[i]); if(o==null) return null; }
  return { obj:o, key:p[p.length-1] };
}
function getPath(path){
  const r = resolvePath(path); if(!r) return '';
  let v;
  if(Array.isArray(r.obj)) v = /^\d+$/.test(r.key) ? r.obj[+r.key] : (r.obj.filter(x=>x&&x.id===r.key)[0]);
  else v = r.obj[r.key];
  return v==null?'':v;
}
function setPath(path, val){
  const r = resolvePath(path); if(!r||r.obj==null) return;
  if(Array.isArray(r.obj) && /^\d+$/.test(r.key)) r.obj[+r.key] = val;
  else r.obj[r.key] = val;
}
function arrPath(path){
  const r = resolvePath(path); if(!r||r.obj==null) return [];
  let v;
  if(Array.isArray(r.obj) && /^\d+$/.test(r.key)) v = r.obj[+r.key];
  else v = r.obj[r.key];
  if(!Array.isArray(v)){ if(Array.isArray(r.obj) && r.key===undefined) return r.obj; v=[]; if(!Array.isArray(r.obj)||!/^\d+$/.test(r.key)) r.obj[r.key]=v; }
  return v;
}

let _focusMemo = null;
function memoFocus(){
  const el = document.activeElement;
  const k = el && el.dataset && (el.dataset.set || el.dataset.lens || el.dataset.blist);
  _focusMemo = k ? { k:k, pos:(el.selectionStart!=null?el.selectionStart:null) } : null;
}
function restoreFocus(){
  if(!_focusMemo) return;
  const q = _focusMemo.k.replace(/"/g,'\\"');
  const el = $('[data-set="'+q+'"],[data-lens="'+q+'"],[data-blist="'+q+'"]', $('#canvas'));
  if(el){ el.focus(); try{ if(_focusMemo.pos!=null) el.setSelectionRange(_focusMemo.pos,_focusMemo.pos); }catch(e){} }
  _focusMemo=null;
}
function autogrow(el){ if(el&&el.tagName==='TEXTAREA'){ el.style.height='auto'; el.style.height=(el.scrollHeight+2)+'px'; } }
function growAll(){ $$('#canvas textarea').forEach(autogrow); }

/* ---------- input helpers ---------- */
function ta(path, ph, cls){
  return '<textarea class="'+(cls||'inp')+'" data-set="'+path+'" placeholder="'+esc(ph||'')+'" rows="2">'+esc(getPath(path))+'</textarea>';
}
function ti(path, ph, cls, live){
  return '<input class="'+(cls||'inp')+'" data-set="'+path+'"'+(live?' data-live="1"':'')+' placeholder="'+esc(ph||'')+'" value="'+esc(getPath(path))+'">';
}
function tn(path, cls, live, mn, mx, w){
  return '<input type="number" class="'+(cls||'mini')+'" data-set="'+path+'"'+(live?' data-live="1"':'')+
    (mn!=null?' min="'+mn+'"':'')+(mx!=null?' max="'+mx+'"':'')+' value="'+esc(getPath(path))+'" style="width:'+(w||64)+'px">';
}
function tsel(path, opts, live, cls){
  const v = String(getPath(path));
  return '<select class="'+(cls||'mini')+'" data-set="'+path+'"'+(live?' data-live="1"':'')+'>'+
    opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===v?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
}
function rng(path, live, mx){
  return '<input type="range" class="rng" min="0" max="'+(mx||10)+'" step="1" data-set="'+path+'"'+(live?' data-live="1"':'')+' value="'+esc(getPath(path))+'">';
}
function sb(v, colour, max, w){
  v = num(v); max = max||10;
  return '<span class="sb"'+(w?' style="min-width:'+w+'px"':'')+'><span class="track"><i style="width:'+clamp(v/max*100,0,100)+'%;background:'+colour+'"></i></span><span class="n">'+fmt(v)+'</span></span>';
}
/* chips: short strings */
function chipsOf(path, cls, ph){
  const arr = arrPath(path);
  return '<div class="chips">'+
    arr.map((v,i)=>'<span class="chip '+(cls||'')+'"><b>'+esc(v)+'</b><button data-act="chipdel" data-chip="'+path+'" data-i="'+i+'" title="Remove">&times;</button></span>').join('')+
    '<span class="chip add" data-act="chipadd" data-chip="'+path+'">+ '+(ph||'add')+'</span></div>';
}
/* bulleted list: full sentences, edited in place */
function bulOf(path, ph){
  const arr = arrPath(path);
  return '<ul class="bul">'+
    arr.map((v,i)=>'<li><span class="bx">&mdash;</span>'+
      '<textarea class="ce" data-blist="'+path+'.'+i+'" rows="1" placeholder="'+esc(ph||'')+'">'+esc(v)+'</textarea>'+
      '<button class="xbtn" data-act="buldel" data-chip="'+path+'" data-i="'+i+'">&times;</button></li>').join('')+
    '</ul><button class="tbtn" data-act="buladd" data-chip="'+path+'" style="margin-top:9px">+ Add a line</button>';
}

/* ============================================================
   7. SHELL
   ============================================================ */
function renderNav(){
  const mk = (s)=>{
    const st = (s.group==='build'||s.group==='exec') ? stageState(s.id) : '';
    const badge = s.group==='exec' ? '★' : s.group==='build' ? s.n : (s.id==='dashboard'?'▦':s.id==='log'?'✎':'§');
    return '<button class="navitem'+(S.stage===s.id?' on':'')+'" data-nav="'+s.id+'">'+
      '<span class="nx">'+badge+'</span><span class="nlab">'+s.nav+'</span>'+
      ((s.group==='build'||s.group==='exec')?'<span class="dot '+st+'"></span>':'')+'</button>';
  };
  $('#nav-build').innerHTML = STAGES.filter(s=>s.group==='exec'||s.group==='build').map(mk).join('');
  $('#nav-run').innerHTML   = STAGES.filter(s=>s.group==='run').map(mk).join('');
  $('#nav-ref').innerHTML   = STAGES.filter(s=>s.group==='ref').map(mk).join('');
  const r = readiness();
  $('#readynum').innerHTML = r+'<small>%</small>';
  $('#readybar').style.width = r+'%';
}
function renderTop(){
  const c = cur();
  $('#clientsel').innerHTML = S.order.map(id=>'<option value="'+id+'"'+(id===S.current?' selected':'')+'>'+esc(S.clients[id].name)+'</option>').join('');
  $('#clogo').textContent = c.short||'••';
  $('#clienturl').value = c.url||'';
}
function renderHead(){
  const s = STAGES[STAGE_IX[S.stage]];
  $('#shnum').textContent = s.group==='exec' ? '★' : s.group==='build' ? s.n : (s.id==='dashboard'?'▦':s.id==='log'?'✎':'§');
  $('#shtitle').innerHTML = s.title;
  $('#shsub').innerHTML = s.sub;
  const vg = VG[s.vg];
  $('#shvg').className = 'vgtag '+vg.cls;
  $('#shvg').innerHTML = 'Value Grid · '+vg.label;
  $('#pnotes').innerHTML = s.notes||'';
  $('#pfoot').classList.toggle('on', S.presenter && !!s.notes);
}
function signoffBlock(){
  const s = STAGES[STAGE_IX[S.stage]];
  if(s.group!=='build' && s.group!=='exec') return '';
  const c = cur(), on = !!c.signoff[s.id];
  return '<div class="signoff">'+
    '<div class="sohead"><span class="soflag">✎</span><b>Over to you: '+esc(s.decide)+'</b>'+
      '<span class="muted tiny" style="margin-left:auto">Typed here, this counts toward programme readiness</span></div>'+
    '<div class="sorow">'+
      '<textarea class="inp" data-set="clientNotes.'+s.id+'" data-live="1" rows="2" placeholder="Capture what the client said, decided or changed at this stage…">'+esc(c.clientNotes[s.id]||'')+'</textarea>'+
      '<button class="toggle'+(on?' on':'')+'" data-act="signoff" data-id="'+s.id+'"><span class="tk">'+(on?'✓':'')+'</span>'+(on?'Signed off':'Mark signed off')+'</button>'+
    '</div></div>';
}

/* ============================================================
   8. STAGE 0: EXECUTIVE SUMMARY
   ============================================================ */
/* ---- hero furniture ---------------------------------------------------- */

/* the coloured left edge of a stat card, inline so nothing leaks between grids */
function edge(colour){ return 'box-shadow:inset 3px 0 0 '+colour+', var(--sh)'; }

/* a donut, drawn inline so it needs nothing external */
function ring(v, colour, size){
  size = size||62;
  const r = size/2 - 5, cx = size/2, circ = 2*Math.PI*r;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" style="flex:0 0 auto">'+
    '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+mix(colour,.16)+'" stroke-width="6"/>'+
    '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+colour+'" stroke-width="6" stroke-linecap="round"'+
      ' stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+(circ*(1-clamp(v,0,100)/100)).toFixed(1)+'"'+
      ' transform="rotate(-90 '+cx+' '+cx+')"/>'+
    '<text x="'+cx+'" y="'+(cx+4.5)+'" text-anchor="middle" font-size="14.5" font-weight="750" fill="'+C.ink+'">'+Math.round(v)+'</text>'+
    '</svg>';
}

/* The estate: one tile per building. Lit = covered, magenta = a dead zone.
   Deliberately abstract. It is the client's problem drawn as data rather than clip art,
   and it renders identically with no network. */
function estate(){
  const cols=12, rows=6, n=cols*rows;
  const dead = [14,27,41,52,58];
  const dim  = [3,9,20,33,38,47,55,63,66,70];
  let out='';
  for(let i=0;i<n;i++){
    const cls = dead.indexOf(i)>-1 ? ' dead' : dim.indexOf(i)>-1 ? ' dim' : '';
    const d = ((i%cols)*0.035 + Math.floor(i/cols)*0.06).toFixed(3);
    out += '<i class="'+cls.trim()+'" style="animation-delay:'+d+'s"></i>';
  }
  return '<div class="estatewrap"><div class="estate">'+out+'</div>'+
    '<div class="estatelegend">'+
      '<span><i style="background:rgba(18,165,148,.72)"></i>Covered</span>'+
      '<span><i style="background:rgba(255,255,255,.10)"></i>Unaddressed</span>'+
      '<span><i style="background:rgba(202,54,106,.85)"></i>Dead zone</span>'+
    '</div></div>';
}

/* A client's own marks, hot-linked from their site when a programme supplies
   them. If there is no network the <img> hides itself and the text beside it
   carries on, so a pitch never depends on a fetch. Programmes loaded from JSON
   can set c.brandLogo and c.proofLogos to switch these on. */
const HIDE_ON_FAIL = "this.style.display='none'";

function vExec(){
  const c = cur(), t = tierCounts(), e = execTotals(), cv = coverage();
  const ak = assetReady(), r = readiness();
  const logo = c.brandLogo||'';
  const proofLogos = Array.isArray(c.proofLogos)?c.proofLogos:[];
  const seg = activeSegs();

  /* ---- hero ---- */
  const lockup = '<div class="lockup">'+
    '<span class="cmark">'+
      (logo?'<img src="'+esc(logo)+'" alt="" onerror="'+HIDE_ON_FAIL+'">':'')+
      '<b>'+esc(c.name)+'</b></span>'+
    '<span class="xsep">&times;</span>'+
    '<span class="zmark"><span class="star">'+STAR+'</span><span>ZAMSTARS</span></span>'+
  '</div>';

  const hero = '<div class="hero"><div class="herogrid">'+
    '<div class="heroL">'+
      lockup+
      '<span class="hk">Account-Based Marketing &middot; '+esc(c.objective.horizon||'programme')+'</span>'+
      '<h2>'+esc(c.exec.thesis||'Write the thesis. One paragraph on why this business, why this approach, why now.')+'</h2>'+
      '<div class="hmeta">'+
        '<span>Prepared for <b>'+esc(c.contact||'the client')+'</b></span>'+
        (c.hq?'<span><b>'+esc(c.hq)+'</b></span>':'')+
        (c.url?'<span><b>'+esc(String(c.url).replace(/^https?:\/\//,''))+'</b></span>':'')+
      '</div>'+
      '<button class="editbtn" data-act="editthesis">'+(S.editThesis?'Done editing':'Edit the thesis')+'</button>'+
      (S.editThesis
        ? '<div class="hlab">Change it here, then read it back to them</div>'+
          '<textarea data-set="exec.thesis" rows="3" placeholder="One paragraph. Why this business, why this method, why now.">'+esc(c.exec.thesis||'')+'</textarea>'
        : '')+
    '</div>'+
    '<div class="heroR">'+
      '<div>'+
        '<span class="hk" style="margin-bottom:12px">The market we are selling into</span>'+
        estate()+
      '</div>'+
      (Array.isArray(c.partners)&&c.partners.length
        ? '<div><span class="hk" style="margin-bottom:6px">Who we run alongside</span>'+
          '<div class="opchips">'+c.partners.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div>'
        : '')+
    '</div>'+
  '</div></div>';

  /* ---- proof strip ---- */
  const proof = proofLogos.length ? '<div class="proofstrip">'+
    '<span class="pslab">'+esc(c.proofLabel||'Already working with')+'</span>'+
    proofLogos.map(function(x){
      return '<span class="pl"><span class="dot"></span>'+
        (x.logo?'<img src="'+esc(x.logo)+'" alt="" onerror="'+HIDE_ON_FAIL+'">':'')+esc(x.name)+'</span>';
    }).join('')+
    (c.proofMore?'<span class="pl" style="border-style:dashed;background:transparent">'+esc(c.proofMore)+'</span>':'')+
  '</div>' : '';

  /* ---- stat cards ---- */
  const tierBar = (function(){
    const tot = Math.max(1,t.t1+t.t2+t.t3);
    return '<div class="tierbar">'+
      '<i style="flex:'+t.t1+';background:'+C.gold+'"></i>'+
      '<i style="flex:'+t.t2+';background:'+C.violet+'"></i>'+
      '<i style="flex:'+t.t3+';background:'+mix(C.ink3,.35)+'"></i></div>';
  })();
  const cards = '<div class="scards">'+
    '<div class="sc" style="'+edge(C.pink)+'"><span class="scicon">◎</span>'+
      '<div class="sck">Named accounts</div><div class="scv">'+e.total+'</div>'+
      '<div class="scd">of '+c.accounts.length+' researched · target '+esc(c.objective.accountTarget||'not set')+'</div></div>'+

    '<div class="sc wide" style="'+edge(C.gold)+'"><span class="scicon">▤</span>'+
      '<div class="sck">Tier split</div>'+
      '<div class="scv">'+t.t1+' <small>/</small> '+t.t2+' <small>/</small> '+t.t3+'</div>'+
      tierBar+
      '<div class="scd" style="margin-top:7px"><b style="color:'+C.gold+'">1:1</b> '+t.t1+
        ' &nbsp;·&nbsp; <b style="color:'+C.violet+'">1:few</b> '+t.t2+
        ' &nbsp;·&nbsp; <b>1:many</b> '+t.t3+'</div></div>'+

    '<div class="sc ring" style="'+edge(r>=80?C.teal:r>=50?C.gold:C.pink)+'"><div>'+ring(r, r>=80?C.teal:r>=50?C.gold:C.pink, 62)+'</div>'+
      '<div class="rtxt"><div class="sck">Readiness</div>'+
      '<div class="scd" style="margin-top:4px">'+BUILD_STAGES().filter(function(s){return c.signoff[s.id];}).length+
      ' of '+BUILD_STAGES().length+' stages signed off by the client</div></div></div>'+
  '</div>'+
  '<div class="scards" style="margin-top:12px">'+
    '<div class="sc" style="'+edge(C.violet)+'"><span class="scicon">◈</span><div class="sck">Segments in scope</div>'+
      '<div class="scv">'+seg.length+' <small>/ '+c.segments.length+'</small></div>'+
      '<div class="segdots">'+c.segments.map(function(s){
        return '<i style="background:'+(s.on?s.colour:mix(C.ink3,.22))+'" title="'+esc(String(s.name).replace(/&amp;/g,'&'))+'"></i>';
      }).join('')+'</div>'+
      '<div class="scd" style="margin-top:7px">'+(c.segments.length-seg.length)+' deliberately parked</div></div>'+

    '<div class="sc" style="'+edge('#8A6206')+'"><span class="scicon">◍</span><div class="sck">Committee roles</div>'+
      '<div class="scv">'+c.personas.length+' <small>/ 6</small></div>'+
      '<div class="segdots">'+COMMERCIAL_ROLES.map(function(cr){
        const on = c.personas.some(function(p){return p.crole===cr[0];});
        return '<i style="background:'+(on?cr[4]:mix(C.ink3,.18))+'" title="'+esc(String(cr[1]).replace(/&amp;/g,'&'))+'"></i>';
      }).join('')+'</div>'+
      '<div class="scd" style="margin-top:7px">'+cv.pThreePct+'% of priority accounts at 3+ roles</div></div>'+

    '<div class="sc" style="'+edge(C.ink)+'"><span class="scicon">₹</span><div class="sck">Budget allocated</div>'+
      '<div class="scv">'+money(playBudget())+'</div>'+
      '<div class="scd">across '+c.plays.filter(function(p){return p.on;}).length+' live plays'+
      (Math.abs(num(c.objective.budget)-playBudget())>1?' · <b style="color:'+C.pink+'">not yet distributed</b>':'')+'</div></div>'+

    '<div class="sc" style="'+edge(mix(C.ink3,.55))+'"><span class="scicon">◷</span><div class="sck">Horizon</div>'+
      '<div class="scv" style="font-size:17px;letter-spacing:-.01em;line-height:1.25;margin-top:7px">'+esc(c.objective.horizon||'not set')+'</div>'+
      '<div class="scd" style="margin-top:6px">'+esc(c.objective.pipelineTarget||'set an outcome target')+'</div></div>'+
  '</div>';

  const topBlock = hero + proof + cards + signoffBlock();

  const w3 = '<div class="w3">'+
    '<div class="wq"><div class="wh"><span class="wl" style="background:'+C.pink+'">W</span>'+
      '<div><h3>Why this suits ABM</h3><div class="wsub">What makes this business a good candidate</div></div></div>'+
      '<div class="wb">'+bulOf('exec.why','A reason this business suits the approach')+'</div></div>'+
    '<div class="wq"><div class="wh"><span class="wl" style="background:'+C.violet+'">W</span>'+
      '<div><h3>What we will do</h3><div class="wsub">The actual scope, in plain terms</div></div></div>'+
      '<div class="wb">'+
        '<div class="f"><label>The scope</label>'+ta('exec.what','How many accounts, which sectors, which channels.')+'</div>'+
        '<div class="f"><label>And what it is not</label>'+ta('exec.notThis','Name the thing people will mistake this for.')+'</div>'+
      '</div></div>'+
    '<div class="wq"><div class="wh"><span class="wl" style="background:'+C.teal+'">H</span>'+
      '<div><h3>How it runs</h3><div class="wsub">Who does what, week to week</div></div></div>'+
      '<div class="wb">'+bulOf('exec.how','Something about how it will actually run')+'</div></div>'+
  '</div>';

  const ctx = '<div class="card"><header><h3>Where things stand today</h3>'+
    '<span class="hint">an honest read, including what is not working</span></header>'+
    '<div class="body">'+ta('exec.context','What has changed in the market, and what is missing in what they do now?')+
    '<div class="grid2" style="margin-top:14px">'+
      '<div class="f"><label>What this is for</label>'+ta('objective.goal')+'</div>'+
      '<div class="f"><label>What good looks like</label>'+ta('objective.pipelineTarget')+'</div>'+
    '</div></div></div>';

  const sm = '<div class="card" style="border-left:3px solid '+C.gold+'"><header><h3>What success looks like</h3>'+
    '<span class="hint">agreed before we start, so nobody argues about it in month three</span>'+
    '<span style="flex:1"></span><span class="muted tiny">'+c.successMetrics.length+' measures</span></header>'+
    '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
      '<th style="min-width:200px">Measure</th><th style="min-width:170px">Target</th>'+
      '<th style="min-width:300px">How we count it</th><th style="min-width:130px">Who owns it</th>'+
      '<th style="min-width:150px">Now</th><th></th></tr></thead><tbody>'+
    (c.successMetrics.length? c.successMetrics.map(m=>{
      const live = smLive(m.metric);
      return '<tr><td>'+ti('successMetrics.'+m.id+'.metric','','ce')+'</td>'+
        '<td>'+ti('successMetrics.'+m.id+'.target','','ce')+'</td>'+
        '<td class="ta">'+ta('successMetrics.'+m.id+'.how','','ce')+'</td>'+
        '<td>'+ti('successMetrics.'+m.id+'.owner','assign…','ce')+'</td>'+
        '<td>'+(live==null?'<span class="muted tiny">tracked manually</span>':'<b class="bignum">'+live+'</b>')+'</td>'+
        '<td><button class="xbtn" data-act="smdel" data-id="'+m.id+'">&times;</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">Nothing here yet. Filling this in together is the fastest way to focus a client meeting.</td></tr>')+
    '</tbody></table></div><button class="addrow" data-act="smadd">+ Add a success measure</button>'+
    '<div class="body" style="padding-top:0"><div class="f"><label>What to say about these numbers</label>'+
      ta('metricsNote','Be plain about what these targets are and are not.')+'</div></div></div>';

  const readout = '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Engagement</div><div class="v">'+e.engRate+'%</div><div class="d">'+e.touched+' of '+e.total+' accounts engaged</div></div>'+
    '<div class="tile vi"><div class="k">Committee coverage</div><div class="v">'+cv.pThreePct+'%</div><div class="d">priority accounts with 3+ roles</div></div>'+
    '<div class="tile te"><div class="k">Assessments</div><div class="v">'+(latestReading('assessments accepted')||0)+'</div><div class="d">accepted by target accounts</div></div>'+
    '<div class="tile go"><div class="k">Asset kit</div><div class="v">'+ak.ready+' <span style="font-size:13px;font-weight:500;color:var(--ink3)">/ '+ak.total+'</span></div><div class="d">'+ak.blocked+' not started</div></div>'+
  '</div>';

  const raci = '<div class="card"><header><h3>Who does what</h3><span class="hint">the reason this does not stall in week three</span></header>'+
    '<div class="body"><div class="raci">'+
      '<div><h4 style="color:'+C.pink+'">'+esc(c.name)+' owns</h4><ul class="bul">'+
        ['Approve the account list and put a named salesperson on every account',
         'Give us the CRM, customer and opportunity data',
         'Provide the engineers and commercial people for the health checks',
         'Check every claim and case study before it goes out',
         'Run discovery, do the surveys, and follow up commercially',
         'Keep the CRM up to date so we can all see what happened'
        ].map(x=>'<li><span class="bx">&mdash;</span><span>'+x+'</span></li>').join('')+'</ul></div>'+
      '<div><h4 style="color:'+C.violet+'">ZAMSTARS owns</h4><ul class="bul">'+
        ['The strategy and the way accounts get scored',
         'Research on accounts, contacts and who sits on each committee',
         'Positioning, copy, content and creative',
         'Running the paid media and building the landing pages',
         'Writing the sequences and supporting outreach',
         'The dashboards, weekly tuning, and a monthly read for your leadership'
        ].map(x=>'<li><span class="bx">&mdash;</span><span>'+x+'</span></li>').join('')+'</ul></div>'+
    '</div>'+
    '<div class="co go" style="margin:14px 0 0"><span class="cot">One rule that protects both of us</span>'+
      'We stop spending on any account sales has no time or intention to chase. Not a threat, just how the budget stays defensible when somebody asks.</div>'+
    '</div></div>';

  return topBlock +
    '<div class="divider"><span>The programme &mdash; why, what, how</span></div>'+
    w3 + ctx +
    '<div class="divider"><span>What we agree to be judged on</span></div>'+
    sm + readout +
    '<div class="divider"><span>How it runs</span></div>'+
    raci;
}
/* map a success measure to a live number where we can compute one */
function smLive(metric){
  const m = String(metric).toLowerCase(), e = execTotals(), cv = coverage();
  if(m.indexOf('accounts that engage')>-1) return e.touched+' of '+e.total;
  if(m.indexOf('people reached per account')>-1) return cv.pThreePct+'% at 3+ roles';
  if(m.indexOf('real conversations')>-1) return e.meetings;
  if(m.indexOf('health checks')>-1) return latestReading('health checks accepted');
  if(m.indexOf('opportunities')>-1) return liveAccounts().filter(a=>num(a.stage)>=5).length;
  if(m.indexOf('reporting')>-1) return cur().exec_.entries.length? 'running' : null;
  return null;
}

/* ============================================================
   9. STAGE 1: THEIR BUSINESS
   ============================================================ */
function vFoundation(){
  const c = cur();
  const arch = ARCHETYPES[c.archetype]||ARCHETYPES.infra;
  return signoffBlock()+
  '<div class="co pk"><span class="cot">Why this page exists</span>'+
    'Every number, persona and line of copy later on comes from what is written here. Get the business model wrong on this page and everything after it will be wrong with great confidence. So read it back to them and let them correct it.</div>'+

  '<div class="grid2">'+
    '<div class="card"><header><h3>What they do</h3><span class="hint">as we understand it so far</span></header><div class="body">'+
      '<div class="f"><label>Industry</label>'+ti('industry')+'</div>'+
      '<div class="f"><label>Headquarters &amp; footprint</label>'+ti('hq')+'</div>'+
      '<div class="f"><label>Closest industry pattern <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:400">(sets the first-draft journey and committee)</span></label>'+
        tsel('archetype', Object.keys(ARCHETYPES).map(k=>[k, ARCHETYPES[k].label]), true, 'inp')+
        '<div class="hlp">'+esc(arch.blurb)+'</div></div>'+
      '<div class="f"><label>What they actually sell</label>'+ta('profile.whatTheyDo','In the buyer\'s words rather than the brochure\'s.')+'</div>'+
      '<div class="f"><label>How the money works</label>'+ta('profile.revenueModel','How they price it, how the contract is shaped, where the long-term value sits.')+'</div>'+
    '</div></div>'+

    '<div class="card"><header><h3>What we have to work with</h3><span class="hint">time, money and deal shape</span></header><div class="body">'+
      '<div class="grid2" style="gap:12px">'+
        '<div class="f"><label>Horizon</label>'+ti('objective.horizon','','inp')+'</div>'+
        '<div class="f"><label>Target account count</label>'+ti('objective.accountTarget','','inp',true)+'</div>'+
      '</div>'+
      '<div class="f"><label>Programme budget (₹, 90 days)</label>'+ti('objective.budget','','inp',true)+
        '<div class="hlp">Split '+num(tierSplit().t1)+' / '+num(tierSplit().t2)+' / '+num(tierSplit().t3)+
        ' across the tiers, with Tier 1 getting most of it because that is where the evidence is, then across the live plays by effort weight. '+
        'Currently allocated: <b>'+money(playBudget())+'</b>. Change the split, or fix an individual play’s cost, on the <b>Play Library</b> screen.</div></div>'+
      '<div class="f"><label>Typical sales cycle</label>'+ti('profile.cycle','','inp')+'</div>'+
      '<div class="f"><label>Annual / contract value</label>'+ti('profile.acv','','inp')+'</div>'+
      '<div class="f"><label>Current go-to-market</label>'+ta('profile.gtm','How do they win business today?')+'</div>'+
    '</div></div>'+
  '</div>'+

  '<div class="grid2">'+
    '<div class="card"><header><h3>Evidence we can use</h3><span class="hint">nothing later on can claim more than this</span></header><div class="body">'+
      chipsOf('profile.proof','te','add a proof point')+
      '<div class="hlp" style="margin-top:10px">Every message we write later has to trace back to one of these lines. That is the rule that keeps the copy honest. Use numbers somebody has actually verified, and be ready to say how they were measured.</div>'+
    '</div></div>'+
    '<div class="card"><header><h3>What only they can say</h3><span class="hint">the genuinely hard-to-copy bits</span></header><div class="body">'+
      chipsOf('profile.diff','pk','add a differentiator')+
      '<div class="hlp" style="margin-top:10px">If a competitor could put the same line on their own site, it is table stakes rather than a difference. Seamless connectivity is the classic example.</div>'+
    '</div></div>'+
  '</div>'+

  '<div class="grid2">'+
    '<div class="card"><header><h3>Who else is in the room</h3></header><div class="body">'+
      ta('profile.competitors','Named competitors, plus the do-nothing option they actually lose to most.')+'</div></div>'+
    '<div class="card"><header><h3>The central marketing problem</h3><span class="hint">the sentence the whole programme answers</span></header><div class="body">'+
      ta('profile.challenge','If you can only fix one thing, what is it?')+'</div></div>'+
  '</div>';
}

/* ============================================================
   10. STAGE 2: WHO TO TARGET
   ============================================================ */
function vICP(){
  const c = cur(), t = tierCounts(), la = liveAccounts();
  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Segments defined</div><div class="v">'+c.segments.length+'</div><div class="d">'+activeSegs().length+' active · '+(c.segments.length-activeSegs().length)+' parked</div></div>'+
    '<div class="tile vi"><div class="k">Accounts in scope</div><div class="v">'+la.length+'</div><div class="d">of '+c.accounts.length+' named</div></div>'+
    '<div class="tile go"><div class="k">Tier 1 unlocked</div><div class="v">'+t.t1+'</div><div class="d">1:1 treatment</div></div>'+
    '<div class="tile te"><div class="k">Disqualifiers agreed</div><div class="v">'+c.disqualify.length+'</div><div class="d">reasons to walk away</div></div>'+
  '</div>'+

  '<div class="grid2">'+
    '<div class="card"><header><h3>What a good fit looks like</h3><span class="hint">accounts qualify on potential and evidence of need, not on being a famous name</span></header>'+
      '<div class="body">'+bulOf('icpFit','A qualifying characteristic…')+'</div></div>'+
    '<div class="card" style="border-left:3px solid '+C.pink+'"><header><h3>Disqualifying conditions</h3><span class="hint">the list clients remember</span></header>'+
      '<div class="body">'+bulOf('disqualify','A reason to deprioritise an account…')+
      '<div class="co pk" style="margin:14px 0 0"><span class="cot">Say this out loud</span>'+
      'An agency that tells you which accounts to walk away from is an agency thinking about your margin, not its own billings.</div></div></div>'+
  '</div>'+

  '<div class="co"><span class="cot">The mechanic</span>'+
    'Switch a segment off and it disappears from the account list, the journey, the messaging and the budget all at once. '+
    '<b>A parked segment costs nothing. A half-targeted segment costs everything.</b></div>'+

  c.segments.map(s=>{
    const cnt = c.accounts.filter(a=>a.seg===s.id).length;
    const t1 = c.accounts.filter(a=>a.seg===s.id && tierOf(a)==='t1').length;
    return '<div class="card" style="'+(s.on?'border-left:3px solid '+s.colour:'opacity:.62')+'">'+
      '<header>'+
        '<button class="sw'+(s.on?' on':'')+'" data-act="segtoggle" data-id="'+s.id+'" title="Include or park this segment"></button>'+
        '<h3 style="flex:1">'+ti('segments.'+s.id+'.name','','ce',true)+'</h3>'+
        '<span class="pill '+(s.priority==='A'?'t1p':s.priority==='B'?'t2p':'t3p')+'">Priority '+esc(s.priority||'?')+'</span>'+
        '<span class="pill '+(s.on?'okp':'t3p')+'">'+(s.on?'IN SCOPE':'PARKED')+'</span>'+
        '<span class="muted tiny">'+cnt+' accounts · '+t1+' Tier 1</span>'+
        '<button class="xbtn" data-act="segdel" data-id="'+s.id+'" title="Delete segment">&times;</button>'+
      '</header>'+
      '<div class="body"><div class="grid2">'+
        '<div>'+
          '<div class="f"><label>Target account types</label>'+ta('segments.'+s.id+'.desc')+'</div>'+
          '<div class="f"><label>Why now</label>'+ta('segments.'+s.id+'.whyNow','What changed in their world this year?')+'</div>'+
          '<div class="f"><label>Why we win here</label>'+ta('segments.'+s.id+'.why')+'</div>'+
        '</div>'+
        '<div>'+
          '<div class="f"><label>Relevant business problems</label>'+chipsOf('segments.'+s.id+'.problems','pk','add a problem')+'</div>'+
          '<div class="f"><label>Qualification criteria</label>'+chipsOf('segments.'+s.id+'.fit','vi','add a criterion')+'</div>'+
          '<div class="grid2" style="gap:12px">'+
            '<div class="f"><label>Addressable size</label>'+ti('segments.'+s.id+'.size','','inp')+'</div>'+
            '<div class="f"><label>Priority</label>'+tsel('segments.'+s.id+'.priority',[['A','A: lead with this'],['B','B: second wave'],['Expansion','Expansion'],['Parked','Parked']],true,'inp')+'</div>'+
          '</div>'+
        '</div>'+
      '</div></div></div>';
  }).join('')+
  '<button class="tbtn" data-act="segadd">+ Add a segment</button>';
}

/* ============================================================
   11. STAGE 3: THE ACCOUNT LIST
   ============================================================ */
function vAccounts(){
  const c = cur(), t = tierCounts(), la = liveAccounts(), w = weights(), ws = weightSum();
  let rows = la.slice();
  if(S.acctSeg!=='all') rows = rows.filter(a=>a.seg===S.acctSeg);
  if(S.acctTier!=='all') rows = rows.filter(a=>tierOf(a)===S.acctTier);
  rows.sort((a,b)=> scoreOf(b)-scoreOf(a));
  const segOpts = c.segments.map(s=>[s.id, esc(s.name)]);
  const budget = num(c.objective.budget);
  const cv = coverage();

  const wcard = '<div class="card" style="border-left:3px solid '+C.violet+'"><header><h3>Scoring model</h3>'+
    '<span class="hint">seven factors, 0–10 each, weighted to a 0–100 account score</span>'+
    '<span style="flex:1"></span><span class="muted tiny">weights total '+ws+(ws!==100?', normalised on output':'')+'</span></header>'+
    '<div class="body"><div class="grid2" style="gap:20px"><div>'+
    SCORE_FACTORS.map(f=>'<div class="wtrow"><span class="wtn">'+f.label+'<div class="tiny muted">'+f.hint+'</div></span>'+
      '<span class="wtbar"><i style="width:'+(num(w[f.k])/Math.max(1,ws)*100*2.2)+'%"></i></span>'+
      tn('weights.'+f.k,'mini',true,0,60,52)+'<span class="tiny muted">%</span></div>').join('')+
    '</div><div>'+
      '<div class="co"><span class="cot">Do this in the room</span>'+
        'Drop <b>Strategic brand value</b> to zero and a famous logo falls out of Tier 1. Push <b>Existing relationship</b> to 40 and Tier 1 collapses to the handful of accounts where a door is already open. '+
        'That is the moment ABM stops being a marketing idea and becomes a capital allocation decision.</div>'+
      '<div class="f"><label>Tier 1 threshold (score)</label>'+
        '<div class="tiny muted" style="margin-bottom:6px">Currently '+TIER_BANDS.t1+' and above, which gives '+t.t1+' accounts. Somewhere between 8 and 10 is about right.</div></div>'+
      '<div class="f"><label>Tier 2 threshold (score)</label>'+
        '<div class="tiny muted">Currently '+TIER_BANDS.t2+' and above. '+t.t2+' accounts qualify. Tier 3 is everything below, and its job is to promote accounts upward rather than absorb budget.</div></div>'+
      '<div class="rowend"><button class="tbtn" data-act="wreset">Reset weights</button></div>'+
    '</div></div></div></div>';

  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile go"><div class="k">Tier 1 · 1:1</div><div class="v">'+t.t1+'</div><div class="d">'+money(tierTarget('t1'))+' · '+money(t.t1?tierTarget('t1')/t.t1:0)+' per account</div></div>'+
    '<div class="tile vi"><div class="k">Tier 2 · 1:Few</div><div class="v">'+t.t2+'</div><div class="d">'+money(tierTarget('t2'))+' · '+money(t.t2?tierTarget('t2')/t.t2:0)+' per account</div></div>'+
    '<div class="tile"><div class="k">Tier 3 · 1:Many</div><div class="v">'+t.t3+'</div><div class="d">'+money(tierTarget('t3'))+' · '+money(t.t3?tierTarget('t3')/t.t3:0)+' per account</div></div>'+
    '<div class="tile pk"><div class="k">Sales-owned</div><div class="v">'+cv.ownedPct+'%</div><div class="d">'+cv.owned+' of '+cv.n+' have a named owner</div></div>'+
  '</div>'+
  (cv.ownedPct<100?'<div class="co go"><span class="cot">Worth settling first</span>Sales has to agree to chase an account before we spend anything personalising work for it. <b>'+(cv.n-cv.owned)+' accounts</b> still have nobody against their name. That is the next conversation to have, before the next campaign.</div>':'')+
  wcard+

  '<div class="pjump">'+
    '<button class="'+(S.acctSeg==='all'?'on':'')+'" data-act="fseg" data-v="all">All segments</button>'+
    activeSegs().map(s=>'<button class="'+(S.acctSeg===s.id?'on':'')+'" data-act="fseg" data-v="'+s.id+'">'+esc(s.name)+'</button>').join('')+
    '<span style="width:14px"></span>'+
    ['all','t1','t2','t3'].map(k=>'<button class="'+(S.acctTier===k?'on':'')+'" data-act="ftier" data-v="'+k+'">'+(k==='all'?'All tiers':TIERSHORT[k])+'</button>').join('')+
  '</div>'+

  '<div class="card"><header><h3>Named account universe</h3><span class="hint">rate each factor 0–10 · the score sets the tier</span>'+
    '<span style="flex:1"></span><span class="muted tiny">showing '+rows.length+' of '+la.length+'</span></header>'+
    '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
      '<th style="min-width:200px">Account</th><th>Segment</th><th>City</th><th style="min-width:120px">Incumbent</th>'+
      SCORE_FACTORS.map(f=>'<th title="'+esc(String(f.label).replace(/&amp;/g,'&'))+': '+esc(f.hint)+'" style="width:44px">'+f.label.split(' ')[0].slice(0,5)+'<div style="font-weight:600;color:var(--ink3)">'+num(w[f.k])+'%</div></th>').join('')+
      '<th style="width:104px">Score</th><th>Tier</th><th style="min-width:120px">Sales owner</th><th></th>'+
    '</tr></thead><tbody>'+
    (rows.length?rows.map(a=>{
      const tr = tierOf(a), sg = segById(a.seg)||{colour:C.ink3};
      const sc = scoreOf(a);
      const noOwner = String(a.owner||'').trim()===''||a.owner==='Unassigned';
      return '<tr>'+
        '<td><input class="ce" data-set="accounts.'+a.id+'.name" value="'+esc(a.name)+'" style="font-weight:600">'+
          '<div style="padding:0 5px"><input class="ce" data-set="accounts.'+a.id+'.note" value="'+esc(a.note)+'" placeholder="entry hypothesis…" style="font-size:11px;color:var(--ink3)"></div></td>'+
        '<td>'+tsel('accounts.'+a.id+'.seg', segOpts, true)+'</td>'+
        '<td><input class="ce" data-set="accounts.'+a.id+'.city" value="'+esc(a.city)+'" style="width:82px"></td>'+
        '<td><input class="ce" data-set="accounts.'+a.id+'.incumbent" value="'+esc(a.incumbent)+'"></td>'+
        SCORE_FACTORS.map(f=>'<td>'+tn('accounts.'+a.id+'.'+f.k,'mini',true,0,10,40)+'</td>').join('')+
        '<td class="calc">'+sb(sc, sc>=TIER_BANDS.t1?C.gold:sc>=TIER_BANDS.t2?C.violet:C.ink3, 100, 96)+'</td>'+
        '<td class="calc"><span class="pill '+TIERPILL[tr]+'">'+TIERSHORT[tr]+'</span></td>'+
        '<td><input class="ce'+(noOwner?'':'')+'" data-set="accounts.'+a.id+'.owner" data-live="1" value="'+esc(a.owner)+'" placeholder="assign…" style="'+(noOwner?'color:var(--pink)':'')+'"></td>'+
        '<td><button class="xbtn" data-act="acctdel" data-id="'+a.id+'">&times;</button></td>'+
      '</tr>';
    }).join(''):'<tr><td colspan="'+(SCORE_FACTORS.length+8)+'" class="empty">No accounts match this filter.</td></tr>')+
    '</tbody></table></div>'+
    '<button class="addrow" data-act="acctadd">+ Add an account</button></div>'+

  '<div class="card"><header><h3>What each tier buys</h3></header><div class="body"><div class="grid3">'+
    [['t1','A dedicated account plan, deep portfolio research, a complete committee map, an individually written value proposition, a microsite, executive-to-executive outreach, a bespoke assessment and a contact plan across five or more stakeholders.'],
     ['t2','Industry-specific content, role-based email and LinkedIn outreach, cluster landing pages, targeted advertising, webinars or roundtables, and sales sequences customised with account-level information.'],
     ['t3','Vertical content, paid social and retargeting, newsletter nurturing, event invitations and trigger-based sales activation. Its job is to spot the accounts worth promoting, not to soak up the budget.']].map(x=>
      '<div style="border:1px solid var(--line);border-radius:9px;padding:13px">'+
      '<span class="pill '+TIERPILL[x[0]]+'">'+TIERLBL[x[0]]+'</span>'+
      '<div style="font-size:22px;font-weight:750;margin:8px 0 2px">'+t[x[0]]+' <span class="muted" style="font-size:12px;font-weight:500">accounts</span></div>'+
      '<div class="bignum muted">'+money(tierTarget(x[0]))+' allocated</div>'+
      '<div class="tiny muted" style="margin-top:8px;line-height:1.55">'+x[1]+'</div></div>').join('')+
  '</div></div></div>';
}

/* ============================================================
   12. STAGE 4: WHO SAYS YES
   ============================================================ */
function vCommittee(){
  const c = cur(), cv = coverage();
  const segOpts = activeSegs();
  const roleOpts = COMMERCIAL_ROLES.map(r=>[r[0], r[1]]);

  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Roles mapped</div><div class="v">'+c.personas.length+'</div><div class="d">of 6 commercial roles</div></div>'+
    '<div class="tile vi"><div class="k">Accounts with a map</div><div class="v">'+cv.mappedPct+'%</div><div class="d">'+cv.mapped+' of '+cv.n+'</div></div>'+
    '<div class="tile go"><div class="k">Priority accounts, 3+ roles</div><div class="v">'+cv.pThreePct+'%</div><div class="d">'+cv.pThree+' of '+cv.priority+'</div></div>'+
    '<div class="tile te"><div class="k">Avg roles per account</div><div class="v">'+cv.avgRoles+'</div><div class="d">multi-threading depth</div></div>'+
  '</div>'+

  '<div class="co vi"><span class="cot">The argument for this stage</span>'+
    'One deal, six arguments. Your champion goes off to sell it internally and loses, usually because nobody wrote the version for the person who actually said no. '+
    '<b>A campaign is not account-based if it relies on one person forwarding the message.</b></div>'+

  '<div class="card"><header><h3>The six commercial roles</h3><span class="hint">every account gets mapped into these, whatever the job titles say</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:170px">Role</th>'+
    '<th style="min-width:240px">Main concern</th><th style="min-width:260px">Content that moves them</th><th style="min-width:200px">Mapped to</th></tr></thead><tbody>'+
  COMMERCIAL_ROLES.map(r=>{
    const mapped = c.personas.filter(p=>p.crole===r[0]);
    return '<tr><td><span class="pill" style="background:'+mix(r[4],.12)+';color:'+r[4]+';border:1px solid '+mix(r[4],.3)+'">'+r[1]+'</span></td>'+
      '<td>'+r[2]+'</td><td class="tiny">'+r[3]+'</td>'+
      '<td>'+(mapped.length?mapped.map(p=>'<div class="tiny"><b>'+p.role+'</b></div>').join(''):'<span class="pill bap">NOT MAPPED</span>')+'</td></tr>';
  }).join('')+'</tbody></table></div></div>'+

  '<div class="grid2">'+
  c.personas.map(p=>{
    const initials = String(p.role).replace(/&amp;/g,'').split(/[\s\/]+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
    return '<div class="persona"'+(p.gen?' style="border-style:dashed"':'')+'>'+
      '<div class="ph"><span class="pav" style="background:'+(ROLE_COL[p.crole]||p.colour||C.ink)+'">'+esc(initials)+'</span>'+
        '<div style="flex:1;min-width:0">'+ti('personas.'+p.id+'.role','','ce')+
          '<div class="prole">'+tsel('personas.'+p.id+'.crole', roleOpts, true)+'</div></div>'+
        (p.gen?'<span class="pill wrp">DRAFT</span>':'')+
        '<button class="xbtn" data-act="perdel" data-id="'+p.id+'">&times;</button></div>'+
      '<div class="pfield"><div class="pl">Segments</div><div class="chips">'+
        segOpts.map(s=>'<span class="chip '+((p.segs||[]).indexOf(s.id)>-1?'sel':'')+'" data-act="perseg" data-id="'+p.id+'" data-seg="'+s.id+'" style="cursor:pointer">'+esc(s.name)+'</span>').join('')+
      '</div></div>'+
      '<div class="pfield"><div class="pl">What they want</div>'+ta('personas.'+p.id+'.goal')+'</div>'+
      '<div class="pfield"><div class="pl">The pain they own</div>'+ta('personas.'+p.id+'.pain')+'</div>'+
      '<div class="pfield"><div class="pl">The pitch that moves them</div>'+ta('personas.'+p.id+'.pitch')+'</div>'+
      '<div class="pfield"><div class="pl">The objection they will raise</div>'+ta('personas.'+p.id+'.objection')+'</div>'+
      '<div class="pfield"><div class="pl">The proof that answers it</div>'+ta('personas.'+p.id+'.proof')+'</div>'+
      '<div class="pfield"><div class="pl">Recommended content</div>'+ta('personas.'+p.id+'.content')+'</div>'+
      '<div class="pfield"><div class="pl">Where we reach them</div>'+chipsOf('personas.'+p.id+'.channels','vi','add a channel')+'</div>'+
    '</div>';
  }).join('')+
  '</div>'+
  '<button class="tbtn" data-act="peradd">+ Add a committee role</button>'+
  '<button class="tbtn" data-act="pergen" style="margin-left:8px">Regenerate from archetype</button>'+

  '<div class="card" style="margin-top:16px"><header><h3>Who we have actually reached</h3>'+
  '<span class="hint">logged on the Log Activity screen · blank columns on a live deal predict a stall</span></header>'+
  '<div class="body">'+coverageMatrix()+'</div></div>';
}
function coverageMatrix(){
  const c = cur();
  const pri = liveAccounts().filter(a=>tierOf(a)!=='t3').sort((a,b)=>scoreOf(b)-scoreOf(a));
  if(!pri.length) return '<div class="empty">No Tier 1 or Tier 2 accounts yet.</div>';
  return '<div class="scrollx"><table class="tbl hm"><thead><tr><th style="min-width:180px">Account</th><th>Tier</th>'+
    COMMERCIAL_ROLES.map(r=>'<th style="max-width:76px;white-space:normal">'+r[1]+'</th>').join('')+'<th>Roles</th></tr></thead><tbody>'+
    pri.map(a=>{
      const roles = a.roles||[];
      return '<tr><td style="font-weight:600">'+esc(a.name)+'</td>'+
        '<td><span class="pill '+TIERPILL[tierOf(a)]+'">'+TIERSHORT[tierOf(a)]+'</span></td>'+
        COMMERCIAL_ROLES.map(r=>{
          const on = roles.indexOf(r[0])>-1;
          return '<td><div class="hmc" style="background:'+(on?mix(r[4],.85):mix(C.ink3,.07))+';color:'+(on?'#fff':'var(--ink2)')+'">'+(on?'✓':'·')+'</div></td>';
        }).join('')+
        '<td><span class="pill '+(roles.length>=3?'okp':roles.length?'wrp':'bap')+'">'+roles.length+'</span></td></tr>';
    }).join('')+
  '</tbody></table></div>'+
  '<div class="legend"><span><i style="background:'+mix(C.pink,.85)+'"></i>Role engaged</span><span><i style="background:'+mix(C.ink3,.07)+'"></i>Not reached</span>'+
  '<span>Target: <b>3+ roles</b> in every priority account</span></div>';
}

/* ============================================================
   13. STAGE 5: BUYING SIGNALS
   ============================================================ */
function vIntel(){
  const c = cur();
  const on = c.signals.filter(s=>s.on);
  const maxW = on.reduce((s,x)=>s+num(x.weight),0);
  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Triggers monitored</div><div class="v">'+on.length+'</div><div class="d">of '+c.signals.length+' defined</div></div>'+
    '<div class="tile vi"><div class="k">Max intent score</div><div class="v">'+maxW+'</div><div class="d">sum of active weights</div></div>'+
    '<div class="tile go"><div class="k">Act-now triggers</div><div class="v">'+on.filter(s=>num(s.weight)>=3).length+'</div><div class="d">weight 3, so respond in days</div></div>'+
    '<div class="tile te"><div class="k">Response commitment</div><div class="v">2 days</div><div class="d">first relevant contact after a trigger</div></div>'+
  '</div>'+

  '<div class="co"><span class="cot">The two rules</span>'+
    'First, a trigger is what gives us a reason to ring somebody this week. Without one, outreach is just an interruption. '+
    '<b>Two.</b> Triggers decay. A published tender is hot for two weeks; a leadership appointment for sixteen. Review the model monthly instead of weekly and it will quietly mislead you, because an old high score looks exactly like a new one.</div>'+

  '<div class="card"><header><h3>Trigger model</h3><span class="hint">weight 1 = note · 2 = nurture · 3 = act now</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
    '<th style="width:38px">On</th><th style="min-width:230px">Trigger</th><th style="min-width:160px">Watched from</th>'+
    '<th style="width:74px">Weight</th><th style="width:82px">Decay</th><th style="min-width:300px">What it actually means</th><th></th>'+
  '</tr></thead><tbody>'+
  c.signals.map(s=>'<tr'+(s.on?'':' style="opacity:.45"')+'>'+
    '<td><button class="sw'+(s.on?' on':'')+'" data-act="sigtoggle" data-id="'+s.id+'" style="width:30px;height:17px"></button></td>'+
    '<td>'+ti('signals.'+s.id+'.name','','ce')+'</td>'+
    '<td>'+ti('signals.'+s.id+'.source','','ce')+'</td>'+
    '<td>'+tsel('signals.'+s.id+'.weight',[[1,'1 · note'],[2,'2 · nurture'],[3,'3 · act']],true)+'</td>'+
    '<td>'+ti('signals.'+s.id+'.decay','','ce tiny')+'</td>'+
    '<td class="ta">'+ta('signals.'+s.id+'.meaning','','ce')+'</td>'+
    '<td><button class="xbtn" data-act="sigdel" data-id="'+s.id+'">&times;</button></td>'+
  '</tr>').join('')+
  '</tbody></table></div><button class="addrow" data-act="sigadd">+ Add a trigger</button></div>'+

  '<div class="card" style="border-left:3px solid '+C.teal+'"><header><h3>Response service levels</h3>'+
    '<span class="hint">agreed before engagement alerts are switched on, never after</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:280px">When this happens</th><th style="min-width:260px">This happens</th><th></th></tr></thead><tbody>'+
  c.sla.map(s=>'<tr><td>'+ti('sla.'+s.id+'.trigger','','ce')+'</td>'+
    '<td>'+ti('sla.'+s.id+'.response','','ce')+'</td>'+
    '<td><button class="xbtn" data-act="sladel" data-id="'+s.id+'">&times;</button></td></tr>').join('')+
  '</tbody></table></div><button class="addrow" data-act="sladd">+ Add a service level</button></div>'+

  '<div class="card"><header><h3>Trigger evidence by account</h3><span class="hint">what we have actually observed, per priority account</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:190px">Account</th><th>Tier</th>'+
    '<th style="width:110px">Trigger score</th><th style="min-width:300px">Evidence on record</th></tr></thead><tbody>'+
  liveAccounts().filter(a=>tierOf(a)!=='t3').sort((a,b)=>num(b.trig)-num(a.trig)).map(a=>{
    const tr=tierOf(a);
    return '<tr><td style="font-weight:600">'+esc(a.name)+'</td>'+
      '<td><span class="pill '+TIERPILL[tr]+'">'+TIERSHORT[tr]+'</span></td>'+
      '<td class="calc">'+sb(a.trig, num(a.trig)>=7?C.pink:num(a.trig)>=5?C.gold:C.ink3)+'</td>'+
      '<td>'+ti('accounts.'+a.id+'.note','what have we actually observed?','ce')+'</td></tr>';
  }).join('')+
  '</tbody></table></div></div>';
}
