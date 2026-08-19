/* ============================================================
   0. BRAND + FRAMEWORK CONSTANTS
   ============================================================ */
const STAR = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M42 4h16v27l19-19 11 11-19 19h27v16H69l19 19-11 11-19-19v27H42V69L23 88 12 77l19-19H4V42h27L12 23l11-11 19 19V4z"/></svg>';

const C = { pink:'#CA366A', violet:'#5B3FA8', gold:'#F5B62C', teal:'#12A594', ink:'#30302F', ink3:'#6E6E6B' };

/* The ZAMSTARS Value Grid. Every stage sits on one band of it. */
const VG = {
  acq: { key:'acq', label:'Acquisition', cls:'vg-acq', colour:C.pink },
  exp: { key:'exp', label:'Experience', cls:'vg-exp', colour:C.violet },
  ret: { key:'ret', label:'Retention', cls:'vg-ret', colour:C.teal },
  adv: { key:'adv', label:'Advocacy',  cls:'vg-adv', colour:C.gold },
  all: { key:'all', label:'Full Value Grid', cls:'vg-all', colour:C.ink3 }
};

/* ------------------------------------------------------------
   How accounts get scored. Seven things we rate out of ten,
   weighted into a mark out of a hundred. The weights belong to
   the client, so they are editable.
   ------------------------------------------------------------ */
const SCORE_FACTORS = [
  { k:'pot',   label:'Revenue potential',    w:25, hint:'What the whole account is worth if we win all of it.' },
  { k:'fit',   label:'Portfolio fit',        w:20, hint:'Size, density, number of sites, whether they need more than one operator.' },
  { k:'trig',  label:'Live trigger',         w:20, hint:'Is something happening right now that gives us a reason to call this week?' },
  { k:'geo',   label:'Can we deliver',       w:10, hint:'Can we actually serve them, at this standard, today?' },
  { k:'brand', label:'Reference value',      w:10, hint:'What winning this does for every other conversation in the segment.' },
  { k:'rel',   label:'Warm door',            w:10, hint:'A prior contract, a group relationship, someone who can make an introduction.' },
  { k:'eng',   label:'Signs of interest',    w:5,  hint:'Things we have actually seen them do: visits, downloads, replies, turning up.' }
];
const TIER_BANDS = { t1:74, t2:52 };

/* ------------------------------------------------------------
   The six people who show up on an enterprise decision. Titles
   change from company to company. These six roles do not.
   ------------------------------------------------------------ */
const COMMERCIAL_ROLES = [
  ['econ',  'Holds the budget',    'Return, risk, whether this scales, what the deal looks like',   'A business case with their own portfolio numbers in it', C.pink],
  ['tech',  'Judges the design',   'Architecture, security, performance, how it fits what they run', 'An architecture note and a working session with our engineers', C.violet],
  ['ops',   'Lives with it daily', 'Uptime, maintenance, how much disruption it causes them',        'The SLA, how monitoring works, a case study from someone like them', C.teal],
  ['proj',  'Controls the timeline','Dates, drawings, coordination with everyone else on site',      'A rollout plan and a checklist they can hand to their contractor', '#8A6206'],
  ['proc',  'Signs the contract',  'Price, terms, whether we will still exist in year seven',       'Total cost of ownership, our credentials, answers to the awkward questions', C.ink],
  ['champ', 'Sells it internally', 'Getting colleagues on side and getting it approved',            'A deck they can present as their own, plus an email they can forward', '#0d7d70']
];
const ROLE_LBL = {}; const ROLE_COL = {};
COMMERCIAL_ROLES.forEach(r=>{ ROLE_LBL[r[0]]=r[1]; ROLE_COL[r[0]]=r[4]; });

/* ------------------------------------------------------------
   Four layers of measurement, in order. Lead-generation numbers
   applied to ABM will tell you a confident lie.
   ------------------------------------------------------------ */
const LAYERS = {
  cov:  { key:'cov',  label:'Coverage',    q:'Do we even know who we are selling to?',            colour:C.ink3,   vg:'acq' },
  eng:  { key:'eng',  label:'Engagement',  q:'Are the right people answering?',                   colour:C.pink,   vg:'acq' },
  prog: { key:'prog', label:'Progression', q:'Is any of that turning into real conversations?',    colour:C.violet, vg:'exp' },
  comm: { key:'comm', label:'Commercial',  q:'Did it make money, and at what cost?',              colour:C.teal,   vg:'ret' }
};

/* ------------------------------------------------------------
   The stages. The order matters more than the contents.
   ------------------------------------------------------------ */
