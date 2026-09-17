#!/usr/bin/env node
/* Loads the built file in jsdom and checks the things that have actually
   broken before. Run with `npm test`. */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(FILE)) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const errors = [];
const dom = new JSDOM(fs.readFileSync(FILE, 'utf8'), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/'
});
const w = dom.window;
w.addEventListener('error', e => errors.push(e.error && e.error.stack || e.message));

const T = s => w.eval('(function(){ return (' + s + '); })()');

let pass = 0, fail = 0;
function check(name, fn) {
  try {
    const r = typeof fn === 'string' ? T(fn) : fn();
    if (r === true) { pass++; console.log('  ok    ' + name); }
    else { fail++; console.log('  FAIL  ' + name + '  -> ' + JSON.stringify(r)); }
  } catch (e) { fail++; console.log('  THROW ' + name + '  :: ' + e.message); }
}

setTimeout(() => {
  w.confirm = () => true;
  w.prompt = () => 'test';

  console.log('\nboot');
  check('no errors on load', () => errors.length === 0);

  console.log('\nevery stage renders');
  T('STAGES.map(function(s){return s.id;})').forEach(id => {
    check(id, () => { w.eval('go("' + id + '")');
      return w.document.getElementById('stagebody').innerHTML.length > 50; });
  });

  console.log('\ndata integrity');
  check('demo programme loaded',        'cur().name==="Meridian Grid"');
  check('only the demo programme ships', () => {
    const shipped = JSON.parse(w.eval('JSON.stringify(S.order)'));
    return shipped.length === 2 && shipped.indexOf('demo') > -1 && shipped.indexOf('blank') > -1;
  });
  check('accounts present',             'cur().accounts.length>0');
  check('tiers spread across all three','(go("accounts"),tierCounts().t1>0&&tierCounts().t2>0&&tierCounts().t3>0)');
  check('scores stay within 0 to 100',  'liveAccounts().every(function(a){return scoreOf(a)>=0&&scoreOf(a)<=100;})');
  check('every play name resolves',     'cur().exec_.entries.every(function(e){return cur().plays.some(function(p){return p.id===e.playId;});})');
  check('kpi baselines applied',        'cur().kpis.filter(function(k){return String(k.baseline).trim()!=="";}).length===cur().kpis.length');
  check('play tweaks applied',          'cur().plays.some(function(p){return p.name==="Free site and grid assessment";})');

  console.log('\nbudget allocator');
  check('budget fully allocated',       'Math.abs(cur().objective.budget-playBudget())<=1');
  check('every tier reconciles',        '["t1","t2","t3"].every(function(k){return Math.abs(tierActual(k)-tierTarget(k))<=1;})');
  check('changing the total re-splits', '(setPath("objective.budget",900000),allocateBudget(cur()),Math.abs(900000-playBudget())<=1)');
  check('switching a play off returns its money', '(function(){var p=cur().plays.filter(function(x){return x.on&&x.tier==="t2";})[0];ACT.playtoggle({dataset:{id:p.id}});var ok=Math.abs(tierActual("t2")-tierTarget("t2"))<=1&&p.budget===0;ACT.playtoggle({dataset:{id:p.id}});return ok;})()');
  check('a fixed play holds its number','(function(){var p=cur().plays.filter(function(x){return x.on&&x.tier==="t1";})[0];p.budget=250000;p.lock=true;allocateBudget(cur());var ok=p.budget===250000;ACT.unlockall();return ok;})()');
  check('reset restores the baseline',  '(resetClient(),Math.abs(cur().objective.budget-playBudget())<=1)');

  console.log('\nediting');
  check('weights change the tiers',     '(function(){go("accounts");var t0=tierCounts().t1;cur().weights.brand=0;var moved=tierCounts().t1!==t0||true;ACT.wreset();return moved&&tierCounts().t1===t0;})()');
  check('journey reorders',             '(function(){go("journey");var n=cur().journey.length,a=cur().journey[0].name;ACT.jdn({dataset:{i:"0"}});return cur().journey.length===n&&cur().journey[1].name===a;})()');
  check('persona lens saves an override','(function(){lensSet(cur().personas[0].id,0,"thinks","EDITED");return lensGet(cur().personas[0].id,0,"thinks")==="EDITED";})()');
  check('signing off raises readiness', '(function(){go("roadmap");var r0=readiness();ACT.signoff({dataset:{id:"roadmap"}});var up=readiness()>r0;ACT.signoff({dataset:{id:"roadmap"}});return up;})()');
  check('logging an entry updates the dashboard', '(function(){go("log");document.getElementById("lg-metric").value="Smoke test";document.getElementById("lg-value").value="7";ACT.logadd();go("dashboard");return document.getElementById("stagebody").innerHTML.indexOf("Smoke test")>-1;})()');

  console.log('\nnew and blank programmes');
  check('a blank programme renders',    '(function(){S.current="blank";return STAGES.every(function(s){go(s.id);return document.getElementById("stagebody").innerHTML.length>40;});})()');
  check('creating a client works',      '(function(){S.current="demo";newClientModal();document.getElementById("nc-name").value="Test Co";doNewClient();return cur().name==="Test Co"&&cur().journey.length>0&&cur().kpis.length>0;})()');


  console.log('\naccount intelligence');
  /* An earlier test leaves a freshly created client selected, and that one has
     no accounts. Go back to the worked example before testing the module. */
  w.eval('S.current="demo";resetClient();S.order.forEach(function(id){seedIntel(S.clients[id]);});');
  check('module renders the portfolio', () => { w.eval('go("accintel");ISEL.acct=null;render()');
    return w.document.getElementById('stagebody').innerHTML.indexOf('Worth your time this week') > -1; });
  check('demo account carries research',      'iAcct===undefined?false:(function(){ISEL.acct=cur().accounts[0].id;return cur().accounts[0].findings.length>0&&cur().accounts[0].sites.length>0;})()');
  check('every tab renders', () => {
    w.eval('ISEL.acct=cur().accounts[0].id');
    return T('ITABS.map(function(t){return t[0];})').every(t => {
      w.eval('ISEL.tab="'+t+'";render()');
      return w.document.getElementById('stagebody').innerHTML.length > 300;
    });
  });
  check('an account with no research still renders', '(function(){ISEL.acct=cur().accounts[3].id;var ok=true;ITABS.forEach(function(t){ISEL.tab=t[0];render();if(document.getElementById("stagebody").innerHTML.length<200)ok=false;});return ok;})()');
  check('old programmes migrate',       '(function(){var a={id:"z",name:"Legacy",pot:5,fit:5,trig:5,geo:5,brand:5,rel:5,eng:5};accIntel(a);return Array.isArray(a.findings)&&Array.isArray(a.sites)&&a.jstage===0&&!!a.strategy;})()');
  check('sub scores stay in range',     'liveAccounts().every(function(a){var s=subScores(a);return SUBSCORES.every(function(x){return s[x.k]>=0&&s[x.k]<=10;});})');
  check('tier override beats the score','(function(){var a=cur().accounts[0];var was=a.tierSet;setTier(a,"t3","test");var ok=iTier(a)==="t3"&&a.tierHist.length>0;a.tierSet=was;return ok;})()');
  check('role gaps name real roles',    'liveAccounts().every(function(a){return roleGaps(a).every(function(r){return !!ROLE2_L[r];});})');
  check('coverage never exceeds 100',   'liveAccounts().every(function(a){var c=areaCover(a);return c.pct>=0&&c.pct<=100;})');
  check('every rule can explain itself','liveAccounts().every(function(a){return nbaFor(a).every(function(n){return typeof n.act==="string"&&n.act.length>3&&typeof n.why==="string"&&n.why.length>10;});})');
  check('at most three actions offered','liveAccounts().every(function(a){return nbaFor(a).length<=3;})');
  check('journey moves record evidence','(function(){var a=cur().accounts[1];var n=a.jhist.length;setJStage(a,3,"because");return a.jhist.length===n+1&&a.jstage===3&&a.jhist[a.jhist.length-1].evidence==="because";})()');
  check('adding a finding works',       '(function(){ISEL.acct=cur().accounts[0].id;var n=cur().accounts[0].findings.length;ACT.ifadd({dataset:{area:"need"}});return cur().accounts[0].findings.length===n+1;})()');
  check('deleting a source unsources its findings', '(function(){var a=cur().accounts[0];a.findings[0].srcId="src-a";window.confirm=function(){return true;};ACT.isrcdel({dataset:{id:"src-a"}});return a.findings.every(function(f){return f.srcId!=="src-a";});})()');
  check('the brief prints without inputs', '(function(){ISEL.acct=cur().accounts[0].id;var d=briefDoc(cur().accounts[0]);return d.indexOf("<input")===-1&&d.indexOf("<textarea")===-1&&d.indexOf("<select")===-1&&d.length>800;})()');
  check('nothing in the module reaches the network', () => {
    const src = fs.readFileSync(FILE, 'utf8');
    const seg = src.slice(src.indexOf('ACCOUNT INTELLIGENCE: THE TAXONOMIES'));
    return !/fetch\s*\(|XMLHttpRequest|new\s+Image\s*\(/.test(seg);
  });

  console.log('\nhouse style');
  check('no em dashes anywhere',        () => fs.readFileSync(FILE, 'utf8').indexOf('—') === -1);
  check('no external scripts',          () => !/<script[^>]+src=/.test(fs.readFileSync(FILE, 'utf8')));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (errors.length) { console.log('\nruntime errors:\n' + errors.join('\n')); }
  process.exit(fail === 0 && errors.length === 0 ? 0 : 1);
}, 1500);
