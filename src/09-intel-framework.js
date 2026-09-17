
/* ============================================================
   24. ACCOUNT INTELLIGENCE: THE TAXONOMIES

   Everything in this file is method rather than data. Change it here
   and every account in every programme picks the change up.

   The rule the module is built around: a claim about a company is
   either something we can show a source for, something we inferred
   from other facts, or something we made up and want to test. The
   data model refuses to let those three blur together.
   ============================================================ */

/* ---------- the fourteen research areas, from the brief ---------- */
const RESEARCH_AREAS = [
  { k:'ident',  n:'Company and structure',   c:C.violet, t1:1, t2:1, t3:1,
    q:'Who exactly are we selling to, and what else do they own?',
    ask:['Legal and trading names, verified domains','Headquarters and operating regions','Industry, sub industry, business model','Revenue and employee scale','Parent, subsidiaries and brands','Ownership and investors','Acquisitions and disposals','Financial year and budget cycle'] },

  { k:'strat',  n:'Strategic priorities',    c:C.pink,   t1:1, t2:1, t3:0,
    q:'What has leadership already committed to in public?',
    ask:['Stated growth priorities','New markets and expansion','Transformation programmes','Customer or employee experience work','Efficiency and cost programmes','Sustainability commitments','Technology modernisation','The words leadership actually uses'] },

  { k:'fin',    n:'Performance and capacity', c:C.gold,   t1:1, t2:0, t3:0,
    q:'Can they fund this, and is the money loose or tight?',
    ask:['Revenue and direction of travel','Margin pressure or profitability','Capital expenditure','Funding and investment events','Debt or restructuring signals','Cost control programmes','Ability to approve at the size we need'] },

  { k:'prod',   n:'Products and customers',   c:C.teal,   t1:1, t2:1, t3:0,
    q:'What do they sell, to whom, and what do they promise?',
    ask:['Principal products and services','Main customer segments','The experience they promise','Geographic markets','Important partnerships','Premium or value positioning'] },

  { k:'assets', n:'Properties and footprint', c:C.violet, t1:1, t2:1, t3:0,
    q:'Which building do we start in? This is where the opportunity lives.',
    ask:['Buildings, campuses, sites','Owned, leased, operated or managed','Number and distribution','Size and density','New build, refurbishment or handover','Architects, contractors, consultants','Owners, operators, facility managers','Connectivity sensitive areas','Evidence of coverage problems'] },

  { k:'tech',   n:'Technology and vendors',   c:C.ink3,   t1:1, t2:0, t3:0,
    q:'What is already installed, and who put it there?',
    ask:['Relevant technology stack','Current infrastructure model','Known suppliers and partners','Network or connectivity strategy','Recent tenders and contracts','Renewal or replacement indicators','Security and compliance expectations','Signs of satisfaction or otherwise'] },

  { k:'need',   n:'Problems and hypotheses',  c:C.pink,   t1:1, t2:1, t3:1,
    q:'What is going wrong, and how sure are we?',
    ask:['Problem statement','Who it affects','Business impact','What they do about it today','Cost of doing nothing','Which of our solutions applies','The question that would confirm it'] },

  { k:'trig',   n:'Triggers and timing',      c:C.gold,   t1:1, t2:1, t3:1,
    q:'Why would they act this quarter rather than next year?',
    ask:['New sites or expansion','Renovation or redevelopment','Handover and launch dates','Acquisition or merger','New senior leadership','Funding or capital expenditure','Tender or RFP published','Contract expiry','Service incidents or complaints','Regulation or compliance deadline','Hiring patterns'] },

  { k:'comp',   n:'Competitors and alternatives', c:C.ink, t1:1, t2:1, t3:0,
    q:'Who is already there, and what would it take to displace them?',
    ask:['Known incumbent','Other vendors in play','The do nothing option','Switching barriers','Incumbent strengths','Evidenced incumbent weaknesses','Our relevant difference','Proof needed to displace'] },

  { k:'rel',    n:'Relationships and access',  c:C.teal,   t1:1, t2:1, t3:0,
    q:'How do we get in the room without cold calling?',
    ask:['Existing or past customer','Previous proposals, won and lost','Known relationships','Shared connections','Former colleagues now inside','Partner introduction paths','Events attended together','Unresolved objections','Last meaningful contact'] },

  { k:'people', n:'The buying committee',      c:C.violet, t1:1, t2:1, t3:1,
    q:'Who has to say yes, and who can stop it?',
    ask:['Name, verified title, location','Buying role and seniority','What they are measured on','Influence and authority','Attitude toward us','Who owns the relationship','Permitted channel','Date last verified'] },

  { k:'proc',   n:'How they buy',              c:C.ink3,   t1:1, t2:0, t3:0,
    q:'What is the path from yes to signed?',
    ask:['Typical purchasing process','Tender or approved vendor requirements','Budget owner','Technical approval','Security, legal and compliance review','Contracting entity','Procurement calendar','Decision criteria','Pilot or proof requirements','Who can stop it'] },

  { k:'chan',   n:'Content and channels',      c:C.teal,   t1:1, t2:1, t3:1,
    q:'Where do these people actually pay attention?',
    ask:['Topics they discuss publicly','Events attended','Associations and communities','Publications followed','Formats that get engagement','Engagement with our own material','Preferred contact channel'] },

  { k:'risk',   n:'Risks and reasons to stop', c:C.pink,   t1:1, t2:1, t3:1,
    q:'What would make us walk away, and have we checked?',
    ask:['Poor fit against the profile','Too small to be worth it','Geography we cannot serve','Exclusive incumbent contract','No capacity to deliver','Account or channel conflict','Legal or reputation concern','No realistic route in','No trigger at all','Duplicate account','Suppression or opt out'] }
];
const AREA = {}; RESEARCH_AREAS.forEach(a=>AREA[a.k]=a);

