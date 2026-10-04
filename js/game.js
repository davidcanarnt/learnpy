/* ============================================================================
   LearnPy — game.js
   All game logic: screens, progress, XP, hearts, combo, achievements,
   the code editor, level runners, quiz/arrange/fill, turtle wiring, sound,
   confetti and toasts.
   ========================================================================== */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const D = window.LearnPyData;
  const Py = window.PyEngine;

  const SAVE_KEY = 'learnpy_save_v1';
  const TOTAL_LEVELS = D.allLevels().length;

  /* ============================== save state ============================ */
  let save = defaultSave();
  function defaultSave() {
    return {
      v: 1, xp: 0, combo: 0, bestCombo: 0,
      levels: {}, ach: [],
      sound: true, anim: true,
      daily: { date: '', done: false },
      sandboxRuns: 0, noHintCount: 0, quizFirstTry: 0,
      last: null
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) save = Object.assign(defaultSave(), JSON.parse(raw));
    } catch (e) { /* private mode etc. */ }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
  loadSave();

  function levelState(id) { return save.levels[id] || null; }

  /* ============================== helpers =============================== */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function md(text) {
    let s = esc(text);
    s = s.replace(/\\\*/g, '\u0001');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/\u0001/g, '*');
    s = s.replace(/\n/g, '<br>');
    return s;
  }
  function normalizeOut(text) {
    return String(text).split('\n').map(l => l.replace(/\s+$/, '')).join('\n')
      .replace(/^\n+/, '').replace(/\n+$/, '');
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function hourNow() { return new Date().getHours(); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================== audio ================================= */
  const Sfx = {
    ctx: null,
    ensure() {
      if (!save.sound) return null;
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      } catch (e) { return null; }
    },
    tone(freq, dur, type, vol, when) {
      const ctx = this.ensure(); if (!ctx) return;
      const t0 = ctx.currentTime + (when || 0);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    click() { this.tone(700, 0.06, 'square', 0.05); },
    type() { this.tone(1200 + Math.random() * 300, 0.02, 'square', 0.015); },
    ok() { [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.1, i * 0.09)); },
    star() { this.tone(880, 0.12, 'sine', 0.09); this.tone(1760, 0.2, 'sine', 0.07, 0.1); },
    bad() { this.tone(220, 0.2, 'sawtooth', 0.07); this.tone(160, 0.3, 'sawtooth', 0.06, 0.12); },
    heart() { this.tone(400, 0.15, 'sine', 0.08); this.tone(200, 0.25, 'sine', 0.07, 0.12); },
    levelup() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.1, i * 0.1)); },
    ach() { [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => this.tone(f, 0.2, 'sine', 0.09, i * 0.09)); }
  };

  /* ============================== confetti ============================== */
  const Confetti = {
    canvas: $('#confetti-canvas'),
    parts: [], running: false,
    init() {
      this.ctx = this.canvas.getContext('2d');
      const rs = () => { this.canvas.width = innerWidth; this.canvas.height = innerHeight; };
      addEventListener('resize', rs); rs();
    },
    burst(n, colors) {
      const cols = colors || ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'];
      for (let i = 0; i < (n || 130); i++) {
        this.parts.push({
          x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
          y: innerHeight * 0.35 + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 14,
          vy: -4 - Math.random() * 9,
          size: 5 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          color: cols[Math.floor(Math.random() * cols.length)],
          life: 70 + Math.random() * 50
        });
      }
      if (!this.running) { this.running = true; requestAnimationFrame(() => this.tick()); }
    },
    tick() {
      const c = this.ctx;
      c.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.parts = this.parts.filter(p => p.life > 0 && p.y < this.canvas.height + 40);
      for (const p of this.parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.rot += p.vr; p.life--;
        c.save();
        c.translate(p.x, p.y); c.rotate(p.rot);
        c.globalAlpha = Math.min(1, p.life / 30);
        c.fillStyle = p.color;
        c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        c.restore();
      }
      if (this.parts.length) requestAnimationFrame(() => this.tick());
      else { this.running = false; c.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    }
  };

  /* ============================== toasts ================================ */
  function toast(icon, title, desc, gold) {
    const el = document.createElement('div');
    el.className = 'toast' + (gold ? ' gold' : '');
    el.innerHTML = `<span class="t-icon">${icon}</span><div><div class="t-name">${esc(title)}</div><div class="t-desc">${esc(desc)}</div></div>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 3400);
  }

  /* ============================ achievements ============================ */
  function award(id) {
    if (save.ach.includes(id)) return;
    const a = D.ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    save.ach.push(id);
    persist();
    Sfx.ach();
    toast(a.icon, 'Achievement: ' + a.name, a.desc, true);
  }

  function checkAchAfterRun() {
    if (hourNow() >= 0 && hourNow() < 5) award('night_owl');
    if (save.xp >= 500) award('xp500');
    if (save.xp >= 1000) award('xp1000');
    if (save.combo >= 5) award('combo5');
    if (save.combo >= 10) award('combo10');
    if (save.noHintCount >= 5) award('no_hint5');
    if (save.quizFirstTry >= 5) award('quiz_ace');
    if (save.sandboxRuns >= 5) award('sandbox5');
  }

  /* =========================== xp / rank / hearts ======================= */
  function rankFor(xp) {
    let r = D.RANKS[0];
    for (const cand of D.RANKS) if (xp >= cand.xp) r = cand;
    return r;
  }
  function nextRankFor(xp) {
    for (const cand of D.RANKS) if (xp < cand.xp) return cand;
    return null;
  }

  let hearts = 5;
  function renderHearts() {
    for (const host of [$('#hearts-map'), $('#hearts-level')]) {
      let html = '';
      for (let i = 0; i < 5; i++) html += `<span class="heart ${i < hearts ? '' : 'lost'}">❤️</span>`;
      host.innerHTML = html;
    }
  }
  function loseHeart() {
    if (hearts > 0) hearts--;
    renderHearts();
    Sfx.heart();
    $$('#screen-level .heart').forEach(h => { h.classList.add('pulse'); setTimeout(() => h.classList.remove('pulse'), 550); });
    if (hearts <= 0) setTimeout(outOfHearts, 600);
  }
  function gainHeart() { hearts = Math.min(5, hearts + 1); renderHearts(); }

  function outOfHearts() {
    const tip = D.TIPS[Math.floor(Math.random() * D.TIPS.length)];
    showInfoModal({
      title: '💔 Out of hearts!',
      html: `<div class="sub" style="margin-bottom:12px">Every failed run costs a heart — but hearts come back when you finish levels.<br><br>
             Meanwhile, here's a tip from Pip to keep your streak alive:</div>
             <div class="hintbox show" style="display:block">💡 ${esc(tip)}</div>`,
      buttons: [{ label: '💪 Got it — one mercy heart', primary: true, onClick: () => { hearts = 1; renderHearts(); } }]
    });
  }

  function updateXpUi() {
    const r = rankFor(save.xp);
    const nxt = nextRankFor(save.xp);
    $('#rank-name').textContent = `${r.icon} ${r.name}`;
    $('#xp-text').textContent = `${save.xp} XP`;
    let pct = 100, txt = 'MAX';
    if (nxt) {
      const span = nxt.xp - r.xp;
      pct = Math.min(100, Math.round(((save.xp - r.xp) / span) * 100));
      txt = `${nxt.xp - save.xp} XP → ${nxt.name}`;
    }
    $('#xp-fill').style.width = pct + '%';
    $('#xp-fill').title = txt;
  }

  function addXp(n) {
    save.xp += n;
    persist();
    updateXpUi();
  }

  function renderCombo() {
    const els = [$('#combo-map'), $('#combo-level')];
    for (const el of els) {
      if (save.combo >= 2) {
        el.textContent = `🔥 ${save.combo} streak`;
        el.classList.add('show');
      } else el.classList.remove('show');
    }
  }

  /* ============================ screens ================================= */
  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $('#' + id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ============================ title screen ============================ */
  function renderTitle() {
    const done = Object.values(save.levels).filter(l => l.done).length;
    const stars = Object.values(save.levels).reduce((a, l) => a + (l.stars || 0), 0);
    const r = rankFor(save.xp);
    $('#title-stats').innerHTML = done === 0 ? '' : `
      <span class="stat-chip">${r.icon} <b>${esc(r.name)}</b></span>
      <span class="stat-chip">⭐ <b>${save.xp}</b> XP</span>
      <span class="stat-chip">✅ <b>${done}</b>/${TOTAL_LEVELS} levels</span>
      <span class="stat-chip">🌟 <b>${stars}</b> stars</span>`;
    $('#btn-continue').style.display = done > 0 ? '' : 'none';
    const bubble = $('#title-bubble');
    const lines = done === 0
      ? `Sssso… you want to learn <b>Python</b>? I'm <b>Pip</b> — your guide. ${TOTAL_LEVELS} levels, 10 worlds, one Great Bug. Ready?`
      : done === TOTAL_LEVELS
        ? `You did it! <b>Serpent Master</b>! 🎉 Come play in the Sandbox any time.`
        : `Welcome back! <b>${TOTAL_LEVELS - done}</b> levels to go. I smell a streak coming on… 🔥`;
    bubble.innerHTML = lines;
  }

  /* ============================== map screen ============================ */
  function isWorldUnlocked(wi) {
    if (wi === 0) return true;
    const prev = D.WORLDS[wi - 1];
    return prev.levels.every(l => levelState(l.id)?.done);
  }
  function isLevelUnlocked(wi, li) {
    if (!isWorldUnlocked(wi)) return false;
    if (li === 0) return true;
    return !!levelState(D.WORLDS[wi].levels[li - 1].id)?.done;
  }

  const TYPE_ICON = { code: '▶', quiz: '💭', arrange: '🧩', fill: '✏️' };

  function renderMap() {
    updateXpUi(); renderCombo(); renderHearts();

    // daily banner
    const db = $('#daily-banner');
    const isDone = save.daily.done && save.daily.date === todayStr();
    db.classList.toggle('done', isDone);
    const q = D.DAILY[dailyIndex()];
    $('#daily-q').textContent = q.q;
    $('#btn-daily').textContent = isDone ? 'Done ✓' : 'Play';
    $('#btn-daily').disabled = isDone;

    const host = $('#worlds');
    host.innerHTML = '';
    D.WORLDS.forEach((w, wi) => {
      const unlocked = isWorldUnlocked(wi);
      const doneCount = w.levels.filter(l => levelState(l.id)?.done).length;
      const card = document.createElement('div');
      card.className = 'world-card';
      card.style.setProperty('--wt', w.tint);
      const nodes = w.levels.map((l, li) => {
        const st = levelState(l.id);
        const unl = unlocked && isLevelUnlocked(wi, li);
        const isCurrent = unl && !st?.done;
        const cls = ['level-node'];
        if (!unl) cls.push('locked');
        if (st?.done) cls.push('done');
        if (isCurrent) cls.push('current');
        const stars = st?.stars || 0;
        return `<div class="${cls.join(' ')}" data-w="${wi}" data-l="${li}" title="${esc(l.title)}">
          <div class="level-icon">${unl ? (TYPE_ICON[l.type] || '▶') : '🔒'}</div>
          <div class="level-name">${esc(l.title)}</div>
          <div class="level-stars">${st?.done ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}</div>
          <div class="level-xp">+${l.xp} XP</div>
        </div>`;
      }).join('');
      card.innerHTML = `
        <div class="world-head">
          <div class="world-emoji">${w.emoji}</div>
          <div>
            <div class="world-name">${w.name} ${unlocked ? '' : '🔒'}</div>
            <div class="world-blurb">${w.blurb}</div>
          </div>
          <div class="world-progress">${doneCount}/${w.levels.length} done
            <div class="wbar"><div class="wbarfill" style="width:${(doneCount / w.levels.length) * 100}%"></div></div>
          </div>
        </div>
        <div class="level-row">${nodes}</div>`;
      if (!unlocked) {
        card.style.opacity = .55;
        card.style.filter = 'saturate(.5)';
      }
      host.appendChild(card);
    });

    $$('#worlds .level-node').forEach(node => {
      node.addEventListener('click', () => {
        const wi = +node.dataset.w, li = +node.dataset.l;
        if (!isLevelUnlocked(wi, li)) { Sfx.bad(); return; }
        Sfx.click();
        openLevel(wi, li);
      });
    });
  }

  function dailyIndex() {
    const d = new Date(todayStr());
    const days = Math.floor(d.getTime() / 86400000);
    return days % D.DAILY.length;
  }

  /* ============================ editor ================================== */
  const PY_KEYWORDS = 'if|elif|else|while|for|in|def|return|break|continue|pass|import|from|as|and|or|not|is';
  const PY_CONSTS = 'True|False|None';
  const PY_BUILTINS = 'print|len|range|str|int|float|bool|input|sum|min|max|sorted|abs|round|list|dict|type|enumerate|zip|any|all|reversed|repr|chr|ord|divmod|pow|append|extend|insert|pop|remove|index|count|sort|reverse|clear|copy|keys|values|items|get|update|setdefault|upper|lower|title|capitalize|strip|lstrip|rstrip|split|join|replace|find|startswith|endswith|isdigit|isalpha|format|center|ljust|rjust|zfill|forward|fd|backward|back|bk|right|rt|left|lt|goto|setpos|setx|sety|setheading|seth|home|circle|dot|penup|pu|pendown|pd|down|pensize|width|speed|color|pencolor|fillcolor|begin_fill|end_fill|bgcolor|write|hideturtle|showturtle|randint|choice|shuffle|uniform|random|sqrt|floor|ceil|fabs|pi|tau|e';
  const HL_RE = new RegExp(
    `(#[^\\n]*)` +
    `|(f"(?:\\\\.|[^"\\\\\\n])*"?|f'(?:\\\\.|[^'\\\\\\n])*'?)` +
    `|("(?:\\\\.|[^"\\\\\\n])*"?|'(?:\\\\.|[^'\\\\\\n])*'?)` +
    `|\\b(\\d+\\.?\\d*(?:[eE][+-]?\\d+)?)\\b` +
    `|\\b(${PY_CONSTS})\\b` +
    `|\\b(${PY_KEYWORDS})\\b` +
    `|\\b(${PY_BUILTINS})\\b`, 'g');

  function highlightSrc(src) {
    let out = '';
    let last = 0;
    src.replace(HL_RE, (m, com, fstr, str, num, konst, kw, fn, offset) => {
      out += esc(src.slice(last, offset));
      const cls = com ? 'tk-com' : fstr ? 'tk-fstr' : str ? 'tk-str' : num ? 'tk-num'
        : konst ? 'tk-const' : kw ? 'tk-kw' : fn ? 'tk-fn' : '';
      out += `<span class="${cls}">${esc(m)}</span>`;
      last = offset + m.length;
      return m;
    });
    out += esc(src.slice(last));
    return out + '\n';
  }

  class Editor {
    constructor(textarea, hl, gutter) {
      this.ta = textarea; this.hl = hl; this.gutter = gutter;
      this.ta.addEventListener('input', () => { this.refresh(); Sfx.type(); });
      this.ta.addEventListener('scroll', () => { this.hl.scrollTop = this.ta.scrollTop; });
      this.ta.addEventListener('keydown', e => this.onKey(e));
      this.refresh();
    }
    getCode() { return this.ta.value; }
    setCode(s) { this.ta.value = s; this.refresh(); }
    focus() { this.ta.focus(); }
    refresh() {
      const v = this.ta.value;
      this.hl.innerHTML = highlightSrc(v);
      const lines = v.split('\n').length;
      let g = '';
      for (let i = 1; i <= lines; i++) g += `<div>${i}</div>`;
      this.gutter.innerHTML = g;
      this.ta.style.height = 'auto';
      this.ta.style.height = Math.max(240, this.ta.scrollHeight) + 'px';
      this.hl.style.minHeight = Math.max(240, this.ta.scrollHeight) + 'px';
    }
    onKey(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = this.ta, s = ta.selectionStart, en = ta.selectionEnd;
        if (e.shiftKey) {
          // outdent current line
          const before = ta.value.slice(0, s);
          const lineStart = before.lastIndexOf('\n') + 1;
          const line = ta.value.slice(lineStart);
          const cut = line.match(/^ {1,4}/);
          if (cut) {
            ta.value = ta.value.slice(0, lineStart) + line.slice(cut[0].length);
            ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - cut[0].length);
          }
        } else {
          ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
        this.refresh();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const ta = this.ta, s = ta.selectionStart;
        const before = ta.value.slice(0, s);
        const lineStart = before.lastIndexOf('\n') + 1;
        const curLine = before.slice(lineStart);
        let indent = (curLine.match(/^ */) || [''])[0];
        if (/:\s*$/.test(curLine.trimEnd())) indent += '    ';
        const insert = '\n' + indent;
        ta.value = before + insert + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + insert.length;
        this.refresh();
      }
    }
  }

  /* ============================ turtle ================================== */
  function makeTurtle(container) {
    return new window.TurtleCanvas(container, { width: 520, height: 400 });
  }

  function turtleModuleFor(canvas) {
    const mod = canvas.makeModule(Py);
    const names = {};
    for (const [k, v] of mod.table) names[k] = v;
    return { mod, names };
  }

  /* ============================ level flow ============================== */
  let cur = null;
  let levelEditor = null;

  function openLevel(wi, li) {
    const world = D.WORLDS[wi];
    const level = world.levels[li];
    cur = { wi, li, world, level, attempts: 0, hintsUsed: 0, quizFirst: true };

    $('#level-crumb').textContent = `${world.emoji} ${world.name} — ${level.title}`;
    $('#task-text').innerHTML = md(level.task);
    $('#level-bubble').innerHTML = pickBubble(level);
    setMood('happy');
    resetHintUi();

    // expected output box
    const showExp = level.expectedShow !== false && level.expected;
    $('#expected-box').style.display = showExp ? '' : 'none';
    if (showExp) $('#expected-pre').textContent = level.expected;

    // panels
    $('#editor-panel').style.display = level.type === 'code' ? '' : 'none';
    $('#quiz-panel').style.display = level.type === 'quiz' ? '' : 'none';
    $('#arrange-panel').style.display = level.type === 'arrange' ? '' : 'none';
    $('#fill-panel').style.display = level.type === 'fill' ? '' : 'none';
    $('#run-row').style.display = level.type === 'quiz' ? 'none' : '';

    // console reset
    setConsole('', 'Run your program to see its output here.', '');
    $('#attempts-note').textContent = '';

    // type-specific setup
    if (level.type === 'code') {
      if (!levelEditor) levelEditor = new Editor($('#code'), $('#hl'), $('#gutter'));
      cur.editor = levelEditor;
      cur.editor.onCtrlEnter = runLevel;
      cur.editor.setCode(level.starter);
      cur.editor.focus();
    } else if (level.type === 'quiz') {
      renderQuiz(level);
    } else if (level.type === 'arrange') {
      renderArrange(level);
    } else if (level.type === 'fill') {
      renderFill(level);
    }

    // turtle panel
    const isTurtleLevel = level.world === 'turtle' || /from\s+turtle|import\s+turtle/.test(level.starter || '');
    const panel = $('#turtle-panel');
    if (isTurtleLevel) {
      panel.style.display = '';
      cur.turtle = makeTurtle(panel);
      const t = turtleModuleFor(cur.turtle);
      cur.turtleMod = t.mod; cur.turtleNames = t.names;
    } else {
      panel.style.display = 'none';
      cur.turtle = null; cur.turtleMod = null; cur.turtleNames = null;
    }

    save.last = { wi, li };
    persist();
    showScreen('screen-level');
  }

  function pickBubble(level) {
    const bubbles = [
      'Read the mission closely — the expected output is your target! 🎯',
      'Small steps: write one or two lines, then run. Run early, run often!',
      'Psst — the expected output box shows exactly what to produce.',
      'Stuck? The hint button is not a defeat, it\'s a shortcut to wisdom. 💡'
    ];
    if (level.type === 'quiz') return 'No coding needed here — pick the answer and read the explanation! 🤔';
    if (level.type === 'arrange') return 'Tap the pieces in order. Indentation matters — the lines remember their spaces!';
    if (level.type === 'fill') return 'Tap a blank, then tap the chip that fits. Then press Run!';
    return bubbles[Math.floor(Math.random() * bubbles.length)];
  }

  function resetHintUi() {
    $('#hintbox').classList.remove('show');
    $('#btn-hint').disabled = false;
    $('#btn-hint').textContent = '💡 Hint';
    cur.hintIdx = 0;
  }

  function showHint() {
    const hints = cur.level.hints || [];
    if (!hints.length) return;
    if (cur.hintIdx < hints.length) {
      $('#hint-text').textContent = hints[cur.hintIdx];
      $('#hintbox').classList.add('show');
      cur.hintIdx++;
      cur.hintsUsed = (cur.hintsUsed || 0) + 1;
      setMood('think');
      Sfx.click();
      if (cur.hintIdx >= hints.length) $('#btn-hint').disabled = true;
      else $('#btn-hint').textContent = '💡 Another hint';
    }
  }

  function setMood(mood) {
    const mouths = {
      happy: 'M34 27 Q40 32 46 27',
      sad: 'M34 30 Q40 26 46 30',
      think: 'M34 28 L46 28'
    };
    $('#lv-mouth').setAttribute('d', mouths[mood] || mouths.happy);
    const svg = $('#mascot-level');
    svg.classList.remove('happy', 'sad');
    if (mood === 'happy') { svg.classList.add('happy'); void svg.offsetWidth; svg.classList.add('happy'); }
    if (mood === 'sad') svg.classList.add('sad');
  }

  function say(msg) { $('#level-bubble').innerHTML = msg; }

  function setConsole(kind, text, extraHtml) {
    const body = $('#console-body');
    body.className = 'console-body' + (kind ? ' ' + kind : '');
    body.innerHTML = esc(text) + (extraHtml || '');
    $('#console-state').textContent = kind === 'ok' ? '✓ success' : kind === 'err' ? '✗ error' : '';
  }

  function appendConsole(html) {
    const body = $('#console-body');
    body.innerHTML += html;
  }

  /* ------------------------------ quiz ---------------------------------- */
  function renderQuiz(level) {
    $('#quiz-q').textContent = level.question;
    const codeEl = $('#quiz-code');
    if (level.code) { codeEl.style.display = ''; codeEl.textContent = level.code; }
    else codeEl.style.display = 'none';
    $('#quiz-explain').classList.remove('show');
    $('#btn-quiz-done').style.display = 'none';
    const opts = $('#quiz-opts');
    opts.innerHTML = '';
    level.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (i === level.answer) {
          b.classList.add('correct');
          [...opts.children].forEach(x => { if (x !== b) x.disabled = true; });
          $('#quiz-explain').innerHTML = '<b>💡 Why:</b> ' + esc(level.explain);
          $('#quiz-explain').classList.add('show');
          $('#btn-quiz-done').style.display = '';
          Sfx.ok();
          if (cur.quizFirst) {
            save.quizFirstTry++;
            if (save.quizFirstTry >= 5) award('quiz_ace');
          }
          succeedRun();
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          cur.quizFirst = false;
          loseHeart();
          save.combo = 0; renderCombo();
          Sfx.bad();
          setMood('sad');
          say('Not quite! Read the options again — you\'ve got this. 💪');
          setConsole('err', 'Not the right answer — try again!', '');
        }
      });
      opts.appendChild(b);
    });
  }
  $('#btn-quiz-done').addEventListener('click', () => {
    Sfx.click();
    $('#modal-success').classList.add('show');
  });

  /* ------------------------------ arrange ------------------------------- */
  function renderArrange(level) {
    cur.arrangeSelected = [];
    let shuffled = shuffle(level.lines);
    let guard = 0;
    while (shuffled.join('|') === level.lines.join('|') && guard++ < 10) shuffled = shuffle(level.lines);
    cur.arrangePool = shuffled;
    drawArrange();
  }
  function drawArrange() {
    const area = $('#arrange-area');
    const pool = $('#arrange-pool');
    area.innerHTML = '';
    if (!cur.arrangeSelected.length) {
      area.innerHTML = '<div class="empty-note">Tap pieces below to build the program…</div>';
    }
    cur.arrangeSelected.forEach((line, i) => {
      const el = document.createElement('div');
      el.className = 'arrange-chip';
      el.innerHTML = `<span class="arrange-num">${i + 1}.</span>` + esc(line);
      el.addEventListener('click', () => {
        // click a placed chip to send it back
        cur.arrangeSelected.splice(i, 1);
        cur.arrangePool.push(line);
        Sfx.click();
        drawArrange();
      });
      area.appendChild(el);
    });
    pool.innerHTML = '';
    cur.arrangePool.forEach(line => {
      const el = document.createElement('div');
      el.className = 'arrange-chip';
      el.textContent = line;
      el.addEventListener('click', () => {
        cur.arrangeSelected.push(line);
        cur.arrangePool.splice(cur.arrangePool.indexOf(line), 1);
        Sfx.click();
        drawArrange();
      });
      pool.appendChild(el);
    });
  }
  $('#btn-arrange-reset').addEventListener('click', () => { renderArrange(cur.level); Sfx.click(); });
  $('#btn-arrange-undo').addEventListener('click', () => {
    if (cur.arrangeSelected.length) {
      cur.arrangePool.push(cur.arrangeSelected.pop());
      drawArrange(); Sfx.click();
    }
  });

  /* ------------------------------ fill ---------------------------------- */
  function renderFill(level) {
    cur.fillAnswers = level.blanks.map(() => null);
    cur.fillActive = 0;
    cur.fillPool = shuffle(level.blanks.flatMap(b => b.choices));
    cur.fillUsed = new Set();
    $('#fill-chips').innerHTML = '';   // clear stale chips before drawFill→refreshChips
    drawFill();
    const chips = $('#fill-chips');
    // pool = all choices, shuffled
    const pool = cur.fillPool;
    pool.forEach(choice => {
      const el = document.createElement('button');
      el.className = 'fill-chip';
      el.textContent = choice;
      el.dataset.val = choice;
      el.addEventListener('click', () => {
        const idx = cur.fillActive;
        if (cur.fillAnswers[idx] !== null && cur.fillAnswers[idx] !== undefined) return;
        cur.fillAnswers[idx] = choice;
        cur.fillUsed.add(choice);
        // advance to next empty blank
        let next = cur.fillAnswers.findIndex(a => a === null);
        cur.fillActive = next === -1 ? idx : next;
        Sfx.click();
        drawFill();
      });
      chips.appendChild(el);
    });
  }
  function drawFill() {
    const level = cur.level;
    const parts = level.template.split('___');
    const host = $('#fill-code');
    host.innerHTML = '';
    parts.forEach((seg, i) => {
      host.appendChild(document.createTextNode(seg));
      if (i < level.blanks.length) {
        const val = cur.fillAnswers[i];
        const btn = document.createElement('button');
        btn.className = 'blankbtn' + (val ? ' filled' : '') + (cur.fillActive === i ? ' active' : '');
        btn.textContent = val || '___';
        btn.addEventListener('click', () => {
          if (val) {
            // take it back
            cur.fillUsed.delete(val);
            cur.fillAnswers[i] = null;
            cur.fillActive = i;
          } else {
            cur.fillActive = i;
          }
          Sfx.click();
          drawFill();
          refreshChips();
        });
        host.appendChild(btn);
      }
    });
    refreshChips();
  }
  function refreshChips() {
    $$('#fill-chips .fill-chip').forEach(chip => {
      const val = chip.dataset.val;
      const usedCount = cur.fillAnswers.filter(a => a === val).length;
      const inPoolCount = cur.fillPool.filter(c => c === val).length;
      chip.classList.toggle('used', usedCount >= inPoolCount);
    });
  }

  /* ------------------------------ running ------------------------------- */
  function levelInputFn(promptText) {
    const q = cur.level.stdin || [];
    if (cur.stdinQueue && cur.stdinQueue.length) {
      const v = cur.stdinQueue.shift();
      appendConsole(`\n<span style="color:#5b6a92">⌨️ ${esc(promptText || '')}</span>\n<span style="color:#8b96b8">   ↳ "${esc(v)}"</span>\n`);
      return v;
    }
    appendConsole(`\n<span style="color:#5b6a92">⌨️ ${esc(promptText || '')} (no more input provided)</span>\n`);
    return null;
  }

  function prepareRun(code) {
    // turtle module available when the level needs it or code asks for it
    const wantsTurtle = /from\s+turtle|import\s+turtle/.test(code) || cur.level.world === 'turtle';
    if (wantsTurtle) {
      if (!cur.turtle) {
        const panel = $('#turtle-panel');
        panel.style.display = '';
        cur.turtle = makeTurtle(panel);
        const t = turtleModuleFor(cur.turtle);
        cur.turtleMod = t.mod; cur.turtleNames = t.names;
      }
      cur.turtle.reset(false);
    } else if (cur.turtle) {
      cur.turtle.reset(false);
    }
    return wantsTurtle;
  }

  function runLevel() {
    if (!cur || cur.level.type === 'quiz') return;
    const level = cur.level;
    let code;
    if (level.type === 'code') code = cur.editor.getCode();
    else if (level.type === 'arrange') {
      if (!cur.arrangeSelected.length) { Sfx.bad(); return; }
      code = cur.arrangeSelected.join('\n') + '\n';
    } else if (level.type === 'fill') {
      // split yields (blanks+1) segments — only insert answers before the tail
      code = level.template.split('___').map((seg, i) => {
        const a = i < cur.fillAnswers.length ? cur.fillAnswers[i] : undefined;
        return seg + (i < cur.fillAnswers.length ? (a !== null && a !== undefined ? a : '___') : '');
      }).join('') + '\n';
    }
    cur.attempts++;
    $('#attempts-note').textContent = cur.attempts > 1 ? `attempt ${cur.attempts}` : '';

    const runBtn = $('#btn-run');
    runBtn.classList.add('running');
    runBtn.disabled = true;

    // defer so the button animation shows
    setTimeout(() => {
      const wantsTurtle = prepareRun(code);
      cur.stdinQueue = (level.stdin || []).slice();

      const result = Py.run(code, {
        inputFn: levelInputFn,
        maxSteps: 400000,
        modules: { turtle: cur.turtleMod || undefined },
        globalNames: cur.turtleNames || undefined
      });

      runBtn.classList.remove('running');
      runBtn.disabled = false;

      const ops = cur.turtle ? cur.turtle.ops : [];

      // ---------- python error? ----------
      if (result.error) {
        failRun({ kind: 'error', error: result.error });
        return;
      }

      award('first_run');
      checkAchAfterRun();

      // show the program's real output in the console (even before checks)
      setConsole('ok', result.output || '(no output — did you print anything?)', '');

      // ---------- check ----------
      if (level.expectedShow === false) {
        // turtle world: judge via check(ops)
        const ok = !level.check || level.check(ops);
        if (ok) succeedRun();
        else failRun({ kind: 'turtle', msg: 'The turtle needs to follow the mission more closely — check the task again!' });
        return;
      }

      const got = normalizeOut(result.output);
      const want = normalizeOut(level.expected);
      if (got === want) succeedRun();
      else failRun({ kind: 'mismatch', got, want, output: result.output });
    }, 220);
  }

  function failRun({ kind, error, got, want, output, msg }) {
    loseHeart();
    save.combo = 0; persist(); renderCombo();
    Sfx.bad();
    setMood('sad');
    $('#editor-panel').classList.add('err-flash');
    setTimeout(() => $('#editor-panel').classList.remove('err-flash'), 450);

    if (kind === 'error') {
      const e = error;
      const friendly = FRIENDLY[e.type] || 'Check your code and try again!';
      setConsole('err',
        `${outputDisplay('')}`,
        `<span class="errbadge">${esc(e.type)}</span>${esc(e.msg)} ${e.line ? `<span style="color:#5b6a92">(line ${e.line})</span>` : ''}
<span class="errline">💡 ${esc(friendly)}</span>`);
      say(pickFailBubble(e.type));
    } else if (kind === 'mismatch') {
      setConsole('err',
        `Your program ran, but the output doesn't match yet.
`,
        `<div class="diffbox">
          <div class="want"><div class="dt">🎯 Expected</div><pre style="margin:0;font-family:inherit;white-space:pre-wrap">${esc(want)}</pre></div>
          <div class="got"><div class="dt">🖥 You got</div><pre style="margin:0;font-family:inherit;white-space:pre-wrap">${esc(got || '(nothing)')}</pre></div>
        </div>`);
      say('So close! Compare your output with the expected one — the difference is hiding in plain sight. 🔍');
    } else {
      setConsole('err', msg || 'Not quite there yet.', '');
      say(msg || 'Not quite — check the mission card on the left!');
    }
  }

  function pickFailBubble(type) {
    const map = {
      NameError: 'Python met a name it doesn\'t know. Spelling trap, or used before created?',
      SyntaxError: 'Python can\'t even read that line — hunt for missing colons, commas or quotes!',
      IndentationError: 'The spacing police! Indent lines inside if/for/def with 4 spaces.',
      TypeError: 'Type clash! Maybe you\'re adding text to a number — f-strings fix that.',
      ZeroDivisionError: 'Dividing by zero breaks the universe (and Python).',
      KeyError: 'That key isn\'t in the dictionary — .get() is the safe way.',
      IndexError: 'That position doesn\'t exist. Indexes start at 0!',
      ValueError: 'The value doesn\'t fit — int() needs digits, for example.',
      TimeLimit: 'Infinite loop alert! Make sure your while condition can become False.',
      RecursionError: 'A function that never stops calling itself… give it a base case!',
      OutputLimit: 'That\'s a LOT of printing. Check your loop conditions!'
    };
    return map[type] || 'Hmm, Python didn\'t like that. Read the error — it usually points right at the problem.';
  }

  const FRIENDLY = {
    NameError: 'Did you spell the name correctly? Create variables before using them.',
    SyntaxError: 'Check for a missing colon (:), comma, quote or bracket on/above that line.',
    IndentationError: 'Indent lines inside blocks with exactly 4 spaces.',
    TypeError: 'You may be mixing types — convert with str() / int(), or use an f-string.',
    ZeroDivisionError: 'Division by zero! Guard it with an if.',
    KeyError: 'Use .get(key, default) to read a key that might be missing.',
    IndexError: 'That index is out of range — lists have len(list) items, starting at 0.',
    ValueError: 'The value can\'t be converted — int("12") works, int("hi") doesn\'t.',
    TimeLimit: 'Infinite loop! Make sure the while condition eventually becomes False.',
    RecursionError: 'Your function calls itself forever — add a stopping condition.',
    ImportError: 'Only random, math and turtle are available here.',
    EOFError: 'input() ran out of provided answers.',
    AttributeError: 'That method name doesn\'t exist for this type — check spelling.',
    OutputLimit: 'Your program printed too much — check your loops.'
  };

  function outputDisplay(s) { return s; }

  function succeedRun() {
    const level = cur.level;
    // stars: first clean attempt wins 3
    const firstTry = level.type === 'quiz' ? cur.quizFirst : cur.attempts <= 1;
    const stars = (firstTry && !cur.hintsUsed) ? 3 : ((firstTry || cur.attempts <= 3) && cur.hintsUsed <= 1) ? 2 : 1;
    const prev = levelState(level.id);
    const bestStars = Math.max(stars, prev?.stars || 0);

    // streak & xp
    save.combo++;
    save.bestCombo = Math.max(save.bestCombo, save.combo);
    if (!cur.hintsUsed) save.noHintCount++;
    let xp = level.xp;
    const base = xp;
    const starBonus = (stars - 1) * 5;
    xp += starBonus;
    let comboBonus = 0;
    if (save.combo >= 6) comboBonus = Math.round(base * 0.2);
    else if (save.combo >= 3) comboBonus = Math.round(base * 0.1);
    xp += comboBonus;

    save.levels[level.id] = { done: true, stars: bestStars };
    addXp(xp);
    gainHeart();
    checkAchAfterRun();
    checkWorldAch(cur.wi);

    persist();
    renderCombo();

    Sfx.levelup();
    Confetti.burst(140);

    const isLast = cur.wi === D.WORLDS.length - 1 && cur.li === cur.world.levels.length - 1;
    const hasNext = !isLast && findNext();

    setMood('happy');
    say(pickWinBubble());

    const showSuccess = () => showSuccessModal({ stars, xp, base, starBonus, comboBonus, isLast, hasNext });
    if (cur.turtle) cur.turtle.whenIdle(showSuccess, 9000);
    else setTimeout(showSuccess, 450);
  }

  function pickWinBubble() {
    const lines = ['Ssspectacular! 🎉', 'You\'re getting scary good at this! 🐍', 'That\'s the way — clean and correct!', 'Brilliant! The Great Bug fears you now.'];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function checkWorldAch(wi) {
    const w = D.WORLDS[wi];
    const allDone = w.levels.every(l => levelState(l.id)?.done);
    if (allDone) {
      award('world_done');
      if (w.id === 'w9') award('turtle_artist');
      if (w.id === 'w10') award('bugslayer');
      const perfect = w.levels.every(l => (levelState(l.id)?.stars || 0) === 3);
      if (perfect) award('perfect_world');
      toast(w.emoji, 'World complete!', `${w.name} — every level cleared!`, true);
      Confetti.burst(220);
    }
  }

  function findNext() {
    const w = cur.world, l = cur.level;
    if (cur.li + 1 < w.levels.length) return { wi: cur.wi, li: cur.li + 1 };
    if (cur.wi + 1 < D.WORLDS.length) return { wi: cur.wi + 1, li: 0 };
    return null;
  }

  function showSuccessModal({ stars, xp, base, starBonus, comboBonus, isLast, hasNext }) {
    const modal = $('#modal-success');
    $('#success-title').textContent = isLast ? 'ADVENTURE COMPLETE! 🏆' : 'Level complete!';
    const st = levelState(cur.level.id);
    $('#success-sub').textContent = `“${cur.level.title}” — ${'★'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}`;
    $$('#modal-success .star').forEach((s, i) => {
      s.classList.remove('lit');
      if (i < st.stars) setTimeout(() => { s.classList.add('lit'); Sfx.star(); }, 150 + i * 260);
    });
    $('#xp-gain').textContent = `+${xp} XP`;
    const bits = [`${base} base`];
    if (starBonus) bits.push(`+${starBonus} stars`);
    if (comboBonus) bits.push(`+${comboBonus} 🔥 streak`);
    $('#xp-detail').textContent = bits.join(' · ');

    // finale certificate
    const cert = $('#cert-pre');
    if (isLast) {
      const r = rankFor(save.xp);
      cert.style.display = '';
      cert.textContent =
`╔═══════════════════════════════════════════╗
║      🐍  LEARNPY CERTIFICATE  🐍          ║
║                                           ║
║   ${('"' + cur.world.name + '"').padEnd(41)}║
║                                           ║
║   Levels cleared ....... ${String(TOTAL_LEVELS).padStart(2)} / ${TOTAL_LEVELS}         ║
║   Final rank ........... ${r.name.slice(0, 22).padEnd(22)} ║
║   Total XP ............. ${String(save.xp).padStart(5)}            ║
║   Best streak .......... ${String(save.bestCombo).padStart(5)}            ║
║   Achievements ......... ${String(save.ach.length).padStart(2)} / ${D.ACHIEVEMENTS.length}          ║
║                                           ║
║   The Great Bug has been DEFEATED.        ║
║   You write real Python now. Go build!    ║
╚═══════════════════════════════════════════╝`;
    } else cert.style.display = 'none';

    $('#btn-next').textContent = hasNext ? 'Next level →' : (isLast ? 'Back to map 🗺️' : 'Back to map 🗺️');
    modal.classList.add('show');
  }

  $('#btn-next').addEventListener('click', () => {
    $('#modal-success').classList.remove('show');
    Sfx.click();
    const next = findNext();
    if (next && !(cur.wi === D.WORLDS.length - 1 && cur.li === cur.world.levels.length - 1)) openLevel(next.wi, next.li);
    else { renderMap(); showScreen('screen-map'); }
  });
  $('#btn-again').addEventListener('click', () => {
    $('#modal-success').classList.remove('show');
    Sfx.click();
    openLevel(cur.wi, cur.li);
  });

  $('#btn-run').addEventListener('click', runLevel);
  $('#btn-hint').addEventListener('click', showHint);
  $('#btn-reset-code').addEventListener('click', () => {
    if (cur.level.type === 'code') { cur.editor.setCode(cur.level.starter); Sfx.click(); }
  });

  /* ============================ sandbox ================================= */
  let sb = { editor: null, turtle: null, turtleNames: null, mod: null };
  function openSandbox() {
    if (!sb.editor) {
      sb.editor = new Editor($('#code-sandbox'), $('#hl-sandbox'), $('#gutter-sandbox'));
      sb.editor.onCtrlEnter = runSandbox;
      sb.editor.setCode(D.SANDBOX_EXAMPLES[0].code);
      const sel = $('#sandbox-examples');
      D.SANDBOX_EXAMPLES.forEach((ex, i) => {
        const o = document.createElement('option');
        o.value = i; o.textContent = ex.name;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => {
        sb.editor.setCode(D.SANDBOX_EXAMPLES[+sel.value].code);
        Sfx.click();
      });
    }
    showScreen('screen-sandbox');
  }
  function runSandbox() {
    const code = sb.editor.getCode();
    const btn = $('#btn-run-sandbox');
    btn.disabled = true;
    const wantsTurtle = /from\s+turtle|import\s+turtle/.test(code) || $('#sandbox-turtle-panel').style.display !== 'none';
    const panel = $('#sandbox-turtle-panel');
    if (wantsTurtle) {
      panel.style.display = '';
      if (!sb.turtle) { sb.turtle = makeTurtle(panel); const t = turtleModuleFor(sb.turtle); sb.mod = t.mod; sb.turtleNames = t.names; }
      sb.turtle.reset(false);
    } else if (sb.turtle) sb.turtle.reset(false);
    $('#btn-toggle-turtle').textContent = panel.style.display === 'none' ? '🐢 Show turtle' : '🐢 Hide turtle';

    setTimeout(() => {
      const result = Py.run(code, {
        inputFn: p => { const v = window.prompt(p || 'input()'); return v === null ? '' : v; },
        maxSteps: 600000,
        modules: { turtle: sb.mod || undefined },
        globalNames: sb.turtleNames || undefined
      });
      btn.disabled = false;
      const body = $('#console-body-sandbox');
      save.sandboxRuns++; persist();
      checkAchAfterRun();
      if (result.error) {
        const e = result.error;
        body.className = 'console-body err';
        body.innerHTML = `<span class="errbadge">${esc(e.type)}</span>${esc(e.msg)} ${e.line ? `<span style="color:#5b6a92">(line ${e.line})</span>` : ''}
<span class="errline">💡 ${esc(FRIENDLY[e.type] || 'Check your code and try again!')}</span>`;
        $('#console-state-sandbox').textContent = '✗ error';
        Sfx.bad();
      } else {
        body.className = 'console-body ok';
        body.textContent = result.output || '(program finished — no output)';
        $('#console-state-sandbox').textContent = '✓ success';
        Sfx.ok();
        if (wantsTurtle) sb.turtle.whenIdle(() => {}, 15000);
      }
    }, 200);
  }
  $('#btn-run-sandbox').addEventListener('click', runSandbox);
  $('#btn-toggle-turtle').addEventListener('click', () => {
    const panel = $('#sandbox-turtle-panel');
    const show = panel.style.display === 'none';
    panel.style.display = show ? '' : 'none';
    if (show && !sb.turtle) {
      sb.turtle = makeTurtle(panel);
      const t = turtleModuleFor(sb.turtle);
      sb.mod = t.mod; sb.turtleNames = t.names;
    }
    $('#btn-toggle-turtle').textContent = show ? '🐢 Hide turtle' : '🐢 Show turtle';
    Sfx.click();
  });

  /* ============================ daily challenge ========================= */
  function openDaily() {
    const q = D.DAILY[dailyIndex()];
    $('#daily-modal-q').textContent = q.q;
    $('#daily-modal-explain').classList.remove('show');
    const opts = $('#daily-modal-opts');
    opts.innerHTML = '';
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (i === q.answer) {
          b.classList.add('correct');
          [...opts.children].forEach(x => { if (x !== b) x.disabled = true; });
          $('#daily-modal-explain').innerHTML = '<b>💡 Why:</b> ' + esc(q.explain);
          $('#daily-modal-explain').classList.add('show');
          if (!(save.daily.done && save.daily.date === todayStr())) {
            save.daily = { date: todayStr(), done: true };
            addXp(30);
            award('daily');
            persist();
            Sfx.levelup();
            Confetti.burst(90);
            renderMap();
          }
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          Sfx.bad();
        }
      });
      opts.appendChild(b);
    });
    $('#modal-daily').classList.add('show');
  }
  $('#btn-daily').addEventListener('click', openDaily);
  $('#btn-daily-close').addEventListener('click', () => $('#modal-daily').classList.remove('show'));

  /* ============================ settings ================================ */
  function openSettings() {
    $('#btn-sound-toggle').textContent = save.sound ? 'On' : 'Off';
    $('#btn-anim-toggle').textContent = save.anim ? 'On' : 'Off';
    $('#modal-settings').classList.add('show');
  }
  $('#btn-settings-close').addEventListener('click', () => $('#modal-settings').classList.remove('show'));
  $('#btn-sound-toggle').addEventListener('click', () => {
    save.sound = !save.sound; persist();
    $('#btn-sound-toggle').textContent = save.sound ? 'On' : 'Off';
    Sfx.click();
  });
  $('#btn-anim-toggle').addEventListener('click', () => {
    save.anim = !save.anim; persist();
    $('#btn-anim-toggle').textContent = save.anim ? 'On' : 'Off';
  });
  $('#btn-reset-progress').addEventListener('click', () => {
    showInfoModal({
      title: 'Reset everything?',
      html: '<div class="sub">This wipes all XP, stars and achievements. There is no undo.</div>',
      buttons: [
        { label: 'Cancel' },
        { label: '🗑️ Yes, reset', primary: false, danger: true, onClick: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} location.reload(); } }
      ]
    });
  });

  function showInfoModal({ title, html, buttons }) {
    // lightweight dynamic modal
    let host = $('#modal-info');
    if (!host) {
      host = document.createElement('div');
      host.className = 'modal-backdrop';
      host.id = 'modal-info';
      host.innerHTML = '<div class="modal" id="modal-info-inner"></div>';
      document.body.appendChild(host);
      host.addEventListener('click', e => { if (e.target === host) host.classList.remove('show'); });
    }
    const inner = host.querySelector('#modal-info-inner');
    inner.innerHTML = `<h2>${esc(title)}</h2>${html}<div class="modal-btns"></div>`;
    const btnRow = inner.querySelector('.modal-btns');
    for (const b of buttons || [{ label: 'OK', primary: true }]) {
      const el = document.createElement('button');
      el.className = 'btn' + (b.primary ? ' primary' : '') + (b.danger ? '' : '');
      el.style.cssText = b.danger ? 'color:var(--bad);border-color:rgba(251,113,133,.4)' : '';
      el.textContent = b.label;
      el.addEventListener('click', () => { host.classList.remove('show'); b.onClick && b.onClick(); });
      btnRow.appendChild(el);
    }
    host.classList.add('show');
  }

  /* ============================ navigation ============================== */
  $('#btn-start').addEventListener('click', () => {
    Sfx.levelup();
    renderMap();
    showScreen('screen-map');
  });
  $('#btn-continue').addEventListener('click', () => {
    Sfx.click();
    // find first unlocked incomplete level
    for (let wi = 0; wi < D.WORLDS.length; wi++) {
      if (!isWorldUnlocked(wi)) break;
      for (let li = 0; li < D.WORLDS[wi].levels.length; li++) {
        if (isLevelUnlocked(wi, li) && !levelState(D.WORLDS[wi].levels[li].id)?.done) {
          openLevel(wi, li);
          return;
        }
      }
    }
    renderMap();
    showScreen('screen-map');
  });
  $('#btn-sandbox').addEventListener('click', openSandbox);
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-map-settings').addEventListener('click', openSettings);
  $('#btn-back-map').addEventListener('click', () => { Sfx.click(); renderMap(); showScreen('screen-map'); });
  $('#brand-map').addEventListener('click', () => { renderTitle(); showScreen('screen-title'); });
  $('#btn-sandbox-back').addEventListener('click', () => { renderTitle(); showScreen('screen-title'); });

  /* ============================ floating glyphs ========================= */
  function spawnGlyphs() {
    const chars = ['py', 'def', 'for', 'in', 'print', 'range()', '{}', '[]', 'x=1', 'f""', '::', 'if:', 'lambda', '→', '★', '+='];
    const host = $('#glyphs');
    for (let i = 0; i < 16; i++) {
      const el = document.createElement('span');
      el.className = 'glyph';
      el.textContent = chars[i % chars.length];
      el.style.left = Math.random() * 96 + '%';
      el.style.fontSize = 13 + Math.random() * 22 + 'px';
      el.style.animationDuration = 22 + Math.random() * 30 + 's';
      el.style.animationDelay = -Math.random() * 40 + 's';
      host.appendChild(el);
    }
  }

  /* ============================ boot ==================================== */
  function init() {
    Confetti.init();
    spawnGlyphs();
    renderTitle();
    updateXpUi();
    renderHearts();
    renderCombo();

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if ($('#screen-level').classList.contains('active')) { e.preventDefault(); runLevel(); }
        else if ($('#screen-sandbox').classList.contains('active')) { e.preventDefault(); runSandbox(); }
      }
      if (e.key === 'Escape') {
        $$('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
      }
    });
    document.addEventListener('click', () => Sfx.ensure(), { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