const STAGES = [
  { id:'exec', n:0, group:'exec', nav:'Start Here', title:'Here is the whole idea on one page',
    vg:'all',
    sub:'Why this business suits account-based marketing, what we are actually proposing to do, how it will run week to week, and the numbers we are happy to be judged on. Open the meeting on this screen and close it on this screen.',
    decide:'Are we agreed on the why, the what, the how and the measures?',
    notes:'Read the thesis out loud, then let them correct it. The sentence that matters most is under WHAT: this is a revenue programme that marketing and sales run together, not an ad campaign with a narrow audience. Everything else in the app exists to keep that sentence true.' },

  { id:'foundation', n:1, group:'build', nav:'Their Business', title:'Get their business right first',
    vg:'all',
    sub:'Before we name a single account we agree what they sell, how the money actually works, and what evidence we can put in front of a buyer. Every number and every line of copy later on comes from this page.',
    decide:'Have we described the offer, the proof and the goal correctly?',
    notes:'Do not mention ABM yet. Talk about their business. Read the profile back and let them fix it. Those corrections are the moment they start trusting you, because it shows the tool bends to them rather than the other way round.' },

  { id:'icp', n:2, group:'build', nav:'Who To Target', title:'Decide who is worth going after',
    vg:'acq',
    sub:'ABM falls apart when the target is everyone with a building. Here we write down who fits, who does not, and which groups deserve a different story. What you decide here shapes the account list, the personas and the journey.',
    decide:'Which segments are in for the pilot, and what takes an account off the list?',
    notes:'This is where you earn the fee. Their website talks to seven industries in one voice, which is a positioning problem rather than a traffic problem. The list clients remember is the second one, the reasons to walk away. An agency that tells you which accounts to drop is thinking about your margin.' },

  { id:'accounts', n:3, group:'build', nav:'The Account List', title:'Name the accounts, then rank them',
    vg:'acq',
    sub:'A written list, scored and sorted. Seven factors, each out of ten, weighted into a mark out of a hundred. The mark sets the tier and the tier sets how much we spend per account. The weights are a commercial judgement, so they are yours to argue with.',
    decide:'Do we agree the weights, the scores, and that sales will chase every name on this list?',
    notes:'Change a weight in front of them. Set reference value to zero and a famous logo drops out of Tier 1. Push warm door up to forty and Tier 1 shrinks to the handful where somebody already knows somebody. Then ask the awkward question: will sales actually chase all of these? If not, take them off.' },

  { id:'committee', n:4, group:'build', nav:'Who Says Yes', title:'Map everyone who has to agree',
    vg:'acq',
    sub:'Six people show up on a decision like this, and each one cares about something different. One deal, six arguments, six different things to hand over. Which is also why outreach has to reach more than one inbox.',
    decide:'Is anyone missing, and does each person get the right thing from us?',
    notes:'Ask who killed their last big deal. It is almost never the champion. It is finance, or legal, or a projects manager nobody briefed. Then show them the coverage grid. Empty columns on a live deal are the best warning sign you will get.' },

  { id:'intel', n:5, group:'build', nav:'Buying Signals', title:'Watch for reasons to call',
    vg:'acq',
    sub:'A trigger is something you can see happening that gives you a reason to ring someone this week. We weight each one, say where we watch it from, and commit to how fast we respond. A trigger acted on in two days and the same trigger acted on three weeks later are not worth the same.',
    decide:'Which triggers do we watch, who owns each source, and how fast do we move?',
    notes:'This is the bit that separates ABM from a mail merge. Push on speed. Ask how long it takes today between a prospect announcing something and somebody picking up the phone. The gap between that answer and two days is roughly what the programme is worth.' },

  { id:'journey', n:6, group:'build', nav:'How They Buy', title:'Map how they actually buy',
    vg:'all',
    sub:'What follows is a draft, not an answer. Switch the persona lens to see the same journey through somebody else\'s eyes, change any cell, add a stage or take one out. Each stage carries what the buyer is thinking, the question in their head, where we meet them, what does the work, and the one number that proves it happened.',
    decide:'Is this how buying really goes here, and where does it get stuck?',
    notes:'Slow down here. This is the centre of the whole thing. Get them to change one cell. The moment a client edits the journey it stops being your deck and becomes their plan. Then ask which stage loses them the most deals. Whatever they answer becomes the priority for everything else.' },

  { id:'messaging', n:7, group:'build', nav:'What We Say', title:'Write what we actually say',
    vg:'acq',
    sub:'One sentence the whole company can stand behind, then a version of it for each person on the committee, with the evidence that stops it being a claim. If a line cannot name the problem it removes, it is decoration.',
    decide:'Would these lines survive being said to a real buyer?',
    notes:'Read the core message aloud, then the audience lines. If the Head of Marketing winces, that is useful, so rewrite it in the room. Make the rule explicit too: seamless connectivity is not a differentiator, because every competitor already says it.' },

  { id:'plays', n:8, group:'build', nav:'The Plays', title:'Pick the plays and price them',
    vg:'exp',
    sub:'Tier 1 gets work built for one named company. Tier 2 gets work shared across a group with the same problem. Tier 3 gets air cover so nobody is ever calling cold. Every play carries one next step, because a play without a next step is just content. Turn one off and the plan, the money and the dashboard all move.',
    decide:'What is in scope, at what cost, and which assets have to exist first?',
    notes:'Let them switch plays on and off and watch the money move. Then go down to the asset kit and be blunt. Nothing goes live until the must-have assets exist. Clients love a plan and underestimate the production behind it, so showing the kit now saves you an argument in week eight.' },

  { id:'roadmap', n:9, group:'build', nav:'The 90 Days', title:'Lay out the first ninety days',
    vg:'exp',
    sub:'Seven phases, from getting the strategy agreed to deciding whether to scale it, revise it or stop. Every row has an owner, a status and something you can point at when it is done. Underneath sits the operating model and the five things that will stall this if nobody owns them.',
    decide:'Who owns what, and are the blockers cleared before we start spending?',
    notes:'Assign owners live, theirs included. A programme with no client-side owner dies in week three, so say that plainly. Then walk the dependency list. Sales ownership assigned, CRM reviewed, claims checked, routing tested, follow-up agreed. Leave any one of those open and week eight goes wrong.' },

  { id:'measure', n:10, group:'build', nav:'How We Measure', title:'Agree the numbers before we start',
    vg:'all',
    sub:'Four layers, in this order: coverage, engagement, progression, commercial. You cannot honestly report engagement on accounts whose committee you never mapped, and you cannot claim revenue impact with nothing underneath it. Every metric gets a baseline, a target and an owner, agreed now rather than argued about later.',
    decide:'Are these the numbers we will be judged on in ninety days?',
    notes:'Push hard on baselines. If they cannot give you one, write unknown and make finding it a week one job. That is a finding, not a gap. Gartner\'s guidance is worth quoting here: account and pipeline metrics, never lead-generation metrics. Then close the build by pointing at the readiness ring.' },

  { id:'dashboard', n:11, group:'run', nav:'Dashboard', title:'See where everything stands',
    vg:'all',
    sub:'How good the list is, where each account sits, how the funnel is converting, which plays are earning their money, and how every metric is tracking against what we agreed.',
    decide:'What are we changing this week?',
    notes:'Frame this as what they get every Monday morning. The dashboard is the retainer. The strategy is the reason it exists.' },

  { id:'log', n:12, group:'run', nav:'Log The Work', title:'Log what actually happened',
    vg:'all',
    sub:'Where the team writes down what they did. Move an account along, tick off the people you reached, count touches and meetings, and post one reading per play. Everything on the dashboard comes from here.',
    decide:'Is this light enough that the team will actually keep it up?',
    notes:'Log one entry live and flip back to the dashboard so they watch a number move. That closes the loop from strategy to evidence in about eight seconds, which is usually the moment somebody asks how much it costs.' },

  { id:'method', n:13, group:'ref', nav:'Our Method', title:'Why we work in this order',
    vg:'all',
    sub:'The thinking behind the sequence, how the tier money works, who does what, and the rules we hold ourselves to. Use this page if somebody challenges the method.',
    decide:'',
    notes:'Keep this one in your back pocket. Open it only if someone pushes on methodology, and then you are answering with a page rather than improvising.' }
];

