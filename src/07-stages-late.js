/* ============================================================
   14. STAGE 6: HOW THEY BUY  (the centrepiece)
   ============================================================ */
const LENSF = ['thinks','does','question'];
function lensGet(pid, idx, field){
  const L=cur().lens||{}; const row = L[pid] && L[pid][idx];
  if(!row) return null;
  const v = row[LENSF.indexOf(field)];
  return v==null?null:v;
}
function lensSet(pid, idx, field, val){
  const c=cur(); c.lens=c.lens||{}; c.lens[pid]=c.lens[pid]||{};
  const row = c.lens[pid][idx] || [null,null,null];
  row[LENSF.indexOf(field)] = val;
  c.lens[pid][idx]=row;
}
function lensCell(pid, idx, field, base){
  const has = lensGet(pid,idx,field);
  const v = has==null ? base : has;
  const style = (has==null) ? ' style="color:var(--ink3);font-style:italic"' : '';
  return '<textarea class="ce" data-lens="'+pid+'|'+idx+'|'+field+'" rows="2"'+style+'>'+esc(v)+'</textarea>';
}

function vJourney(){
  const c = cur();
  const lens = S.lensPersona;
  const sel = clamp(S.jSel,0,Math.max(0,c.journey.length-1));

  if(!c.journey.length){
    return signoffBlock()+'<div class="card"><div class="empty">No journey yet. '+
      '<button class="tbtn pk" data-act="jgen" style="margin-left:8px">Generate one from the '+esc((ARCHETYPES[c.archetype]||{}).label||'')+' archetype</button></div></div>';
  }
  const st = c.journey[sel];

  const flow = '<div class="jflow">'+c.journey.map(function(j,i){
    const vg = VG[j.vg]||VG.all, q = String(j.question||'');
    return '<div class="jnode'+(i===sel?' on':'')+'" data-act="jsel" data-i="'+i+'">'+
      '<div class="jvg" style="background:'+vg.colour+'"></div>'+
      '<div class="jn">'+String(i+1).padStart(2,'0')+' · '+vg.label.toUpperCase().slice(0,3)+'</div>'+
      '<div class="jt">'+j.name+'</div>'+
      '<div class="jm">'+esc(q.slice(0,58))+(q.length>58?'…':'')+'</div></div>';
  }).join('')+'</div>';

  const lensBar = '<div class="lens"><span class="lab">Persona lens</span>'+
    '<span class="chip '+(lens==='all'?'sel':'')+'" data-act="lens" data-v="all" style="cursor:pointer">All personas</span>'+
    c.personas.map(function(p){
      const filled = (c.lens && c.lens[p.id]) ? Object.keys(c.lens[p.id]).length : 0;
      return '<span class="chip '+(lens===p.id?'sel':'')+'" data-act="lens" data-v="'+p.id+'" style="cursor:pointer">'+p.role+
        (filled?' <b style="opacity:.65">'+filled+'/'+c.journey.length+'</b>':' <b style="opacity:.5">draft</b>')+'</span>';
    }).join('')+
    '<span class="muted tiny" style="margin-left:auto">'+(lens==='all'
      ? 'Showing the baseline journey. Pick a persona to see the same journey through their eyes.'
      : 'The italic grey cells are carried over from the baseline. Type over one and it becomes this person’s own.')+'</span></div>';

  const vgOpts = [['acq','Acquisition'],['exp','Experience'],['ret','Retention'],['adv','Advocacy']];

  const table = '<div class="card"><header><h3>Journey grid</h3>'+
    '<span class="hint">every cell is editable · rows reorder · stages add and delete</span>'+
    '<span style="flex:1"></span><span class="muted tiny">'+c.journey.length+' stages</span></header>'+
    '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
      '<th style="width:30px">#</th><th style="min-width:130px">Stage</th><th style="width:96px">Value Grid</th>'+
      '<th style="min-width:200px">What they think</th><th style="min-width:190px">What they do</th>'+
      '<th style="min-width:180px">The question in their head</th>'+
      '<th style="min-width:145px">Channels</th><th style="min-width:145px">Assets that do the work</th>'+
      '<th style="min-width:150px">Proof metric</th><th style="min-width:95px">Owner</th>'+
      '<th style="min-width:185px">Where it stalls</th><th style="width:66px"></th>'+
    '</tr></thead><tbody>'+
    c.journey.map(function(j,i){
      const hl = (i===sel) ? ' style="background:'+mix(C.pink,.045)+'"' : '';
      return '<tr'+hl+'>'+
        '<td class="num" style="color:var(--ink3)">'+(i+1)+'</td>'+
        '<td><input class="ce" data-set="journey.'+i+'.name" value="'+esc(j.name)+'" style="font-weight:650"></td>'+
        '<td>'+tsel('journey.'+i+'.vg', vgOpts, true)+'</td>'+
        '<td class="ta">'+(lens==='all' ? ta('journey.'+i+'.thinks','','ce') : lensCell(lens,i,'thinks', j.thinks))+'</td>'+
        '<td class="ta">'+(lens==='all' ? ta('journey.'+i+'.does','','ce')   : lensCell(lens,i,'does',   j.does))+'</td>'+
        '<td class="ta">'+(lens==='all' ? ta('journey.'+i+'.question','','ce'): lensCell(lens,i,'question', j.question))+'</td>'+
        '<td>'+chipsOf('journey.'+i+'.channels','vi')+'</td>'+
        '<td>'+chipsOf('journey.'+i+'.assets','pk')+'</td>'+
        '<td class="ta">'+ta('journey.'+i+'.kpi','','ce')+'</td>'+
        '<td>'+ti('journey.'+i+'.owner','','ce')+'</td>'+
        '<td class="ta">'+ta('journey.'+i+'.friction','','ce')+'</td>'+
        '<td style="white-space:nowrap">'+
          '<button class="xbtn" data-act="jup" data-i="'+i+'" title="Move earlier">&uarr;</button>'+
          '<button class="xbtn" data-act="jdn" data-i="'+i+'" title="Move later">&darr;</button>'+
          '<button class="xbtn" data-act="jdel" data-i="'+i+'" title="Delete stage">&times;</button>'+
        '</td></tr>';
    }).join('')+
    '</tbody></table></div><button class="addrow" data-act="jadd">+ Add a journey stage</button></div>';

  const vg = VG[st.vg]||VG.all;
  const detail = '<div class="card" style="border-left:3px solid '+vg.colour+'">'+
    '<header><span class="pill" style="background:'+mix(vg.colour,.12)+';color:'+vg.colour+';border:1px solid '+mix(vg.colour,.3)+'">STAGE '+(sel+1)+' · '+vg.label.toUpperCase()+'</span>'+
      '<h3 style="flex:1">'+st.name+'</h3></header>'+
    '<div class="body"><div class="grid2">'+
      '<div>'+
        '<div class="f"><label>Buyer mindset</label>'+ta('journey.'+sel+'.mindset')+'</div>'+
        '<div class="f"><label>The question in their head</label>'+ta('journey.'+sel+'.question')+'</div>'+
        '<div class="f"><label>Where this stage stalls</label>'+ta('journey.'+sel+'.friction')+'</div>'+
      '</div>'+
      '<div>'+
        '<div class="f"><label>Channels</label>'+chipsOf('journey.'+sel+'.channels','vi','add a channel')+'</div>'+
        '<div class="f"><label>Assets that do the work</label>'+chipsOf('journey.'+sel+'.assets','pk','add an asset')+'</div>'+
        '<div class="f"><label>The one metric that proves this stage happened</label>'+ta('journey.'+sel+'.kpi')+'</div>'+
        '<div class="f"><label>Owner</label>'+ti('journey.'+sel+'.owner','','inp')+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="co go" style="margin:4px 0 0"><span class="cot">Ask the client this, now</span>'+
      'Of these '+c.journey.length+' stages, which one loses you the most deals? Whatever they say becomes the priority for everything else, and the reason the plan in Stage 9 is ordered the way it is.</div>'+
    '</div></div>';

  const dist = '<div class="card"><header><h3>Where the accounts actually are</h3><span class="hint">live positions, from the Log Activity screen</span></header>'+
    '<div class="body">'+funnelBars()+'</div></div>';

  return signoffBlock()+
    '<div class="co pk"><span class="cot">This is a draft, not an answer</span>'+
      'The journey below was generated from the <b>'+esc((ARCHETYPES[c.archetype]||{}).label||'')+'</b> archetype and then edited against what we know about '+esc(c.name)+
      '. Switch the persona lens, change a cell, add a stage. The moment the client edits this, it stops being our deck and becomes their plan.</div>'+
    flow + lensBar + table + detail + dist;
}

