
/* ============================================================
   27. ACCOUNT INTELLIGENCE: ACTIONS AND REGISTRATION

   VIEWS and ACT are extended by assignment rather than edited in
   place, so the existing dispatch code in 08 stays untouched and
   removing this module removes the feature cleanly.
   ============================================================ */

VIEWS.accintel = vAccIntel;

Object.assign(ACT, {

  /* navigation inside the module */
  iopen(el){ ISEL.acct = el.dataset.id; ISEL.tab = 'over'; render(); },
  iclose(){ ISEL.acct = null; render(); },
  itab(el){ ISEL.tab = el.dataset.t; render(); },

  /* findings */
  ifadd(el){
    const a = iAcct(); if(!a) return;
    a.findings.push({ id:uid('f'), area:el.dataset.area, title:'', text:'',
      kind:'hyp', ver:'new', conf:'2', srcId:'', at:today() });
    save(); render(true);
  },
  ifdel(el){
    const a = iAcct(); if(!a) return;
    a.findings = a.findings.filter(f=>f.id!==el.dataset.id);
    save(); render(true);
  },

  /* sources */
  isrcadd(){
    const a = iAcct(); if(!a) return;
    a.sources.push({ id:uid('src'), type:'site', publisher:'', title:'', url:'',
      pub:'', acc:today(), note:'', q:'4' });
    save(); render(true);
  },
  isrcdel(el){
    const a = iAcct(); if(!a) return;
    const id = el.dataset.id;
    const used = a.findings.filter(f=>f.srcId===id).length;
    if(used && !confirm(used+' finding'+(used>1?'s point':' points')+' at this source. Delete it anyway? Those findings become unsourced.')) return;
    a.sources = a.sources.filter(s=>s.id!==id);
    a.findings.forEach(f=>{ if(f.srcId===id) f.srcId=''; });
    save(); render(true);
  },

  /* sites */
  isadd(){
    const a = iAcct(); if(!a) return;
    a.sites.push({ id:uid('site'), name:'', type:'office', city:a.city||'',
      status:'plan', owner:'own', size:'', date:'', need:'', opp:'none', conf:'2' });
    save(); render(true);
  },
  isdel(el){
    const a = iAcct(); if(!a) return;
    a.sites = a.sites.filter(s=>s.id!==el.dataset.id);
    a.findings.forEach(f=>{ if(f.siteId===el.dataset.id) f.siteId=''; });
    save(); render(true);
  },

  /* people */
  ipadd(){
    const a = iAcct(); if(!a) return;
    a.people.push({ id:uid('p'), name:'', title:'', fn:'', sen:'head', role:'',
      infl:'0', auth:'0', rel:'0', eng:'0', owner:'', verAt:today().slice(0,7),
      email:'', phone:'', linkedin:'', contactSource:'', contactStatus:'',
      care:'', next:'', sup:'0' });
    save(); render(true);
  },
  ipdel(el){
    const a = iAcct(); if(!a) return;
    a.people = a.people.filter(p=>p.id!==el.dataset.id);
    save(); render(true);
  },

  /* triggers */
  itadd(){
    const a = iAcct(); if(!a) return;
    a.trigs.push({ id:uid('t'), type:'site', desc:'', date:today(), expiry:'',
      strength:'2', srcId:'', action:'', status:'open' });
    save(); render(true);
  },
  itdel(el){
    const a = iAcct(); if(!a) return;
    a.trigs = a.trigs.filter(t=>t.id!==el.dataset.id);
    save(); render(true);
  },

  /* simple string arrays inside the account, such as discovery questions */
  ibadd(el){
    const a = iAcct(); if(!a) return;
    arrPath(ap(a, el.dataset.p)).push('');
    save(); render(true);
  },
  ibdel(el){
    const a = iAcct(); if(!a) return;
    arrPath(ap(a, el.dataset.p)).splice(parseInt(el.dataset.i,10), 1);
    save(); render(true);
  },

  /* journey. Gates warn, they do not block, because the person in the
     room knows things the app does not. But the warning is specific. */
  ijset(el){
    const a = iAcct(); if(!a) return;
    const to = parseInt(el.dataset.n, 10), from = num(a.jstage);
    const s = JSTAGES[to];
    let msg;
    if(to > from){
      msg = 'Move ' + a.name + ' to ' + s.nav + '?\n\nBefore leaving ' + JSTAGES[from].nav +
            ' these should be true:\n\n' + JSTAGES[from].gate.map(g=>'  - '+g).join('\n') +
            '\n\nWhat is the evidence? Leave blank to move anyway.';
    } else {
      msg = 'Move ' + a.name + ' back to ' + s.nav + '?\n\nWhy has it gone backwards?';
    }
    const ev = prompt(msg, '');
    if(ev === null) return;
    setJStage(a, to, ev);
    save(); render(true);
    toast(to>from ? 'Moved to <b>'+esc(s.nav)+'</b>.' : 'Moved back to <b>'+esc(s.nav)+'</b>.');
  },

  /* one click disqualification reasons */
  idisqr(el){
    const a = iAcct(); if(!a) return;
    a.statusWhy = el.dataset.v;
    save(); render(true);
  },

  /* printable brief */
  ibrief(){
    const a = iAcct(); if(!a) return;
    const w = window.open('', '_blank');
    if(!w){ toast('Your browser blocked the popup. Allow popups to open the brief.'); return; }
    w.document.write(briefDoc(a));
    w.document.close();
  }
});