const STAGE_IX = {}; STAGES.forEach((s,i)=>STAGE_IX[s.id]=i);
const BUILD_STAGES = ()=> STAGES.filter(s=>s.group==='build'||s.group==='exec');

/* ------------------------------------------------------------
   Industry archetypes. The URL reader scores page text against
   these, then generates a first-draft journey and committee.
   ------------------------------------------------------------ */
const ARCHETYPES = {
  infra: {
    label:'Infrastructure and deployed services',
    blurb:'Long cycles, capex-shy buyers, lots of stakeholders, delivered site by site. Win one asset, then spread across the portfolio.',
    kw:['infrastructure','building','deploy','network','installation','site','facility','fibre','fiber','das','wifi','wi-fi','telecom','construction','property','asset','maintenance','uptime','capex','managed services','engineering','mep'],
    cycle:'6 to 14 months', motion:'Land one asset, then spread across the portfolio',
    journey:[
      ['Not their problem yet','Thinks somebody else owns this. The operator, the ISP, whoever fitted it out last.','Whose problem is this, actually?','ret'],
      ['Now it is theirs','A complaint, a lost renewal or an audit makes it land on their desk.','What is this costing me?','acq'],
      ['Working out the options','Finds out there is a category here and starts comparing approaches.','What are my options and what do they cost?','acq'],
      ['Building a shortlist','Scale, references and the commercial model matter more than features.','Who can do this at my size without falling over?','acq'],
      ['Proving it works','Site survey, audit, design review. This is where it gets real.','Will this actually work in my building?','exp'],
      ['Getting it approved','The model, access rights, the SLA, procurement, legal.','Can we get this past finance and legal?','exp'],
      ['First site goes live','Delivery is the marketing now.','Did they do what they said?','exp'],
      ['Rolling it out','The next assets, and the revenue that actually matters.','Where do we do this next?','ret'],
      ['Happy to say so','References, joint content, a slot on a conference stage.','Will I put my name to this?','adv']
    ]
  },
  saas: {
    label:'B2B software and platforms',
    blurb:'Shorter cycles, usually driven by one champion inside the business, and growth comes from more seats and more modules.',
    kw:['software','platform','saas','cloud','api','dashboard','integration','subscription','users','seats','analytics','automation','app'],
    cycle:'1 to 6 months', motion:'One champion gets you in, then you grow team by team',
    journey:[
      ['Coping','Working around it with spreadsheets and goodwill.','Is this even worth solving?','ret'],
      ['Something breaks','Growth, an incident or a new hire makes the workaround untenable.','Why does this keep going wrong?','acq'],
      ['Looking around','Reading comparisons, asking peers what they use.','What kind of tool fixes this?','acq'],
      ['Evaluating','Shortlist, demos, a trial, a security review.','Which one, and can we trust them?','acq'],
      ['Selling it internally','The champion has to get finance and IT on side.','How do I get this approved?','exp'],
      ['Getting set up','Implementation and the first bit of value.','Was that worth the disruption?','exp'],
      ['Catching on','Other teams start asking for access.','Who else needs this?','ret'],
      ['Renewing and growing','More seats, more modules, a longer term.','Do we go all in?','ret'],
      ['Recommending it','Reviews, referrals, showing up in the community.','Would I tell a friend?','adv']
    ]
  },
  prof: {
    label:'Professional and advisory services',
    blurb:'Bought on trust and track record rather than specification. Relationships do most of the work.',
    kw:['consulting','advisory','strategy','agency','services','audit','legal','recruitment','search','talent','marketing','research','firm','partners'],
    cycle:'2 to 9 months', motion:'Reputation, then a relationship, then a retainer',
    journey:[
      ['Vaguely aware','Knows the name from something they read or someone they know.','Who are these people?','acq'],
      ['Naming the problem','A specific problem gets a name and a deadline attached.','Do we fix this ourselves or bring someone in?','acq'],
      ['Checking us out','Reads the work. Looks for who else we have done this for.','Have they done this before, in my world?','acq'],
      ['Sizing us up','A conversation rather than a pitch. They are judging judgement.','Do I want these people in my meetings?','exp'],
      ['Scoping it','Proposal, scope, price, procurement.','Is the scope right and can I defend the price?','exp'],
      ['First piece of work','Something defined with a visible outcome.','Did that land?','exp'],
      ['Becoming the default','They call us first for this kind of problem now.','Who do we ring?','ret'],
      ['Widening','New scope, another business unit, another country.','Where else can they help?','ret'],
      ['Introducing us','Introductions and public reference.','Who should I introduce them to?','adv']
    ]
  },
  mfg: {
    label:'Manufacturing and industrial',
    blurb:'Driven by specifications and procurement, with a long qualification process before any volume arrives.',
    kw:['manufacturing','industrial','factory','plant','production','oem','components','machinery','supply chain','distributor','quality','iso'],
    cycle:'6 to 18 months', motion:'Get into the spec, survive qualification, then win volume',
    journey:[
      ['Happy enough','The current supplier is fine and switching looks expensive.','Why change anything?','ret'],
      ['Something forces a look','Cost pressure, a quality failure or a new line.','What are our options?','acq'],
      ['Writing the spec','Requirements get drafted. Being in the spec is most of the game.','What exactly do we need?','acq'],
      ['Finding suppliers','RFQ, a longlist, capability screening.','Who can supply this reliably?','acq'],
      ['Qualifying us','Samples, trials, audits, certification.','Does it pass?','exp'],
      ['Agreeing terms','Pricing, volumes, terms, contract.','Do the economics work?','exp'],
      ['Ramping up','First production orders.','Can they hold quality at volume?','exp'],
      ['Giving us more','More parts, more plants, a bigger share.','Do we give them more?','ret'],
      ['Vouching for us','Reference calls and joint development.','Would we recommend them?','adv']
    ]
  },
  health: {
    label:'Healthcare and regulated',
    blurb:'Clinical and administrative buyers, committee approval, and evidence needed at every step.',
    kw:['hospital','healthcare','clinical','patient','medical','diagnostics','pharma','nabh','compliance','care','nursing'],
    cycle:'6 to 18 months', motion:'Clinical proof first, then the administrative case',
    journey:[
      ['Business as usual','The existing way of doing things is baked into daily practice.','Why disturb clinical workflow?','ret'],
      ['Something surfaces','An outcome, an incident or an audit finding.','Is this affecting care?','acq'],
      ['Looking for evidence','Gathering clinical and operational evidence.','What does the evidence say?','acq'],
      ['Asking around','Peer institutions and references drive the shortlist.','Who else at our level uses this?','acq'],
      ['Piloting it','One unit, one clinical champion.','Does it work in our setting?','exp'],
      ['Getting it through','Purchase committee, compliance, capital approval.','Can this be approved?','exp'],
      ['Rolling out','Unit by unit, with training.','Is anyone actually using it?','exp'],
      ['Standardising','Other units, other hospitals in the group.','Do we make this the standard?','ret'],
      ['Publishing it','Published outcomes and a conference slot.','Will our clinicians present this?','adv']
    ]
  },
  edu: {
    label:'Education and campuses',
    blurb:'Tied to the academic and budget calendar, with lots of committees, and student experience usually settles the argument.',
    kw:['university','college','campus','education','student','school','academic','institute','learning','faculty','hostel'],
    cycle:'4 to 12 months', motion:'Work to the academic and budget calendar',
    journey:[
      ['Good enough','Fine until students or rankings say otherwise.','Is this a priority this year?','ret'],
      ['Pressure builds','Student feedback, rankings, accreditation or a dip in admissions.','What is this costing us?','acq'],
      ['Benchmarking','Looking at what peer institutions do.','What do the good campuses do?','acq'],
      ['Finding vendors','Tender or shortlist, with references from other campuses.','Who has done this on a campus like ours?','acq'],
      ['Trying it','One block, one hostel, one department.','Does it survive a real campus?','exp'],
      ['Budget and governance','Committee, trustees, the budget cycle.','Does it fit this year?','exp'],
      ['Rolling out','Phased across the campus.','Are students noticing?','exp'],
      ['Other campuses','The rest of the group.','Do we standardise?','ret'],
      ['Showing it off','Case study, campus tours, a conference talk.','Will we host a visit?','adv']
    ]
  }
};