function funnelBars(){
  const f=funnelData(), la=liveAccounts();
  let max = 1; f.forEach(function(x){ if(x.atOrPast>max) max=x.atOrPast; });
  return '<div class="fun">'+f.map(function(x,i){
    const vg=VG[x.vg]||VG.all;
    return '<div class="funrow"><div class="fl">'+String(i+1).padStart(2,'0')+' '+x.name+'</div>'+
      '<div class="fbar"><i style="width:'+(x.atOrPast/max*100)+'%;background:'+mix(vg.colour,.3)+'"></i>'+
        '<span>'+x.atOrPast+' reached this stage or beyond'+(x.at?' · '+x.at+' sitting here now':'')+'</span></div>'+
      '<div class="fn">'+pct(x.atOrPast,la.length)+'%</div></div>';
  }).join('')+'</div>'+
  '<div class="legend"><span><i style="background:'+mix(C.pink,.3)+'"></i>Acquisition</span>'+
  '<span><i style="background:'+mix(C.violet,.3)+'"></i>Experience</span>'+
  '<span><i style="background:'+mix(C.teal,.3)+'"></i>Retention</span>'+
  '<span><i style="background:'+mix(C.gold,.3)+'"></i>Advocacy</span></div>';
}

/* ============================================================
   15. STAGE 7: WHAT WE SAY
   ============================================================ */