/* Research area status. Deliberately includes "stale" and "needs checking",
   because a research tool that only knows done and not done will quietly
   present two year old facts as current. */
const AREA_ST = [
  ['none','Missing',        '#B9B8B6'],
  ['part','Partly done',    C.gold],
  ['chk', 'Needs checking', C.pink],
  ['old', 'Stale',          '#8A6206'],
  ['ok',  'Complete',       C.teal],
  ['na',  'Not applicable', '#B9B8B6']
];
const AREA_ST_L={}, AREA_ST_C={}; AREA_ST.forEach(s=>{ AREA_ST_L[s[0]]=s[1]; AREA_ST_C[s[0]]=s[2]; });

/* ---------- fact, inference, hypothesis ---------- */
const FIND_KIND = [
  ['fact','Fact',       'Direct evidence says so',                    C.teal],
  ['inf', 'Inference',  'Several facts point this way',               C.violet],
  ['hyp', 'Hypothesis', 'We think this and want to test it',          C.gold]
];
const KIND_L={}, KIND_C={}; FIND_KIND.forEach(k=>{ KIND_L[k[0]]=k[1]; KIND_C[k[0]]=k[3]; });

const VERIFY = [
  ['new','Not reviewed',    '#B9B8B6'],
  ['ok', 'Verified',        C.teal],
  ['chk','Needs confirming',C.gold],
  ['old','Outdated',        '#8A6206'],
  ['no', 'Rejected',        C.pink]
];
const VER_L={}, VER_C={}; VERIFY.forEach(v=>{ VER_L[v[0]]=v[1]; VER_C[v[0]]=v[2]; });

const CONF = [['3','High'],['2','Medium'],['1','Low']];

/* ---------- source quality, the five point hierarchy ---------- */
const SRC_Q = [
  ['5','Primary verified',    'Filing, official announcement, our own record', C.teal],
  ['4','Quality secondary',   'Reputable journalism or recognised database',   C.violet],
  ['3','Corroborated signal', 'Two or more credible indirect sources',         C.gold],
  ['2','Single unverified',   'One indirect source, wants confirming',         '#8A6206'],
  ['1','Hypothesis',          'Reasoning without direct confirmation',         C.pink]
];
const SRCQ_L={}, SRCQ_C={}; SRC_Q.forEach(s=>{ SRCQ_L[s[0]]=s[1]; SRCQ_C[s[0]]=s[3]; });

const SRC_TYPE = [
  ['site','Company website'],['filing','Filing or annual report'],['press','Press release'],
  ['news','News or trade press'],['gov','Government or regulator'],['tender','Tender portal'],
  ['db','Industry database'],['li','LinkedIn or Sales Navigator'],['event','Event or conference'],
  ['crm','Our CRM or records'],['person','Conversation or interview'],['other','Other']
];

