# 🐍 LearnPy — Learn Python by Playing

A **self-contained, browser-based game** that teaches you real Python — no installs, no
accounts, no internet needed. Just open `index.html`.

![LearnPy](https://img.shields.io/badge/python-teaching%20game-22d3ee) ![offline](https://img.shields.io/badge/works-offline-a78bfa)

## 🎮 What is it?

> **▶ Play online: [davidcanarnt.github.io/learnpy](https://davidcanarnt.github.io/learnpy/)**
> *(or download and double-click `index.html` — no install, no internet needed)*

You are shipwrecked on **Snake Island** with **Pip** the python. Fix the Great Bug's chaos
across **10 worlds and 65 levels**, earning XP, stars, streaks and achievements along the way.

Every level runs your code on a **real Python interpreter built into the page** (a custom,
sandboxed subset written in JavaScript — see `js/pyengine.js`). If it runs in LearnPy, the
same code runs in Python 3.

### The worlds

| # | World | You learn |
|---|-------|-----------|
| 1 | 🌴 Hello, Snake Island | `print()`, strings, comments, `sep=` |
| 2 | 📦 Variable Valley | variables, arithmetic, `//` vs `/`, `input()`, `round()` |
| 3 | 🐚 String Shore | f-strings, methods, indexing, slicing, `replace()` |
| 4 | 🌊 List Lagoon | lists, indexes, `append`, `sort`, `sum/min/max` |
| 5 | 🔀 Decision Delta | `if/elif/else`, `and/or`, `in`, `==` vs `=` |
| 6 | 🌀 Loop Lagoon | `for`, `range()`, `while`, `break`/`continue`, patterns |
| 7 | ⚙️ Function Falls | `def`, parameters, defaults, `return`, reuse in loops |
| 8 | 🗝️ Dict Depths | dictionaries, `.get()`, looping `.items()`, vote counter |
| 9 | 🐢 Turtle Peak | draw with code: squares, spirals, stars, free art |
| 10 | 👑 The Great Bug | boss fight: debug a broken program, final trial |

Level types keep it fresh: **write code** (with a real editor), **answer quizzes**,
**re-assemble scrambled programs**, and **fill in the blanks**.

## ✨ Why it's (hopefully) addictive

- 💗 **Hearts** — failed runs cost one; wins restore them
- 🔥 **Streaks** — consecutive successful runs multiply your XP
- ⭐ **3-star levels** — first try, no hints
- 🏆 **15 achievements**, 8 ranks (Byte Rookie → Serpent Master)
- 🎯 **Challenge of the Day** — a fresh bonus quiz every day
- 💾 Progress auto-saves in your browser (localStorage)
- 🌍 **English & Español** — auto-detected, switchable in Settings
- 🎉 Confetti, sound effects (WebAudio), an animated turtle, and a mascot with opinions
- 🧪 **Sandbox** with turtle graphics + examples — zero grades, pure experiments

## 🚀 How to run

**Play online:** [davidcanarnt.github.io/learnpy](https://davidcanarnt.github.io/learnpy/)

**Or locally:** double-click **`index.html`** (Chrome, Edge or Firefox). That's it.
Everything — interpreter, levels, styles — is local. No build step, no server, no network.

> Tip: `Ctrl+Enter` runs your code. `Tab` indents, `Shift+Tab` outdents, `Enter` auto-indents.

## 🌍 Languages

LearnPy speaks **English** and **Spanish**. It auto-detects your browser language
(`es-*` → Español, anything else → English) and remembers your choice — switch
anytime in **Settings → Language**, even mid-session. The interface *and* the whole
curriculum (worlds, tasks, hints, quizzes, achievements, daily challenge) are
translated; code examples, starters and expected outputs stay in English on purpose,
so you learn with real Python conventions.

## 🧠 The Python subset

Supported: variables & assignment (incl. tuple swap), ints/floats/strings/booleans,
f-strings with format specs, lists, tuples, dicts, `if/elif/else`, `while`, `for … in`,
`def` with defaults, `return`, `break/continue`, indexing & slicing, comparison/boolean
operators, the main builtins (`print`, `len`, `range`, `input`, `sorted`, `enumerate`,
`zip`, …), string/list/dict methods, and `random` / `math` / `turtle` modules.

Deliberately Python-faithful details: `/` always returns a float (`4/2` → `2.0`), `//`
floors toward negative infinity, `%` follows the divisor's sign, `round()` is banker's
rounding, dicts preserve insertion order, and `range()` excludes its end.

Not supported (with friendly errors pointing the way): classes, list comprehensions
(use a loop + `.append()`), `try/except`, `lambda`, sets.

## 📁 Project layout

```
learnpy/
├── index.html          ← open this
├── css/style.css       ← the looks
├── js/pyengine.js      ← custom Python interpreter (tokenizer → parser → evaluator)
├── js/turtle.js        ← animated canvas turtle (records ops so levels can check drawings)
├── js/levels.js        ← curriculum data: worlds, levels, quizzes, achievements (English)
├── js/i18n.js          ← i18n core: UI dictionaries, language detection, bundle()
├── js/i18n-levels.js   ← Spanish curriculum translations (prose only; code stays English)
├── js/game.js          ← game logic: screens, XP, hearts, streaks, sound, confetti
└── test/               ← 1,087 automated tests (engine + levels + i18n)
```

## 🧪 Tests

```bash
node test/run_tests.js    # 161 engine tests
node test/test_levels.js  # 333 curriculum tests (every solution runs & matches)
node test/test_i18n.js    # 593 i18n tests (UI keys + full Spanish coverage)
```

---

Made with ❤️, ⚡ and an unreasonable number of 🐍 puns.