function vMessaging(){
  const c = cur();
  return signoffBlock()+
  '<div class="card" style="border-left:3px solid '+C.pink+'"><header><h3>Core message</h3>'+
    '<span class="hint">one sentence the whole business can stand behind</span></header>'+
    '<div class="body"><textarea class="inp" data-set="coreMessage" rows="2" '+
      'style="font-size:19px;font-weight:680;line-height:1.45;letter-spacing:-.015em">'+esc(c.coreMessage||'')+'</textarea>'+
      '<div class="hlp">Everything below is this sentence translated for a specific person. If an audience line contradicts it, one of the two is wrong.</div></div></div>'+

  '<div class="co"><span class="cot">The rules that keep this honest</span>'+
    'Lead with the business problem before explaining the technology. Translate every acronym into an operational outcome in the same sentence. '+
    'Every claim traces back to something in Stage 1. And do not let a broad phrase like seamless connectivity or world-class service stand in for a difference, because every competitor is already saying it.</div>'+

  c.umbrellas.map(function(u){
    return '<div class="card">'+
    '<header><h3 style="flex:1">'+ti('umbrellas.'+u.id+'.name','Audience','ce')+'</h3>'+
      '<button class="xbtn" data-act="umbdel" data-id="'+u.id+'">&times;</button></header>'+
    '<div class="body">'+
      '<div class="f"><label>The line, the bit a stranger would repeat</label>'+
        '<textarea class="inp" data-set="umbrellas.'+u.id+'.line" rows="1" style="font-size:16px;font-weight:650;line-height:1.45">'+esc(u.line)+'</textarea></div>'+
      '<div class="grid2">'+
        '<div>'+
          '<div class="f"><label>Who it is aimed at</label>'+ta('umbrellas.'+u.id+'.target')+'</div>'+
          '<div class="f"><label>What it is about</label>'+ta('umbrellas.'+u.id+'.focus')+'</div>'+
          '<div class="f"><label>Proof behind it</label>'+ta('umbrellas.'+u.id+'.proof')+'</div>'+
          '<div class="f"><label>Segments</label><div class="chips">'+
            activeSegs().map(function(s){
              const on = (u.segs||[]).indexOf(s.id)>-1;
              return '<span class="chip '+(on?'sel':'')+'" data-act="umbseg" data-id="'+u.id+'" data-seg="'+s.id+'" style="cursor:pointer">'+esc(s.name)+'</span>';
            }).join('')+'</div></div>'+
        '</div>'+
        '<div>'+
          '<div class="f"><label>Supporting points</label>'+bulOf('umbrellas.'+u.id+'.supporting','A supporting point…')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="f"><label>The argument, in full</label>'+ta('umbrellas.'+u.id+'.body')+'</div>'+
    '</div></div>';
  }).join('')+
  '<button class="tbtn" data-act="umbadd">+ Add an audience message</button>'+

  '<div class="card" style="margin-top:16px"><header><h3>Opening lines</h3><span class="hint">plain, concrete, nothing that sounds like marketing</span></header>'+
  '<div class="body">'+bulOf('hooks','A hook…')+'</div></div>'+

  '<div class="card"><header><h3>Message-to-role matrix</h3><span class="hint">the same offer, argued six different ways</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:180px">Committee role</th>'+
    '<th style="min-width:240px">The pitch that moves them</th><th style="min-width:210px">What they will push back on</th>'+
    '<th style="min-width:210px">The proof that answers it</th><th style="min-width:190px">Content to hand them</th></tr></thead><tbody>'+
  c.personas.map(function(p){
    const rc = ROLE_COL[p.crole]||C.ink;
    return '<tr><td><b>'+p.role+'</b><div class="tiny"><span class="pill" style="background:'+mix(rc,.12)+';color:'+rc+';border:1px solid '+mix(rc,.3)+'">'+(ROLE_LBL[p.crole]||'not set')+'</span></div></td>'+
    '<td class="ta">'+ta('personas.'+p.id+'.pitch','','ce')+'</td>'+
    '<td class="ta">'+ta('personas.'+p.id+'.objection','','ce')+'</td>'+
    '<td class="ta">'+ta('personas.'+p.id+'.proof','','ce')+'</td>'+
    '<td class="ta">'+ta('personas.'+p.id+'.content','','ce')+'</td></tr>';
  }).join('')+
  '</tbody></table></div></div>';
}

/* ============================================================
   16. STAGE 8: THE PLAYS, THEIR NEXT STEPS, AND THE ASSET KIT
   ============================================================ */