/* ---------- the ten buying roles ---------- */
const BUY_ROLES = [
  ['econ',  'Economic buyer',      'Holds the budget and carries the return',       C.pink,   1],
  ['dec',   'Decision maker',      'Says yes or no on the recommendation',          C.pink,   1],
  ['tech',  'Technical evaluator', 'Judges whether it works and fits',              C.violet, 1],
  ['ops',   'Operational owner',   'Lives with it after we leave',                  C.teal,   1],
  ['proc',  'Procurement or legal','Owns terms, price and the contract',            C.ink,    0],
  ['champ', 'Champion',            'Sells it internally when we are not there',     '#0d7d70',1],
  ['infl',  'Influencer',          'Shapes the view without holding the decision',  C.ink3,   0],
  ['block', 'Blocker',             'Has a reason to stop it',                       '#8A6206',0],
  ['user',  'End user',            'Feels the problem daily',                       C.gold,   0],
  ['sponsor','Executive sponsor',  'Opens doors from the top',                      C.violet, 0]
];
const ROLE2_L={}, ROLE2_C={}, ROLE2_CORE={};
BUY_ROLES.forEach(r=>{ ROLE2_L[r[0]]=r[1]; ROLE2_C[r[0]]=r[3]; ROLE2_CORE[r[0]]=r[4]; });
/* The five marked core are the ones a Tier 1 account cannot progress without.
   Everything else is useful rather than required, and the coverage score
   says so rather than pretending all ten matter equally. */
const CORE_ROLES = BUY_ROLES.filter(r=>r[4]).map(r=>r[0]);

const SENIORITY = [['cxo','C level'],['vp','VP or director'],['head','Head of'],['mgr','Manager'],['ic','Individual']];
const STRENGTH  = [['0','None'],['1','Cold'],['2','Aware of us'],['3','Warm'],['4','Trusted']];
const LEVEL     = [['0','Unknown'],['1','Low'],['2','Medium'],['3','High']];
const ATTITUDE  = [['','Unknown'],['pos','Positive'],['neu','Neutral'],['neg','Negative']];

/* ---------- sites ---------- */
const SITE_TYPE = [
  ['office','Office'],['mixed','Mixed use'],['retail','Retail or mall'],['hotel','Hotel'],
  ['hosp','Hospital'],['campus','Campus'],['ind','Industrial or warehouse'],
  ['res','Residential'],['data','Data centre'],['other','Other']
];
const SITE_STATUS = [
  ['plan','Planned',        C.ink3],
  ['const','Under construction', C.gold],
  ['fit','Fit out',         C.violet],
  ['hand','Handover due',   C.pink],
  ['live','Operating',      C.teal],
  ['refurb','Refurbishment',C.violet]
];
const SITE_ST_L={}, SITE_ST_C={}; SITE_STATUS.forEach(s=>{ SITE_ST_L[s[0]]=s[1]; SITE_ST_C[s[0]]=s[2]; });
const SITE_HOLD = [['own','Owned'],['lease','Leased'],['op','Operated'],['mgd','Managed'],['dev','Developing']];
const SITE_OPP  = [['none','Not assessed'],['target','Target'],['survey','Survey requested'],['prop','Proposed'],['won','Won'],['lost','Lost']];

/* ---------- triggers ---------- */
const TRIG_TYPE = [
  ['site','New site or property'],['expand','Expansion into a new city'],['refurb','Renovation or redevelopment'],
  ['hand','Handover or launch date'],['ma','Acquisition or merger'],['leader','New senior leadership'],
  ['fund','Funding or capital expenditure'],['tender','Tender or RFP published'],['expiry','Contract expiry'],
  ['incident','Complaint or service incident'],['reg','Regulation or deadline'],['digital','Smart building or digital programme'],
  ['hiring','Hiring pattern'],['compete','Competitor deployment'],['earn','Earnings call statement'],['engage','Engaged with our material']
];
const TRIG_STR = [['3','Strong'],['2','Moderate'],['1','Weak']];
const TRIG_ST  = [['open','Open'],['acted','Acted on'],['expired','Expired'],['ignored','Deliberately ignored']];

/* ---------- the account journey, stages 0 to 9 ----------
   Contact activity rolls up but never moves the stage on its own.
   A human moves it, and the gate says what should be true first. */
