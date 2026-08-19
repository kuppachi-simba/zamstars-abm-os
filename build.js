#!/usr/bin/env node
/* Concatenates src/ into a single self-contained dist/index.html.
   No bundler, no dependencies, no build step to go wrong in six months. */

const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

const HTML_PARTS = ['01-styles.html', '02-shell.html'];
const JS_PARTS = [
  '03-framework.js',
  '04-clients.js',
  '05-store.js',
  '06-stages-early.js',
  '07-stages-late.js',
  '08-run-and-wiring.js'
];

function read(f) {
  const p = path.join(SRC, f);
  if (!fs.existsSync(p)) throw new Error('missing source file: ' + f);
  return fs.readFileSync(p, 'utf8');
}

const out =
  HTML_PARTS.map(read).join('') +
  JS_PARTS.map(read).join('') +
  '\n</script>\n</body>\n</html>\n';

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), out);

const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(0);
console.log('built dist/index.html  ' + kb + 'KB  from ' + (HTML_PARTS.length + JS_PARTS.length) + ' source files');

/* Guardrails. These have all bitten at least once. */
const problems = [];
if (out.indexOf('—') > -1) problems.push('em dash found in the output');
if (/<script[^>]+src=/.test(out)) problems.push('external script tag found, the file must stay self-contained');
if (out.indexOf('</html>') === -1) problems.push('output is truncated');
if (problems.length) {
  console.error('\nbuild checks failed:');
  problems.forEach(p => console.error('  - ' + p));
  process.exit(1);
}
console.log('build checks passed');