/* persona starters per industry: [job title, which of the six roles they are] */
const PERSONA_TEMPLATES = {
  infra:[
    ['Head of Real Estate / Asset Management','econ'],
    ['Head of Projects / MEP and Design','proj'],
    ['CIO / Head of IT Infrastructure','tech'],
    ['Head of Facilities and Operations','ops'],
    ['CFO / Procurement Head','proc'],
    ['Business Unit or Experience Lead','champ']
  ],
  saas:[
    ['Functional Head','champ'],['CIO / Head of IT','tech'],
    ['Security and Compliance Lead','ops'],['CFO / Procurement','proc'],
    ['Divisional Head','econ']
  ],
  prof:[
    ['CXO Sponsor','econ'],['Function Head','champ'],
    ['Procurement / Vendor Management','proc'],['Internal Team Lead','ops']
  ],
  mfg:[
    ['Head of Engineering / Design','tech'],['Plant or Operations Head','ops'],
    ['Quality Head','proj'],['Procurement Head','proc'],['Business Head','econ']
  ],
  health:[
    ['Clinical Head / HOD','champ'],['Medical Superintendent / COO','ops'],
    ['Head of Biomedical / IT','tech'],['CFO / Purchase Committee','proc'],['Group CEO','econ']
  ],
  edu:[
    ['Registrar / Director of Administration','ops'],['Head of IT / Campus Systems','tech'],
    ['Dean of Student Experience','champ'],['Finance Officer / Trustee','proc'],['Vice Chancellor','econ']
  ]
};

