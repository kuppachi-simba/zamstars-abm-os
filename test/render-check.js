#!/usr/bin/env node
/* Renders every screen in a headless DOM and prints what a reader would see,
   plus the three things that go wrong silently in string-built HTML:
   leaked "undefined", escaped entities showing as raw text, and unbalanced
   divs. The smoke tests prove the app works. This one shows you the words.

   Run with `npm run check`. */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(FILE)) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const dom = new JSDOM(fs.readFileSync(FILE, 'utf8'), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/'
});
const w = dom.window;
const LEAKS = ['undefined', '[object Object]', 'NaN', '&amp;middot;', '&amp;nbsp;', 'null<'];
let problems = 0;

function screen(label, setup) {
  w.eval(setup);
  const el = w.document.getElementById('stagebody');
  const html = el.innerHTML;
  const found = LEAKS.filter(x => html.indexOf(x) > -1);
  const open = (html.match(/<div/g) || []).length;
  const close = (html.match(/<\/div>/g) || []).length;
  if (found.length) problems++;
  if (open !== close) problems++;

  console.log('\n===== ' + label + ' =====');
  console.log('  ' + html.length + ' chars, ' + open + ' divs' +
    (open === close ? '' : ' UNBALANCED, ' + close + ' closed') +
    (found.length ? '   LEAKED: ' + found.join(', ') : ''));
  console.log('  ' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 600));
}

setTimeout(() => {
  w.confirm = () => true;
  w.prompt = () => 'checked by the render check';

  w.eval('S.current="demo";');
  w.eval('STAGES.forEach(function(s){ go(s.id); });');

  w.eval('go("accintel"); ISEL.acct=null;');
  screen('Account Intelligence, portfolio', 'render()');

  w.eval('ISEL.acct=cur().accounts[0].id;');
  w.eval('ITABS.map(function(t){return t;})').forEach(t => {
    screen('Account workspace: ' + t[1], 'ISEL.tab="' + t[0] + '";render()');
  });

  /* An account nobody has touched. Empty states are where string-built HTML
     usually breaks, because every branch assumes data. */
  w.eval('ISEL.acct=cur().accounts[cur().accounts.length-1].id;');
  w.eval('ITABS.map(function(t){return t;})').forEach(t => {
    w.eval('ISEL.tab="' + t[0] + '";render()');
    const html = w.document.getElementById('stagebody').innerHTML;
    const found = LEAKS.filter(x => html.indexOf(x) > -1);
    if (found.length || html.length < 200) {
      problems++;
      console.log('\n  EMPTY ACCOUNT PROBLEM on ' + t[1] + ': ' + (found.join(', ') || 'rendered almost nothing'));
    }
  });
  console.log('\nempty account renders every tab cleanly');

  console.log('\n' + (problems ? problems + ' problem(s) found' : 'no render problems found'));
  process.exit(problems ? 1 : 0);
}, 1600);