const JSTAGES = [
  { n:0, k:'cand',  nav:'Candidate',        c:'#B9B8B6',
    d:'Somebody suggested this company. Nobody has checked it yet.',
    gate:['Basic company facts recorded','A possible use case written down','A reviewer assigned'] },
  { n:1, k:'qual',  nav:'Qualified target', c:C.ink3,
    d:'It fits the profile and is worth real time.',
    gate:['Tier agreed','Our solution mapped to their situation','No conflict or disqualifying reason'] },
  { n:2, k:'res',   nav:'Researched',       c:C.violet,
    d:'The research standard for its tier is met.',
    gate:['Tier checklist complete','Account thesis written','Buying committee started','Risks and unknowns listed'] },
  { n:3, k:'aware', nav:'Aware',            c:C.gold,
    d:'Relevant people have seen something from us. Nothing has come back yet.',
    gate:['At least one approved touch delivered','To a named person on the committee'] },
  { n:4, k:'eng',   nav:'Engaged',          c:C.gold,
    d:'One relevant person has done something meaningful.',
    gate:['A substantive reply, an attendance, or repeated high value activity','From somebody on the committee, not a general enquiry'] },
  { n:5, k:'multi', nav:'Multi threaded',   c:C.pink,
    d:'Two or more of the committee are engaged, or a champion is opening doors.',
    gate:['Two or more committee members engaged','Or one champion actively connecting others'] },
  { n:6, k:'meet',  nav:'Meeting held',     c:C.pink,
    d:'A real business or technical conversation has happened or is firmly booked.',
    gate:['Attendees recorded','Problem discussed and captured','Timing and process understood','An agreed next step'] },
  { n:7, k:'opp',   nav:'Validated opportunity', c:C.teal,
    d:'Sales confirms a real problem, a fit, the people, the timing and the money.',
    gate:['Sales owner has confirmed it','Value and timing estimated','Recorded in the CRM as the system of record'] },
  { n:8, k:'eval',  nav:'Evaluation',       c:C.teal,
    d:'They are assessing, piloting, or reading a proposal.',
    gate:['Assessment, pilot or proposal in progress','Decision criteria known','Decision date estimated'] },
  { n:9, k:'close', nav:'Closed',           c:C.ink,
    d:'Won, lost, paused or moved to nurture. Reason recorded either way.',
    gate:['Outcome reason recorded','Lessons written down for the next one'] }
];
const JS_BY_K={}; JSTAGES.forEach(s=>JS_BY_K[s.k]=s);

const ACC_STATUS = [
  ['active',  'Active',       C.teal],
  ['pause',   'Paused',       C.gold],
  ['nurture', 'Nurture',      C.violet],
  ['disq',    'Disqualified', C.ink3]
];
const ACCST_L={}, ACCST_C={}; ACC_STATUS.forEach(s=>{ ACCST_L[s[0]]=s[1]; ACCST_C[s[0]]=s[2]; });

const DISQ_REASONS = [
  'Does not fit the profile','Too small to be worth the effort','Geography we cannot serve',
  'Locked into an incumbent contract','We lack capacity to deliver','Account or channel conflict',
  'Legal, compliance or reputation concern','No realistic route in','No trigger and no timeline',
  'Duplicate of another account','Asked not to be contacted'
];

/* ---------- what each tier owes ----------
   Research depth is the thing that should change between tiers.
   Everything else follows from it. */
const TIER_SPEC = {
  t1:{ label:'Tier 1', mode:'One to one',  c:C.gold,   people:[5,10], vol:'5 to 15 accounts',
       review:'Weekly', scan:'Weekly trigger scan, monthly full review',
       must:['ident','strat','fin','prod','assets','tech','need','trig','comp','rel','people','proc','chan','risk'],
       goal:'A strategic opportunity built account by account.' },
  t2:{ label:'Tier 2', mode:'One to few',  c:C.violet, people:[3,6],  vol:'20 to 75 accounts',
       review:'Fortnightly', scan:'Fortnightly trigger scan, quarterly full review',
       must:['ident','strat','prod','assets','need','trig','comp','rel','people','chan','risk'],
       goal:'Repeatable opportunities across a cluster that shares a problem.' },
  t3:{ label:'Tier 3', mode:'One to many', c:C.teal,   people:[1,3],  vol:'75 accounts and up',
       review:'Monthly', scan:'Monthly trigger scan, six monthly full review',
       must:['ident','need','trig','people','chan','risk'],
       goal:'Find the accounts worth promoting. Not to absorb budget.' }
};

/* ---------- the five sub scores ----------
   Kept separate on purpose. A single blended number hides the fact that
   a great account we cannot reach and a reachable account nobody needs
   score the same. */
const SUBSCORES = [
  { k:'fit',   n:'Fit',          c:C.violet, q:'Should our client want this account at all?' },
  { k:'timing',n:'Timing',       c:C.gold,   q:'Is there a reason to act this quarter?' },
  { k:'intent',n:'Intent',       c:C.pink,   q:'Have they shown us anything?' },
  { k:'cover', n:'Coverage',     c:C.teal,   q:'Do we know enough of the buying committee?' },
  { k:'access',n:'Access',       c:'#8A6206',q:'Can we credibly get into the room?' }
];

/* ---------- next best action rules ----------
   Every rule states its own reason. Nothing recommends an action it
   cannot explain, and nothing is auto sent. */