/* ------------------------------------------------------------
   The plays. [tier, name, channel, asset, effort, weight,
   what it is, the next step it asks for, when to use it]
   The first six are the ones that actually convert. Each is an
   offer with a next step rather than a piece of content.
   ------------------------------------------------------------ */
const PLAY_TEMPLATES = [
  // ---- the offers that convert ----
  ['t1','Free connectivity health check','Owned / Field','Executive scorecard','High',10,
   'We survey one of their buildings: indoor mobile coverage, Wi-Fi capacity, the dead zones they already know about, the cabling that is there, which operators reach it, and what to fix first. They get a short scorecard signed off by an engineer. Detailed design work comes later, once there is a commercial conversation. Everything else in this programme exists to earn this meeting.',
   'Book a connectivity health check','Existing buildings, hotels, hospitals, campuses and offices where people are already complaining'],
  ['t1','Move fast on a trigger','Direct / Multi','One-page account note','High',8,
   'The moment an account announces a development, an acquisition, a refurbishment or a technology programme, we write a one-page note on what it means for them, leadership sends a short letter, a personal sequence follows, the ads reinforce the same point, and sales rings inside an agreed window. Speed is the whole play. First contact inside two working days.',
   'A letter from leadership within two working days','Any Tier 1 or Tier 2 account with something fresh and checkable happening'],
  ['t1','Lead with proof','Content / Sales','Short case story','Medium',7,
   'Turn work already delivered into short stories that answer the questions a buyer actually asks. What was wrong, who it affected, what we installed, how we kept out of everyone\'s way, what got better and by how much, how long it took, and why any of it matters to them.',
   'See what we did in a building like yours','Accounts that want evidence from somewhere like their own place before they will meet'],
  ['t2','Get in before the design is frozen','Content / Field','Pre-handover checklist','Medium',7,
   'Go after announced developments and projects heading for handover with a checklist they can use, an honest piece on what it costs to plan connectivity late, a technical guide written for consultants, a design session, and a realistic timeline.',
   'Book a session before your design is frozen','Developers, project heads, architects and MEP consultants with live projects'],
  ['t2','Standardise the portfolio','Content / Workshop','Maturity model and benchmark','High',8,
   'For groups running several properties: a simple maturity model, a workshop benchmarking their sites against each other, a standard technical blueprint, how central monitoring would work, and the cost and risk written up for their board. This is the play that turns one building into a portfolio agreement.',
   'Benchmark your sites against each other','Hotel groups, property companies, co-working operators and education networks'],
  ['t2','Put ten peers in a room','Event','Curated dinner or session','High',8,
   'Eight to twelve senior people, hosted by leadership with a customer or an industry name in the room. A conversation between peers, not a product webinar. That difference is the entire reason it works.',
   'A private follow-up conversation','Groups where peers influence each other more than any vendor does'],

  // ---- Tier 1 support ----
  ['t1','Do the homework','Research','Internal account note','Medium',4,
   'A living page per Tier 1 account: how they are structured, what they own, who is on the committee, what is happening, who they use today, and our best guess at the way in. Nothing goes out until this exists.',
   'Internal. Nothing goes out without it','Every Tier 1 account, before anyone reaches out'],
  ['t1','Write to them, on paper','Direct / Post','Signed letter','Low',3,
   'A letter from the founder to their counterpart, couriered. In a market full of InMail, paper stands out.',
   'Twenty minutes, one leader to another','Tier 1 accounts where we know who holds the budget'],
  ['t1','Build them their own page','Web','Personalised landing page','Medium',5,
   'A URL made for one company, with proof from their sector and their own numbers on it. It also gives us the cleanest read on interest we will ever get.',
   'Ask for your health check','Tier 1 accounts actively looking'],
  ['t1','Take them to see it working','Field / Event','Hosted site visit','High',6,
   'Bring the committee to a building we already run. Nothing beats a buyer talking to another buyer.',
   'Come and see a live site','Accounts stuck in technical or commercial review'],
  ['t1','Build the business case for them','Sales Enablement','Interactive model','Medium',5,
   'Their numbers, our model, written the way their finance team writes. This is what gets it past the CFO.',
   'Take this to your finance team','Any account where finance or procurement has entered the room'],
  ['t1','Message the committee directly','Paid Social','Conversation ad','Low',4,
   'Leadership-sender messages to a list of named individuals, split by tier, sector and role. Precision, never volume.',
   'Book twenty minutes','Mapped committee members at Tier 1 accounts'],
  ['t1','Send something they cannot ignore','Direct / Post','Physical piece','Medium',3,
   'A physical object that makes their specific problem hard to argue with. Made to sit on a desk and get talked about.',
   'Open the report we sent you','Tier 1 accounts that have gone quiet'],

  // ---- Tier 2 support ----
  ['t2','Write the one document their sector needs','Content','Gated PDF and microsite','Medium',6,
   'One properly useful document per group. It earns the meeting and does the qualifying for you.',
   'Download the guide','Every active Tier 2 cluster'],
  ['t2','Borrow a partner\'s audience','Event / Partner','Joint session','Medium',5,
   'Run something with an operator or a partner who already has the relationship. Halves the cost and doubles the credibility.',
   'Register for the joint session','Groups where a partner is already in the door'],
  ['t2','Pack the proof together','Content','Case study set','Low',4,
   'Three stories per sector, same structure, comparable numbers. The single thing sales asks for most.',
   'See three comparable sites','All clusters, and the most reused thing in the kit'],
  ['t2','Put the guide in front of them','Paid Social','Document ad','Low',4,
   'Get the guide read without making them fill in a form first.',
   'Read the guide','Cluster-level awareness at low cost per account'],
  ['t2','Let them price their own problem','Web Tool','Interactive calculator','Medium',5,
   'A calculator that turns their own square footage or room count into a number. Their number persuades them; ours does not.',
   'Work out what this is costing you','Accounts that accept the problem but not the urgency'],
  ['t2','Publish research with someone credible','PR / Partner','Research report','High',6,
   'Co-publish with a broker or an analyst. Buys authority you cannot advertise your way into.',
   'Download the research','Category credibility across every cluster'],
  ['t2','Keep in touch properly','Email','Five-touch sequence','Low',3,
   'Something we noticed about them, what it probably costs, proof from somewhere similar, an offer of a health check, then a polite close. Short, researched, tied to something real.',
   'Book a health check','Every Tier 2 account with a name and an email'],

  // ---- Tier 3 ----
  ['t3','Stay visible to the whole list','Paid Social','LinkedIn ABM ads','Low',5,
   'Upload the account list and run steady air cover so the brand is never cold when sales rings.',
   'See how it works','The full named list'],
  ['t3','Catch them while they are searching','Paid Search','Search and landing pages','Medium',6,
   'Own the terms people type while they are drafting an RFP. In-building coverage, DAS, managed Wi-Fi, neutral host, indoor 5G. Each group of terms gets its own page and its own next step.',
   'Talk to a specialist','Real demand happening outside the named list'],
  ['t3','Advertise inside their buildings','Programmatic','Geo display','Medium',4,
   'Serve ads only inside the parks and precincts where these buyers physically sit.',
   'See what your building is missing','Dense target precincts'],
  ['t3','Retarget by problem, not by page','Programmatic','Retargeting','Low',3,
   'Split retargeting by what the visitor showed interest in rather than which page they landed on, and always reinforce proof and a next step.',
   'Book a health check','Known visitors from target accounts'],
  ['t3','Keep the slow ones warm','Email','Newsletter','Low',2,
   'Low effort, long horizon, for accounts that are real but not ready. This is also what pushes Tier 3 names up into Tier 2.',
   'Stay on the list','Good fit, nothing happening yet'],
  ['t3','Let the field do the talking','Organic Social','Advocacy toolkit','Medium',3,
   'Give the delivery teams what they need to post from site. Proof that paid media cannot fake.',
   'Follow the site stories','Steady credibility'],
  ['t3','Have a point of view in public','Organic / PR','Article series','Medium',5,
   'Leadership publishing a proper argument once a month. This compounds rather than spikes.',
   'Read the argument','Category authority across all tiers'],
  ['t3','Make the proof findable','SEO / Content','Content hub','Medium',4,
   'A structured library of what we have done, for the buyer quietly checking us out after the first conversation.',
   'Look through the sites we run','Buyers doing their own due diligence']
];

