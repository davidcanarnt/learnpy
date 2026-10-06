/* Validates the multilingual layer: UI dictionaries and es curriculum coverage.
   Run: node test/test_i18n.js */
'use strict';
const fs = require('fs');
const path = require('path');
const I18N = require('../js/i18n.js');
const Data = require('../js/levels.js');
const ES = require('../js/i18n-levels.js').es;
const PyEngine = require('../js/pyengine.js');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) passed++;
  else { failed++; failures.push(name + (extra ? ' — ' + extra : '')); }
}

/* ---------------- UI dictionaries ---------------- */
const enKeys = Object.keys(I18N.UI.en);
const esKeys = Object.keys(I18N.UI.es);
check('UI en/es key parity',
  enKeys.length === esKeys.length && enKeys.every(k => k in I18N.UI.es) && esKeys.every(k => k in I18N.UI.en),
  `en=${enKeys.length} es=${esKeys.length} missing=${enKeys.filter(k => !(k in I18N.UI.es))} extra=${esKeys.filter(k => !(k in I18N.UI.en))}`);

for (const code of ['en', 'es']) {
  for (const [k, v] of Object.entries(I18N.UI[code])) {
    check(`UI ${code}.${k} non-empty`, (typeof v === 'string' && v.length > 0) || typeof v === 'function', typeof v);
  }
}

/* every key referenced from index.html and every literal T('...') in game.js must exist */
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const htmlKeys = [...new Set([...html.matchAll(/data-i18n(?:-html|-title)?="([^"]+)"/g)].map(m => m[1]))];
check('index.html keys all translated',
  htmlKeys.every(k => (k in I18N.UI.en) && (k in I18N.UI.es)),
  htmlKeys.filter(k => !(k in I18N.UI.en) || !(k in I18N.UI.es)).join(', '));

const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf8');
const gameKeys = [...new Set([...gameSrc.matchAll(/\bT\('([^']+)'/g)].map(m => m[1]))].filter(k => !k.endsWith('.'));
check('game.js literal T() keys all translated',
  gameKeys.every(k => (k in I18N.UI.en) && (k in I18N.UI.es)),
  gameKeys.filter(k => !(k in I18N.UI.en) || !(k in I18N.UI.es)).join(', '));

/* interpolation + fallback */
I18N.setLang('en');
check('t() interpolates', I18N.t('combo.streak', { n: 3 }).includes('3'), I18N.t('combo.streak', { n: 3 }));
I18N.setLang('es');
check('t() interpolates es', I18N.t('combo.streak', { n: 3 }).includes('3'), I18N.t('combo.streak', { n: 3 }));
check('t() falls back to key', I18N.t('nope.key') === 'nope.key', '');
check('certificate function works (es)',
  I18N.t('success.certificate', { world: 'X', levels: 65, total: 65, rank: 'R', xp: 1, streak: 1, ach: 1, achTotal: 15 }).split('\n').length === 14,
  '');

/* ---------------- Spanish curriculum coverage ---------------- */
I18N.setLang('es');
check('es pack available', I18N.hasPack(), 'i18n-levels.js es pack missing');

const rawLevels = Data.allLevels();
check('ranks translated', ES.ranks.length === Data.RANKS.length, `es=${ES.ranks.length}`);
check('tips translated', ES.tips.length === Data.TIPS.length && ES.tips.every(t => t && t.length > 10), '');
check('daily translated',
  ES.daily.length === Data.DAILY.length &&
  ES.daily.every((d, i) => d.q && d.explain && d.options.length === Data.DAILY[i].options.length), '');
check('achievements translated',
  Data.ACHIEVEMENTS.every(a => ES.achievements[a.id] && ES.achievements[a.id].name && ES.achievements[a.id].desc), '');
check('sandbox examples translated', ES.sandboxExamples.length === Data.SANDBOX_EXAMPLES.length, '');

for (const w of Data.WORLDS) {
  const tw = ES.worlds[w.id];
  check(`world ${w.id} translated`, !!(tw && tw.name && tw.blurb), 'missing name/blurb');
}

for (const { level } of rawLevels) {
  const tr = ES.levels[level.id];
  check(`level ${level.id} translated`, !!tr, 'missing');
  if (!tr) continue;
  check(`level ${level.id} title`, typeof tr.title === 'string' && tr.title.length > 0, '');
  if (level.type === 'quiz') {
    check(`level ${level.id} question`, typeof tr.question === 'string' && tr.question.length > 0, '');
    check(`level ${level.id} explain`, typeof tr.explain === 'string' && tr.explain.length > 0, '');
    check(`level ${level.id} options length`, Array.isArray(tr.options) && tr.options.length === level.options.length, '');
  } else {
    check(`level ${level.id} task`, typeof tr.task === 'string' && tr.task.length > 10, '');
    check(`level ${level.id} hints`, Array.isArray(tr.hints) && tr.hints.length === (level.hints || []).length, '');
  }
  if (tr.starter !== undefined && level.type === 'code') {
    const p = PyEngine.parseOnly(tr.starter);
    check(`starter ${level.id} still parses`, p === null || p.type !== 'InternalError', p && `${p.type}: ${p.msg}`);
  }
}

/* no orphan translations (typos / removed levels) */
const rawIds = new Set(rawLevels.map(x => x.level.id));
const orphans = Object.keys(ES.levels).filter(id => !rawIds.has(id));
check('no orphan level translations', orphans.length === 0, orphans.join(', '));

/* ---------------- bundle() ---------------- */
const B = I18N.bundle(Data);
const bl = B.allLevels();
check('bundle keeps level count', bl.length === rawLevels.length, `got ${bl.length}`);
check('bundle keeps level ids', bl.every((x, i) => x.level.id === rawLevels[i].level.id), '');
check('bundle does not mutate source', Data.WORLDS[0].name === 'Hello, Snake Island' && Data.WORLDS[0].levels[0].title === 'Say Hello', Data.WORLDS[0].levels[0].title);
check('bundle translates worlds', B.WORLDS[0].name === ES.worlds.w1.name, B.WORLDS[0].name);
check('bundle translates levels', B.WORLDS[0].levels[0].title === ES.levels.w1l1.title, B.WORLDS[0].levels[0].title);
check('bundle keeps solutions intact', B.WORLDS[0].levels[0].solution === Data.WORLDS[0].levels[0].solution, '');
check('bundle keeps check fns intact', B.WORLDS[8].levels[0].check === Data.WORLDS[8].levels[0].check, '');

I18N.setLang('en');
check('en bundle returns canonical data', I18N.bundle(Data) === Data, '');
check('en levels untranslated', I18N.bundle(Data).WORLDS[0].levels[0].title === 'Say Hello', '');

console.log(`\n===== I18N: ${passed} passed, ${failed} failed =====`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