function vPlays(){
  const c = cur(), t = tierCounts();
  const budget = num(c.objective.budget);
  const live = c.plays.filter(function(p){return p.on;});
  const spend = playBudget();
  const ak = assetReady();
  const tierSpend = function(k){ let s=0; c.plays.forEach(function(p){ if(p.tier===k&&p.on) s+=num(p.budget); }); return s; };

  const sec = function(k){
    const list = c.plays.filter(function(p){ return p.tier===k && (S.playTier==='all'||S.playTier===k); });
    if(!list.length) return '';
    const onN = c.plays.filter(function(p){return p.tier===k&&p.on;}).length;
    const allN = c.plays.filter(function(p){return p.tier===k;}).length;
    return '<div class="card"><header><span class="pill '+TIERPILL[k]+'">'+TIERLBL[k]+'</span>'+
      '<h3 style="flex:1">'+(k==='t1'?'Built for one named account':k==='t2'?'Shared by a vertical cluster':'Programmatic air cover')+'</h3>'+
      '<span class="muted tiny">'+onN+' of '+allN+' live · '+money(tierSpend(k))+' · '+t[k]+' accounts</span></header>'+
      '<div class="body"><div class="grid3">'+list.map(function(p){
        return '<div class="play'+(p.on?'':' off')+'">'+
          '<div class="phd"><button class="sw'+(p.on?' on':'')+'" data-act="playtoggle" data-id="'+p.id+'"></button>'+
            '<h4>'+ti('plays.'+p.id+'.name','','ce')+'</h4></div>'+
          '<div class="pd">'+ta('plays.'+p.id+'.desc','','ce')+'</div>'+
          '<div class="pfield" style="margin-top:9px"><div class="pl">Primary call to action</div>'+
            '<div style="display:flex;gap:5px;align-items:flex-start"><span style="color:'+C.pink+';font-weight:800">&rsaquo;</span>'+
            ta('plays.'+p.id+'.cta','a play without a next step is content','ce')+'</div></div>'+
          '<div class="pfield"><div class="pl">Best used for</div>'+ta('plays.'+p.id+'.best','','ce')+'</div>'+
          '<div class="pm"><span class="chip tiny">'+esc(p.channel)+'</span><span class="chip tiny">'+esc(p.asset)+'</span>'+
            '<span class="chip tiny '+(p.effort==='High'?'go':p.effort==='Medium'?'vi':'te')+'">'+esc(p.effort)+' effort</span></div>'+
          '<div style="display:flex;gap:5px;align-items:center;margin-top:9px">'+
            '<span class="tiny muted" style="flex:0 0 auto">₹</span>'+
            '<input class="mini" data-set="plays.'+p.id+'.budget" data-live="1" value="'+esc(p.budget)+'" style="width:80px;font-family:var(--mono)">'+
            '<button class="chip '+(p.lock?'go':'')+'" data-act="locktoggle" data-id="'+p.id+'" '+
              'title="'+(p.lock?'Fixed. The allocator works around this number. Click to put it back on AUTO.':'Auto. Recalculated from the tier split. Type a number, or click, to fix it.')+'" '+
              'style="cursor:pointer;font-size:9px;font-weight:800;letter-spacing:.08em;padding:2px 6px">'+(p.lock?'FIXED':'AUTO')+'</button>'+
            '<span class="tiny muted" style="margin-left:auto">'+ti('plays.'+p.id+'.owner','owner','ce tiny')+'</span></div>'+
          (p.on?'<div class="tiny muted" style="margin-top:3px">'+pct(num(p.budget), tierTarget(p.tier))+'% of the '+TIERSHORT[p.tier]+' pool</div>':'')+
        '</div>';
      }).join('')+'</div></div></div>';
  };

  const over = spend>budget && budget>0;

  /* ---------- the allocator ---------- */
  const fixedN = c.plays.filter(function(p){return p.on&&p.lock;}).length;
  const fixedSum = c.plays.filter(function(p){return p.on&&p.lock;}).reduce(function(s,p){return s+num(p.budget);},0);
  const unalloc = budget - spend;
  const pending = Math.abs(unalloc) > 1;
  const alloc = '<div class="card" style="border-left:3px solid '+(pending?C.gold:C.violet)+'"><header><h3>Budget allocation</h3>'+
    '<span class="hint">you give one number · the app splits it · you override anything</span>'+
    '<span style="flex:1"></span>'+
    (fixedN?'<button class="tbtn" data-act="unlockall">Unlock all '+fixedN+'</button>':'')+
    '<button class="tbtn" data-act="resetsplit">Reset split</button></header>'+
    '<div class="body"><div class="grid2" style="gap:22px"><div>'+
      '<div class="f"><label>Total budget for 90 days (₹), the number they give you</label>'+
        '<input class="inp" data-set="objective.budget" data-commit="1" inputmode="numeric" value="'+esc(c.objective.budget)+'" '+
        'style="font-size:21px;font-weight:700;font-family:var(--mono)">'+
        '<div class="hlp">Type the whole figure, then press <b>Enter</b> or the button below. '+
        'Nothing recalculates while you are still typing.</div></div>'+
      '<div class="f"><label>Tier split</label>'+
        TIERS.map(function(k){
          const tgt = tierTarget(k), act = tierActual(k), lk = tierLocked(k);
          const bad = act>tgt+1;
          return '<div class="wtrow"><span class="wtn"><span class="pill '+TIERPILL[k]+'">'+TIERSHORT[k]+'</span> '+
            TIERLBL[k].split('·')[1]+
            '<div class="tiny muted">target '+money(tgt)+' · allocated <b style="color:'+(bad?C.pink:'inherit')+'">'+money(act)+'</b>'+
            (lk?' · '+money(lk)+' fixed':'')+' · '+t[k]+' accounts</div></span>'+
            '<span class="wtbar"><i style="width:'+clamp(tgt?act/tgt*100:0,0,100)+'%;background:'+(bad?C.pink:C.violet)+'"></i></span>'+
            '<input type="number" class="mini" data-set="tierSplit.'+k+'" data-commit="1" min="0" max="100" value="'+esc(getPath('tierSplit.'+k))+'" style="width:52px">'+
            '<span class="tiny muted">%</span></div>';
        }).join('')+
        '<div class="hlp">Percentages of the total. They do not have to add up to 100, since the app normalises them, so you can think in ratios if that is easier.</div></div>'+
      '<button class="tbtn '+(pending?'pk':'pri')+'" data-act="autoalloc" '+
        'style="width:100%;padding:11px;font-size:13.5px;font-weight:700;margin-top:4px">'+
        (pending?'Distribute &amp; commit '+money(num(c.objective.budget)):'Distribute &amp; commit')+'</button>'+
      '<div class="hlp" style="text-align:center">Splits the total across the tiers, then across the live plays on AUTO.</div>'+
    '</div><div>'+
      '<div class="grid2" style="gap:12px;margin-bottom:12px">'+
        '<div class="tile" style="box-shadow:none"><div class="k">Entered</div><div class="v" style="font-size:21px">'+money(budget)+'</div><div class="d">client budget</div></div>'+
        '<div class="tile '+(!pending?'te':unalloc<0?'pk':'go')+'" style="box-shadow:none"><div class="k">'+(unalloc<0?'Over by':'Not yet distributed')+'</div>'+
          '<div class="v" style="font-size:21px">'+money(Math.abs(unalloc))+'</div>'+
          '<div class="d">'+(!pending?'fully distributed':unalloc<0?'fixed amounts exceed the split':'press Distribute &amp; commit')+'</div></div>'+
      '</div>'+
      (pending?'<div class="co go"><span class="cot">Waiting on you</span>'+
        'You have entered <b>'+money(budget)+'</b> but the plays currently hold <b>'+money(spend)+'</b>. '+
        'Press <b>Distribute &amp; commit</b> to push the difference of '+money(Math.abs(unalloc))+' through the tier split.</div>':'')+
      '<div class="co"><span class="cot">How it works</span>'+
        'Every live play is on <b>AUTO</b> by default and receives a share of its tier proportional to its effort weight. '+
        'The moment you type over a play’s number it flips to <b>FIXED</b>, and the rest of that tier redistributes around it. '+
        'Switch a play off and its money returns to the pool instead of vanishing.'+
        (fixedN?' Currently <b>'+fixedN+' plays are fixed</b>, holding '+money(fixedSum)+'.':'')+'</div>'+
      (c._alloc && TIERS.some(function(k){return c._alloc[k]&&c._alloc[k].over;})
        ? '<div class="co pk"><span class="cot">Fixed amounts exceed a tier</span>'+
          'In '+TIERS.filter(function(k){return c._alloc[k]&&c._alloc[k].over;}).map(function(k){return TIERSHORT[k];}).join(' and ')+
          ', the plays you fixed already cost more than the tier split allows, so every AUTO play in that tier has dropped to zero. '+
          'Either raise the tier percentage, raise the total, or unlock something.</div>' : '')+
      '<div class="co go"><span class="cot">The honest caveat to say out loud</span>'+
        'This allocation is arithmetic, not a media plan. It tells you what each play <i>can</i> cost if you hold the tier ratio. '+
        'Real costs like a roundtable venue, a print run or a retainer go in as FIXED numbers, and the model works around them.</div>'+
    '</div></div></div></div>';

  const kit = '<div class="card" style="border-left:3px solid '+(ak.blocked?C.pink:C.teal)+'"><header><h3>Must-have asset kit</h3>'+
    '<span class="hint">nothing activates until these exist</span><span style="flex:1"></span>'+
    '<span class="muted tiny">'+ak.ready+' ready · '+ak.total+' total</span></header>'+
    '<div class="body tight scrollx"><table class="tbl"><thead><tr><th style="min-width:320px">Asset</th>'+
      '<th style="width:110px">Type</th><th style="min-width:150px">Owner</th><th style="width:140px">Status</th><th></th></tr></thead><tbody>'+
    c.assets.map(function(a){
      const cls = a.status==='Ready'?'okp':a.status==='Not started'?'bap':a.status==='In review'?'t2p':'wrp';
      return '<tr><td>'+ti('assets.'+a.id+'.name','','ce')+'</td>'+
        '<td class="tiny muted">'+esc(a.type)+'</td>'+
        '<td>'+ti('assets.'+a.id+'.owner','','ce')+'</td>'+
        '<td>'+tsel('assets.'+a.id+'.status',ASSET_STATUS,true)+' <span class="pill '+cls+'" style="margin-left:4px">'+(a.status==='Ready'?'✓':'')+'</span></td>'+
        '<td><button class="xbtn" data-act="assetdel" data-id="'+a.id+'">&times;</button></td></tr>';
    }).join('')+
    '</tbody></table></div><button class="addrow" data-act="assetadd">+ Add an asset</button></div>';

  return signoffBlock()+
  alloc+
  '<div class="grid4" style="margin-bottom:16px">'+
    '<div class="tile pk"><div class="k">Plays live</div><div class="v">'+live.length+'</div><div class="d">of '+c.plays.length+' in the library</div></div>'+
    '<div class="tile '+(over?'go':'te')+'"><div class="k">Allocated</div><div class="v">'+money(spend)+'</div><div class="d">'+(budget?(pct(spend,budget)+'% of '+money(budget)):'no budget set')+'</div></div>'+
    '<div class="tile vi"><div class="k">Per Tier-1 account</div><div class="v">'+money(t.t1?tierSpend('t1')/t.t1:0)+'</div><div class="d">'+t.t1+' accounts, 1:1</div></div>'+
    '<div class="tile"><div class="k">Per Tier-3 account</div><div class="v">'+money(t.t3?tierSpend('t3')/t.t3:0)+'</div><div class="d">'+t.t3+' accounts, programmatic</div></div>'+
  '</div>'+
  (over?'<div class="co go"><span class="cot">Over budget</span>Live plays allocate <b>'+money(spend)+'</b> against a programme budget of <b>'+money(budget)+'</b>. Switch something off or raise the budget, but do not pretend the arithmetic works.</div>':'')+
  (ak.blocked?'<div class="co pk"><span class="cot">Production gate</span><b>'+ak.blocked+' must-have assets have not started.</b> Paid media and outreach should not go live until they exist. This is the argument that saves you in week eight.</div>':'')+
  '<div class="co"><span class="cot">Try this in the room</span>'+
    'Switch the roundtable off. The money does not disappear, it gets shared out across the remaining Tier 2 plays, so the same budget now buys less reach. '+
    'Then fix the roundtable at its real venue cost and watch what the rest of Tier 2 has left. That trade-off is the entire conversation a Head of Marketing has with their CFO; this just makes it visible on one screen.</div>'+

  '<div class="pjump">'+['all','t1','t2','t3'].map(function(k){
    return '<button class="'+(S.playTier===k?'on':'')+'" data-act="fplay" data-v="'+k+'">'+(k==='all'?'All tiers':TIERLBL[k])+'</button>';
  }).join('')+'</div>'+
  sec('t1')+sec('t2')+sec('t3')+
  '<button class="tbtn" data-act="playadd">+ Add a custom play</button>'+
  '<div style="height:16px"></div>'+kit;
}