/* The brief opens as its own document so it prints cleanly and can be
   saved as a PDF by the browser. No library, no server. */
function briefDoc(a){
  const body = iBrief(a)
    .replace(/<div class="rowend"[\s\S]*?<\/div>/, '')
    .replace(/<(input|select|textarea)[^>]*>/g, '')
    .replace(/<\/(select|textarea)>/g, '');
  return '<!doctype html><html><head><meta charset="utf-8">'+
    '<title>'+esc(a.name)+' account brief</title><style>'+
    'body{font:14px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,Inter,Roboto,Helvetica,Arial,sans-serif;'+
    'color:#30302F;max-width:760px;margin:40px auto;padding:0 24px}'+
    'h2{font-size:26px;margin:0 0 4px}h4{font-size:12px;text-transform:uppercase;letter-spacing:.09em;'+
    'color:#6E6E6B;margin:22px 0 6px;border-top:1px solid #E4E3E3;padding-top:14px}'+
    'ul,ol{margin:6px 0;padding-left:20px}li{margin-bottom:5px}'+
    '.muted,.tiny{color:#6E6E6B}.tiny{font-size:12px}'+
    '.calcbox{background:#F4FAF8;border:1px solid #D8EAE6;border-radius:9px;padding:12px 14px;margin-top:18px}'+
    '.card,.body{all:unset;display:block}'+
    '@media print{body{margin:0;max-width:none}}'+
    '</style></head><body>'+body+
    '<p class="tiny muted" style="margin-top:30px;border-top:1px solid #E4E3E3;padding-top:12px">'+
    'ZAMSTARS ABM OS. Prepared '+today()+'. Findings marked as hypothesis are unproven and should not be '+
    'presented as fact.</p></body></html>';
}

/* ============================================================
   28. DEMO RESEARCH

   One fictional account researched properly, so the module opens with
   something to look at rather than fourteen empty boxes. Attached to
   the shipped demo only, and only when that account has no research of
   its own, so it can never overwrite real work.
   ============================================================ */
