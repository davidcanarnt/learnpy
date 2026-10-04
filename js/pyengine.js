/* ============================================================================
   LearnPy — pyengine.js
   A tiny, friendly Python interpreter (a well-chosen subset) in pure JS.
   No DOM dependencies: runs in the browser AND in Node (for the test suite).
   Public API:
     PyEngine.run(sourceCode, options) -> { output, error, vars }
     PyEngine.pyStr(v), PyEngine.PyFloat, PyEngine.makeModule(name, fns) ...
   Options: {
     inputFn:  (prompt) => string|null     // for input()
     maxSteps: number                      // anti infinite-loop budget
     globalNames: { name: builtinValue }   // injected globals (e.g. turtle fns)
     modules: { name: ModuleVal }          // extra importable modules (turtle)
   }
   ========================================================================== */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.PyEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ================================ values =============================== */
  class PyFloat { constructor(v) { this.v = v; } }
  class PyTuple { constructor(items) { this.items = items; } }
  class PyFunc {
    constructor(name, params, defaults, body, env) {
      this.name = name; this.params = params; this.defaults = defaults;
      this.body = body; this.env = env;
    }
  }
  class Builtin { constructor(name, fn) { this.name = name; this.fn = fn; } }
  class BoundMethod { constructor(obj, name) { this.obj = obj; this.name = name; } }
  class RangeVal { constructor(a, b, c) { this.a = a; this.b = b; this.c = c; } }
  class EnumVal { constructor(pairs) { this.pairs = pairs; } }
  class ZipVal { constructor(pairs) { this.pairs = pairs; } }
  class ModuleVal { constructor(name, table) { this.name = name; this.table = table; } }

  class PyError extends Error {
    constructor(type, msg, line, friendly) {
      super(msg); this.type = type; this.msg = msg; this.line = line; this.friendly = friendly || null;
    }
  }
  const BreakSig = { sig: 'break' };
  const ContinueSig = { sig: 'continue' };
  class ReturnSig { constructor(v) { this.v = v; } }

  const isF = v => v instanceof PyFloat;
  const unwrap = v => isF(v) ? v.v : (typeof v === 'boolean' ? (v ? 1 : 0) : v);
  const isNumLike = v => typeof v === 'number' || typeof v === 'boolean' || isF(v);

  function typeName(v) {
    if (v === null || v === undefined) return 'NoneType';
    if (typeof v === 'boolean') return 'bool';
    if (isF(v)) return 'float';
    if (typeof v === 'number') return 'int';
    if (typeof v === 'string') return 'str';
    if (Array.isArray(v)) return 'list';
    if (v instanceof Map) return 'dict';
    if (v instanceof PyTuple) return 'tuple';
    if (v instanceof PyFunc) return 'function';
    if (v instanceof Builtin) return 'builtin_function_or_method';
    if (v instanceof BoundMethod) return 'method';
    if (v instanceof RangeVal) return 'range';
    if (v instanceof ModuleVal) return 'module';
    if (v instanceof EnumVal || v instanceof ZipVal) return 'iterator';
    return 'object';
  }

  function fmtFloat(v) {
    if (!isFinite(v)) return v > 0 ? 'inf' : (v < 0 ? '-inf' : 'nan');
    if (Object.is(v, -0)) return '-0.0';
    if (Number.isInteger(v) && Math.abs(v) < 1e16) return v + '.0';
    const a = Math.abs(v);
    if (a >= 1e16 || a < 1e-4) {
      let s = v.toExponential();
      s = s.replace(/e([+-])(\d)$/, 'e$1$2'); // python shows '1e+16' / '1e-05'
      return s;
    }
    return String(v);
  }

  function fmtInt(v) {
    if (typeof v !== 'number') return String(v);
    if (Number.isInteger(v)) return Object.is(v, -0) ? '0' : String(v);
    return fmtFloat(v); // defensive
  }

  function pyStr(v) {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (isF(v)) return fmtFloat(v.v);
    if (typeof v === 'number') return fmtInt(v);
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
    if (v instanceof PyTuple) {
      return '(' + v.items.map(pyRepr).join(', ') + (v.items.length === 1 ? ',' : '') + ')';
    }
    if (v instanceof Map) {
      return '{' + [...v.entries()].map(([k, val]) => pyRepr(k) + ': ' + pyRepr(val)).join(', ') + '}';
    }
    if (v instanceof RangeVal) {
      return v.c === 1 ? `range(${v.a}, ${v.b})` : `range(${v.a}, ${v.b}, ${v.c})`;
    }
    if (v instanceof PyFunc || v instanceof Builtin) return `<function ${v.name}>`;
    if (v instanceof BoundMethod) return `<built-in method ${v.name}>`;
    if (v instanceof ModuleVal) return `<module '${v.name}'>`;
    if (v instanceof EnumVal) return '<enumerate object>';
    if (v instanceof ZipVal) return '<zip object>';
    return String(v);
  }

  function pyRepr(v) {
    if (typeof v === 'string') {
      if (v.includes("'") && !v.includes('"')) return '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
      return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') + "'";
    }
    return pyStr(v);
  }

  function pyTruth(v) {
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (isF(v)) return v.v !== 0;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v.length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (v instanceof Map) return v.size > 0;
    if (v instanceof PyTuple) return v.items.length > 0;
    return true;
  }

  function pyEq(a, b) {
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;
    const na = typeof a === 'boolean' || isF(a) || typeof a === 'number';
    const nb = typeof b === 'boolean' || isF(b) || typeof b === 'number';
    if (na && nb) return unwrap(a) === unwrap(b);
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((x, i) => pyEq(x, b[i]));
    }
    if (a instanceof PyTuple && b instanceof PyTuple) {
      if (a.items.length !== b.items.length) return false;
      return a.items.every((x, i) => pyEq(x, b.items[i]));
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [k, v] of a) { if (!b.has(k) || !pyEq(v, b.get(k))) return false; }
      return true;
    }
    if (typeof a === 'boolean' || typeof b === 'boolean') return a === b;
    return a === b;
  }

  const HASHABLE = v =>
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ||
    isF(v) || v === null || v === undefined;

  /* =============================== tokenizer ============================= */
  const KEYWORDS = new Set(['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return',
    'break', 'continue', 'pass', 'import', 'from', 'as', 'and', 'or', 'not', 'True',
    'False', 'None', 'is']);
  const UNSUPPORTED = {
    lambda: 'lambda functions are not supported here — use `def` instead!',
    class: 'classes are not supported here yet — you can do a lot without them!',
    try: 'try/except is not supported here yet.',
    except: 'try/except is not supported here yet.',
    finally: 'try/except is not supported here yet.',
    raise: 'raising errors is not supported here yet.',
    with: 'the `with` statement is not supported here yet.',
    yield: 'generators are not supported here yet.',
    global: 'the `global` keyword is not needed here.',
    nonlocal: 'the `nonlocal` keyword is not supported here.',
    del: 'the `del` statement is not supported here — use .pop() or .remove()!',
    assert: 'assert is not supported here yet.',
    async: 'async is not supported here yet.',
    await: 'await is not supported here yet.'
  };
  const OPS3 = ['**=', '//='];
  const OPS2 = ['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%='];
  const OPS1 = '+-*/%=<>()[]{},:.;';

  const ESC_MAP = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0', '\\': '\\', "'": "'", '"': '"' };

  function tokenize(src) {
    const tokens = [];
    let i = 0, line = 1;
    const indents = [0];
    let atLineStart = true, depth = 0;
    const n = src.length;
    function push(t, v) { tokens.push({ t, v, line }); }
    function err(msg, ln) { throw new PyError('SyntaxError', msg, ln === undefined ? line : ln, 'Check for missing colons (:), commas, quotes or brackets near here.'); }

    while (i <= n) {
      if (atLineStart && depth === 0) {
        let j = i, col = 0;
        while (j < n && (src[j] === ' ' || src[j] === '\t')) { col += src[j] === '\t' ? 4 : 1; j++; }
        if (j >= n || src[j] === '\n' || src[j] === '\r' || src[j] === '#') {
          while (j < n && src[j] !== '\n') j++;
          if (j >= n) break;
          i = j + 1; line++; continue;
        }
        const top = indents[indents.length - 1];
        if (col > top) { indents.push(col); push('indent', col); }
        else if (col < top) {
          while (col < indents[indents.length - 1]) { indents.pop(); push('dedent', null); }
          if (col !== indents[indents.length - 1]) err('unindent does not match any outer indentation level');
        }
        atLineStart = false; i = j;
        continue;
      }
      if (i >= n) break;
      const c = src[i];
      if (c === '\n') { line++; i++; if (depth === 0) { push('nl', null); atLineStart = true; } continue; }
      if (c === '\r') { i++; continue; }
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '\\') {
        if (src[i + 1] === '\n') { i += 2; line++; continue; }
        if (src[i + 1] === '\r' && src[i + 2] === '\n') { i += 3; line++; continue; }
        err("unexpected character '\\'");
      }
      if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '"' || c === "'") { push('str', readString(c, line)); continue; }
      // numbers
      const nm = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (nm) {
        const txt = nm[0];
        push('num', parseFloat(txt));
        tokens[tokens.length - 1].f = /[.eE]/.test(txt);
        i += txt.length; continue;
      }
      // names / keywords / f-strings
      const idm = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      if (idm) {
        const name = idm[0];
        i += name.length;
        if ((name === 'f' || name === 'F') && (src[i] === '"' || src[i] === "'")) {
          readFString(src[i], line); continue;
        }
        if (KEYWORDS.has(name)) push('kw', name);
        else push('name', name);
        continue;
      }
      const three = src.substr(i, 3), two = src.substr(i, 2);
      if (OPS3.includes(three)) { push('op', three); i += 3; continue; }
      if (OPS2.includes(two)) { push('op', two); i += 2; continue; }
      if (OPS1.includes(c)) {
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth = Math.max(0, depth - 1);
        push('op', c); i++; continue;
      }
      err('unexpected character ' + pyRepr(c));
    }
    if (!atLineStart && depth === 0) push('nl', null);
    while (indents.length > 1) { indents.pop(); push('dedent', null); }
    push('eof', null);
    return tokens;

    function readString(quote, line0) {
      i++; let out = '';
      while (true) {
        if (i >= n || src[i] === '\n') err('unterminated string literal (missing ' + quote + ')', line0);
        const c = src[i];
        if (c === quote) { i++; return out; }
        if (c === '\\') {
          const e = src[i + 1];
          if (e === undefined || e === '\n') err('unterminated string literal', line0);
          if (e === 'x' && /^[0-9a-fA-F]{2}$/.test(src.substr(i + 2, 2))) { out += String.fromCharCode(parseInt(src.substr(i + 2, 2), 16)); i += 4; continue; }
          if (e === 'u' && /^[0-9a-fA-F]{4}$/.test(src.substr(i + 2, 4))) { out += String.fromCharCode(parseInt(src.substr(i + 2, 4), 16)); i += 6; continue; }
          if (e in ESC_MAP) { out += ESC_MAP[e]; i += 2; continue; }
          out += '\\' + e; i += 2; continue;
        }
        out += c; i++;
      }
    }

    function readFString(quote, line0) {
      const parts = []; let buf = '';
      i++; // past opening quote
      while (true) {
        if (i >= n || src[i] === '\n') err('unterminated f-string literal', line0);
        const c = src[i];
        if (c === quote) { i++; break; }
        if (c === '\\') {
          const e = src[i + 1];
          if (e === undefined) err('unterminated f-string literal', line0);
          if (e in ESC_MAP) { buf += ESC_MAP[e]; i += 2; continue; }
          buf += '\\' + e; i += 2; continue;
        }
        if (c === '{') {
          if (src[i + 1] === '{') { buf += '{'; i += 2; continue; }
          if (buf) { parts.push({ s: buf }); buf = ''; }
          let j = i + 1, d = 1, ex = '', q = null, closed = false;
          while (j < n) {
            const cc = src[j];
            if (q) {
              ex += cc;
              if (cc === q) q = null;
              else if (cc === '\\') { j++; if (j < n) ex += src[j]; }
            } else if (cc === '"' || cc === "'") { q = cc; ex += cc; }
            else if (cc === '{' || cc === '(' || cc === '[') { d++; ex += cc; }
            else if (cc === '}' || cc === ')' || cc === ']') {
              d--;
              if (d === 0) { closed = true; break; }
              ex += cc;
            } else ex += cc;
            j++;
          }
          if (!closed) err("f-string: expecting '}'", line0);
          let exprSrc = ex, fmt = null, dd = 0, qq = null, splitAt = -1;
          for (let k = 0; k < ex.length; k++) {
            const c2 = ex[k];
            if (qq) { if (c2 === qq) qq = null; continue; }
            if (c2 === '"' || c2 === "'") { qq = c2; continue; }
            if ('([{'.includes(c2)) dd++;
            else if (')]}'.includes(c2)) dd--;
            else if (c2 === ':' && dd === 0) { splitAt = k; break; }
          }
          if (splitAt >= 0) { fmt = ex.slice(splitAt + 1); exprSrc = ex.slice(0, splitAt); }
          parts.push({ e: exprSrc, fmt });
          i = j + 1;
          continue;
        }
        if (c === '}') {
          if (src[i + 1] === '}') { buf += '}'; i += 2; continue; }
          err("f-string: single '}' is not allowed", line0);
        }
        buf += c; i++;
      }
      if (buf) parts.push({ s: buf });
      if (!parts.length) parts.push({ s: '' });
      push('fstr', parts);
    }
  }

  /* ================================ parser =============================== */
  const COMP_OPS = ['==', '!=', '<', '<=', '>', '>='];
  const AUG_OPS = { '+=': '+', '-=': '-', '*=': '*', '/=': '/', '//=': '//', '%=': '%', '**=': '**' };

  function Parser(tokens) {
    this.toks = tokens; this.pos = 0;
  }
  Parser.prototype = {
    peek(off) { return this.toks[this.pos + (off || 0)]; },
    next() { return this.toks[this.pos++]; },
    at(t, v) { const k = this.peek(); return k && k.t === t && (v === undefined || k.v === v); },
    atOp(v) { return this.at('op', v); },
    atKw(v) { return this.at('kw', v); },
    accept(t, v) { if (this.at(t, v)) { this.pos++; return true; } return false; },
    acceptOp(v) { return this.accept('op', v); },
    acceptKw(v) { return this.accept('kw', v); },
    expect(t, v, what) {
      const k = this.peek();
      if (k && k.t === t && (v === undefined || k.v === v)) return this.next();
      const got = k ? (k.t === 'nl' ? 'end of line' : (k.t === 'eof' ? 'end of file' : pyRepr(String(k.v)))) : 'nothing';
      throw new PyError('SyntaxError', `invalid syntax (expected ${what || (v ? `'${v}'` : t)}, got ${got})`, this.line(),
        'Check for missing colons (:), commas, quotes or brackets near here.');
    },
    line() { const k = this.peek(); return k ? k.line : 0; },
    N(type, props) { props.t = type; props.line = this.line(); return props; },

    parseProgram() {
      const stmts = [];
      while (!this.at('eof')) {
        if (this.accept('nl')) continue;
        this.pushStmt(stmts, this.parseStatement());
      }
      return stmts;
    },

    pushStmt(stmts, st) {
      if (Array.isArray(st)) stmts.push(...st);
      else stmts.push(st);
    },

    parseBlock() {
      this.expect('op', ':', "':'");
      if (this.accept('nl')) {
        if (this.accept('indent')) {
          const stmts = [];
          while (!this.at('dedent')) {
            if (this.at('eof')) throw new PyError('SyntaxError', 'unexpected end of file (unclosed block?)', this.line(), 'A block was left open — check your indentation.');
            this.pushStmt(stmts, this.parseStatement());
          }
          this.expect('dedent');
          return stmts;
        }
        throw new PyError('IndentationError', 'expected an indented block', this.line(),
          'After a colon (:) the next line must be indented — usually 4 spaces.');
      }
      return this.parseSimpleLine();
    },

    parseSimpleLine() {
      const stmts = [this.parseSimpleStmt()];
      while (this.acceptOp(';')) stmts.push(this.parseSimpleStmt());
      if (this.at('nl')) this.next();
      else if (!this.at('eof') && !this.at('dedent')) this.expect('nl', undefined, 'end of line');
      return stmts;
    },

    parseStatement() {
      const k = this.peek();
      if (k.t === 'kw') {
        if (k.v === 'if') return this.parseIf();
        if (k.v === 'while') return this.parseWhile();
        if (k.v === 'for') return this.parseFor();
        if (k.v === 'def') return this.parseDef();
      }
      return this.parseSimpleLine();
    },

    parseIf() {
      this.next(); // if
      const test = this.parseExpr();
      const body = this.parseBlock();
      let orelse = [];
      while (this.atKw('elif')) {
        this.next();
        const t2 = this.parseExpr();
        const b2 = this.parseBlock();
        let inner = [];
        if (this.atKw('else')) { this.next(); inner = this.parseBlock(); }
        orelse = [this.N('if', { test: t2, body: b2, orelse: inner })];
        // NOTE: elif chains: we build them iteratively below instead
        break;
      }
      if (this.atKw('else')) { this.next(); orelse = this.parseBlock(); }
      return this.N('if', { test, body, orelse });
    },

    parseWhile() {
      this.next();
      const test = this.parseExpr();
      const body = this.parseBlock();
      return this.N('while', { test, body });
    },

    parseFor() {
      this.next();
      const target = this.parseTargetList();
      if (!this.acceptKw('in')) this.expect('kw', 'in', "'in'");
      const iter = this.parseExpr();
      const body = this.parseBlock();
      return this.N('for', { target, iter, body });
    },

    parseDef() {
      this.next();
      const nameTok = this.peek();
      if (nameTok.t !== 'name') throw new PyError('SyntaxError', 'invalid function name', this.line());
      this.next();
      this.expect('op', '(', "'('");
      const params = [], defaults = [];
      while (!this.atOp(')')) {
        const p = this.peek();
        if (p.t !== 'name') throw new PyError('SyntaxError', 'invalid parameter name', this.line());
        this.next();
        params.push(p.v);
        if (this.acceptOp('=')) defaults.push(this.parseExpr());
        else defaults.push(null);
        if (!this.acceptOp(',')) break;
      }
      this.expect('op', ')', "')'");
      const body = this.parseBlock();
      return this.N('def', { name: nameTok.v, params, defaults, body });
    },

    parseSimpleStmt() {
      const k = this.peek();
      if (k.t === 'kw') {
        switch (k.v) {
          case 'return': {
            this.next();
            let value = null;
            if (!this.at('nl') && !this.at('eof') && !this.atOp(';')) value = this.parseExprList();
            return this.N('return', { value });
          }
          case 'break': this.next(); return this.N('break', {});
          case 'continue': this.next(); return this.N('continue', {});
          case 'pass': this.next(); return this.N('pass', {});
          case 'import': {
            this.next();
            const names = [];
            do {
              const m = this.peek();
              if (m.t !== 'name') throw new PyError('SyntaxError', 'invalid module name', this.line());
              this.next();
              let alias = m.v;
              if (this.acceptKw('as')) { const a = this.peek(); if (a.t !== 'name') throw new PyError('SyntaxError', 'invalid alias', this.line()); this.next(); alias = a.v; }
              names.push({ mod: m.v, alias });
            } while (this.acceptOp(','));
            return this.N('import', { names });
          }
          case 'from': {
            this.next();
            const m = this.peek();
            if (m.t !== 'name') throw new PyError('SyntaxError', 'invalid module name', this.line());
            this.next();
            this.expect('kw', 'import', "'import'");
            const names = [];
            if (this.acceptOp('*')) names.push({ name: '*', alias: null });
            else do {
              const nm = this.peek();
              if (nm.t !== 'name') throw new PyError('SyntaxError', 'invalid name after import', this.line());
              this.next();
              let alias = nm.v;
              if (this.acceptKw('as')) { const a = this.peek(); if (a.t !== 'name') throw new PyError('SyntaxError', 'invalid alias', this.line()); this.next(); alias = a.v; }
              names.push({ name: nm.v, alias });
            } while (this.acceptOp(','));
            return this.N('fromimport', { mod: m.v, names });
          }
          default:
            if (UNSUPPORTED[k.v]) throw new PyError('SyntaxError', `'${k.v}' is not supported in LearnPy yet`, this.line(), UNSUPPORTED[k.v]);
        }
      }
      // expression / assignment
      const e = this.parseExpr();
      let targets = [e];
      let isTuple = false;
      while (this.atOp(',') ) { this.next(); targets.push(this.parseExpr()); isTuple = true; }
      if (this.acceptOp('=')) {
        const value = this.parseExprList();
        const target = isTuple ? this.N('tuple', { items: targets }) : targets[0];
        this.checkTarget(target);
        return this.N('assign', { target, value });
      }
      const augTok = this.peek();
      if (augTok.t === 'op' && AUG_OPS[augTok.v]) {
        this.next();
        this.checkTarget(e);
        const value = this.parseExpr();
        return this.N('aug', { target: e, op: AUG_OPS[augTok.v], value });
      }
      return this.N('exprstmt', { e });
    },

    checkTarget(t) {
      if (t.t === 'name' || t.t === 'index') return;
      if (t.t === 'tuple') { t.items.forEach(x => this.checkTarget(x)); return; }
      if (t.t === 'attr') throw new PyError('SyntaxError', 'cannot assign to attribute here', t.line);
      throw new PyError('SyntaxError', 'cannot assign to this expression', t.line, 'The left side of = must be a variable (like x) or a position (like lst[0]).');
    },

    parseTargetList() {
      const first = this.parsePrimaryOnly();
      const items = [first];
      while (this.acceptOp(',')) items.push(this.parsePrimaryOnly());
      if (items.length === 1) {
        if (first.t !== 'name') throw new PyError('SyntaxError', 'invalid loop target', first.line, 'The loop variable must be a simple name like x.');
        return first;
      }
      items.forEach(x => { if (x.t !== 'name') throw new PyError('SyntaxError', 'invalid loop target', x.line); });
      return this.N('tuple', { items });
    },

    /* -------- expressions -------- */
    parseExprList() {
      const first = this.parseExpr();
      const items = [first];
      while (this.atOp(',')) {
        this.next();
        if (this.at('nl') || this.at('eof') || this.atOp(';') || this.atOp(')')) break;
        items.push(this.parseExpr());
      }
      if (items.length === 1) return first;
      return this.N('tuple', { items });
    },

    parseExpr() { return this.parseOr(); },
    parseOr() {
      let left = this.parseAnd();
      while (this.atKw('or')) { this.next(); const right = this.parseAnd(); left = this.N('boolop', { op: 'or', left, right }); }
      return left;
    },
    parseAnd() {
      let left = this.parseNot();
      while (this.atKw('and')) { this.next(); const right = this.parseNot(); left = this.N('boolop', { op: 'and', left, right }); }
      return left;
    },
    parseNot() {
      if (this.atKw('not')) { this.next(); return this.N('not', { e: this.parseNot() }); }
      return this.parseCompare();
    },
    parseCompare() {
      let left = this.parseArith();
      const rest = [];
      while (true) {
        const k = this.peek();
        if (k.t === 'op' && COMP_OPS.includes(k.v)) { this.next(); rest.push({ op: k.v, right: this.parseArith() }); continue; }
        if (k.t === 'kw' && k.v === 'in') { this.next(); rest.push({ op: 'in', right: this.parseArith() }); continue; }
        if (k.t === 'kw' && k.v === 'not' && this.peek(1) && this.peek(1).t === 'kw' && this.peek(1).v === 'in') {
          this.next(); this.next(); rest.push({ op: 'not in', right: this.parseArith() }); continue;
        }
        if (k.t === 'kw' && k.v === 'is') {
          this.next();
          if (this.atKw('not')) { this.next(); rest.push({ op: 'is not', right: this.parseArith() }); }
          else rest.push({ op: 'is', right: this.parseArith() });
          continue;
        }
        break;
      }
      if (!rest.length) return left;
      return this.N('compare', { left, rest });
    },
    parseArith() {
      let left = this.parseTerm();
      while (this.atOp('+') || this.atOp('-')) {
        const op = this.next().v;
        const right = this.parseTerm();
        left = this.N('bin', { op, left, right });
      }
      return left;
    },
    parseTerm() {
      let left = this.parseUnary();
      while (this.atOp('*') || this.atOp('/') || this.atOp('//') || this.atOp('%')) {
        const op = this.next().v;
        const right = this.parseUnary();
        left = this.N('bin', { op, left, right });
      }
      return left;
    },
    parseUnary() {
      if (this.atOp('-') || this.atOp('+')) {
        const op = this.next().v;
        return this.N('unary', { op, e: this.parseUnary() });
      }
      return this.parsePower();
    },
    parsePower() {
      const base = this.parsePostfix();
      if (this.acceptOp('**')) {
        const exp = this.parseUnary(); // right assoc, allows 2**-1
        return this.N('bin', { op: '**', left: base, right: exp });
      }
      return base;
    },
    parsePostfix() {
      let e = this.parsePrimary();
      while (true) {
        if (this.atOp('.')) {
          this.next();
          const nm = this.peek();
          if (nm.t !== 'name' && nm.t !== 'kw') throw new PyError('SyntaxError', 'invalid attribute name', this.line());
          this.next();
          e = this.N('attr', { value: e, name: nm.v });
        } else if (this.atOp('[')) {
          this.next();
          let start = null, stop = null, step = null, isSlice = false;
          if (!this.atOp(':')) start = this.parseExpr();
          if (this.acceptOp(':')) {
            isSlice = true;
            if (!this.atOp(':') && !this.atOp(']')) stop = this.parseExpr();
            if (this.acceptOp(':')) {
              if (!this.atOp(']')) step = this.parseExpr();
            }
          }
          this.expect('op', ']', "']'");
          e = isSlice ? this.N('slice', { value: e, start, stop, step }) : this.N('index', { value: e, index: start });
        } else if (this.atOp('(')) {
          this.next();
          const args = [], kwargs = [];
          while (!this.atOp(')')) {
            const a = this.peek(), b = this.peek(1);
            if (a.t === 'name' && b && b.t === 'op' && b.v === '=') {
              this.next(); this.next();
              kwargs.push([a.v, this.parseExpr()]);
            } else args.push(this.parseExpr());
            if (!this.acceptOp(',')) break;
          }
          this.expect('op', ')', "')'");
          e = this.N('call', { func: e, args, kwargs });
        } else break;
      }
      return e;
    },

    parsePrimaryOnly() { return this.parsePostfix(); },

    parsePrimary() {
      const k = this.peek();
      if (k.t === 'num') { this.next(); return this.N('num', { v: k.v, f: !!k.f }); }
      if (k.t === 'str' || k.t === 'fstr') {
        const parts = [];
        if (k.t === 'str') parts.push({ s: k.v });
        else parts.push(...this.parseFStrParts(k.v, k.line));
        this.next();
        while (this.at('str') || this.at('fstr')) {
          const t2 = this.next();
          if (t2.t === 'str') parts.push({ s: t2.v });
          else parts.push(...this.parseFStrParts(t2.v, t2.line));
        }
        if (parts.every(p => p.s !== undefined)) return this.N('str', { v: parts.map(p => p.s).join('') });
        return this.N('fstr', { parts });
      }
      if (k.t === 'kw') {
        if (k.v === 'True') { this.next(); return this.N('const', { v: true }); }
        if (k.v === 'False') { this.next(); return this.N('const', { v: false }); }
        if (k.v === 'None') { this.next(); return this.N('const', { v: null }); }
        if (k.v === 'not') return this.parseNot();
        if (UNSUPPORTED[k.v]) throw new PyError('SyntaxError', `'${k.v}' is not supported in LearnPy yet`, this.line(), UNSUPPORTED[k.v]);
        throw new PyError('SyntaxError', 'invalid syntax', this.line());
      }
      if (k.t === 'name') { this.next(); return this.N('name', { v: k.v }); }
      if (this.atOp('(')) {
        this.next();
        if (this.acceptOp(')')) return this.N('tuple', { items: [] });
        const first = this.parseExpr();
        if (this.atOp(',')) {
          const items = [first];
          while (this.acceptOp(',')) { if (this.atOp(')')) break; items.push(this.parseExpr()); }
          this.expect('op', ')', "')'");
          return this.N('tuple', { items });
        }
        this.expect('op', ')', "')'");
        return first;
      }
      if (this.atOp('[')) {
        this.next();
        const items = [];
        while (!this.atOp(']')) {
          items.push(this.parseExpr());
          if (this.atKw('for')) throw new PyError('SyntaxError', 'list comprehensions are not supported here yet', this.line(), 'Use a regular for loop with .append() instead!');
          if (!this.acceptOp(',')) break;
        }
        this.expect('op', ']', "']'");
        return this.N('list', { items });
      }
      if (this.atOp('{')) {
        this.next();
        const pairs = [];
        while (!this.atOp('}')) {
          const key = this.parseExpr();
          if (!this.acceptOp(':')) throw new PyError('SyntaxError', 'sets are not supported here — use a list [ ] instead', this.line(), 'Curly braces here need key: value pairs, like {"a": 1}');
          const val = this.parseExpr();
          pairs.push([key, val]);
          if (!this.acceptOp(',')) break;
        }
        this.expect('op', '}', "'}'");
        return this.N('dict', { pairs });
      }
      throw new PyError('SyntaxError', 'invalid syntax', this.line(), 'Check for missing colons (:), commas, quotes or brackets near here.');
    },

    parseFStrParts(rawParts, line) {
      return rawParts.map(p => {
        if (p.s !== undefined) return { s: p.s };
        try {
          const sub = new Parser(tokenize(p.e));
          const ast = sub.parseExpr();
          return { e: ast, fmt: p.fmt };
        } catch (err) {
          if (err instanceof PyError) { if (!err.line) err.line = line; }
          throw err;
        }
      });
    }
  };

  // fix elif-chaining: rewrite parseIf properly
  Parser.prototype.parseIf = function () {
    this.next(); // 'if'
    const test = this.parseExpr();
    const body = this.parseBlock();
    let orelse = [];
    if (this.atKw('elif')) {
      orelse = [this.parseIfElif()];
    } else if (this.atKw('else')) {
      this.next();
      orelse = this.parseBlock();
    }
    return this.N('if', { test, body, orelse });
  };
  Parser.prototype.parseIfElif = function () {
    this.next(); // 'elif'
    const test = this.parseExpr();
    const body = this.parseBlock();
    let orelse = [];
    if (this.atKw('elif')) orelse = [this.parseIfElif()];
    else if (this.atKw('else')) { this.next(); orelse = this.parseBlock(); }
    return this.N('if', { test, body, orelse });
  };

  /* ============================== interpreter ============================ */
  function Env(parent) { this.vars = new Map(); this.parent = parent || null; }

  const STR_METHODS = new Set(['upper', 'lower', 'title', 'capitalize', 'strip', 'lstrip', 'rstrip',
    'count', 'find', 'replace', 'split', 'join', 'startswith', 'endswith', 'isdigit', 'isalpha',
    'isalnum', 'format', 'center', 'ljust', 'rjust', 'zfill']);
  const LIST_METHODS = new Set(['append', 'extend', 'insert', 'pop', 'remove', 'index', 'count',
    'sort', 'reverse', 'clear', 'copy']);
  const DICT_METHODS = new Set(['keys', 'values', 'items', 'get', 'pop', 'update', 'clear', 'setdefault', 'copy']);

  function Interp(opts) {
    this.opts = opts || {};
    this.maxSteps = this.opts.maxSteps || 400000;
    this.steps = 0;
    this.callDepth = 0;
    this.out = [];
    this.outLen = 0;
    this.globals = new Env(null);
    this.builtins = new Map();
    this.modules = new Map();
    this.installCore();
    const gm = this.opts.modules || {};
    for (const k in gm) if (gm[k]) this.modules.set(k, gm[k]);
    if (this.opts.globalNames) {
      for (const k in this.opts.globalNames) this.globals.vars.set(k, this.opts.globalNames[k]);
    }
  }

  Interp.prototype.emit = function (s) {
    this.outLen += s.length;
    if (this.outLen > 120000) throw new PyError('OutputLimit', 'Too much output — stopping here', 0, 'Your program is printing a LOT. Check your loops!');
    this.out.push(s);
  };

  Interp.prototype.tick = function (node) {
    this.steps++;
    if (this.steps > this.maxSteps) {
      throw new PyError('TimeLimit', 'Program ran for too long', node && node.line || 0,
        "Your code may have an infinite loop — make sure a while loop's condition can become False!");
    }
  };

  Interp.prototype.getName = function (env, name, node) {
    let e = env;
    while (e) { if (e.vars.has(name)) return e.vars.get(name); e = e.parent; }
    if (this.builtins.has(name)) return this.builtins.get(name);
    throw new PyError('NameError', `name '${name}' is not defined`, node && node.line || 0,
      `Python doesn't know '${name}' yet. Check the spelling, or create the variable / define the function before using it.`);
  };

  Interp.prototype.callValue = function (f, args, kwargs, node) {
    this.callDepth++;
    try {
      if (this.callDepth > 250) throw new PyError('RecursionError', 'maximum recursion depth exceeded', node && node.line || 0, 'A function keeps calling itself — make sure it has a stopping condition!');
      if (f instanceof Builtin) return f.fn(this, args, kwargs, node);
      if (f instanceof BoundMethod) return this.dispatchMethod(f.obj, f.name, args, kwargs, node);
      if (f instanceof PyFunc) {
        const env = new Env(f.env);
        const kwNames = kwargs.map(k => k[0]);
        if (kwNames.length) throw new PyError('TypeError', `${f.name}() doesn't accept keyword arguments here yet`, node && node.line || 0);
        if (args.length > f.params.length) {
          throw new PyError('TypeError', `${f.name}() takes ${f.params.length} argument${f.params.length === 1 ? '' : 's'} but ${args.length} were given`, node && node.line || 0);
        }
        for (let i = 0; i < f.params.length; i++) {
          if (i < args.length) env.vars.set(f.params[i], args[i]);
          else if (f.defaults[i] !== null) env.vars.set(f.params[i], f.defaults[i]);
          else throw new PyError('TypeError', `${f.name}() missing required argument: '${f.params[i]}'`, node && node.line || 0);
        }
        try { this.execBody(f.body, env); }
        catch (e) { if (e instanceof ReturnSig) return e.v; throw e; }
        return null;
      }
      throw new PyError('TypeError', `'${typeName(f)}' object is not callable`, node && node.line || 0);
    } finally { this.callDepth--; }
  };

  Interp.prototype.getAttr = function (obj, name, node) {
    if (obj instanceof ModuleVal) {
      if (obj.table.has(name)) return obj.table.get(name);
      throw new PyError('AttributeError', `module '${obj.name}' has no attribute '${name}'`, node && node.line || 0);
    }
    if (typeof obj === 'string' && STR_METHODS.has(name)) return new BoundMethod(obj, name);
    if (Array.isArray(obj) && LIST_METHODS.has(name)) return new BoundMethod(obj, name);
    if (obj instanceof Map && DICT_METHODS.has(name)) return new BoundMethod(obj, name);
    throw new PyError('AttributeError', `'${typeName(obj)}' object has no attribute '${name}'`, node && node.line || 0,
      `Double-check the method name — and remember it's called with ${name}()`);
  };

  Interp.prototype.dispatchMethod = function (obj, name, args, kwargs, node) {
    const A = args;
    if (typeof obj === 'string') {
      const s = obj;
      switch (name) {
        case 'upper': return s.toUpperCase();
        case 'lower': return s.toLowerCase();
        case 'title': return s.replace(/[A-Za-z]+(?:'?[A-Za-z]*)?/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
        case 'capitalize': return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
        case 'strip': return s.trim();
        case 'lstrip': return s.replace(/^\s+/, '');
        case 'rstrip': return s.replace(/\s+$/, '');
        case 'count': {
          this.needArgs(name, A, 1, 1, node);
          return s.split(A[0]).length - 1;
        }
        case 'find': {
          this.needArgs(name, A, 1, 3, node);
          const start = A.length > 1 ? this.toIndex(A[1], node) : 0;
          const stop = A.length > 2 ? this.toIndex(A[2], node) : s.length;
          return s.substring(start, stop).indexOf(A[0]) === -1 && start === 0 ? s.indexOf(A[0]) : (() => {
            const sub = s.slice(start, stop);
            const idx = sub.indexOf(A[0]);
            return idx === -1 ? -1 : start + idx;
          })();
        }
        case 'replace': {
          this.needArgs(name, A, 2, 3, node);
          if (A.length > 2 && typeof A[2] === 'number') {
            let out = '', rest = s, count = A[2];
            while (count-- > 0) {
              const idx = rest.indexOf(A[0]);
              if (idx === -1) break;
              out += rest.slice(0, idx) + A[1];
              rest = rest.slice(idx + A[0].length);
            }
            return out + rest;
          }
          return s.split(A[0]).join(A[1]);
        }
        case 'split': {
          if (!A.length) return s.trim().length ? s.trim().split(/\s+/) : [];
          if (A[0] === '') throw new PyError('ValueError', 'empty separator', node && node.line || 0);
          return s.split(A[0]);
        }
        case 'join': {
          this.needArgs(name, A, 1, 1, node);
          const items = [...this.iterOf(A[0], node)];
          for (let i = 0; i < items.length; i++) {
            if (typeof items[i] !== 'string') throw new PyError('TypeError', `sequence item ${i}: expected str instance, ${typeName(items[i])} found`, node && node.line || 0);
          }
          return items.join(s);
        }
        case 'startswith': this.needArgs(name, A, 1, 1, node); return s.startsWith(A[0]);
        case 'endswith': this.needArgs(name, A, 1, 1, node); return s.endsWith(A[0]);
        case 'isdigit': return /^[0-9]+$/.test(s);
        case 'isalpha': return /^[A-Za-z]+$/.test(s);
        case 'isalnum': return /^[A-Za-z0-9]+$/.test(s);
        case 'format': throw new PyError('TypeError', '.format() is not supported here — use an f-string instead!', node && node.line || 0, 'f-strings: f"Hello {name}!"');
        case 'center': { this.needArgs(name, A, 1, 2, node); const w = this.toIndex(A[0], node); const f = A.length > 1 ? String(A[1]) : ' '; return s.length >= w ? s : this.pad(s, w, 'center', f); }
        case 'ljust': { this.needArgs(name, A, 1, 2, node); const w = this.toIndex(A[0], node); const f = A.length > 1 ? String(A[1]) : ' '; return s.length >= w ? s : s + f.repeat(Math.ceil((w - s.length) / f.length)).slice(0, w - s.length); }
        case 'rjust': { this.needArgs(name, A, 1, 2, node); const w = this.toIndex(A[0], node); const f = A.length > 1 ? String(A[1]) : ' '; return s.length >= w ? s : f.repeat(Math.ceil((w - s.length) / f.length)).slice(0, w - s.length) + s; }
        case 'zfill': { this.needArgs(name, A, 1, 1, node); const w = this.toIndex(A[0], node); return s.length >= w ? s : '0'.repeat(w - s.length) + s; }
      }
    }
    if (Array.isArray(obj)) {
      const L = obj;
      switch (name) {
        case 'append': this.needArgs(name, A, 1, 1, node); L.push(A[0]); return null;
        case 'extend': {
          this.needArgs(name, A, 1, 1, node);
          for (const item of this.iterOf(A[0], node)) L.push(item);
          return null;
        }
        case 'insert': {
          this.needArgs(name, A, 2, 2, node);
          let i = this.toIndex(A[0], node);
          if (i < 0) i = Math.max(0, L.length + i);
          L.splice(Math.min(i, L.length), 0, A[1]);
          return null;
        }
        case 'pop': {
          if (A.length > 1) this.needArgs(name, A, 0, 1, node);
          if (!L.length) throw new PyError('IndexError', 'pop from empty list', node && node.line || 0);
          let i = A.length ? this.toIndex(A[0], node) : -1;
          if (i < 0) i += L.length;
          if (i < 0 || i >= L.length) throw new PyError('IndexError', 'pop index out of range', node && node.line || 0);
          return L.splice(i, 1)[0];
        }
        case 'remove': {
          this.needArgs(name, A, 1, 1, node);
          const idx = L.findIndex(x => pyEq(x, A[0]));
          if (idx === -1) throw new PyError('ValueError', `${pyRepr(pyStr(A[0])) === pyStr(A[0]) ? pyRepr(A[0]) : pyRepr(A[0])} is not in list`.replace(pyRepr(A[0]), pyRepr(A[0])), node && node.line || 0, `The value you tried to remove isn't in the list.`);
          L.splice(idx, 1);
          return null;
        }
        case 'index': {
          this.needArgs(name, A, 1, 1, node);
          const idx = L.findIndex(x => pyEq(x, A[0]));
          if (idx === -1) throw new PyError('ValueError', `${pyRepr(A[0])} is not in list`, node && node.line || 0);
          return idx;
        }
        case 'count': this.needArgs(name, A, 1, 1, node); return L.filter(x => pyEq(x, A[0])).length;
        case 'sort': {
          const key = kwargs.find(k => k[0] === 'key');
          const rev = kwargs.find(k => k[0] === 'reverse');
          const kf = key ? key[1] : null;
          const r = rev ? pyTruth(rev[1]) : false;
          const keyed = L.map(x => [kf ? this.callValue(kf, [x], [], node) : x, x]);
          keyed.sort((a, b) => this.pyCompareVal(a[0], b[0], node));
          if (r) keyed.reverse();
          for (let i = 0; i < keyed.length; i++) L[i] = keyed[i][1];
          return null;
        }
        case 'reverse': L.reverse(); return null;
        case 'clear': L.length = 0; return null;
        case 'copy': return L.slice();
      }
    }
    if (obj instanceof Map) {
      const D = obj;
      switch (name) {
        case 'keys': return [...D.keys()];
        case 'values': return [...D.values()];
        case 'items': return [...D.entries()].map(([k, v]) => new PyTuple([k, v]));
        case 'get': {
          this.needArgs(name, A, 1, 2, node);
          if (D.has(A[0])) return D.get(A[0]);
          return A.length > 1 ? A[1] : null;
        }
        case 'pop': {
          this.needArgs(name, A, 1, 2, node);
          if (D.has(A[0])) { const v = D.get(A[0]); D.delete(A[0]); return v; }
          if (A.length > 1) return A[1];
          throw new PyError('KeyError', pyRepr(A[0]), node && node.line || 0, "That key isn't in the dictionary. Use .get(key, default) to check safely.");
        }
        case 'update': {
          this.needArgs(name, A, 1, 1, node);
          if (A[0] instanceof Map) { for (const [k, v] of A[0]) D.set(k, v); return null; }
          throw new PyError('TypeError', 'update() expects a dictionary', node && node.line || 0);
        }
        case 'clear': D.clear(); return null;
        case 'setdefault': {
          this.needArgs(name, A, 1, 2, node);
          if (D.has(A[0])) return D.get(A[0]);
          const d = A.length > 1 ? A[1] : null;
          D.set(A[0], d); return d;
        }
        case 'copy': return new Map(D);
      }
    }
    throw new PyError('AttributeError', `'${typeName(obj)}' object has no method '${name}'`, node && node.line || 0);
  };

  Interp.prototype.pad = function (s, w, align, fill) {
    const total = w - s.length;
    if (total <= 0) return s;
    if (align === 'center') {
      const left = Math.floor(total / 2), right = total - left;
      return fill.repeat(Math.ceil(left / fill.length)).slice(0, left) + s + fill.repeat(Math.ceil(right / fill.length)).slice(0, right);
    }
    return s;
  };

  Interp.prototype.needArgs = function (name, args, min, max, node) {
    if (args.length < min || args.length > max) {
      throw new PyError('TypeError', `${name}() takes ${min === max ? min : min + '-' + max} argument${min === 1 && max === 1 ? '' : 's'} but ${args.length} were given`, node && node.line || 0);
    }
  };

  Interp.prototype.toIndex = function (v, node) {
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number' && Number.isInteger(v)) return v;
    if (isF(v) && Number.isInteger(v.v)) return v.v;
    throw new PyError('TypeError', 'an integer is required here', node && node.line || 0);
  };

  Interp.prototype.iterOf = function (v, node) {
    if (Array.isArray(v)) return v[Symbol.iterator]();
    if (typeof v === 'string') return v[Symbol.iterator]();
    if (v instanceof PyTuple) return v.items[Symbol.iterator]();
    if (v instanceof Map) return [...v.keys()][Symbol.iterator]();
    if (v instanceof RangeVal) return this.rangeIter(v);
    if (v instanceof EnumVal) return v.pairs[Symbol.iterator]();
    if (v instanceof ZipVal) return v.pairs[Symbol.iterator]();
    throw new PyError('TypeError', `'${typeName(v)}' object is not iterable`, node && node.line || 0);
  };

  Interp.prototype.rangeIter = function* (r) {
    if (r.c > 0) for (let x = r.a; x < r.b; x += r.c) yield x;
    else for (let x = r.a; x > r.b; x += r.c) yield x;
  };

  Interp.prototype.rangeLen = function (r) {
    if (r.c > 0) return Math.max(0, Math.ceil((r.b - r.a) / r.c));
    return Math.max(0, Math.ceil((r.a - r.b) / -r.c));
  };

  Interp.prototype.pyCompareVal = function (a, b, node) {
    const na = isNumLike(a), nb = isNumLike(b);
    if (na && nb) return unwrap(a) - unwrap(b);
    if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
    const la = Array.isArray(a) || a instanceof PyTuple, lb = Array.isArray(b) || b instanceof PyTuple;
    if (la && lb && Array.isArray(a) === Array.isArray(b)) {
      const xa = Array.isArray(a) ? a : a.items, xb = Array.isArray(b) ? b : b.items;
      const n = Math.min(xa.length, xb.length);
      for (let i = 0; i < n; i++) {
        const c = this.pyCompareVal(xa[i], xb[i], node);
        if (c !== 0) return c;
      }
      return xa.length - xb.length;
    }
    throw new PyError('TypeError', `'<' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`, node && node.line || 0);
  };

  Interp.prototype.binOp = function (op, a, b, node) {
    const na = isNumLike(a), nb = isNumLike(b);
    switch (op) {
      case '+':
        if (typeof a === 'string' && typeof b === 'string') return a + b;
        if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
        if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple(a.items.concat(b.items));
        if (na && nb) return mkNum(unwrap(a) + unwrap(b), isF(a) || isF(b), node);
        throw new PyError('TypeError', `can only concatenate ${typeName(a)} (not "${typeName(b)}") to ${typeName(a)}`, node && node.line || 0,
          'To join text with a number, use an f-string or str() around the number.');
      case '-':
        if (na && nb) return mkNum(unwrap(a) - unwrap(b), isF(a) || isF(b), node);
        break;
      case '*':
        if (na && nb) return mkNum(unwrap(a) * unwrap(b), isF(a) || isF(b), node);
        if (typeof a === 'string' && typeof b === 'number' && !isF(b)) return a.repeat(Math.max(0, b | 0));
        if (typeof b === 'string' && typeof a === 'number' && !isF(a)) return b.repeat(Math.max(0, a | 0));
        if (Array.isArray(a) && typeof b === 'number' && !isF(b)) return flatRepeat(a, b | 0);
        if (Array.isArray(b) && typeof a === 'number' && !isF(a)) return flatRepeat(b, a | 0);
        break;
      case '/':
        if (na && nb) {
          if (unwrap(b) === 0) throw new PyError('ZeroDivisionError', 'division by zero', node && node.line || 0, "You can't divide by zero!");
          return new PyFloat(unwrap(a) / unwrap(b));
        }
        break;
      case '//':
        if (na && nb) {
          if (unwrap(b) === 0) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero', node && node.line || 0, "You can't divide by zero!");
          return mkNum(Math.floor(unwrap(a) / unwrap(b)), isF(a) || isF(b), node);
        }
        break;
      case '%':
        if (na && nb) {
          if (unwrap(b) === 0) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero', node && node.line || 0, "You can't divide by zero!");
          const ua = unwrap(a), ub = unwrap(b);
          return mkNum(ua - Math.floor(ua / ub) * ub, isF(a) || isF(b), node);
        }
        break;
      case '**':
        if (na && nb) {
          const ua = unwrap(a), ub = unwrap(b);
          if (!isF(a) && !isF(b) && typeof a === 'number' && typeof b === 'number' && ub >= 0) {
            const r = Math.pow(ua, ub);
            return Number.isInteger(r) ? r : r;
          }
          return new PyFloat(Math.pow(ua, ub));
        }
        break;
    }
    throw new PyError('TypeError', `unsupported operand type(s) for ${op}: '${typeName(a)}' and '${typeName(b)}'`, node && node.line || 0,
      'Check the types — maybe you need str() or int() to convert one of them.');
  };

  function mkNum(v, isFloat, node) {
    if (!isFinite(v)) return new PyFloat(v);
    return isFloat ? new PyFloat(v) : v;
  }
  function flatRepeat(arr, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(...arr);
    return out;
  }

  Interp.prototype.doIndex = function (container, idx, node) {
    if (typeof container === 'string' || Array.isArray(container) || container instanceof PyTuple) {
      const items = container instanceof PyTuple ? container.items : container;
      const tname = typeof container === 'string' ? 'string' : 'list';
      if (!isNumLike(idx)) throw new PyError('TypeError', `${tname} indices must be integers`, node && node.line || 0);
      let i = this.toIndex(idx, node);
      if (i < 0) i += items.length;
      if (i < 0 || i >= items.length) throw new PyError('IndexError', `${tname} index out of range`, node && node.line || 0, `That position doesn't exist. Remember: indexes start at 0, and the list has ${items.length} item${items.length === 1 ? '' : 's'}.`);
      return typeof container === 'string' ? container[i] : (container instanceof PyTuple ? items[i] : items[i]);
    }
    if (container instanceof Map) {
      if (!HASHABLE(idx)) throw new PyError('TypeError', "unhashable type: '" + typeName(idx) + "'", node && node.line || 0);
      if (container.has(idx)) return container.get(idx);
      throw new PyError('KeyError', pyRepr(idx), node && node.line || 0, "That key isn't in the dictionary. Use .get(key, default) to check safely.");
    }
    throw new PyError('TypeError', `'${typeName(container)}' object is not subscriptable`, node && node.line || 0);
  };

  Interp.prototype.doSetIndex = function (container, idx, v, node) {
    if (Array.isArray(container)) {
      if (!isNumLike(idx)) throw new PyError('TypeError', 'list indices must be integers', node && node.line || 0);
      let i = this.toIndex(idx, node);
      if (i < 0) i += container.length;
      if (i < 0 || i >= container.length) throw new PyError('IndexError', 'list assignment index out of range', node && node.line || 0, 'Use .append(value) to add to the end of a list.');
      container[i] = v;
      return;
    }
    if (container instanceof Map) {
      if (!HASHABLE(idx)) throw new PyError('TypeError', "unhashable type: '" + typeName(idx) + "'", node && node.line || 0);
      container.set(idx, v);
      return;
    }
    throw new PyError('TypeError', `'${typeName(container)}' object does not support item assignment`, node && node.line || 0);
  };

  Interp.prototype.doSlice = function (v, sl, node) {
    if (typeof v !== 'string' && !Array.isArray(v) && !(v instanceof PyTuple)) {
      throw new PyError('TypeError', `'${typeName(v)}' object is not subscriptable`, node && node.line || 0);
    }
    const items = v instanceof PyTuple ? v.items : v;
    const len = items.length;
    const env = this.currentEnv;
    const step = sl.step === null ? 1 : this.toIndex(this.evalNode(sl.step, env), node);
    if (step === 0) throw new PyError('ValueError', 'slice step cannot be zero', node && node.line || 0);
    const clamp = (x, dflt) => {
      if (x === null || x === undefined) return dflt;
      let i = this.toIndex(x, node);
      if (i < 0) i += len;
      return Math.max(0, Math.min(i, len));
    };
    const out = [];
    if (step > 0) {
      const s = clamp(sl.start === null ? null : this.evalNode(sl.start, env), 0);
      const e = clamp(sl.stop === null ? null : this.evalNode(sl.stop, env), len);
      for (let i = s; i < e; i += step) out.push(items[i]);
    } else {
      const cl = (x, dflt) => {
        if (x === null || x === undefined) return dflt;
        let i = this.toIndex(x, node);
        if (i < 0) i += len;
        return Math.max(-1, Math.min(i, len - 1));
      };
      const s = cl(sl.start === null ? null : this.evalNode(sl.start, env), len - 1);
      const e = cl(sl.stop === null ? null : this.evalNode(sl.stop, env), -1);
      for (let i = s; i > e; i += step) if (i >= 0 && i < len) out.push(items[i]);
    }
    return typeof v === 'string' ? out.join('') : (v instanceof PyTuple ? new PyTuple(out) : out);
  };

  Interp.prototype.envOf = function () { return this.currentEnv; };
  Interp.prototype.evalNode = function (node, env) {
    this.currentEnv = env;
    this.tick(node);
    switch (node.t) {
      case 'num': return node.f ? new PyFloat(node.v) : node.v;
      case 'str': return node.v;
      case 'fstr': {
        let s = '';
        for (const p of node.parts) {
          if (p.s !== undefined) s += p.s;
          else s += this.pyFormat(this.evalNode(p.e, env), p.fmt, node);
        }
        return s;
      }
      case 'const': return node.v;
      case 'name': return this.getName(env, node.v, node);
      case 'list': return node.items.map(x => this.evalNode(x, env));
      case 'tuple': return new PyTuple(node.items.map(x => this.evalNode(x, env)));
      case 'dict': {
        const m = new Map();
        for (const [kNode, vNode] of node.pairs) {
          const k = this.evalNode(kNode, env);
          if (!HASHABLE(k)) throw new PyError('TypeError', "unhashable type: '" + typeName(k) + "'", node && node.line || 0);
          m.set(k, this.evalNode(vNode, env));
        }
        return m;
      }
      case 'bin': return this.binOp(node.op, this.evalNode(node.left, env), this.evalNode(node.right, env), node);
      case 'unary': {
        const v = this.evalNode(node.e, env);
        if (!isNumLike(v)) throw new PyError('TypeError', `bad operand type for unary ${node.op}: '${typeName(v)}'`, node && node.line || 0);
        return node.op === '-' ? mkNum(-unwrap(v), isF(v), node) : mkNum(unwrap(v), isF(v), node);
      }
      case 'not': return !pyTruth(this.evalNode(node.e, env));
      case 'boolop': {
        const l = this.evalNode(node.left, env);
        if (node.op === 'and') return pyTruth(l) ? this.evalNode(node.right, env) : l;
        return pyTruth(l) ? l : this.evalNode(node.right, env);
      }
      case 'compare': {
        let left = this.evalNode(node.left, env);
        for (const r of node.rest) {
          const right = this.evalNode(r.right, env);
          if (!this.compareOp(r.op, left, right, node)) return false;
          left = right;
        }
        return true;
      }
      case 'attr': return this.getAttr(this.evalNode(node.value, env), node.name, node);
      case 'index': return this.doIndex(this.evalNode(node.value, env), this.evalNode(node.index, env), node);
      case 'slice': return this.doSlice(this.evalNode(node.value, env), node, node);
      case 'call': {
        const f = this.evalNode(node.func, env);
        const args = node.args.map(a => this.evalNode(a, env));
        const kwargs = node.kwargs.map(([n, v]) => [n, this.evalNode(v, env)]);
        return this.callValue(f, args, kwargs, node);
      }
    }
    throw new PyError('InternalError', 'unknown expression node ' + node.t, 0);
  };

  Interp.prototype.compareOp = function (op, a, b, node) {
    switch (op) {
      case '==': return pyEq(a, b);
      case '!=': return !pyEq(a, b);
      case 'is': return a === b || (a === null && b === null);
      case 'is not': return !(a === b || (a === null && b === null));
      case 'in': return this.contains(a, b, node);
      case 'not in': return !this.contains(a, b, node);
    }
    const na = isNumLike(a), nb = isNumLike(b);
    if (na && nb) {
      const ua = unwrap(a), ub = unwrap(b);
      switch (op) { case '<': return ua < ub; case '<=': return ua <= ub; case '>': return ua > ub; case '>=': return ua >= ub; }
    }
    if (typeof a === 'string' && typeof b === 'string') {
      switch (op) { case '<': return a < b; case '<=': return a <= b; case '>': return a > b; case '>=': return a >= b; }
    }
    const la = Array.isArray(a) || a instanceof PyTuple, lb = Array.isArray(b) || b instanceof PyTuple;
    if (la && lb && Array.isArray(a) === Array.isArray(b)) {
      const c = this.pyCompareVal(a, b, node);
      switch (op) { case '<': return c < 0; case '<=': return c <= 0; case '>': return c > 0; case '>=': return c >= 0; }
    }
    throw new PyError('TypeError', `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`, node && node.line || 0);
  };

  Interp.prototype.contains = function (item, container, node) {
    if (typeof container === 'string') {
      if (typeof item !== 'string') throw new PyError('TypeError', 'in <string> requires string as left operand', node && node.line || 0);
      return container.includes(item);
    }
    if (Array.isArray(container)) return container.some(x => pyEq(x, item));
    if (container instanceof PyTuple) return container.items.some(x => pyEq(x, item));
    if (container instanceof Map) return container.has(item);
    if (container instanceof RangeVal) {
      if (!isNumLike(item)) return false;
      const x = unwrap(item);
      if (container.c > 0) return x >= container.a && x < container.b && (x - container.a) % container.c === 0;
      return x <= container.a && x > container.b && (container.a - x) % (-container.c) === 0;
    }
    throw new PyError('TypeError', `argument of type '${typeName(container)}' is not iterable`, node && node.line || 0);
  };

  Interp.prototype.pyFormat = function (v, fmt, node) {
    if (!fmt) return pyStr(v);
    const m = /^(?:(.)?([<>^]))?(0)?(\d+)?(?:\.(\d+))?([a-zA-Z])?$/.exec(fmt);
    if (!m) return pyStr(v);
    let fill = m[1] || null;
    let align = m[2] || null;
    if (m[3] === '0' && !fill && !align) { fill = '0'; align = '>'; }
    if (!fill) fill = ' ';
    const width = m[4] ? parseInt(m[4], 10) : null,
      prec = m[5] ? parseInt(m[5], 10) : null, type = m[6] || null;
    let s;
    const numeric = isNumLike(v);
    if (type === 'f' || (prec !== null && numeric)) {
      if (!numeric) throw new PyError('TypeError', `unsupported format string passed to ${typeName(v)}.__format__`, node && node.line || 0);
      s = unwrap(v).toFixed(prec !== null ? prec : 6);
    } else if (type === 'd') {
      if (!numeric) throw new PyError('ValueError', `Unknown format code 'd' for object of type '${typeName(v)}'`, node && node.line || 0);
      s = String(Math.trunc(unwrap(v)));
    } else if (type === 's' || type === 'g' || type === null) {
      s = pyStr(v);
    } else s = pyStr(v);
    if (width !== null && s.length < width) {
      const al = align || (numeric ? '>' : '<');
      const total = width - s.length;
      if (al === '^') s = this.pad(s, width, 'center', fill);
      else if (al === '>') s = fill.repeat(total) + s;
      else s = s + fill.repeat(total);
    }
    return s;
  };

  /* ------------------------- statement execution ------------------------- */
  Interp.prototype.execBody = function (body, env) {
    for (const st of body) this.exec(st, env);
  };

  Interp.prototype.assignTo = function (target, v, env) {
    switch (target.t) {
      case 'name': env.vars.set(target.v, v); return;
      case 'index': {
        const container = this.evalNode(target.value, env);
        const idx = this.evalNode(target.index, env);
        this.doSetIndex(container, idx, v, target);
        return;
      }
      case 'tuple': {
        const items = [...this.iterOf(v, target)];
        if (items.length !== target.items.length) {
          throw new PyError('ValueError', items.length < target.items.length
            ? `not enough values to unpack (expected ${target.items.length}, got ${items.length})`
            : `too many values to unpack (expected ${target.items.length})`, target.line || 0);
        }
        for (let i = 0; i < items.length; i++) this.assignTo(target.items[i], items[i], env);
        return;
      }
      default:
        throw new PyError('SyntaxError', 'cannot assign to this expression', target.line || 0);
    }
  };

  Interp.prototype.unpack = function (v, target, env) {
    if (target.t === 'tuple') {
      const items = [...this.iterOf(v, target)];
      if (items.length !== target.items.length) {
        throw new PyError('ValueError', items.length < target.items.length
          ? `not enough values to unpack (expected ${target.items.length}, got ${items.length})`
          : `too many values to unpack (expected ${target.items.length})`, target.line || 0);
      }
      for (let i = 0; i < items.length; i++) this.assignTo(target.items[i], items[i], env);
    } else this.assignTo(target, v, env);
  };

  Interp.prototype.exec = function (st, env) {
    this.tick(st);
    switch (st.t) {
      case 'exprstmt': this.evalNode(st.e, env); return;
      case 'assign': this.assignTo(st.target, this.evalNode(st.value, env), env); return;
      case 'aug': {
        const cur = this.evalNode(st.target.t === 'index'
          ? st.target : { t: 'name', v: st.target.v, line: st.line }, env);
        const val = this.binOp(st.op, cur, this.evalNode(st.value, env), st);
        this.assignTo(st.target, val, env);
        return;
      }
      case 'if':
        if (pyTruth(this.evalNode(st.test, env))) this.execBody(st.body, env);
        else this.execBody(st.orelse, env);
        return;
      case 'while':
        while (pyTruth(this.evalNode(st.test, env))) {
          try { this.execBody(st.body, env); }
          catch (e) {
            if (e === BreakSig) break;
            if (e === ContinueSig) continue;
            throw e;
          }
        }
        return;
      case 'for': {
        const iterable = this.evalNode(st.iter, env);
        for (const item of this.iterOf(iterable, st)) {
          this.unpack(item, st.target, env);
          try { this.execBody(st.body, env); }
          catch (e) {
            if (e === BreakSig) break;
            if (e === ContinueSig) continue;
            throw e;
          }
        }
        return;
      }
      case 'def': {
        const defaults = st.defaults.map(d => d === null ? null : this.evalNode(d, env));
        env.vars.set(st.name, new PyFunc(st.name, st.params, defaults, st.body, env));
        return;
      }
      case 'return': throw new ReturnSig(st.value === null ? null : this.evalNode(st.value, env));
      case 'break': throw BreakSig;
      case 'continue': throw ContinueSig;
      case 'pass': return;
      case 'import': {
        for (const { mod, alias } of st.names) {
          const m = this.getModule(mod, st);
          env.vars.set(alias, m);
        }
        return;
      }
      case 'fromimport': {
        const m = this.getModule(st.mod, st);
        for (const { name, alias } of st.names) {
          if (name === '*') {
            for (const [k, v] of m.table) if (!k.startsWith('_')) env.vars.set(k, v);
            continue;
          }
          if (!m.table.has(name)) throw new PyError('ImportError', `cannot import name '${name}' from '${st.mod}'`, st.line || 0);
          env.vars.set(alias, m.table.get(name));
        }
        return;
      }
    }
    throw new PyError('InternalError', 'unknown statement node ' + st.t, 0);
  };

  Interp.prototype.getModule = function (name, st) {
    if (this.modules.has(name)) return this.modules.get(name);
    throw new PyError('ImportError', `No module named '${name}'`, st.line || 0, `Available modules here: ${[...this.modules.keys()].join(', ')}`);
  };

  /* ------------------------------ builtins ------------------------------- */
  Interp.prototype.installCore = function () {
    const B = (name, fn) => new Builtin(name, fn);
    const self = this;
    const add = (name, fn) => this.builtins.set(name, B(name, fn));

    add('print', (ip, args, kwargs) => {
      let sep = ' ', end = '\n';
      for (const [k, v] of kwargs) {
        if (k === 'sep') { if (typeof v !== 'string') throw new PyError('TypeError', 'sep must be a string', 0); sep = v; }
        else if (k === 'end') { if (typeof v !== 'string') throw new PyError('TypeError', 'end must be a string', 0); end = v; }
        else if (k === 'file' || k === 'flush') { /* ignored */ }
      }
      ip.emit(args.map(a => pyStr(a)).join(sep) + end);
      return null;
    });

    add('input', (ip, args, kwargs, node) => {
      const prompt = args.length ? pyStr(args[0]) : '';
      if (!ip.opts.inputFn) throw new PyError('EOFError', 'input() is not available here', node && node.line || 0);
      const s = ip.opts.inputFn(prompt);
      if (s === null || s === undefined) throw new PyError('EOFError', 'input() ran out of input', node && node.line || 0, 'This challenge provides the input the user "types" — run again to use it.');
      return String(s);
    });

    add('len', (ip, args, kwargs, node) => {
      ip.needArgs('len', args, 1, 1, node);
      const v = args[0];
      if (typeof v === 'string' || Array.isArray(v)) return v.length;
      if (v instanceof Map) return v.size;
      if (v instanceof PyTuple) return v.items.length;
      if (v instanceof RangeVal) return ip.rangeLen(v);
      throw new PyError('TypeError', `object of type '${typeName(v)}' has no len()`, node && node.line || 0);
    });

    add('range', (ip, args, kwargs, node) => {
      ip.needArgs('range', args, 1, 3, node);
      const parts = args.map(x => {
        if (typeof x === 'boolean') return x ? 1 : 0;
        if (typeof x === 'number' && Number.isInteger(x)) return x;
        throw new PyError('TypeError', "'" + typeName(x) + "' object cannot be interpreted as an integer", node && node.line || 0);
      });
      if (parts.length === 1) return new RangeVal(0, parts[0], 1);
      if (parts.length === 2) return new RangeVal(parts[0], parts[1], 1);
      return new RangeVal(parts[0], parts[1], parts[2]);
    });

    add('str', (ip, args, kwargs, node) => {
      if (!args.length) return '';
      ip.needArgs('str', args, 1, 1, node);
      return pyStr(args[0]);
    });
    add('int', (ip, args, kwargs, node) => {
      ip.needArgs('int', args, 1, 1, node);
      const v = args[0];
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (isF(v)) return Math.trunc(v.v);
      if (typeof v === 'number') return Math.trunc(v);
      if (typeof v === 'string') {
        const t = v.trim();
        if (/^[+-]?\d+$/.test(t)) return parseInt(t, 10);
        throw new PyError('ValueError', `invalid literal for int() with base 10: ${pyRepr(v)}`, node && node.line || 0, `int() needs digits — '${v.trim()}' isn't a whole number.`);
      }
      throw new PyError('TypeError', `int() argument must be a string or a number, not '${typeName(v)}'`, node && node.line || 0);
    });
    add('float', (ip, args, kwargs, node) => {
      ip.needArgs('float', args, 1, 1, node);
      const v = args[0];
      if (typeof v === 'boolean') return new PyFloat(v ? 1 : 0);
      if (isF(v)) return v;
      if (typeof v === 'number') return new PyFloat(v);
      if (typeof v === 'string') {
        const t = v.trim();
        if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return new PyFloat(parseFloat(t));
        throw new PyError('ValueError', `could not convert string to float: ${pyRepr(v)}`, node && node.line || 0);
      }
      throw new PyError('TypeError', `float() argument must be a string or a number, not '${typeName(v)}'`, node && node.line || 0);
    });
    add('bool', (ip, args, kwargs, node) => {
      ip.needArgs('bool', args, 1, 1, node);
      return pyTruth(args[0]);
    });

    add('abs', (ip, args, kwargs, node) => {
      ip.needArgs('abs', args, 1, 1, node);
      const v = args[0];
      if (!isNumLike(v)) throw new PyError('TypeError', `bad operand type for abs(): '${typeName(v)}'`, node && node.line || 0);
      return mkNum(Math.abs(unwrap(v)), isF(v), node);
    });
    add('round', (ip, args, kwargs, node) => {
      ip.needArgs('round', args, 1, 2, node);
      const v = args[0];
      if (!isNumLike(v)) throw new PyError('TypeError', `type ${typeName(v)} doesn't define __round__ method`, node && node.line || 0);
      if (args.length === 1) {
        if (!isF(v)) return v; // int stays int
        return bankerRound(v.v);
      }
      const nd = ip.toIndex(args[1], node);
      const x = unwrap(v);
      let r = Math.round(x * Math.pow(10, nd)) / Math.pow(10, nd);
      if (Object.is(r, -0)) r = 0;
      return isF(v) ? new PyFloat(r) : r;
    });
    function bankerRound(x) {
      const f = Math.floor(x), d = x - f;
      if (d > 0.5) return f + 1;
      if (d < 0.5) return f;
      return f % 2 === 0 ? f : f + 1;
    }

    add('min', (ip, args, kwargs, node) => minMax(ip, args, kwargs, node, false));
    add('max', (ip, args, kwargs, node) => minMax(ip, args, kwargs, node, true));
    function minMax(ip, args, kwargs, node, isMax) {
      let items;
      if (args.length === 1) items = [...ip.iterOf(args[0], node)];
      else items = args.slice();
      if (!items.length) throw new PyError('ValueError', `${isMax ? 'max' : 'min'}() arg is an empty sequence`, node && node.line || 0);
      const keyKw = kwargs.find(k => k[0] === 'key');
      const keyed = items.map(x => [keyKw ? ip.callValue(keyKw[1], [x], [], node) : x, x]);
      let best = keyed[0];
      for (const k of keyed) {
        const c = ip.pyCompareVal(k[0], best[0], node);
        if (isMax ? c > 0 : c < 0) best = k;
      }
      return best[1];
    }

    add('sum', (ip, args, kwargs, node) => {
      ip.needArgs('sum', args, 1, 2, node);
      let start = args.length > 1 ? args[1] : 0;
      let anyFloat = isF(start);
      let total = unwrap(start);
      for (const item of ip.iterOf(args[0], node)) {
        if (!isNumLike(item)) throw new PyError('TypeError', `unsupported operand type(s) for +: '${typeName(start)}' and '${typeName(item)}'`, node && node.line || 0);
        if (isF(item)) anyFloat = true;
        total += unwrap(item);
      }
      return mkNum(total, anyFloat, node);
    });

    add('sorted', (ip, args, kwargs, node) => {
      ip.needArgs('sorted', args, 1, 1, node);
      const items = [...ip.iterOf(args[0], node)];
      const keyKw = kwargs.find(k => k[0] === 'key');
      const rev = kwargs.find(k => k[0] === 'reverse');
      const keyed = items.map(x => [keyKw ? ip.callValue(keyKw[1], [x], [], node) : x, x]);
      keyed.sort((a, b) => ip.pyCompareVal(a[0], b[0], node));
      if (rev && pyTruth(rev[1])) keyed.reverse();
      return keyed.map(k => k[1]);
    });

    add('reversed', (ip, args, kwargs, node) => {
      ip.needArgs('reversed', args, 1, 1, node);
      const items = [...ip.iterOf(args[0], node)];
      return items.reverse();
    });
    add('list', (ip, args, kwargs, node) => {
      if (!args.length) return [];
      ip.needArgs('list', args, 1, 1, node);
      return [...ip.iterOf(args[0], node)];
    });
    add('dict', (ip, args, kwargs, node) => {
      const out = new Map();
      if (!args.length) {
        for (const [k, v] of kwargs) out.set(k, v);
        return out;
      }
      ip.needArgs('dict', args, 1, 1, node);
      const src = args[0];
      if (src instanceof Map) return new Map(src);
      for (const pair of ip.iterOf(src, node)) {
        const items = pair instanceof PyTuple ? pair.items : pair;
        if (!Array.isArray(items) || items.length !== 2) throw new PyError('TypeError', 'dict() expects pairs of (key, value)', node && node.line || 0);
        out.set(items[0], items[1]);
      }
      return out;
    });
    add('type', (ip, args, kwargs, node) => {
      ip.needArgs('type', args, 1, 1, node);
      return `<class '${typeName(args[0])}'>`;
    });
    add('enumerate', (ip, args, kwargs, node) => {
      ip.needArgs('enumerate', args, 1, 2, node);
      const start = args.length > 1 ? ip.toIndex(args[1], node) : 0;
      const items = [...ip.iterOf(args[0], node)];
      return new EnumVal(items.map((x, i) => new PyTuple([i + start, x])));
    });
    add('zip', (ip, args, kwargs, node) => {
      if (args.length < 2) ip.needArgs('zip', args, 2, 99, node);
      const lists = args.map(a => [...ip.iterOf(a, node)]);
      const n = Math.min(...lists.map(l => l.length));
      const pairs = [];
      for (let i = 0; i < n; i++) pairs.push(new PyTuple(lists.map(l => l[i])));
      return new ZipVal(pairs);
    });
    add('any', (ip, args, kwargs, node) => {
      ip.needArgs('any', args, 1, 1, node);
      for (const x of ip.iterOf(args[0], node)) if (pyTruth(x)) return true;
      return false;
    });
    add('all', (ip, args, kwargs, node) => {
      ip.needArgs('all', args, 1, 1, node);
      for (const x of ip.iterOf(args[0], node)) if (!pyTruth(x)) return false;
      return true;
    });
    add('repr', (ip, args, kwargs, node) => { ip.needArgs('repr', args, 1, 1, node); return pyRepr(args[0]); });
    add('chr', (ip, args, kwargs, node) => {
      ip.needArgs('chr', args, 1, 1, node);
      const i = ip.toIndex(args[0], node);
      if (i < 0 || i > 0x10ffff) throw new PyError('ValueError', 'chr() arg not in range(0x110000)', node && node.line || 0);
      return String.fromCodePoint(i);
    });
    add('ord', (ip, args, kwargs, node) => {
      ip.needArgs('ord', args, 1, 1, node);
      const s = args[0];
      if (typeof s !== 'string' || s.length !== 1) throw new PyError('TypeError', 'ord() expected a character, but ' + (typeof s === 'string' ? `string of length ${s.length} found` : `${typeName(s)} found`), node && node.line || 0);
      return s.codePointAt(0);
    });
    add('pow', (ip, args, kwargs, node) => {
      ip.needArgs('pow', args, 2, 2, node);
      return ip.binOp('**', args[0], args[1], node);
    });
    add('divmod', (ip, args, kwargs, node) => {
      ip.needArgs('divmod', args, 2, 2, node);
      const q = ip.binOp('//', args[0], args[1], node);
      const r = ip.binOp('%', args[0], args[1], node);
      return new PyTuple([q, r]);
    });

    // standard modules
    this.modules.set('random', new ModuleVal('random', new Map([
      ['randint', B('randint', (ip, a, kw, node) => {
        ip.needArgs('randint', a, 2, 2, node);
        const lo = ip.toIndex(a[0], node), hi = ip.toIndex(a[1], node);
        return lo + Math.floor(Math.random() * (hi - lo + 1));
      })],
      ['random', B('random', () => new PyFloat(Math.random()))],
      ['uniform', B('uniform', (ip, a, kw, node) => {
        ip.needArgs('uniform', a, 2, 2, node);
        return new PyFloat(unwrap(a[0]) + Math.random() * (unwrap(a[1]) - unwrap(a[0])));
      })],
      ['choice', B('choice', (ip, a, kw, node) => {
        ip.needArgs('choice', a, 1, 1, node);
        const items = [...ip.iterOf(a[0], node)];
        if (!items.length) throw new PyError('IndexError', 'Cannot choose from an empty sequence', node && node.line || 0);
        return items[Math.floor(Math.random() * items.length)];
      })],
      ['shuffle', B('shuffle', (ip, a, kw, node) => {
        ip.needArgs('shuffle', a, 1, 1, node);
        const L = a[0];
        if (!Array.isArray(L)) throw new PyError('TypeError', 'shuffle() expects a list', node && node.line || 0);
        for (let i = L.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [L[i], L[j]] = [L[j], L[i]];
        }
        return null;
      })]
    ])));

    this.modules.set('math', new ModuleVal('math', new Map([
      ['pi', new PyFloat(Math.PI)],
      ['e', new PyFloat(Math.E)],
      ['tau', new PyFloat(Math.PI * 2)],
      ['sqrt', B('sqrt', (ip, a, kw, node) => {
        ip.needArgs('sqrt', a, 1, 1, node);
        const x = unwrap(a[0]);
        if (x < 0) throw new PyError('ValueError', 'math domain error', node && node.line || 0);
        return new PyFloat(Math.sqrt(x));
      })],
      ['floor', B('floor', (ip, a, kw, node) => {
        ip.needArgs('floor', a, 1, 1, node);
        return Math.floor(unwrap(a[0]));
      })],
      ['ceil', B('ceil', (ip, a, kw, node) => {
        ip.needArgs('ceil', a, 1, 1, node);
        return Math.ceil(unwrap(a[0]));
      })],
      ['fabs', B('fabs', (ip, a, kw, node) => {
        ip.needArgs('fabs', a, 1, 1, node);
        return new PyFloat(Math.abs(unwrap(a[0])));
      })]
    ])));
  };

  /* ------------------------------- public -------------------------------- */
  function run(src, opts) {
    const interp = new Interp(opts);
    let error = null;
    try {
      const tokens = tokenize(src);
      const ast = new Parser(tokens).parseProgram();
      interp.execBody(ast, interp.globals);
    } catch (e) {
      if (e instanceof PyError) error = { type: e.type, msg: e.msg, line: e.line, friendly: e.friendly };
      else if (e instanceof ReturnSig) error = { type: 'SyntaxError', msg: "'return' outside function", line: 0 };
      else if (e === BreakSig) error = { type: 'SyntaxError', msg: "'break' outside loop", line: 0 };
      else if (e === ContinueSig) error = { type: 'SyntaxError', msg: "'continue' not properly in loop", line: 0 };
      else error = { type: 'InternalError', msg: e && e.message || String(e), line: 0 };
    }
    const vars = {};
    for (const [k, v] of interp.globals.vars) {
      if (k.startsWith('_')) continue;
      if (v instanceof PyFunc || v instanceof Builtin || v instanceof ModuleVal) continue;
      vars[k] = pyStr(v);
    }
    return { output: interp.out.join(''), error, vars };
  }

  function parseOnly(src) {
    try { new Parser(tokenize(src)).parseProgram(); return null; }
    catch (e) {
      if (e instanceof PyError) return { type: e.type, msg: e.msg, line: e.line, friendly: e.friendly };
      return { type: 'InternalError', msg: e && e.message || String(e), line: 0 };
    }
  }

  function makeModule(name, tableObj) {
    const table = new Map();
    for (const k in tableObj) {
      const v = tableObj[k];
      if (typeof v === 'function') table.set(k, new Builtin(k, (ip, args, kwargs) => toPy(v(args, kwargs))));
      else table.set(k, toPy(v));
    }
    return new ModuleVal(name, table);
  }

  function toPy(v) {
    if (v === null || v === undefined || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
    if (typeof v === 'function') return new Builtin('anonymous', (ip, args, kwargs) => toPy(v(args, kwargs)));
    if (Array.isArray(v)) return v.map(toPy);
    if (v instanceof PyTuple || v instanceof PyFloat || v instanceof ModuleVal || v instanceof Builtin) return v;
    if (v instanceof Map) return v;
    if (typeof v === 'object' && v.__pyfloat !== undefined) return new PyFloat(v.__pyfloat);
    return v;
  }

  return {
    run, parseOnly, tokenize,
    PyError, PyFloat, PyTuple, ModuleVal, Builtin, PyFunc,
    pyStr, pyRepr, pyTruth, typeName, makeModule,
    version: '1.0.0'
  };
});