/* ============================================================
   17. STAGE 9: THE FIRST NINETY DAYS
   ============================================================ */
const STATUSES = [['Planned','Planned'],['In progress','In progress'],['Blocked','Blocked'],['Done','Done']];
function vRoadmap(){
  const c = cur();
  let rows = c.roadmap.slice();
  if(S.roadPhase!=='all') rows = rows.filter(function(r){ return String(r.phase)===String(S.roadPhase); });
  rows.sort(function(a,b){ return (a.phase-b.phase)||(a.week-b.week); });
  const st = {}; STATUSES.forEach(function(s){ st[s[0]] = c.roadmap.filter(function(r){return r.status===s[0];}).length; });
  const depsOpen = c.deps.filter(function(d){return !d.done;}).length;

  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+
    STATUSES.map(function(s){
      const cls = s[0]==='Done'?'te':s[0]==='Blocked'?'pk':s[0]==='In progress'?'vi':'';
      return '<div class="tile '+cls+'"><div class="k">'+s[1]+'</div><div class="v">'+st[s[0]]+'</div>'+
      '<div class="d">'+pct(st[s[0]],c.roadmap.length)+'% of '+c.roadmap.length+' rows</div></div>';
    }).join('')+
  '</div>'+

  (depsOpen?'<div class="co pk"><span class="cot">'+depsOpen+' dependencies still open</span>'+
    'Activation in Phase 5 cannot begin honestly until these are cleared. Tick them off below as they land.</div>':'')+

  '<div class="card" style="border-left:3px solid '+C.pink+'"><header><h3>Campaign dependencies</h3>'+
    '<span class="hint">any one of these unresolved and week eight fails</span></header><div class="body"><ul class="bul">'+
    c.deps.map(function(d){
      return '<li><button class="toggle'+(d.done?' on':'')+'" data-act="deptoggle" data-id="'+d.id+'" '+
        'style="padding:4px 9px;font-size:11px;align-self:flex-start"><span class="tk">'+(d.done?'✓':'')+'</span>'+(d.done?'Cleared':'Open')+'</button>'+
        '<textarea class="ce" data-set="deps.'+d.id+'.text" rows="1">'+esc(d.text)+'</textarea>'+
        '<button class="xbtn" data-act="depdel" data-id="'+d.id+'">&times;</button></li>';
    }).join('')+'</ul><button class="tbtn" data-act="depadd" style="margin-top:9px">+ Add a dependency</button></div></div>'+

  '<div class="grid4" style="margin-bottom:16px">'+PHASES.map(function(p){
    const rs = c.roadmap.filter(function(r){ return String(r.phase)===String(p[0]); });
    const done = rs.filter(function(r){ return r.status==='Done'; }).length;
    return '<div class="tile" style="border-left:3px solid '+p[4]+'">'+
      '<div class="k">Phase '+p[0]+' · '+p[1]+'</div>'+
      '<div style="font-size:12px;font-weight:680;margin:3px 0 2px">'+p[2]+'</div>'+
      '<div class="tiny muted" style="margin-bottom:5px">'+p[3]+'</div>'+
      '<div class="rbar" style="background:var(--line)"><i style="width:'+pct(done,rs.length)+'%;background:'+p[4]+'"></i></div>'+
      '<div class="d" style="margin-top:5px">'+done+' of '+rs.length+' complete</div></div>';
  }).join('')+'</div>'+

  '<div class="pjump"><button class="'+(S.roadPhase==='all'?'on':'')+'" data-act="fphase" data-v="all">All phases</button>'+
    PHASES.map(function(p){ return '<button class="'+(String(S.roadPhase)===String(p[0])?'on':'')+'" data-act="fphase" data-v="'+p[0]+'">'+p[0]+'. '+p[1]+'</button>'; }).join('')+'</div>'+

  '<div class="card"><header><h3>Week by week</h3><span class="hint">every row has an owner, a status and an output</span></header>'+
  '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
    '<th style="width:110px">Phase</th><th style="width:52px">Wk</th><th style="min-width:280px">Activity</th>'+
    '<th style="min-width:115px">Format</th><th style="min-width:140px">Owner</th>'+
    '<th style="min-width:190px">Output</th><th style="min-width:115px">Status</th><th></th>'+
  '</tr></thead><tbody>'+
  (rows.length?rows.map(function(r){
    return '<tr><td>'+tsel('roadmap.'+r.id+'.phase',PHASES.map(function(p){return [p[0],p[0]+'. '+p[1]];}),true)+'</td>'+
      '<td>'+tn('roadmap.'+r.id+'.week','mini',true,1,13,42)+'</td>'+
      '<td>'+ti('roadmap.'+r.id+'.activity','','ce')+'</td>'+
      '<td>'+ti('roadmap.'+r.id+'.format','','ce')+'</td>'+
      '<td>'+ti('roadmap.'+r.id+'.owner','assign…','ce')+'</td>'+
      '<td>'+ti('roadmap.'+r.id+'.output','','ce')+'</td>'+
      '<td>'+tsel('roadmap.'+r.id+'.status',STATUSES,true)+'</td>'+
      '<td><button class="xbtn" data-act="roaddel" data-id="'+r.id+'">&times;</button></td></tr>';
  }).join(''):'<tr><td colspan="8" class="empty">No rows in this phase.</td></tr>')+
  '</tbody></table></div><button class="addrow" data-act="roadadd">+ Add a row</button></div>'+

  '<div class="card"><header><h3>Live plays with no plan row</h3><span class="hint">a play with no week is a play that will not happen</span></header><div class="body">'+
  (function(){
    const orphan = c.plays.filter(function(p){
      if(!p.on) return false;
      const first = String(p.name).toLowerCase().replace(/&amp;/g,'&').split(' ')[0];
      return !c.roadmap.some(function(r){ return String(r.activity).toLowerCase().indexOf(first)>-1; });
    });
    if(!orphan.length) return '<div class="empty">Every live play appears in the plan. Good.</div>';
    return '<div class="chips">'+orphan.map(function(p){
      return '<span class="chip go"><b>'+p.name+'</b>'+
      '<button data-act="roadfromplay" data-id="'+p.id+'" title="Add a plan row" style="color:var(--pink);font-weight:800">+</button></span>';
    }).join('')+'</div><div class="hlp">Click <b>+</b> to drop a row into Phase 5 and then move it to the week it belongs in.</div>';
  })()+
  '</div></div>';
}