/* What has to exist before anything goes live. */
const ASSET_KIT = [
  ['The master pitch document','Core','ZAMSTARS'],
  ['One-pager for the first priority sector','Vertical','ZAMSTARS'],
  ['One-pager for the second priority sector','Vertical','ZAMSTARS'],
  ['The health check offer and its scorecard template','Offer','ZAMSTARS + Client'],
  ['Pre-handover checklist for projects teams','Offer','ZAMSTARS + Client'],
  ['First case study, written around an outcome','Proof','ZAMSTARS'],
  ['Second case study, written around an outcome','Proof','ZAMSTARS'],
  ['The deck for Tier 1 meetings','Sales','ZAMSTARS'],
  ['How the architecture works, in plain terms','Technical','Client'],
  ['Answers to the security, install and SLA questions','Technical','Client'],
  ['The total cost of ownership model','Commercial','ZAMSTARS + Client'],
  ['Email and LinkedIn sequences, one per role','Outreach','ZAMSTARS'],
  ['Landing pages, one per sector','Web','ZAMSTARS'],
  ['Battlecards for the sales team','Sales','ZAMSTARS'],
  ['The account research template','Ops','ZAMSTARS'],
  ['Everything needed to run a roundtable','Event','ZAMSTARS'],
  ['A deck the internal champion can present as their own','Sales','ZAMSTARS']
];
const ASSET_STATUS = [['Not started','Not started'],['In production','In production'],['In review','In review'],['Ready','Ready']];