function seedIntel(c){
  if(!c || c.id!=='demo') return;
  const a = (c.accounts||[])[0];
  if(!a) return;
  accIntel(a);
  if((a.findings||[]).length || (a.sites||[]).length) return;

  a.owner = 'Priya N';
  a.jstage = 4;
  a.jhist = [
    { from:0, to:1, evidence:'Fits the profile on portfolio size and has a published 2030 target.', at:'2026-06-02' },
    { from:1, to:2, evidence:'Tier 1 checklist done. Thesis agreed with sales.', at:'2026-06-24' },
    { from:2, to:3, evidence:'Letter sent to the asset director, plus the Salford grid note.', at:'2026-07-14' },
    { from:3, to:4, evidence:'Asset director replied asking what a survey involves.', at:'2026-08-04' }
  ];
  a.nextStep = 'Get the Salford survey booked before the September board paper closes';
  a.nextBy = '2026-09-12';

  a.sources = [
    { id:'src-a', type:'filing', publisher:'Harbourline REIT', title:'Annual report 2025', url:'https://example.com/ar25', pub:'2026-03', acc:'2026-06-02', note:'', q:'5' },
    { id:'src-b', type:'press', publisher:'Harbourline REIT', title:'Salford refurbishment announcement', url:'https://example.com/salford', pub:'2026-05', acc:'2026-06-04', note:'', q:'5' },
    { id:'src-c', type:'news', publisher:'Property Week', title:'Northern REITs and the 2030 deadline', url:'https://example.com/pw', pub:'2026-04', acc:'2026-06-09', note:'', q:'4' },
    { id:'src-d', type:'li',  publisher:'LinkedIn', title:'Asset director profile and posts', url:'https://example.com/li', pub:'', acc:'2026-06-11', note:'', q:'3' }
  ];

  a.research = {
    ident:{ st:'ok',   note:'Listed REIT, four office units in the north west plus two under offer.' },
    strat:{ st:'ok',   note:'2030 net zero target is stated in the annual report and repeated in every investor deck.' },
    fin:{   st:'ok',   note:'Capital programme funded. Refurbishment budget approved for the current year.' },
    prod:{  st:'part', note:'Grade A office landlord. Tenant mix is professional services.' },
    assets:{st:'ok',   note:'Four units. Salford is the one in refurbishment and the obvious place to start.' },
    tech:{  st:'chk',  note:'Car parks appear unmanaged. Nobody has confirmed who maintains them.' },
    need:{  st:'ok',   note:'Tenant renewal conversations are raising charging. No provision at three of four sites.' },
    trig:{  st:'ok',   note:'Salford refurbishment plus the 2030 target plus a renewal cycle in Q1.' },
    comp:{  st:'part', note:'No incumbent at Salford. A regional installer quoted last year and was not appointed.' },
    rel:{   st:'ok',   note:'Asset director replied to the letter. No prior contract.' },
    people:{st:'part', note:'Four mapped. Procurement not identified.' },
    proc:{  st:'none', note:'' },
    chan:{  st:'part', note:'Asset director posts on LinkedIn about retrofit. Attends the northern property forum.' },
    risk:{  st:'ok',   note:'No conflict. Deliverable. Worth the effort.' }
  };

  a.findings = [
    { id:'f-1', area:'strat', title:'A 2030 net zero target is published and repeated', kind:'fact', ver:'ok', conf:'3', srcId:'src-a',
      text:'It appears in the annual report and in every investor deck since. That makes it a commitment somebody is measured on rather than a marketing line.', at:'2026-06-02' },
    { id:'f-2', area:'assets', title:'Salford is in refurbishment with works running to Q2 next year', kind:'fact', ver:'ok', conf:'3', srcId:'src-b',
      text:'The only window where ducting and supply can be designed in rather than retrofitted. After it closes the cost of the same work roughly triples.', at:'2026-06-04' },
    { id:'f-3', area:'need', title:'Three of four sites have no charging provision at all', kind:'fact', ver:'ok', conf:'3', srcId:'src-a',
      text:'Against a published 2030 target and a tenant base that is asking at renewal.', at:'2026-06-05' },
    { id:'f-4', area:'comp', title:'A regional installer quoted last year and was not appointed', kind:'inf', ver:'chk', conf:'2', srcId:'src-c',
      text:'Suggests the objection is commercial model rather than need. Worth finding out what the quote said before we price anything.', at:'2026-06-09' },
    { id:'f-5', area:'need', title:'Tenant renewals are where this becomes urgent for them', kind:'hyp', ver:'new', conf:'2', srcId:'',
      text:'If charging is coming up in renewal conversations then the asset director has a revenue reason as well as a compliance one. Nobody has confirmed this.', at:'2026-06-11' },
    { id:'f-6', area:'proc', title:'Capital spend above a threshold likely needs board approval', kind:'hyp', ver:'new', conf:'1', srcId:'',
      text:'Standard for a listed REIT, but the threshold and the board calendar are unknown. This decides whether the September paper matters.', at:'2026-06-11' }
  ];

  a.sites = [
    { id:'site-1', name:'Salford Quays', type:'office', city:'Salford', status:'refurb', owner:'own',
      size:'420 bay car park', date:'2027-06', opp:'survey', conf:'3',
      need:'Refurbishment is open now, so supply and ducting can be designed in. This is the site that proves the case for the other three.' },
    { id:'site-2', name:'Deansgate Central', type:'office', city:'Manchester', status:'live', owner:'own',
      size:'260 bays', date:'', opp:'target', conf:'2',
      need:'Operating and full. Retrofit cost is higher, so it follows Salford rather than leading.' },
    { id:'site-3', name:'Leeds Waterside', type:'mixed', city:'Leeds', status:'live', owner:'own',
      size:'310 bays', date:'', opp:'target', conf:'2', need:'Tenant mix is asking at renewal.' },
    { id:'site-4', name:'Trafford Park North', type:'ind', city:'Manchester', status:'hand', owner:'dev',
      size:'180 bays', date:'2026-11', opp:'none', conf:'2',
      need:'Handover in November. After that the specification is set and changing it costs somebody money.' }
  ];

  a.people = [
    { id:'p-1', name:'Ellen Whitcombe', title:'Asset Director', fn:'Asset management', sen:'vp', role:'econ',
      infl:'3', auth:'3', rel:'2', eng:'3', owner:'Priya N', verAt:'2026-08', sup:'0', next:'Offer the Salford survey',
      care:'Yield per square foot and the 2030 target. Replied to the letter, which is the only real signal on this account so far.' },
    { id:'p-2', name:'Marcus Oyelaran', title:'Head of Sustainability', fn:'ESG', sen:'head', role:'champ',
      infl:'2', auth:'1', rel:'3', eng:'2', owner:'Priya N', verAt:'2026-08', sup:'0', next:'Send the retrofit note',
      care:'Has to report progress against 2030. Charging is one of the few levers he controls, which makes him the natural champion.' },
    { id:'p-3', name:'Dev Raghunathan', title:'Projects Manager, Salford', fn:'Projects', sen:'mgr', role:'proj',
      infl:'2', auth:'1', rel:'1', eng:'1', owner:'Tom B', verAt:'2026-07', sup:'0', next:'Get on the contractor call',
      care:'Dates and coordination. Cares whether this adds weeks to a programme he is already defending.' },
    { id:'p-4', name:'Sarah Lindqvist', title:'Facilities Lead', fn:'Operations', sen:'head', role:'ops',
      infl:'1', auth:'0', rel:'1', eng:'0', owner:'Tom B', verAt:'2026-07', sup:'0', next:'',
      care:'Will live with whatever gets installed. Nobody has asked her yet, which is usually a mistake.' }
  ];

  a.trigs = [
    { id:'tr-1', type:'refurb', desc:'Salford Quays refurbishment announced, works running to Q2 2027',
      date:'2026-05-12', expiry:'2026-12-01', strength:'3', srcId:'src-b', status:'open',
      action:'Get a survey booked while the design is still open' },
    { id:'tr-2', type:'hand', desc:'Trafford Park North handover due November',
      date:'2026-06-01', expiry:'2026-11-01', strength:'2', srcId:'src-a', status:'open',
      action:'Reach the projects manager before the specification is frozen' },
    { id:'tr-3', type:'engage', desc:'Asset director replied to the letter asking what a survey involves',
      date:'2026-08-04', expiry:'2026-09-15', strength:'3', srcId:'', status:'open',
      action:'Answer within two working days with a date, not a brochure' }
  ];

  a.strategy = {
    objective:'A portfolio agreement covering all four sites, starting with one paid survey at Salford.',
    thesis:'They have published a 2030 target and have no charging at three of four sites. Salford is open for refurbishment right now, which is the only moment the work is cheap. We can show them what their own car park would take before anybody signs anything.',
    whyNow:'The Salford design closes this year and Trafford Park hands over in November. Both windows shut on their own schedule rather than ours.',
    priority:'Salford Quays. It is the one site where the cost argument is on our side.',
    value:'Charging revenue per bay plus a defensible line in the 2030 report. They can check both against their own numbers rather than taking ours.',
    champion:'Marcus in sustainability. He has to report progress and this is one of the few levers he controls.',
    access:'Direct. The asset director has already replied, so the door is open and the job now is not to waste it.',
    proof:'The Ashcroft rollout, because it is the same shape of portfolio and the numbers came from the client rather than from us.',
    offer:'A free grid assessment of Salford Quays, delivered as a short written report.',
    obstacles:'Procurement is unmapped, so we do not know who signs. A regional installer quoted last year and lost, and nobody knows why.',
    success:'Survey completed, findings presented to the asset director and one other, and a second site named.',
    exit:'If no survey is booked by the end of October the Salford window has closed. Move to nurture and come back at Trafford Park.',
    questions:[
      'What did the installer quote last year, and what stopped it?',
      'Is charging coming up in tenant renewal conversations, or are we assuming that?',
      'What size of capital spend needs board approval, and when does the board sit?',
      'Who signs a contract like this, and have they signed one before?'
    ]
  };
}