/* ============================================================
   18. STAGE 10: HOW WE MEASURE
   ============================================================ */
function vMeasure(){
  const c = cur();
  const keys = ['cov','eng','prog','comm'];
  const cnt = {}; keys.forEach(function(k){ cnt[k]=c.kpis.filter(function(x){return x.layer===k;}).length; });
  const noBase = c.kpis.filter(function(k){ return String(k.baseline).trim()===''; });

  return signoffBlock()+
  '<div class="grid4" style="margin-bottom:16px">'+keys.map(function(k){
    const L=LAYERS[k];
    return '<div class="tile" style="border-left:3px solid '+L.colour+'"><div class="k">'+L.label+'</div>'+
      '<div class="v">'+cnt[k]+'</div><div class="d">'+L.q+'</div></div>';
  }).join('')+'</div>'+

  '<div class="co go"><span class="cot">The mistake this page prevents</span>'+
    'ABM gets measured at the account, buying group and revenue level. Use ordinary lead-generation metrics and you get a confident lie, because impressions and form fills can all rise while nothing useful happens. '+
    'The four layers are also an order. You cannot honestly report engagement on accounts whose committee you never mapped, and you cannot claim revenue impact with nothing underneath it.</div>'+

  '<div class="pjump"><button class="'+(S.kpiLayer==='all'?'on':'')+'" data-act="flayer" data-v="all">All layers</button>'+
    keys.map(function(k){ return '<button class="'+(S.kpiLayer===k?'on':'')+'" data-act="flayer" data-v="'+k+'">'+LAYERS[k].label+'</button>'; }).join('')+'</div>'+

  keys.filter(function(k){ return S.kpiLayer==='all'||S.kpiLayer===k; }).map(function(k){
    const list = c.kpis.filter(function(x){return x.layer===k;}); if(!list.length) return '';
    const L=LAYERS[k], v=VG[L.vg]||VG.all;
    return '<div class="card" style="border-left:3px solid '+L.colour+'">'+
      '<header><span class="pill" style="background:'+mix(L.colour,.12)+';color:'+L.colour+';border:1px solid '+mix(L.colour,.3)+'">'+L.label.toUpperCase()+'</span>'+
        '<h3 style="flex:1">'+L.q+'</h3><span class="vgtag '+v.cls+'" style="margin:0">'+v.label+'</span></header>'+
      '<div class="body tight scrollx"><table class="tbl"><thead><tr>'+
        '<th style="min-width:190px">Metric</th><th style="min-width:270px">How we count it</th>'+
        '<th style="width:92px">Baseline</th><th style="width:92px">90-day target</th><th style="width:74px">Unit</th>'+
        '<th style="min-width:115px">Owner</th><th style="min-width:104px">Movement</th><th></th></tr></thead><tbody>'+
      list.map(function(x){
        const hasB = String(x.baseline).trim()!=='', hasT = String(x.target).trim()!=='';
        let mv='', cls='muted';
        if(hasB && hasT){
          const bl=num(x.baseline), tg=num(x.target), d=tg-bl;
          const lower = /cycle|length|days|cost/i.test(x.metric);
          cls = (lower ? d<0 : d>0) ? 'okp' : 'bap';
          mv = (d>0?'+':'')+fmt(d)+(bl?(' ('+(d>0?'+':'')+Math.round(d/Math.abs(bl)*100)+'%)'):'');
        }
        return '<tr><td>'+ti('kpis.'+x.id+'.metric','','ce')+'</td>'+
          '<td class="ta">'+ta('kpis.'+x.id+'.def','','ce')+'</td>'+
          '<td>'+ti('kpis.'+x.id+'.baseline','?','mini',true)+'</td>'+
          '<td>'+ti('kpis.'+x.id+'.target','','mini',true)+'</td>'+
          '<td>'+ti('kpis.'+x.id+'.unit','','ce tiny')+'</td>'+
          '<td>'+ti('kpis.'+x.id+'.owner','assign…','ce')+'</td>'+
          '<td class="calc">'+(cls==='muted'?'<span class="muted tiny">set a baseline</span>':'<span class="pill '+cls+'">'+mv+'</span>')+'</td>'+
          '<td><button class="xbtn" data-act="kpidel" data-id="'+x.id+'">&times;</button></td></tr>';
      }).join('')+
      '</tbody></table></div></div>';
  }).join('')+
  '<button class="tbtn" data-act="kpiadd">+ Add a metric</button>'+

  '<div class="card" style="margin-top:16px"><header><h3>Metrics with no baseline</h3>'+
    '<span class="hint">a target without a baseline is a wish</span><span style="flex:1"></span>'+
    '<span class="muted tiny">'+noBase.length+' of '+c.kpis.length+'</span></header><div class="body">'+
  (noBase.length
    ? '<div class="chips">'+noBase.map(function(k){ return '<span class="chip go"><b>'+esc(k.metric)+'</b></span>'; }).join('')+'</div>'+
      '<div class="hlp">If they cannot give you a baseline, write <b>unknown</b> and make finding it a week one job. That is a finding rather than a gap, and it is often the most useful thing you tell them all month.</div>'
    : '<div class="empty">Every metric has a baseline. That is rarer than it sounds.</div>')+
  '</div></div>';
}
