/* ============================================================
   19. STAGE 11: THE DASHBOARD
   ============================================================ */
function autoKpi(k){
  const e = execTotals(), cv = coverage();
  const m = String(k.metric).toLowerCase();
  if(m.indexOf('named salesperson')>-1) return cv.ownedPct;
  if(m.indexOf('know the committee')>-1) return cv.mappedPct;
  if(m.indexOf('three or more names')>-1) return cv.threePct;
  if(m.indexOf('accounts that engaged')>-1) return e.touched;
  if(m.indexOf('people engaged per account')>-1) return cv.avgRoles;
  if(m.indexOf('real conversations')>-1 && m.indexOf('cost')===-1) return e.meetings;
  if(m.indexOf('discovery meetings')>-1) return e.meetings;
  if(m.indexOf('health checks delivered')>-1) return latestReading('health checks completed');
  if(m.indexOf('sales has accepted')>-1) return liveAccounts().filter(a=>num(a.stage)>=3).length;
  if(m.indexOf('opportunities created')>-1) return liveAccounts().filter(a=>num(a.stage)>=5).length;
  if(m.indexOf('turned up to something')>-1) return latestReading('confirmed attendees');
  if(m.indexOf('content actually read')>-1) return latestReading('downloads from target accounts');
  if(m.indexOf('visits from target accounts')>-1) return latestReading('page visits');
  if(m.indexOf('cost per engaged account')>-1) return e.touched? Math.round(playBudget()/e.touched) : null;
  if(m.indexOf('cost per real conversation')>-1) return e.meetings? Math.round(playBudget()/e.meetings) : null;
  if(m.indexOf('cost per opportunity')>-1){ const o=liveAccounts().filter(a=>num(a.stage)>=5).length; return o?Math.round(playBudget()/o):null; }
  return null;
}
function vDashboard(){
  const c = cur(), e = execTotals(), t = tierCounts(), cv = coverage(), ak = assetReady();

  const tiles = '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Accounts in scope</div><div class="v">'+e.total+'</div><div class="d">'+t.t1+' T1 · '+t.t2+' T2 · '+t.t3+' T3</div></div>'+
    '<div class="tile vi"><div class="k">Engaged</div><div class="v">'+e.touched+' <span style="font-size:13px;font-weight:500;color:var(--ink3)">/ '+e.total+'</span></div><div class="d">'+e.engRate+'% of the list has moved</div></div>'+
    '<div class="tile te"><div class="k">Meetings held</div><div class="v">'+e.meetings+'</div><div class="d">'+(e.touched?fmt(e.meetings/e.touched):0)+' per engaged account</div></div>'+
    '<div class="tile go"><div class="k">Proving it works, or past that</div><div class="v">'+e.validated+'</div><div class="d">'+((latestReading('health checks accepted')!=null)?latestReading('health checks accepted')+' health checks accepted':'no health checks logged yet')+'</div></div>'+
  '</div>';

  /* Layer one: how good the list actually is */
  const covCard = '<div class="card" style="border-left:3px solid '+LAYERS.cov.colour+'"><header>'+
    '<span class="pill t3p">COVERAGE</span><h3 style="flex:1">'+LAYERS.cov.q+'</h3>'+
    '<span class="muted tiny">the layer everyone skips</span></header><div class="body"><div class="grid4">'+
    [['Sales-owned',cv.ownedPct,cv.owned+' of '+cv.n+' accounts',100],
     ['Committee mapped',cv.mappedPct,cv.mapped+' of '+cv.n+' accounts',90],
     ['3+ roles, all accounts',cv.threePct,cv.three+' of '+cv.n,75],
     ['3+ roles, priority only',cv.pThreePct,cv.pThree+' of '+cv.priority,80]]
    .map(function(x){
      const col = x[1]>=x[3]?C.teal:x[1]>=x[3]*0.6?C.gold:C.pink;
      return '<div><div class="k" style="font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink3);font-weight:800">'+x[0]+'</div>'+
        '<div style="font-size:23px;font-weight:750;letter-spacing:-.02em;margin:2px 0 4px">'+x[1]+'%</div>'+
        '<div class="rbar" style="background:var(--line)"><i style="width:'+x[1]+'%;background:'+col+'"></i></div>'+
        '<div class="d" style="margin-top:4px">'+x[2]+' · target '+x[3]+'%</div></div>';
    }).join('')+'</div>'+
    (cv.ownedPct<100?'<div class="co pk" style="margin:14px 0 0"><span class="cot">Spend gate</span><b>'+(cv.n-cv.owned)+' accounts have no named sales owner.</b> Personalising anything for them is spend without a commitment behind it.</div>':'')+
    '</div></div>';

  const funnel = '<div class="card"><header><h3>Journey funnel</h3><span class="hint">accounts that reached each stage or beyond</span></header><div class="body">'+funnelBars()+'</div></div>';

  const hm = (function(){
    if(!c.journey.length) return '';
    return '<div class="card"><header><h3>Tier × journey position</h3><span class="hint">where the money is, and whether it is moving</span></header>'+
      '<div class="body scrollx"><table class="tbl hm"><thead><tr><th></th>'+
      c.journey.map(function(j,i){ return '<th style="max-width:74px;white-space:normal;font-size:8.5px">'+(i+1)+'. '+j.name+'</th>'; }).join('')+'</tr></thead><tbody>'+
      ['t1','t2','t3'].map(function(k){
        const acc = liveAccounts().filter(function(a){return tierOf(a)===k;});
        let max=1; c.journey.forEach(function(j,i){ const n=acc.filter(function(a){return num(a.stage)===i;}).length; if(n>max)max=n; });
        return '<tr><td style="white-space:nowrap"><span class="pill '+TIERPILL[k]+'">'+TIERSHORT[k]+'</span></td>'+
          c.journey.map(function(j,i){
            const n = acc.filter(function(a){return num(a.stage)===i;}).length;
            const alpha = n? (0.16 + 0.7*(n/max)) : 0;
            const col = n? mix((VG[j.vg]||VG.all).colour, alpha) : mix(C.ink3,.05);
            return '<td><div class="hmc" style="background:'+col+';color:'+(alpha>.55?'#fff':'var(--ink2)')+'">'+(n||'·')+'</div></td>';
          }).join('')+'</tr>';
      }).join('')+
      '</tbody></table></div>'+
      '<div class="hlp" style="padding:0 16px 14px">A Tier-1 account parked in an early column for more than a month is the most expensive thing in this programme. Those are the rows to talk about on Monday.</div></div>';
  })();

  /* KPI tracking, grouped by layer */
  const kpiCard = ['cov','eng','prog','comm'].map(function(lk){
    const list = c.kpis.filter(function(k){return k.layer===lk;}); if(!list.length) return '';
    const L = LAYERS[lk];
    return '<div class="card"><header><span class="pill" style="background:'+mix(L.colour,.12)+';color:'+L.colour+';border:1px solid '+mix(L.colour,.3)+'">'+L.label.toUpperCase()+'</span>'+
      '<h3 style="flex:1">'+L.q+'</h3><span class="muted tiny">auto-derived where possible · type over any value</span></header>'+
      '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:210px">Metric</th>'+
      '<th style="width:80px" class="num">Baseline</th><th style="width:92px">Current</th><th style="width:80px" class="num">Target</th>'+
      '<th style="min-width:180px">Progress to target</th><th style="width:74px">Unit</th></tr></thead><tbody>'+
      list.map(function(k){
        const auto = autoKpi(k);
        const shown = String(k.current==null?'':k.current).trim()!=='' ? num(k.current) : auto;
        const bl = String(k.baseline).trim()===''?null:num(k.baseline);
        const tg = String(k.target).trim()===''?null:num(k.target);
        let bar='<span class="muted tiny">no target set</span>';
        if(tg!=null && shown!=null){
          const lower = /cycle|length|days|cost/i.test(k.metric);
          let p;
          if(lower){ const b = bl==null?shown:bl; p = (b===tg)?100:clamp((b-shown)/(b-tg)*100,0,100); }
          else { const b = bl==null?0:bl; p = (tg===b)?100:clamp((shown-b)/(tg-b)*100,0,100); }
          const col = p>=100?C.teal:p>=60?C.violet:p>=30?C.gold:C.pink;
          bar = '<span class="sb" style="min-width:150px"><span class="track"><i style="width:'+p+'%;background:'+col+'"></i></span><span class="n">'+Math.round(p)+'%</span></span>';
        }
        return '<tr><td><b>'+esc(k.metric)+'</b></td>'+
          '<td class="num calc">'+(bl==null?'-':fmt(bl))+'</td>'+
          '<td><input class="mini" data-set="kpis.'+k.id+'.current" data-live="1" value="'+esc(k.current==null?'':k.current)+'" placeholder="'+(auto!=null?fmt(auto):'-')+'" style="width:70px;font-family:var(--mono)"></td>'+
          '<td class="num calc">'+(tg==null?'-':fmt(tg))+'</td>'+
          '<td class="calc">'+bar+'</td><td class="tiny muted">'+esc(k.unit)+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>';
  }).join('');

  /* play performance */
  const plays = c.plays.filter(function(p){return p.on;});
  const perf = '<div class="card"><header><h3>Play performance</h3><span class="hint">what each live play has actually returned</span></header>'+
    '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="width:52px">Tier</th><th style="min-width:200px">Play</th>'+
    '<th style="width:92px" class="num">Budget</th><th style="width:52px" class="num">Logs</th><th style="min-width:290px">Latest readings</th></tr></thead><tbody>'+
    (plays.length?plays.map(function(p){
      const ent = c.exec_.entries.filter(function(x){return x.playId===p.id;}).sort(function(a,b){return b.date.localeCompare(a.date);});
      const latest = {}; ent.forEach(function(x){ if(!(x.metric in latest)) latest[x.metric]=x; });
      const ks = Object.keys(latest);
      return '<tr><td><span class="pill '+TIERPILL[p.tier]+'">'+TIERSHORT[p.tier]+'</span></td>'+
        '<td><b>'+p.name+'</b><div class="tiny muted">'+esc(p.channel)+'</div></td>'+
        '<td class="num">'+money(p.budget)+'</td><td class="num">'+ent.length+'</td>'+
        '<td>'+(ks.length? '<div class="chips">'+ks.map(function(m){ return '<span class="chip te"><b>'+fmt(num(latest[m].value))+'</b> '+esc(m)+'</span>'; }).join('')+'</div>'
          : '<span class="muted tiny">nothing logged yet, and a play with no numbers is hard to defend at renewal</span>')+'</td></tr>';
    }).join(''):'<tr><td colspan="5" class="empty">No live plays.</td></tr>')+
    '</tbody></table></div></div>';

  /* watchlist */
  const stalled = liveAccounts().filter(function(a){return tierOf(a)!=='t3' && num(a.stage)<=1;}).sort(function(a,b){return scoreOf(b)-scoreOf(a);});
  const hot = liveAccounts().filter(function(a){return num(a.stage)>=4;}).sort(function(a,b){return num(b.stage)-num(a.stage);});
  const watch = '<div class="grid2">'+
    '<div class="card"><header><h3>Needs attention</h3><span class="hint">priority accounts that have not moved</span></header>'+
    '<div class="body tight">'+(stalled.length?'<table class="tbl"><tbody>'+stalled.slice(0,12).map(function(a){
      return '<tr><td><b>'+esc(a.name)+'</b><div class="tiny muted">'+esc((segById(a.seg)||{}).name||'')+' · '+esc(a.city)+'</div></td>'+
      '<td><span class="pill '+TIERPILL[tierOf(a)]+'">'+TIERSHORT[tierOf(a)]+'</span></td>'+
      '<td class="tiny muted">'+esc(c.journey[num(a.stage)]?c.journey[num(a.stage)].name:'-')+'</td>'+
      '<td class="num">'+(a.roles||[]).length+' roles</td>'+
      '<td class="num">'+num(a.touches)+' touches</td></tr>';
    }).join('')+'</tbody></table>':'<div class="empty">Nothing stalled. Enjoy it while it lasts.</div>')+'</div></div>'+
    '<div class="card"><header><h3>Closest to commercial</h3><span class="hint">validation stage or beyond</span></header>'+
    '<div class="body tight">'+(hot.length?'<table class="tbl"><tbody>'+hot.slice(0,12).map(function(a){
      return '<tr><td><b>'+esc(a.name)+'</b><div class="tiny muted">'+esc((segById(a.seg)||{}).name||'')+'</div></td>'+
      '<td><span class="pill '+TIERPILL[tierOf(a)]+'">'+TIERSHORT[tierOf(a)]+'</span></td>'+
      '<td class="tiny"><b>'+esc(c.journey[num(a.stage)]?c.journey[num(a.stage)].name:'-')+'</b></td>'+
      '<td class="num">'+(a.roles||[]).length+' roles</td>'+
      '<td class="num">'+num(a.meetings)+' mtgs</td></tr>';
    }).join('')+'</tbody></table>':'<div class="empty">Nothing in validation yet.</div>')+'</div></div>'+
  '</div>';

  return '<div class="co pk"><span class="cot">This is the retainer</span>'+
    'The strategy is why this screen exists. This screen is what '+esc(c.name)+' gets every Monday morning. All of it comes from what the team logs on the next tab, so none of it is typed into a slide by hand.'+
    (ak.blocked?' <b>'+ak.blocked+' must-have assets have not started</b>, which caps what the rest of these numbers can do.':'')+'</div>'+
    tiles + covCard + funnel + hm + kpiCard + perf + watch;
}

/* ============================================================
   20. STAGE 12: LOGGING THE WORK
   ============================================================ */
function vLog(){
  const c = cur();
  const jOpts = c.journey.map(function(j,i){ return [i, (i+1)+'. '+j.name]; });
  const rows = liveAccounts().slice().sort(function(a,b){ return num(b.stage)-num(a.stage) || scoreOf(b)-scoreOf(a); });
  const playOpts = c.plays.filter(function(p){return p.on;}).map(function(p){ return [p.id, p.name]; });

  return '<div class="co te"><span class="cot">Keep this light</span>'+
    'If logging takes more than two minutes a week the team will stop, and the dashboard will quietly become fiction. '+
    'Tick the committee roles you have actually reached, set the journey position, and post one reading per play.</div>'+

  '<div class="card"><header><h3>Account progress &amp; committee coverage</h3>'+
    '<span class="hint">click a role to mark it reached. This is what the whole coverage layer runs on</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
    '<th style="min-width:190px">Account</th><th style="width:52px">Tier</th><th style="min-width:160px">Journey position</th>'+
    '<th style="min-width:230px">Committee roles engaged</th>'+
    '<th style="width:78px">Touches</th><th style="width:78px">Meetings</th>'+
    '<th style="min-width:120px">Owner</th><th style="min-width:200px">Latest note</th></tr></thead><tbody>'+
  (rows.length?rows.map(function(a){
    const roles = a.roles||[];
    return '<tr><td><b>'+esc(a.name)+'</b><div class="tiny muted">'+esc((segById(a.seg)||{}).name||'')+'</div></td>'+
    '<td class="calc"><span class="pill '+TIERPILL[tierOf(a)]+'">'+TIERSHORT[tierOf(a)]+'</span></td>'+
    '<td>'+tsel('accounts.'+a.id+'.stage', jOpts, true, 'mini')+'</td>'+
    '<td><div class="chips">'+COMMERCIAL_ROLES.map(function(r){
        const on = roles.indexOf(r[0])>-1;
        return '<span class="chip'+(on?' sel':'')+'" data-act="rolemark" data-id="'+a.id+'" data-role="'+r[0]+'" '+
          'title="'+esc(String(r[1]).replace(/&amp;/g,'&'))+'" style="cursor:pointer;font-size:10px;padding:2px 7px">'+r[1].split(' ')[0].replace('/','')+'</span>';
      }).join('')+'</div></td>'+
    '<td>'+tn('accounts.'+a.id+'.touches','mini',true,0,null,54)+'</td>'+
    '<td>'+tn('accounts.'+a.id+'.meetings','mini',true,0,null,54)+'</td>'+
    '<td>'+ti('accounts.'+a.id+'.owner','assign…','ce',true)+'</td>'+
    '<td>'+ti('accounts.'+a.id+'.note','','ce')+'</td></tr>';
  }).join(''):'<tr><td colspan="8" class="empty">No accounts in scope.</td></tr>')+
  '</tbody></table></div></div>'+

  '<div class="card"><header><h3>Log a metric reading</h3><span class="hint">against a live play</span></header><div class="body">'+
    '<div class="grid4" style="gap:10px;align-items:end">'+
      '<div class="f" style="margin:0"><label>Play</label><select class="inp" id="lg-play">'+
        (playOpts.length?playOpts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>';}).join(''):'<option value="">no live plays yet</option>')+'</select></div>'+
      '<div class="f" style="margin:0"><label>Metric</label><input class="inp" id="lg-metric" placeholder="e.g. Replies received"></div>'+
      '<div class="f" style="margin:0"><label>Value</label><input class="inp" id="lg-value" type="number" placeholder="0"></div>'+
      '<div class="f" style="margin:0"><label>Date</label><input class="inp" id="lg-date" type="date" value="'+today()+'"></div>'+
    '</div>'+
    '<div class="f" style="margin-top:11px"><label>Note</label><input class="inp" id="lg-note" placeholder="Which accounts, what happened, what it means…"></div>'+
    '<div class="rowend"><button class="tbtn pk" data-act="logadd">Log entry</button></div>'+
  '</div></div>'+

  '<div class="card"><header><h3>Activity log</h3><span class="hint">'+c.exec_.entries.length+' entries</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="width:96px">Date</th><th style="min-width:190px">Play</th>'+
    '<th style="min-width:170px">Metric</th><th style="width:86px" class="num">Value</th><th style="min-width:270px">Note</th><th></th></tr></thead><tbody>'+
  (c.exec_.entries.length? c.exec_.entries.slice().sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(en){
    const p = c.plays.filter(function(x){return x.id===en.playId;})[0];
    return '<tr><td class="mono tiny">'+esc(en.date)+'</td><td>'+(p?p.name:'<span class="muted">deleted play</span>')+'</td>'+
      '<td>'+esc(en.metric)+'</td><td class="num"><b>'+fmt(num(en.value))+'</b></td>'+
      '<td class="tiny muted">'+esc(en.note)+'</td>'+
      '<td><button class="xbtn" data-act="logdel" data-id="'+en.id+'">&times;</button></td></tr>';
  }).join('') : '<tr><td colspan="6" class="empty">Nothing logged yet.</td></tr>')+
  '</tbody></table></div></div>';
}

/* ============================================================
   21. STAGE 13: OUR METHOD
   ============================================================ */
function vMethod(){
  const c = cur(), t = tierCounts(), cv = coverage();
  return '<div class="co pk"><span class="cot">The specific argument for '+esc(c.name)+'</span>'+esc(c.method||'Not written yet.')+'</div>'+

  '<div class="card"><header><h3>Why the stages are in this order</h3></header><div class="body"><div class="stack">'+
  [['0 → 1','Executive summary first. If the why, the what and the how are not agreed, the next ten stages are expensive theatre.'],
   ['1 → 2','You cannot segment a business you have described wrongly. Foundation first, always.'],
   ['2 → 3','Segments and disqualifiers before accounts. Name accounts first and you get a list of companies you have heard of.'],
   ['3 → 4','Score and tier before persona work. The depth of research you can afford depends entirely on the tier.'],
   ['4 → 5','Committee before triggers. A trigger only matters if you know which human it tells you to call.'],
   ['5 → 6','Triggers before journey. The journey has to be built around observable moments, not imagined ones.'],
   ['6 → 7','Journey before message. Copy written without a journey position is copy written for nobody.'],
   ['7 to 8','Message before play. A play is only a way of delivering something, so choose it once you know what is being delivered.'],
   ['8 → 9','Plays and assets before the plan. A plan is plays with dates, owners and outputs attached.'],
   ['9 → 10','Plan before measurement. You can only baseline what you have committed to doing.'],
   ['10 → run','Measurement before launch. Agreeing the scoreboard after the game starts is how good programmes get killed.']]
  .map(function(x){ return '<div style="display:flex;gap:12px"><span class="pill t2p" style="flex:0 0 auto;min-width:62px;text-align:center">'+x[0]+'</span>'+
    '<span style="font-size:12.5px;line-height:1.55">'+x[1]+'</span></div>'; }).join('')+'</div></div></div>'+

  '<div class="grid2">'+
  '<div class="card"><header><h3>Tier economics, stated plainly</h3></header><div class="body"><div class="stack">'+
    [['t1','50% of budget','Marketing behaves like a member of the deal team. Dedicated account plan, deep portfolio research, complete committee map, individually written value proposition, microsite, executive-to-executive outreach, bespoke assessment, contact plan across five or more stakeholders. If you would not do it for one named company, it is not a Tier-1 play.'],
     ['t2','32% of budget','One asset, many accounts, one shared pain. Vertical content, role-based outreach, cluster landing pages, roundtables and webinars, sequences customised with account-level detail. The efficiency layer.'],
     ['t3','18% of budget','Air cover so sales never calls cold, and a way of spotting who deserves moving up into Tier 1 or 2. It should not be soaking up most of the pilot budget.']]
    .map(function(x){ return '<div><span class="pill '+TIERPILL[x[0]]+'">'+TIERLBL[x[0]]+' · '+x[1]+'</span>'+
      '<div class="tiny" style="margin-top:6px;line-height:1.6">'+x[2]+'</div></div>'; }).join('')+
  '</div></div></div>'+

  '<div class="card"><header><h3>Rules we hold ourselves to</h3></header><div class="body"><div class="stack">'+
    ['Every claim traces to a proof point. No adjective survives without evidence behind it.',
     'Sales agrees to pursue an account before we spend a rupee personalising anything for it.',
     'Measurement runs in four layers, coverage then engagement then progression then commercial, and never on lead-generation metrics.',
     'A target without a baseline is a wish. Write "unknown" and go establish it.',
     'A play with no primary call to action is content, not a play.',
     'A play with no logged reading cannot be defended at renewal, so it does not get renewed.',
     'A trigger acted on in two days and the same trigger acted on in three weeks are not the same asset.',
     'Outreach is multi-threaded or it is not account-based. One person forwarding an email is not a committee strategy.',
     'Expansion is a marketing job. Most firms hand it to sales and then wonder where the annuity went.',
     'We do not keep spending on an account sales has no intention of pursuing.',
     'AI-first, human-final. The draft can be generated; the judgement cannot.',
     'If the client has not edited it, they have not agreed to it.']
    .map(function(x){ return '<div style="display:flex;gap:9px;font-size:12.5px;line-height:1.55"><span style="color:'+C.pink+';font-weight:800">&mdash;</span><span>'+esc(x)+'</span></div>'; }).join('')+
  '</div></div></div>'+
  '</div>'+

  '<div class="card"><header><h3>Where this programme stands right now</h3></header><div class="body">'+
  '<dl class="kv">'+
    '<dt>Client</dt><dd><b>'+esc(c.name)+'</b><div class="tiny muted">'+esc(c.industry)+'</div></dd>'+
    '<dt>Archetype</dt><dd>'+esc((ARCHETYPES[c.archetype]||{}).label||'not set')+'</dd>'+
    '<dt>Segments</dt><dd>'+activeSegs().length+' in scope, '+(c.segments.length-activeSegs().length)+' parked</dd>'+
    '<dt>Accounts</dt><dd>'+liveAccounts().length+' named: '+t.t1+' Tier 1, '+t.t2+' Tier 2, '+t.t3+' Tier 3</dd>'+
    '<dt>Coverage</dt><dd>'+cv.ownedPct+'% sales-owned · '+cv.pThreePct+'% of priority accounts at 3+ roles</dd>'+
    '<dt>Committee</dt><dd>'+c.personas.length+' roles mapped across '+COMMERCIAL_ROLES.length+' commercial roles</dd>'+
    '<dt>Journey</dt><dd>'+c.journey.length+' stages, '+Object.keys(c.lens||{}).length+' persona lenses authored</dd>'+
    '<dt>Plays live</dt><dd>'+c.plays.filter(function(p){return p.on;}).length+' of '+c.plays.length+', allocating '+money(playBudget())+'</dd>'+
    '<dt>Asset kit</dt><dd>'+assetReady().ready+' of '+assetReady().total+' ready</dd>'+
    '<dt>Readiness</dt><dd><b>'+readiness()+'%</b>, with '+BUILD_STAGES().filter(function(s){return c.signoff[s.id];}).length+' of '+BUILD_STAGES().length+' stages signed off</dd>'+
  '</dl></div></div>'+

  '<div class="card"><header><h3>Client decisions captured in this session</h3></header><div class="body"><div class="stack">'+
  (BUILD_STAGES().map(function(s){
    const n = (c.clientNotes[s.id]||'').trim();
    if(!n) return '';
    return '<div style="border-left:2px solid '+(c.signoff[s.id]?C.teal:C.gold)+';padding-left:11px">'+
      '<div class="tiny" style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)">'+s.nav+
      (c.signoff[s.id]?' <span class="pill okp" style="margin-left:4px">SIGNED OFF</span>':'')+'</div>'+
      '<div style="font-size:12.5px;line-height:1.55;margin-top:3px">'+esc(n)+'</div></div>';
  }).join('') || '<div class="empty">No client input captured yet. Every build stage has a box for it.</div>')+
  '</div></div></div>';
}

/* ============================================================
   22. RENDER DISPATCH
   ============================================================ */
const VIEWS = { exec:vExec, foundation:vFoundation, icp:vICP, accounts:vAccounts, committee:vCommittee,
  intel:vIntel, journey:vJourney, messaging:vMessaging, plays:vPlays, roadmap:vRoadmap,
  measure:vMeasure, dashboard:vDashboard, log:vLog, method:vMethod };

let _scrollMemo = 0;
function render(keepScroll){
  memoFocus();
  if(keepScroll) _scrollMemo = $('#canvas').scrollTop;
  renderTop(); renderNav(); renderHead();
  const f = VIEWS[S.stage] || vExec;
  $('#stagebody').innerHTML = f();
  growAll();
  $('#canvas').scrollTop = keepScroll ? _scrollMemo : 0;
  restoreFocus();
  const i = STAGE_IX[S.stage];
  $('#btn-next').innerHTML = i < STAGES.length-1 ? 'Next stage &rsaquo;' : 'Back to start';
}
function go(id){ if(STAGE_IX[id]==null) return; S.stage=id; save(); render(); }

/* ============================================================
   23. ACTIONS
   ============================================================ */
const ACT = {
  /* segments */
  segtoggle(el){ const s=segById(el.dataset.id); if(s){ s.on=!s.on; save(); render(true); } },
  segdel(el){ if(!confirm('Delete this segment? Accounts in it drop out of scope.')) return;
    const c=cur(); c.segments=c.segments.filter(s=>s.id!==el.dataset.id); save(); render(true); },
  segadd(){ const c=cur(); const cols=[C.pink,C.violet,C.teal,C.gold,'#8A6206',C.ink3];
    c.segments.push({ id:uid('s'), name:'New segment', on:true, priority:'B', colour:cols[c.segments.length%cols.length],
      desc:'', whyNow:'', why:'', problems:[], fit:[], size:'' }); save(); render(true);
    toast('Segment added. Name it, then add accounts in Stage 3.'); },

  /* accounts */
  acctadd(){ const c=cur(); const segs=activeSegs();
    if(!segs.length){ toast('Define at least one active segment first.'); return; }
    const a={ id:uid('a'), name:'New account', seg:segs[0].id, city:'', incumbent:'',
      note:'', owner:'', stage:0, touches:0, meetings:0, roles:[] };
    SCORE_FACTORS.forEach(f=>a[f.k]=5);
    c.accounts.push(a); save(); render(true); },
  acctdel(el){ const c=cur(); c.accounts=c.accounts.filter(a=>a.id!==el.dataset.id); save(); render(true); },
  fseg(el){ S.acctSeg=el.dataset.v; render(true); },
  ftier(el){ S.acctTier=el.dataset.v; render(true); },
  wreset(){ const c=cur(); SCORE_FACTORS.forEach(f=>c.weights[f.k]=f.w); save(); render(true);
    toast('Weights reset to the recommended model.'); },

  /* personas */
  peradd(){ const c=cur();
    c.personas.push({ id:uid('pe'), role:'New committee role', crole:'champ', colour:ROLE_COL.champ,
      segs:activeSegIds(), goal:'', pain:'', pitch:'', objection:'', proof:'', content:'', channels:[] });
    save(); render(true); },
  perdel(el){ const c=cur(); c.personas=c.personas.filter(p=>p.id!==el.dataset.id); save(); render(true); },
  perseg(el){ const p=personaById(el.dataset.id); if(!p) return; p.segs=p.segs||[];
    const i=p.segs.indexOf(el.dataset.seg); if(i>-1) p.segs.splice(i,1); else p.segs.push(el.dataset.seg);
    save(); render(true); },
  pergen(){ const c=cur();
    if(!confirm('Replace the committee with a fresh draft generated from the '+((ARCHETYPES[c.archetype]||{}).label||'')+' archetype?')) return;
    c.personas = generatePersonas(c.archetype, c); c.lens={}; save(); render(true);
    toast('Committee regenerated as a draft. Persona lenses were cleared.'); },

  /* triggers + sla */
  sigtoggle(el){ const c=cur(); const s=c.signals.filter(x=>x.id===el.dataset.id)[0]; if(s){ s.on=!s.on; save(); render(true); } },
  sigdel(el){ const c=cur(); c.signals=c.signals.filter(s=>s.id!==el.dataset.id); save(); render(true); },
  sigadd(){ const c=cur(); c.signals.push({ id:uid('sg'), name:'New trigger', source:'', weight:2, meaning:'', decay:'', on:true }); save(); render(true); },
  sladd(){ const c=cur(); c.sla.push({ id:uid('sl'), trigger:'', response:'' }); save(); render(true); },
  sladel(el){ const c=cur(); c.sla=c.sla.filter(s=>s.id!==el.dataset.id); save(); render(true); },

  /* journey */
  jsel(el){ S.jSel=parseInt(el.dataset.i,10); render(true); },
  lens(el){ S.lensPersona=el.dataset.v; render(true); },
  jadd(){ const c=cur(); c.journey.push({ id:uid('j'), name:'New stage', vg:'acq', mindset:'', question:'',
    thinks:'', does:'', channels:[], assets:[], kpi:'', owner:'', friction:'', gen:true });
    S.jSel=c.journey.length-1; save(); render(true); },
  jdel(el){ const c=cur(); const i=parseInt(el.dataset.i,10);
    if(c.journey.length<=2){ toast('A journey needs at least two stages.'); return; }
    if(!confirm('Delete this journey stage? Accounts sitting here move back one stage.')) return;
    c.journey.splice(i,1);
    c.accounts.forEach(a=>{ if(num(a.stage)>=i) a.stage=Math.max(0,num(a.stage)-1); });
    Object.keys(c.lens||{}).forEach(pid=>{ const m={}; Object.keys(c.lens[pid]).forEach(k=>{ const n=parseInt(k,10);
      if(n<i)m[n]=c.lens[pid][k]; else if(n>i)m[n-1]=c.lens[pid][k]; }); c.lens[pid]=m; });
    S.jSel=clamp(S.jSel,0,c.journey.length-1); save(); render(true); },
  jup(el){ swapJ(parseInt(el.dataset.i,10),-1); },
  jdn(el){ swapJ(parseInt(el.dataset.i,10), 1); },
  jgen(){ const c=cur(); c.journey = generateJourney(c.archetype); c.lens={}; S.jSel=0; save(); render(true);
    toast('Journey generated from the <b>'+esc((ARCHETYPES[c.archetype]||{}).label||'')+'</b> pattern. Every cell is a draft, so go and edit it.'); },

  /* messaging */
  umbadd(){ const c=cur(); c.umbrellas.push({ id:uid('u'), name:'New audience', line:'', target:'', focus:'', proof:'', supporting:[], body:'', segs:activeSegIds() }); save(); render(true); },
  umbdel(el){ const c=cur(); c.umbrellas=c.umbrellas.filter(u=>u.id!==el.dataset.id); save(); render(true); },
  umbseg(el){ const c=cur(); const u=c.umbrellas.filter(x=>x.id===el.dataset.id)[0]; if(!u) return; u.segs=u.segs||[];
    const i=u.segs.indexOf(el.dataset.seg); if(i>-1) u.segs.splice(i,1); else u.segs.push(el.dataset.seg); save(); render(true); },

  /* plays + assets + budget */
  playtoggle(el){ const c=cur(); const p=c.plays.filter(x=>x.id===el.dataset.id)[0]; if(!p) return;
    p.on=!p.on;
    if(!p.on){ p.lock=false; p.budget=0; }      /* its money goes back to the pool */
    allocateBudget(c); save(); render(true);
    toast(p.on ? '<b>'+p.name+'</b> switched on, so the '+TIERSHORT[p.tier]+' pool re-split around it.'
               : '<b>'+p.name+'</b> switched off. All '+money(tierTarget(p.tier))+' is still allocated, shared across the rest of '+TIERSHORT[p.tier]+'.'); },
  playadd(){ const c=cur(); c.plays.push({ id:uid('p'), tier:S.playTier==='all'?'t1':S.playTier, name:'New play',
    channel:'', asset:'', effort:'Medium', weight:4, desc:'', cta:'', best:'', on:true, budget:0, lock:false, owner:'ZAMSTARS' });
    allocateBudget(c); save(); render(true); },
  locktoggle(el){ const c=cur(); const p=c.plays.filter(x=>x.id===el.dataset.id)[0]; if(!p) return;
    p.lock=!p.lock; allocateBudget(c); save(); render(true);
    toast(p.lock ? '<b>'+p.name+'</b> is now FIXED at '+money(p.budget)+'. The rest of '+TIERSHORT[p.tier]+' works around it.'
                 : '<b>'+p.name+'</b> back on AUTO, recalculated from the tier split.'); },
  autoalloc(){ const c=cur(); allocateBudget(c); save(); render(true);
    toast('Distributed <b>'+money(num(c.objective.budget))+'</b>: '+
      TIERS.map(k=>TIERSHORT[k]+' '+money(tierTarget(k))).join(' · ')+
      ' across '+c.plays.filter(p=>p.on).length+' live plays.'); },
  unlockall(){ const c=cur(); c.plays.forEach(p=>p.lock=false); allocateBudget(c); save(); render(true);
    toast('All plays back on AUTO.'); },
  resetsplit(){ const c=cur(); c.tierSplit=Object.assign({},TIER_SPLIT_DEFAULT); allocateBudget(c); save(); render(true);
    toast('Tier split reset to 50 / 32 / 18.'); },
  fplay(el){ S.playTier=el.dataset.v; render(true); },
  assetadd(){ const c=cur(); c.assets.push({ id:uid('as'), name:'New asset', type:'Custom', owner:'ZAMSTARS', status:'Not started' }); save(); render(true); },
  assetdel(el){ const c=cur(); c.assets=c.assets.filter(a=>a.id!==el.dataset.id); save(); render(true); },

  /* plan */
  roadadd(){ const c=cur(); c.roadmap.push({ id:uid('r'), phase:S.roadPhase==='all'?1:parseInt(S.roadPhase,10),
    week:1, activity:'New activity', format:'', owner:'', output:'', status:'Planned' }); save(); render(true); },
  roaddel(el){ const c=cur(); c.roadmap=c.roadmap.filter(r=>r.id!==el.dataset.id); save(); render(true); },
  fphase(el){ S.roadPhase=el.dataset.v; render(true); },
  roadfromplay(el){ const c=cur(); const p=c.plays.filter(x=>x.id===el.dataset.id)[0]; if(!p) return;
    c.roadmap.push({ id:uid('r'), phase:5, week:8, activity:String(p.name).replace(/&amp;/g,'&'),
      format:p.asset, owner:p.owner||'ZAMSTARS', output:String(p.cta||'').replace(/&amp;/g,'&'), status:'Planned' });
    save(); render(true); toast('Row added to Phase 5. Move it to the week it belongs in.'); },
  deptoggle(el){ const c=cur(); const d=c.deps.filter(x=>x.id===el.dataset.id)[0]; if(d){ d.done=!d.done; save(); render(true); } },
  depadd(){ const c=cur(); c.deps.push({ id:uid('dp'), text:'', done:false }); save(); render(true); },
  depdel(el){ const c=cur(); c.deps=c.deps.filter(d=>d.id!==el.dataset.id); save(); render(true); },

  /* measurement */
  kpiadd(){ const c=cur(); c.kpis.push({ id:uid('k'), layer:S.kpiLayer==='all'?'eng':S.kpiLayer, vg:'acq',
    metric:'New metric', def:'', unit:'', baseline:'', target:'', current:'', owner:'' }); save(); render(true); },
  kpidel(el){ const c=cur(); c.kpis=c.kpis.filter(k=>k.id!==el.dataset.id); save(); render(true); },
  flayer(el){ S.kpiLayer=el.dataset.v; render(true); },

  editthesis(){ S.editThesis=!S.editThesis; render(true);
    if(S.editThesis) setTimeout(()=>{ const el=$('[data-set="exec.thesis"]',$('#canvas')); if(el){ el.focus(); autogrow(el); } },40); },

  /* success metrics */
  smadd(){ const c=cur(); c.successMetrics.push({ id:uid('sm'), metric:'New measure', target:'', how:'', owner:'' }); save(); render(true); },
  smdel(el){ const c=cur(); c.successMetrics=c.successMetrics.filter(m=>m.id!==el.dataset.id); save(); render(true); },

  /* sign-off */
  signoff(el){ const c=cur(); const id=el.dataset.id; c.signoff[id]=!c.signoff[id]; save(); render(true);
    if(c.signoff[id]) toast('Stage signed off. Programme readiness is now <b>'+readiness()+'%</b>.'); },

  /* committee coverage marking */
  rolemark(el){ const c=cur(); const a=c.accounts.filter(x=>x.id===el.dataset.id)[0]; if(!a) return;
    a.roles = a.roles||[];
    const i = a.roles.indexOf(el.dataset.role);
    if(i>-1) a.roles.splice(i,1); else a.roles.push(el.dataset.role);
    save(); render(true); },

  /* log */
  logadd(){
    const c=cur(); const pid=$('#lg-play').value, m=$('#lg-metric').value.trim();
    if(!pid){ toast('Switch on at least one play in Stage 8 first.'); return; }
    if(!m){ toast('Give the reading a metric name.'); return; }
    c.exec_.entries.push({ id:uid('e'), date:$('#lg-date').value||today(), playId:pid, metric:m,
      value:num($('#lg-value').value), note:$('#lg-note').value.trim() });
    save(); render(true); toast('Logged. The dashboard has already re-computed.'); },
  logdel(el){ const c=cur(); c.exec_.entries=c.exec_.entries.filter(e=>e.id!==el.dataset.id); save(); render(true); },

  /* array editors */
  chipadd(el){ const v = prompt('Add:'); if(v==null||!v.trim()) return;
    const arr = arrPath(el.dataset.chip); arr.push(v.trim()); save(); render(true); },
  chipdel(el){ const arr = arrPath(el.dataset.chip); arr.splice(parseInt(el.dataset.i,10),1); save(); render(true); },
  buladd(el){ const arr = arrPath(el.dataset.chip); arr.push(''); save(); render(true); },
  buldel(el){ const arr = arrPath(el.dataset.chip); arr.splice(parseInt(el.dataset.i,10),1); save(); render(true); }
};
function swapJ(i,d){
  const c=cur(); const j=i+d; if(j<0||j>=c.journey.length) return;
  const t=c.journey[i]; c.journey[i]=c.journey[j]; c.journey[j]=t;
  c.accounts.forEach(a=>{ const s=num(a.stage); if(s===i) a.stage=j; else if(s===j) a.stage=i; });
  Object.keys(c.lens||{}).forEach(pid=>{ const L=c.lens[pid]; const a=L[i], b=L[j];
    if(a===undefined) delete L[j]; else L[j]=a;
    if(b===undefined) delete L[i]; else L[i]=b; });
  S.jSel=j; save(); render(true);
}

/* ============================================================
   24. READING A CLIENT SITE  (beta, falls back to a manual picker)
   ============================================================ */
function scoreArchetype(text){
  const t = String(text).toLowerCase();
  let best='infra', bs=-1; const scores={};
  Object.keys(ARCHETYPES).forEach(k=>{
    let s=0; ARCHETYPES[k].kw.forEach(w=>{ s += Math.min(t.split(w).length-1, 8); });
    scores[k]=s; if(s>bs){ bs=s; best=k; }
  });
  return { best:best, scores:scores };
}
function extractBits(text){
  const out = { proof:[] };
  const lines = String(text).split(/[\n\r]|(?<=\.)\s+/).map(s=>s.trim()).filter(s=>s.length>8&&s.length<170);
  const seen = {};
  lines.forEach(l=>{
    if(/(\d[\d,\.]*\s*(\+|%|bn|mn|cr|k|million|billion|crore|lakh)|\b\d{2,}\+)/i.test(l) && !/cookie|copyright|privacy|©/i.test(l)){
      const key=l.toLowerCase().slice(0,40);
      if(!seen[key]){ seen[key]=1; out.proof.push(l.replace(/\s+/g,' ')); }
    }
  });
  out.proof = out.proof.slice(0,10);
  return out;
}
async function analyseURL(){
  const raw = $('#clienturl').value.trim();
  if(!raw){ toast('Enter a client website URL first.'); return; }
  const url = /^https?:\/\//i.test(raw) ? raw : 'https://'+raw;
  cur().url = url; $('#clienturl').value = url; save();

  const btn = $('#btn-analyse'); btn.disabled=true; btn.textContent='Reading site…';
  let text=null, ok=true;
  try{
    const ctl = new AbortController();
    const to = setTimeout(()=>ctl.abort(), 14000);
    const res = await fetch('https://r.jina.ai/'+url, { signal:ctl.signal, headers:{ 'Accept':'text/plain' } });
    clearTimeout(to);
    if(!res.ok) throw new Error('HTTP '+res.status);
    text = await res.text();
    if(!text || text.length<200) throw new Error('too little content');
  }catch(err){ ok=false; }
  btn.disabled=false; btn.textContent='Analyse business';

  if(!ok){
    modalArchetype(null, null,
      '<div class="co go"><span class="cot">Live read unavailable</span>'+
      'The reader could not reach <b>'+esc(url)+'</b>. Usually that means no internet, or the site blocks reads from another origin. '+
      'Nothing is lost. Pick the pattern yourself and the same generator runs. This is exactly why the tool never depends on a live fetch in a client meeting.</div>');
    return;
  }
  modalArchetype(scoreArchetype(text), extractBits(text), '');
}
function modalArchetype(sc, bits, warn){
  const keys = Object.keys(ARCHETYPES);
  const best = sc? sc.best : cur().archetype;
  let maxS=1; if(sc) keys.forEach(k=>{ if(sc.scores[k]>maxS) maxS=sc.scores[k]; });
  openModal('Generate an ABM programme from the business',
    warn+
    (sc?'<div class="co te"><span class="cot">Read the site</span>Scored the page text against six industry archetypes. Best match: <b>'+esc(ARCHETYPES[best].label)+'</b>. Confirm it or change it, since this decides the first-draft journey and committee.</div>':'')+
    '<div class="f"><label>Industry archetype</label>'+
      keys.map(k=>'<label style="display:flex;align-items:center;gap:9px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;cursor:pointer">'+
        '<input type="radio" name="arch" value="'+k+'"'+(k===best?' checked':'')+'>'+
        '<span style="flex:1"><b style="font-size:12.5px">'+ARCHETYPES[k].label+'</b>'+
        '<div class="tiny muted">'+esc(ARCHETYPES[k].blurb)+'</div></span>'+
        (sc?'<span class="sb" style="min-width:70px"><span class="track"><i style="width:'+(sc.scores[k]/maxS*100)+'%;background:'+(k===best?C.pink:C.ink3)+'"></i></span></span>':'')+
      '</label>').join('')+'</div>'+
    (bits&&bits.proof.length?'<div class="f"><label>Proof points found on the site</label>'+
      '<div class="chips">'+bits.proof.map(p=>'<span class="chip te"><input type="checkbox" class="pfx" value="'+esc(p)+'" checked style="margin-right:4px"><b>'+esc(p.slice(0,90))+'</b></span>').join('')+'</div>'+
      '<div class="hlp">Ticked lines get added to the proof bank in Stage 1. Untick anything that is marketing rather than evidence.</div></div>':'')+
    '<div class="f"><label>What this will do</label><div class="tiny muted" style="line-height:1.6">'+
      'Generates a <b>journey</b> and a <b>committee</b> from the archetype, both marked as drafts, and appends any ticked proof points. '+
      'It leaves your segments, accounts, messaging, plays and success measures alone. Those are judgement calls, and a generator has no business making them.</div></div>',
    [['Cancel','',''],['Generate programme','pk','genarch']]);
}
function doGenerate(){
  const c = cur();
  const a = $('input[name=arch]:checked', $('#modal'));
  if(a) c.archetype = a.value;
  $$('.pfx', $('#modal')).forEach(cb=>{
    if(cb.checked){ c.profile.proof=c.profile.proof||[]; if(c.profile.proof.indexOf(cb.value)===-1) c.profile.proof.push(cb.value); }
  });
  c.journey  = generateJourney(c.archetype);
  c.personas = generatePersonas(c.archetype, c);
  c.lens = {}; S.jSel=0;
  closeModal(); save(); go('journey');
  toast('Generated a draft journey and committee from the <b>'+esc(ARCHETYPES[c.archetype].label)+'</b> archetype. Now edit it with the client.');
}

/* ============================================================
   25. MODAL + CLIENTS + EXPORT
   ============================================================ */
function openModal(title, body, buttons){
  $('#modal').innerHTML = '<header><h3>'+title+'</h3></header><div class="mb">'+body+'</div>'+
    '<footer>'+(buttons||[['Close','','']]).map(b=>'<button class="tbtn '+b[1]+'" data-mact="'+b[2]+'">'+b[0]+'</button>').join('')+'</footer>';
  $('#mask').classList.add('on');
}
function closeModal(){ $('#mask').classList.remove('on'); }

function newClientModal(){
  openModal('New client programme',
    '<div class="f"><label>Client name</label><input class="inp" id="nc-name" placeholder="e.g. Devgraph"></div>'+
    '<div class="f"><label>Website</label><input class="inp" id="nc-url" placeholder="https://…"></div>'+
    '<div class="f"><label>Industry archetype</label><select class="inp" id="nc-arch">'+
      Object.keys(ARCHETYPES).map(k=>'<option value="'+k+'">'+ARCHETYPES[k].label+'</option>').join('')+'</select>'+
      '<div class="hlp">Generates a draft journey and committee. The play library, asset kit, trigger model, SLA and measurement framework come pre-loaded; segments, accounts and messaging start empty because those are judgement calls.</div></div>'+
    '<div class="f"><label>Start from</label><select class="inp" id="nc-base">'+
      '<option value="blank">A blank programme</option>'+
      S.order.filter(id=>id!=='blank').map(id=>'<option value="'+id+'">A copy of '+esc(S.clients[id].name)+'</option>').join('')+
    '</select></div>',
    [['Cancel','',''],['Create','pk','newclient']]);
}
function doNewClient(){
  const name = $('#nc-name').value.trim(); if(!name){ toast('Give the client a name.'); return; }
  const base = $('#nc-base').value, arch = $('#nc-arch').value, url = $('#nc-url').value.trim();
  const id = 'c-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,20)+'-'+Math.random().toString(36).slice(2,5);
  let c;
  if(base==='blank'){ c = hydrate(Object.assign({}, BLANK, { id:id, archetype:arch })); }
  else {
    c = JSON.parse(JSON.stringify(S.clients[base])); c.id=id; c.archetype=arch;
    c.exec_={entries:[]}; c.signoff={}; c.clientNotes={};
    c.accounts.forEach(a=>{ a.stage=0; a.touches=0; a.meetings=0; a.roles=[]; a.owner=''; });
    c.assets.forEach(a=>a.status='Not started');
    c.roadmap.forEach(r=>r.status='Planned');
    c.deps.forEach(d=>d.done=false);
    c.kpis.forEach(k=>{ k.current=''; });
    c.plays.forEach(p=>{ p.lock=false; });
    allocateBudget(c);
  }
  c.name = name; c.url = url;
  c.short = name.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase() || '••';
  if(base==='blank'){ c.journey=generateJourney(arch); c.personas=generatePersonas(arch,c); }
  normalise(c);
  S.clients[id]=c; S.order.push(id); S.current=id; S.stage='exec'; S.jSel=0; S.lensPersona='all';
  closeModal(); save(); render();
  toast('<b>'+esc(name)+'</b> created. Start on the Executive Summary, or paste the URL and hit Analyse.'); }

function exportJSON(){
  const c = cur();
  const blob = new Blob([JSON.stringify({ _app:'ZAMSTARS ABM OS', _version:2, _exported:new Date().toISOString(), client:c },null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ABM-OS-'+String(c.name).replace(/[^A-Za-z0-9]+/g,'-')+'-'+today()+'.json';
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast('Exported <b>'+esc(c.name)+'</b>. Send the file to anyone who has the app and Import will load it exactly as it is now.');
}
function importJSON(file){
  const fr = new FileReader();
  fr.onload = ()=>{
    try{
      const d = JSON.parse(fr.result);
      const c = d.client || d;
      if(!c || !c.name) throw 0;
      let id = c.id || uid('c');
      if(S.clients[id]) id = id+'-'+Math.random().toString(36).slice(2,5);
      c.id = id; normalise(c);
      S.clients[id]=c; S.order.push(id); S.current=id; S.stage='exec';
      save(); render(); toast('Imported <b>'+esc(c.name)+'</b>.');
    }catch(e){ toast('That file could not be read as an ABM OS programme.'); }
  };
  fr.readAsText(file);
}

/* ============================================================
   26. WIRING
   ============================================================ */
let lastTyped = 0;
function bindOnce(){
  $('#starmark').innerHTML = STAR;
  /* editing a field anywhere suppresses the single-key shortcuts briefly.
     Only 'input'. Using keypress would also suppress the shortcut keys themselves. */
  document.addEventListener('input', ()=>{ lastTyped = Date.now(); }, true);

  $('#rail').addEventListener('click', e=>{
    const n = e.target.closest('[data-nav]'); if(n) go(n.dataset.nav);
  });
  $('#btn-present').addEventListener('click', ()=>{ S.presenter=!S.presenter; renderHead();
    toast(S.presenter?'Presenter notes on, so you can see what to say at each stage.':'Presenter notes off.'); });
  $('#pclose').addEventListener('click', ()=>{ S.presenter=false; renderHead(); });
  $('#btn-export').addEventListener('click', exportJSON);
  $('#btn-import').addEventListener('click', ()=>$('#filein').click());
  $('#filein').addEventListener('change', e=>{ if(e.target.files[0]) importJSON(e.target.files[0]); e.target.value=''; });

  $('#clientsel').addEventListener('change', e=>{ S.current=e.target.value; S.jSel=0; S.lensPersona='all';
    S.acctSeg='all'; S.acctTier='all'; S.playTier='all'; S.roadPhase='all'; S.kpiLayer='all'; save(); render(); });
  $('#clienturl').addEventListener('change', e=>{ cur().url=e.target.value.trim(); save(); });
  $('#btn-analyse').addEventListener('click', analyseURL);
  $('#btn-newclient').addEventListener('click', newClientModal);
  $('#btn-reset').addEventListener('click', ()=>{ if(confirm('Reset '+cur().name+' to the shipped baseline? All edits to this client are lost.')) resetClient(); });
  $('#btn-next').addEventListener('click', ()=>{ const i=STAGE_IX[S.stage]; go(STAGES[(i+1)%STAGES.length].id); });

  $('#canvas').addEventListener('click', e=>{
    const b = e.target.closest('[data-act]'); if(!b) return;
    const fn = ACT[b.dataset.act]; if(fn){ e.preventDefault(); fn(b); }
  });
  /* Write the typed value into the model. Returns the bound path, or 'lens'/'blist',
     or null if the element is not bound to anything. Never re-renders. */
  const applyValue = (el)=>{
    if(!el || !el.dataset) return null;
    if(el.dataset.lens){
      const p = el.dataset.lens.split('|');
      lensSet(p[0], parseInt(p[1],10), p[2], el.value);
      el.style.color=''; el.style.fontStyle='';
      return 'lens';
    }
    if(el.dataset.blist){ setPath(el.dataset.blist, el.value); return 'blist'; }
    if(!el.dataset.set) return null;
    setPath(el.dataset.set, el.value);
    return el.dataset.set;
  };

  /* TYPING: write through and save, but never re-render.
     A re-render mid-word replaces the focused element, and once focus falls back
     to <body> the next digit is read as a stage-navigation shortcut. That was the
     bug where entering a budget jumped to another screen after one character. */
  $('#canvas').addEventListener('input', e=>{
    autogrow(e.target);
    lastTyped = Date.now();
    if(applyValue(e.target)!=null) save();
  });

  /* COMMIT: fires on blur, Enter, a select choice, or a slider release. */
  $('#canvas').addEventListener('change', e=>{
    const el = e.target;
    const path = applyValue(el);
    if(path==null) return;
    const deferred = !!(el.dataset && el.dataset.commit);   /* waits for the button */

    if(!deferred){
      if(/^plays\.[^.]+\.budget$/.test(path)){
        /* naming a cost for a play is an act of intent: fix it, re-split the rest */
        const p = cur().plays.filter(x=>x.id===path.split('.')[1])[0];
        if(p && !p.lock){
          p.lock = true;
          toast('<b>'+p.name+'</b> fixed at '+money(p.budget)+', so the rest of '+TIERSHORT[p.tier]+' re-split around it.');
        }
        allocateBudget(cur());
      } else if(/^plays\.[^.]+\.weight$/.test(path)){
        allocateBudget(cur());
      }
    }
    save();
    const needs = deferred || el.dataset.live || el.tagName==='SELECT' ||
                  el.type==='range' || el.type==='number' || path==='lens';
    if(needs) render(true);
  });

  /* Enter inside a deferred field distributes straight away */
  $('#canvas').addEventListener('keydown', e=>{
    if(e.key!=='Enter') return;
    const el = e.target;
    if(el && el.dataset && el.dataset.commit){ e.preventDefault(); el.blur(); ACT.autoalloc(); }
  });

  $('#mask').addEventListener('click', e=>{
    if(e.target.id==='mask'){ closeModal(); return; }
    const b = e.target.closest('[data-mact]'); if(!b) return;
    const a = b.dataset.mact;
    if(a==='genarch') doGenerate();
    else if(a==='newclient') doNewClient();
    else closeModal();
  });

  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ closeModal(); return; }
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    if($('#mask').classList.contains('on')) return;
    /* Never let a shortcut fire out of a field, or in the moment after typing.
       if a re-render has just stolen focus, the next keystroke is still the user
       finishing a number, not asking to change screen */
    const t = e.target;
    if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)) return;
    const tag = (document.activeElement&&document.activeElement.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
    if(Date.now()-lastTyped < 1200) return;
    if(e.key==='ArrowRight'||e.key===']'){ const i=STAGE_IX[S.stage]; go(STAGES[Math.min(STAGES.length-1,i+1)].id); }
    if(e.key==='ArrowLeft'||e.key==='['){ const i=STAGE_IX[S.stage]; go(STAGES[Math.max(0,i-1)].id); }
    if(e.key==='p'||e.key==='P'){ S.presenter=!S.presenter; renderHead(); }
    if(e.key==='0') go('exec');
    if(/^[1-9]$/.test(e.key)){ const s=STAGES.filter(x=>x.group==='build')[parseInt(e.key,10)-1]; if(s) go(s.id); }
    if(e.key==='d'||e.key==='D') go('dashboard');
    if(e.key==='m'||e.key==='M') go('method');
  });
}