const NBA_RULES = [
  { k:'disq',   urg:3, when:(m)=> m.a.status==='disq',
    act:'Leave this account alone',
    why:(m)=> 'Disqualified: '+(m.a.statusWhy||'no reason recorded')+'. Remove it from active reporting.' },

  { k:'noowner',urg:3, when:(m)=> m.st>=1 && !m.a.owner,
    act:'Give this account an owner',
    why:()=> 'It has passed qualification with nobody accountable for it. Every later rule assumes an owner exists.' },

  { k:'gap',    urg:3, when:(m)=> m.st>=2 && m.gaps.length>0 && m.tier!=='t3',
    act:(m)=> 'Find the '+m.gaps.map(g=>ROLE2_L[g].toLowerCase()).join(' and the '),
    why:(m)=> 'The committee is missing '+m.gaps.length+' of the '+CORE_ROLES.length+' roles that decide this. Reaching the ones we know will not move it.' },

  { k:'trigcold',urg:3, when:(m)=> m.openTrig>0 && m.st<3,
    act:'Open a conversation on the live trigger now',
    why:(m)=> m.openTrig+' trigger'+(m.openTrig>1?'s are':' is')+' open and nobody has been contacted. Trigger windows close.' },

  { k:'thesis', urg:2, when:(m)=> m.st>=2 && !(m.a.strategy&&m.a.strategy.thesis),
    act:'Write the account thesis',
    why:()=> 'Research is done but nobody has said in one sentence why this company should care. Outreach without it is a template.' },

  { k:'unsourced',urg:2, when:(m)=> m.unsourced>=3,
    act:'Put sources on the findings that have none',
    why:(m)=> m.unsourced+' findings carry no source. Any of them could reach a buyer and none of them can be defended.' },

  { k:'hypover',urg:2, when:(m)=> m.facts>0 && m.hyps > m.facts,
    act:'Test the hypotheses or drop them',
    why:(m)=> 'This account rests on '+m.hyps+' hypotheses against '+m.facts+' verified facts. It is a story, not a case.' },

  { k:'stale',  urg:2, when:(m)=> m.stale>0,
    act:'Refresh the stale research',
    why:(m)=> m.stale+' area'+(m.stale>1?'s have':' has')+' gone stale for a '+TIER_SPEC[m.tier].label+' account on a '+TIER_SPEC[m.tier].review.toLowerCase()+' cadence.' },

  { k:'single', urg:2, when:(m)=> m.st===4 && m.engaged<2,
    act:'Bring in a second person before pushing further',
    why:()=> 'One engaged contact is a relationship, not a deal. Single threaded accounts die when that person moves.' },

  { k:'nostep', urg:3, when:(m)=> m.st===6 && !m.a.nextStep,
    act:'Get the next step agreed in writing',
    why:()=> 'A meeting happened and no next step was recorded. This is where accounts quietly stop.' },

  { k:'nosite', urg:2, when:(m)=> m.st>=2 && m.sites===0,
    act:'Name the first property to go after',
    why:()=> 'No site is recorded. The opportunity is a building rather than a company, so the account cannot progress without one.' },

  { k:'checklist',urg:1, when:(m)=> m.st>=1 && m.cover<60,
    act:'Finish the tier research checklist',
    why:(m)=> 'Research is '+m.cover+'% complete against the '+TIER_SPEC[m.tier].label+' standard.' },

  { k:'noeng',  urg:1, when:(m)=> m.st===3 && m.touches>=4,
    act:'Change the message or pause the account',
    why:(m)=> m.touches+' touches have produced nothing. Sending a fifth version of the same idea will not work.' },

  { k:'quiet',  urg:1, when:(m)=> m.st>=3 && m.st<7 && m.openTrig===0 && m.intent<3,
    act:'Look for a fresh trigger',
    why:()=> 'The account is in flight with no live trigger and little intent. Something has to justify the next call.' },

  { k:'promote',urg:2, when:(m)=> m.tier==='t3' && m.intent>=6,
    act:'Promote this account out of Tier 3',
    why:()=> 'Tier 3 exists to find accounts worth more attention. This one is showing intent and is being treated as air cover.' },

  { k:'exit',   urg:1, when:(m)=> m.a.strategy && m.a.strategy.exit && m.st>=3 && m.intent<2 && m.touches>=6,
    act:'Check this against your own exit criteria',
    why:(m)=> 'You wrote: '+String(m.a.strategy.exit).slice(0,90) }
];

const URG = { 3:['Now', C.pink], 2:['This week', C.gold], 1:['When you can', C.ink3] };
