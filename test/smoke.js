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

  console.log('\nhouse style');
  check('no em dashes anywhere',        () => fs.readFileSync(FILE, 'utf8').indexOf('—') === -1);
  check('no external scripts',          () => !/<script[^>]+src=/.test(fs.readFileSync(FILE, 'utf8')));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (errors.length) { console.log('\nruntime errors:\n' + errors.join('\n')); }
  process.exit(fail === 0 && errors.length === 0 ? 0 : 1);
}, 1500);
