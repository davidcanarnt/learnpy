/* Validates every level's solution against its expected output/check.
   Run together with the engine tests: node test/run_tests.js */
'use strict';
const PyEngine = require('../js/pyengine.js');
const Data = require('../js/levels.js');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) passed++;
  else { failed++; failures.push(name + (extra ? ' — ' + extra : '')); }
}

function normalize(text) {
  return text.split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '').replace(/^\n+/, '');
}

/* fake turtle that records ops like the browser canvas does */
function fakeTurtleModule() {
  const ops = [];
  const names = ['forward', 'fd', 'backward', 'back', 'bk', 'right', 'rt', 'left', 'lt', 'goto',
    'setpos', 'setx', 'sety', 'setheading', 'seth', 'home', 'circle', 'dot', 'penup', 'pu', 'up',
    'pendown', 'pd', 'down', 'pensize', 'width', 'speed', 'color', 'pencolor', 'fillcolor',
    'begin_fill', 'end_fill', 'bgcolor', 'write', 'clear', 'reset', 'hideturtle', 'ht',
    'showturtle', 'st'];
  const table = {};
  for (const n of names) {
    table[n] = (args, kwargs) => { ops.push({ name: n, args }); return null; };
  }
  table.xcor = () => ({ __pyfloat: 0 });
  table.ycor = () => ({ __pyfloat: 0 });
  table.heading = () => ({ __pyfloat: 0 });
  table.position = () => [({ __pyfloat: 0 }), ({ __pyfloat: 0 })];
  const mod = PyEngine.makeModule('turtle', table);
  const globalNames = {};
  for (const n of names) globalNames[n] = mod.table.get(n);
  return { mod, ops, globalNames };
}

function runSolution(level, world) {
  let code;
  if (level.type === 'code') code = level.solution;
  else if (level.type === 'arrange') code = level.lines.join('\n') + '\n';
  else if (level.type === 'fill') {
    let i = 0;
    code = level.template.replace(/___/g, () => level.blanks[i++].answer) + '\n';
  } else return null;
  const isTurtle = level.task && (code.includes('from turtle import *') || code.includes('import turtle'));
  const t = fakeTurtleModule();
  const opts = {
    modules: { turtle: t.mod },
    globalNames: t.globalNames,
    inputFn: () => (level.stdin && level.stdin.length) ? level.stdin.shift() : null
  };
  if (level.stdin) opts.stdin = level.stdin.slice();
  // stdin via inputFn closure:
  let inQueue = (level.stdin || []).slice();
  opts.inputFn = () => inQueue.length ? inQueue.shift() : null;
  const r = PyEngine.run(code, opts);
  return { r, ops: t.ops };
}

for (const { world, level } of Data.allLevels()) {
  const name = `${level.id} (${level.type}) "${level.title}"`;

  // structural checks
  if (level.type === 'quiz') {
    check(name + ' quiz structure', typeof level.question === 'string' && Array.isArray(level.options)
      && typeof level.answer === 'number' && level.answer < level.options.length && level.explain, 'bad quiz fields');
    continue;
  }
  if (!level.hints || !level.hints.length) check(name + ' has hints', false, 'missing hints');
  check(name + ' has task', typeof level.task === 'string' && level.task.length > 10, '');

  const res = runSolution(level, world);
  if (!res) continue;
  const { r, ops } = res;

  if (r.error) { check(name + ' solution runs', false, `${r.error.type}: ${r.error.msg}`); continue; }
  check(name + ' solution runs', true);

  // expected output (skip turtle free-form levels with expectedShow false)
  if (level.expectedShow === false) {
    // turtle level: must pass its check if present
    if (level.check) {
      const ok = level.check(ops);
      check(name + ' turtle check passes on solution', ok === true, `ops: ${JSON.stringify(ops.slice(0, 6))}`);
    } else {
      check(name + ' has check for turtle level', false, 'turtle level without check()');
    }
  } else {
    const got = normalize(r.output);
    const want = normalize(level.expected);
    check(name + ' output matches', got === want, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    if (level.check) {
      const ok = level.check(ops);
      check(name + ' custom check passes', ok === true, '');
    }
  }

  // starter may be intentionally incomplete (that's the exercise!), but any error
  // must be a proper friendly Python error — never an InternalError (that's OUR bug).
  if (typeof level.starter === 'string') {
    const starterParse = PyEngine.parseOnly(level.starter);
    check(name + ' starter produces real python errors', starterParse === null || starterParse.type !== 'InternalError',
      starterParse && `${starterParse.type}: ${starterParse.msg}`);
  }

  // starter must NOT already pass the level (except turtle levels whose starter IS the solution demo)
  if (level.type === 'code' && level.expectedShow !== false) {
    const t2 = fakeTurtleModule();
    let inQueue = (level.stdin || []).slice();
    const r2 = PyEngine.run(level.starter, {
      modules: { turtle: t2.mod }, globalNames: t2.globalNames,
      inputFn: () => inQueue.length ? inQueue.shift() : null
    });
    const starterOutput = normalize(r2.output || '');
    const want = normalize(level.expected);
    if (!r2.error) check(name + ' starter does not already win', starterOutput !== want, 'starter already produces expected output');
  }
}

/* daily pool sanity */
Data.DAILY.forEach((d, i) => {
  check(`daily[${i}] structure`, typeof d.q === 'string' && Array.isArray(d.options) && typeof d.answer === 'number' && d.answer < d.options.length && !!d.explain, '');
});
Data.SANDBOX_EXAMPLES.forEach((ex, i) => {
  const t = fakeTurtleModule();
  const r = PyEngine.run(ex.code, { inputFn: () => null, modules: { turtle: t.mod }, globalNames: t.globalNames });
  check(`sandbox example[${i}] "${ex.name}" runs`, !r.error, r.error && `${r.error.type}: ${r.error.msg}`);
});

/* world order + unique ids */
const ids = new Set();
for (const { level } of Data.allLevels()) {
  check(`unique id ${level.id}`, !ids.has(level.id), '');
  ids.add(level.id);
}

console.log(`\n===== LEVELS: ${passed} passed, ${failed} failed =====`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