/* ------------------------------------------------------------
   Measurement. [layer, metric, how it is counted, unit]
   ------------------------------------------------------------ */
const KPI_TEMPLATES = [
  ['cov','Accounts with a named salesperson','Someone in sales has agreed to chase this account','%'],
  ['cov','Accounts where we know the committee','At least the budget holder, the technical judge and the daily owner identified','%'],
  ['cov','Accounts with three or more names','Three of the six roles with real contact details','%'],
  ['cov','How complete the contact data is','Role, email and seniority all verified','%'],

  ['eng','Accounts that engaged','At least one real interaction from somebody on the map','accounts'],
  ['eng','People engaged per account','Average number of different individuals we reached','people'],
  ['eng','Share who were senior','Director level or above, as a share of everyone engaged','%'],
  ['eng','Visits from target accounts','Sessions we can attribute to a named account','visits'],
  ['eng','Serious content actually read','Case studies, guides and health check pages opened by target accounts','opens'],
  ['eng','Turned up to something','Roundtables, sessions and site visits attended','people'],
  ['eng','Came back within a month','Accounts that engaged more than once in a rolling thirty days','accounts'],

  ['prog','Real conversations','A first proper commercial conversation with somebody on the map','conversations'],
  ['prog','Discovery meetings','A structured meeting with two or more roles in the room','meetings'],
  ['prog','Health checks delivered','Accepted and completed, not just offered','health checks'],
  ['prog','Accounts sales has accepted','Formally taken on as active','accounts'],
  ['prog','Opportunities created','Recorded in the CRM as qualified','opportunities'],

  ['comm','Pipeline we created','Value of opportunities this programme sourced','INR Cr'],
  ['comm','Pipeline we helped','Value of opportunities we touched but did not source','INR Cr'],
  ['comm','Average deal size','Mean value of what we sourced','INR L'],
  ['comm','Win rate','Share of what we sourced that closed','%'],
  ['comm','How long deals took','Median days from first meeting to signature','days'],
  ['comm','Cost per engaged account','Spend divided by accounts that engaged','INR'],
  ['comm','Cost per real conversation','Spend divided by conversations','INR'],
  ['comm','Cost per opportunity','Spend divided by opportunities','INR']
];

/* ------------------------------------------------------------
   The ninety days, in seven phases.
   ------------------------------------------------------------ */
const PHASES = [
  [1,'Agree it','Weeks 1-2','Strategy signed off and baselines written down',C.pink],
  [2,'Choose them','Weeks 3-4','Forty named accounts, each with an owner',C.pink],
  [3,'Build it','Weeks 4-6','The asset kit finished',C.violet],
  [4,'Warm it up','Weeks 6-7','Accounts have heard of us',C.violet],
  [5,'Go live','Weeks 8-10','Engagement across several channels',C.teal],
  [6,'Convert','Weeks 10-12','Meetings and opportunities',C.teal],
  [7,'Decide','End of week 12','Scale it, change it or stop',C.gold]
];
const PHASE_LBL = {}; const PHASE_COL = {};
PHASES.forEach(p=>{ PHASE_LBL[p[0]]=p[1]; PHASE_COL[p[0]]=p[4]; });

const ROADMAP_TEMPLATE = [
  [1,1,'Sit down with sales, delivery and leadership','Workshop','ZAMSTARS + Client','Everyone agrees what this is'],
  [1,1,'Go through the CRM and the open opportunities','Analysis','Client','Real conversion rates to work from'],
  [1,2,'Work through the offer and write down who fits','Workshop','ZAMSTARS + Client','ICP and the reasons to walk away'],
  [1,2,'Set the goals and write down the starting numbers','Workshop','ZAMSTARS + Client','Measures both sides have signed'],
  [2,3,'Score and rank every account','Analysis','ZAMSTARS','The list, marked out of a hundred'],
  [2,3,'Put a named salesperson against every account','Ops','Client','Nobody unowned'],
  [2,4,'Find out who sits on each committee','Research','ZAMSTARS','Three or more names per account'],
  [2,4,'Start watching for triggers','Ops','ZAMSTARS','A live watchlist somebody reads'],
  [3,4,'Agree the core message and the version for each role','Workshop','Client','Messaging signed off'],
  [3,5,'Build the health check offer and its scorecard','Content + Design','ZAMSTARS','The offer we lead with'],
  [3,5,'Write two case studies and get the claims checked','Content','ZAMSTARS + Client','Proof we can stand behind'],
  [3,6,'Build the landing pages and test where leads go','Web','ZAMSTARS','Pages live, routing tested'],
  [3,6,'Write the sequences, one per role','Content','ZAMSTARS','Outreach ready to send'],
  [4,6,'Get leadership publishing','Content','Client + ZAMSTARS','Leadership visible where buyers look'],
  [4,7,'Start engaging committee members quietly','Organic Social','Client','A warmer list to call'],
  [4,7,'Ask partners and consultants for introductions','Partner','Client','Doors opened by someone else'],
  [4,7,'Build the ad audiences and check the match rate','Paid Media','ZAMSTARS','Audiences confirmed'],
  [5,8,'Brief sales on tiers, roles, the offer and response times','Enablement','ZAMSTARS + Client','A sales team that knows the plan'],
  [5,8,'Send the Tier 1 letters and the physical pieces','Direct','Client','Conversations opened at the top'],
  [5,9,'Turn on the leadership messages and document ads','Paid Social','ZAMSTARS','We reach more than one inbox per account'],
  [5,9,'Turn on search and the precinct advertising','Paid Media','ZAMSTARS','Catching people already looking'],
  [5,10,'Invite the first group to the roundtable','Event','ZAMSTARS','A confirmed guest list'],
  [6,10,'Host the roundtable','Event','Client + ZAMSTARS','Peer conversations and follow-ups'],
  [6,11,'Deliver the health checks and present them','Field + Sales','Client','Scorecards in buyers\' hands'],
  [6,11,'Take late-stage accounts to see a live site','Field','Client','The last objection answered'],
  [6,12,'Follow up to the agreed timings and update the CRM','Sales','Client','Opportunities recorded properly'],
  [7,12,'Review where every account got to','Review','ZAMSTARS + Client','An honest read on results'],
  [7,12,'Work out which sector, trigger and message did the work','Analysis','ZAMSTARS','What to do more of'],
  [7,12,'Decide whether to scale, change or stop','Decision','Client','A mandate for next quarter']
];

const DEPENDENCIES = [
  'Every account has a named salesperson before we start spending on it.',
  'Somebody has been through the CRM and the open opportunities.',
  'Every claim in the case studies has been checked by someone who was there.',
  'The landing pages are built and we have tested where a form actually goes.',
  'Sales has agreed how fast they will follow up before we start generating alerts.'
];

const SLA_DEFAULT = [
  ['A target account does something interesting','Someone looks at it within four working hours'],
  ['Sales accepts an engaged account','They make contact within one working day'],
  ['Somebody attends an event','A personal follow-up within one working day'],
  ['A health check gets requested','Routed to the right person straight away'],
  ['Something real happens at an account','First relevant contact within two working days'],
  ['A deal moves or dies','Written into the CRM within two working days'],
  ['A Tier 1 account goes quiet','We review it every fortnight']
];

/* ------------------------------------------------------------
   Triggers. Something you can see, that gives you a reason to
   ring somebody this week. [name, where we watch it, weight,
   what it actually means, how long it stays useful]
   ------------------------------------------------------------ */
const DEFAULT_SIGNALS = [
  ['New building, site or campus announced','News and real estate press',3,'The best one there is. Designing it in beats retrofitting on cost, disruption and time. Get to the project head before the drawings are frozen.','8 weeks'],
  ['Construction approval or handover','Filings and project trackers',3,'A date somebody else set, which is the easiest kind to sell against.','6 weeks'],
  ['Tender or RFP published','Tender portals and procurement notices',3,'They are buying now. This one goes cold fastest, so act within days or leave it.','2 weeks'],
  ['New person in a buying role','LinkedIn and press',3,'New executives reopen settled decisions in their first four months.','16 weeks'],
  ['Smart building or digital programme','Company announcements',3,'The budget and the mandate exist. The network is the dependency nobody has scoped.','12 weeks'],
  ['5G, IoT or private network plans','Trade press and operator news',3,'Already thinking about it and technically literate. Shortest route to a real conversation.','10 weeks'],
  ['Someone from the account visits our pages','Our own analytics',3,'Actual behaviour from somebody on the map. Route it to sales the same day.','2 weeks'],
  ['Several roles engaging at once','Analytics and CRM',3,'This is what an internal evaluation looks like from the outside.','4 weeks'],
  ['A big lease or anchor tenant signed','Real estate press',2,'The fit-out window is opening and tenant expectations are being set now.','8 weeks'],
  ['Refurbishment announced','News and project trackers',2,'Ceilings are already coming down, so the disruption objection disappears.','10 weeks'],
  ['Portfolio bought or merged','Filings and news',2,'A new owner standardising an inherited estate is the ideal conversation.','16 weeks'],
  ['Funding or capital raise','News and filings',2,'Money, plus a mandate to modernise something.','12 weeks'],
  ['Expanding into a new city','News and careers pages',2,'Greenfield decisions somewhere we can actually deliver.','12 weeks'],
  ['Public complaints about connectivity','Reviews, social and press',2,'A crack in the incumbent relationship. In hospitality, a review that names the Wi-Fi is a qualified lead.','6 weeks'],
  ['A contract coming up for renewal','CRM and market chatter',3,'The only moment an embedded supplier is genuinely vulnerable.','12 weeks'],
  ['A compliance or audit deadline','Regulator and industry press',2,'A deadline with a legal consequence behind it.','10 weeks'],
  ['A sustainability commitment','ESG reports and press',1,'A softer opening, but it gets the infrastructure conversation to board level.','20 weeks'],
  ['Hiring for a relevant role','LinkedIn Jobs and careers pages',3,'Budget got approved somewhere upstream. Cheapest thing on this list to watch.','6 weeks'],
  ['Engaging with a competitor','Paid platform signals',1,'Aware of the category. Worth nurturing rather than ringing.','8 weeks'],
  ['A peer in the same group just bought','CRM and market news',2,'Herd behaviour is strongest in the most conservative sectors.','12 weeks']
];
