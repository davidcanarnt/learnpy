/* Test suite for the LearnPy Python engine. Run: node test/run_tests.js */
'use strict';
const PyEngine = require('../js/pyengine.js');
const { run } = PyEngine;

let passed = 0, failed = 0;
const failures = [];

function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (extra ? ' — ' + extra : '')); }
}
function outIs(name, code, expected, opts) {
  const r = run(code, opts);
  check(name, r.output === expected && !r.error, r.error ? `${r.error.type}: ${r.error.msg} @${r.error.line}` : `got ${JSON.stringify(r.output)} want ${JSON.stringify(expected)}`);
}
function errIs(name, code, type, opts) {
  const r = run(code, opts);
  check(name, r.error && r.error.type === type, r.error ? `got ${r.error.type}: ${r.error.msg}` : 'no error, output=' + JSON.stringify(r.output));
}

/* ---------------- basics ---------------- */
outIs('hello', 'print("Hello, world!")', 'Hello, world!\n');
outIs('comment', '# hi\nprint(1) # trailing', '1\n');
outIs('two prints', 'print("a")\nprint("b")', 'a\nb\n');
outIs('empty print', 'print()', '\n');
outIs('print sep', 'print(2024, "AI", sep="-")', '2024-AI\n');
outIs('print end', 'print("a", end="")\nprint("b", end="")\nprint("")', 'ab\n');
outIs('print no newline', 'print("a", end=" ") \nprint("b")', 'a b\n');

/* ---------------- arithmetic ---------------- */
outIs('precedence', 'print(2 + 3 * 4 ** 2)', '50\n');
outIs('truediv float', 'print(4 / 2)', '2.0\n');
outIs('truediv float 2', 'print(7 / 2)', '3.5\n');
outIs('floordiv', 'print(7 // 2)', '3\n');
outIs('floordiv neg', 'print(-7 // 2)', '-4\n');
outIs('mod', 'print(7 % 3)', '1\n');
outIs('mod neg', 'print(-7 % 3)', '2\n');
outIs('pow', 'print(2 ** 10)', '1024\n');
outIs('pow neg exp', 'print(2 ** -1)', '0.5\n');
outIs('unary', 'print(-2 ** 2)', '-4\n');
outIs('unary2', 'print((-2) ** 2)', '4\n');
outIs('float add', 'print(1.5 + 1)', '2.5\n');
outIs('big int pow', 'print(10 ** 6)', '1000000\n');
outIs('paren', 'print((3 + 4) * 2)', '14\n');
errIs('divzero', 'print(1 / 0)', 'ZeroDivisionError');
errIs('modzero', 'print(7 % 0)', 'ZeroDivisionError');

/* ---------------- strings ---------------- */
outIs('str escape', 'print("a\\tb")', 'a\tb\n');
outIs('str concat', 'print("foo" + "bar")', 'foobar\n');
outIs('str repeat', 'print("ab" * 3)', 'ababab\n');
outIs('str in', 'print("py" in "happy python")', 'True\n');
outIs('str index', 's = "LearnPy"\nprint(s[0], s[-1])', 'L y\n');
outIs('str slice', 's = "LearnPy"\nprint(s[:5], s[2:4], s[-2:])', 'Learn ar Py\n');
outIs('str slice step', 's = "abcdef"\nprint(s[::2], s[::-1])', 'ace fedcba\n');
outIs('upper', 'print("python".upper())', 'PYTHON\n');
outIs('title', 'print("hello world".title())', 'Hello World\n');
outIs('capitalize', 'print("hello there".capitalize())', 'Hello there\n');
outIs('strip', 'print("  hi  ".strip())', 'hi\n');
outIs('split', 'print("a,b,c".split(","))', "['a', 'b', 'c']\n");
outIs('split none', 'print("the quick fox".split())', "['the', 'quick', 'fox']\n");
outIs('join', 'print(", ".join(["x", "y"]))', 'x, y\n');
outIs('replace', 'print("secret code".replace("secret", "####"))', '#### code\n');
outIs('find', 'print("hello".find("ll"), "hello".find("z"))', '2 -1\n');
outIs('count', 'print("banana".count("a"))', '3\n');
outIs('startswith', 'print("learnpy".startswith("learn"))', 'True\n');
outIs('len str', 'print(len("abcd"))', '4\n');
outIs('adjacent concat', 'print("foo" "bar")', 'foobar\n');
outIs('isdigit', 'print("123".isdigit(), "1a".isdigit())', 'True False\n');
outIs('repr in list', 'print(["it\'s", "a"])', '["it\'s", \'a\']\n');
outIs('zfill', 'print("7".zfill(3))', '007\n');

/* ---------------- f-strings ---------------- */
outIs('fstring basic', 'name = "Ada"\nprint(f"Hello {name}!")', 'Hello Ada!\n');
outIs('fstring expr', 'x = 6\nprint(f"{x} * 7 = {x * 7}")', '6 * 7 = 42\n');
outIs('fstring fmt', 'pi = 3.14159\nprint(f"{pi:.2f}")', '3.14\n');
outIs('fstring pad', 'print(f"{7:03d}|{7:^5}|{\'hi\':>6}")', '007|  7  |    hi\n');
outIs('fstring braces', 'print(f"{{}}")', '{}\n');
outIs('fstring call', 'name="bob"\nprint(f"HI {name.upper()}!")', 'HI BOB!\n');
outIs('fstring mixed', 'a, b = 3, 4\nprint(f"{a}+{b}={a+b}")', '3+4=7\n');

/* ---------------- variables & tuples ---------------- */
outIs('swap', 'a = 3\nb = 7\na, b = b, a\nprint(a, b)', '7 3\n');
outIs('multi assign', 'x, y = 1, 2\nprint(x + y)', '3\n');
outIs('aug', 'x = 5\nx += 3\nx *= 2\nprint(x)', '16\n');
outIs('aug index', 'lst = [1, 2]\nlst[0] += 10\nprint(lst)', '[11, 2]\n');
outIs('tuple', 'print((1, 2))', '(1, 2)\n');
outIs('tuple single', 't = (1,)\nprint(t)', '(1,)\n');
errIs('unpack too many', 'a, b = (1, 2, 3)\nprint(a)', 'ValueError');
errIs('unpack too few', 'a, b = [1]', 'ValueError');
outIs('return tuple', 'def f():\n    return 3, 4\nx, y = f()\nprint(x * y)', '12\n');

/* ---------------- lists ---------------- */
outIs('list literal', 'pets = ["cat", "dog"]\nprint(pets)', "['cat', 'dog']\n");
outIs('list index neg', 'nums = [10, 20, 30]\nprint(nums[0], nums[-1])', '10 30\n');
outIs('list append', 'todo = ["a"]\ntodo.append("b")\nprint(todo)', "['a', 'b']\n");
outIs('list insert', 'L = [1, 3]\nL.insert(1, 2)\nprint(L)', '[1, 2, 3]\n');
outIs('list pop', 'L = [1, 2, 3]\nprint(L.pop(), L)', '3 [1, 2]\n');
outIs('list remove', 'L = ["a", "b"]\nL.remove("a")\nprint(L)', "['b']\n");
outIs('list sort', 'scores = [9, 4, 7]\nscores.sort()\nprint(scores)', '[4, 7, 9]\n');
outIs('sorted reverse', 'print(sorted([3, 1, 2], reverse=True))', '[3, 2, 1]\n');
outIs('sorted key', 'words = ["bb", "a", "ccc"]\nprint(sorted(words, key=len))', "['a', 'bb', 'ccc']\n");
outIs('list reverse', 'L = [1, 2]\nL.reverse()\nprint(L)', '[2, 1]\n');
outIs('list sum min max', 'print(sum([1, 2, 3]), max([1, 9, 3]), min([5, 2]))', '6 9 2\n');
outIs('list len', 'print(len([1, 2, 3]))', '3\n');
outIs('list concat', 'print([1] + [2, 3])', '[1, 2, 3]\n');
outIs('list repeat', 'print([0] * 3)', '[0, 0, 0]\n');
errIs('list index oob', 'L = [1]\nprint(L[5])', 'IndexError');
outIs('list slice', 'L = [10, 20, 30, 40]\nprint(L[1:3])', '[20, 30]\n');
outIs('list extend', 'a = [1]\na.extend([2, 3])\nprint(a)', '[1, 2, 3]\n');
outIs('in list', 'print(2 in [1, 2], 5 in [1, 2])', 'True False\n');
outIs('list set', 'L = [1, 2]\nL[1] = 9\nprint(L)', '[1, 9]\n');
errIs('unhashable', '{[1]: 2}', 'TypeError');

/* ---------------- dicts ---------------- */
outIs('dict literal', 'hero = {"name": "Pip"}\nprint(hero["name"])', 'Pip\n');
outIs('dict add', 'hero = {"name": "Pip"}\nhero["level"] = 3\nprint(hero)', "{'name': 'Pip', 'level': 3}\n");
outIs('dict keys loop', 'd = {"a": 1, "b": 2}\nfor k in d:\n    print(k)', 'a\nb\n');
outIs('dict items', 'd = {"a": 1}\nfor k, v in d.items():\n    print(k, "=", v)', 'a = 1\n');
outIs('dict get default', 'd = {}\nprint(d.get("x", 42))', '42\n');
outIs('dict keys vals', 'd = {"a": 1, "b": 2}\nprint(list(d.keys()), list(d.values()))', "['a', 'b'] [1, 2]\n");
errIs('keyerror', 'd = {}\nprint(d["x"])', 'KeyError');
outIs('dict int keys', 'd = {1: "a"}\nprint(d[1])', 'a\n');

/* ---------------- control flow ---------------- */
outIs('if', 'temp = 31\nif temp > 30:\n    print("hot")', 'hot\n');
outIs('if else', 'x = 5\nif x > 10:\n    print("big")\nelse:\n    print("small")', 'small\n');
outIs('elif', 'score = 77\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")', 'B\n');
outIs('and or', 'print(True and False, True or False)', 'False True\n');
outIs('not', 'print(not True, not 0)', 'False True\n');
outIs('chained cmp', 'print(1 < 2 < 3, 3 > 2 == 2)', 'True True\n');
outIs('one-line if', 'x = 5\nif x == 5: print("five")', 'five\n');
outIs('while', 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("go")', '3\n2\n1\ngo\n');
outIs('while break', 'n = 0\nwhile True:\n    n += 1\n    if n >= 3:\n        break\nprint(n)', '3\n');
outIs('continue', 'for n in [1, 2, 3]:\n    if n == 2:\n        continue\n    print(n)', '1\n3\n');
outIs('for range', 'for i in range(1, 4):\n    print(i)', '1\n2\n3\n');
outIs('for range step', 'for i in range(0, 10, 3):\n    print(i)', '0\n3\n6\n9\n');
outIs('for str', 'for c in "ab":\n    print(c)', 'a\nb\n');
outIs('for enumerate', 'for i, c in enumerate("ab", 1):\n    print(i, c)', '1 a\n2 b\n');
outIs('for zip', 'for a, b in zip([1, 2], ["x", "y"]):\n    print(a, b)', '1 x\n2 y\n');
outIs('pattern', 'for i in range(1, 4):\n    print("*" * i)', '*\n**\n***\n');

/* ---------------- functions ---------------- */
outIs('def simple', 'def greet():\n    print("hi")\ngreet()', 'hi\n');
outIs('def param', 'def greet(name):\n    print(f"hi {name}")\ngreet("Ada")', 'hi Ada\n');
outIs('def default', 'def cheer(name="friend"):\n    print(f"go {name}")\ncheer()\ncheer("Pip")', 'go friend\ngo Pip\n');
outIs('def return', 'def double(n):\n    return n * 2\nprint(double(21))', '42\n');
outIs('recursion', 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\nprint(fact(5))', '120\n');
errIs('recursion limit', 'def f(n):\n    return f(n + 1)\nf(0)', 'RecursionError');
outIs('is even', 'def is_even(n):\n    return n % 2 == 0\nprint(is_even(4), is_even(3))', 'True False\n');
errIs('missing arg', 'def f(x):\n    return x\nf()', 'TypeError');
errIs('nameerror', 'print(mystery)', 'NameError');
outIs('func as value', 'def f(x):\n    return x + 1\ng = f\nprint(g(1))', '2\n');

/* ---------------- conversions & misc ---------------- */
outIs('int str', 'print(int("12") + 1)', '13\n');
outIs('int trunc', 'print(int(3.9), int(-3.9))', '3 -3\n');
outIs('float', 'print(float("3.5") + 0.5)', '4.0\n');
outIs('str num', 'print(str(42) + "!")', '42!\n');
errIs('int bad', 'int("abc")', 'ValueError');
outIs('round', 'print(round(3.14159, 2), round(2.5), round(3.5))', '3.14 2 4\n');
outIs('abs', 'print(abs(-5), abs(2.5))', '5 2.5\n');
outIs('type', 'print(type(3), type("a"), type(1.5), type([1]), type(True))', "<class 'int'> <class 'str'> <class 'float'> <class 'list'> <class 'bool'>\n");
outIs('any all', 'print(any([0, 1]), all([1, 0]))', 'True False\n');
outIs('chr ord', 'print(chr(65), ord("A"))', 'A 65\n');
outIs('divmod', 'print(divmod(7, 2))', '(3, 1)\n');
outIs('list range', 'print(list(range(3)))', '[0, 1, 2]\n');
outIs('range len', 'print(len(range(0, 10, 2)))', '5\n');
outIs('range in', 'print(7 in range(0, 10, 2), 8 in range(0, 10, 2))', 'False True\n');
outIs('bool ops value', 'print(0 or "x", 3 and 5, "" or None)', 'x 5 None\n');
outIs('is none', 'x = None\nprint(x is None, 1 is not None)', 'True True\n');
outIs('reversed', 'print(list(reversed([1, 2, 3])))', '[3, 2, 1]\n');

/* ---------------- modules ---------------- */
outIs('math pi', 'import math\nprint(round(math.pi, 2))', '3.14\n');
outIs('math sqrt', 'import math\nprint(math.sqrt(16))', '4.0\n');
outIs('from import', 'from math import sqrt\nprint(sqrt(9))', '3.0\n');
errIs('bad module', 'import socket', 'ImportError');
errIs('bad attr', 'from math import nope', 'ImportError');
{
  const r = run('import random\nprint(random.randint(1, 6) >= 1 and random.randint(1, 6) <= 6)');
  check('random randint', !r.error && r.output === 'True\n', r.error && r.error.msg);
  const r2 = run('print(random.choice(["a", "b"]) in ["a", "b"])');
  check('random choice bare fails', r2.error && r2.error.type === 'NameError', '');
}

/* ---------------- input ---------------- */
outIs('input stdin', 'name = input("Your name? ")\nprint("Welcome,", name)', 'Welcome: Pip\n'.replace('Welcome:', 'Welcome,'), { inputFn: () => 'Pip' });
errIs('input exhausted', 'input()\ninput()', 'EOFError', { inputFn: () => null });

/* ---------------- errors & limits ---------------- */
{
  const r = run('x = 1\nprint(x\ny = 2');
  check('syntax error line', r.error && r.error.type === 'SyntaxError', JSON.stringify(r.error));
}
{
  const r = run('if True:\nprint(1)');
  check('indent error', r.error && r.error.type === 'IndentationError', JSON.stringify(r.error));
}
{
  const r = run('n = 1\nwhile n > 0:\n    print("loop")\nprint("done")', { maxSteps: 20000 });
  check('infinite loop caught', r.error && r.error.type === 'TimeLimit', JSON.stringify(r.error));
}
{
  const r = run('print(1)\nprint(name_that_does_not_exist)');
  check('nameerror line number', r.error && r.error.line === 2, JSON.stringify(r.error));
}
errIs('unsupported lambda', 'f = lambda x: x', 'SyntaxError');
errIs('unsupported class', 'class A:\n    pass', 'SyntaxError');
errIs('break outside', 'break', 'SyntaxError');
errIs('return outside', 'return 1', 'SyntaxError');
errIs('attr error', '"a".nope()', 'AttributeError');
errIs('str int add', 'print("a" + 1)', 'TypeError');
errIs('not iterable', 'for x in 5:\n    print(x)', 'TypeError');
errIs('not callable', 'x = 5\nx()', 'TypeError');
errIs('output limit', 'while True:\n    print("x")', 'OutputLimit', { maxSteps: 500000 });

/* ---------------- global names (turtle style) ---------------- */
{
  const calls = [];
  const mod = PyEngine.makeModule('turtle', {
    forward: (args) => { calls.push(['forward', args[0]]); return null; },
    right: (args) => { calls.push(['right', args[0]]); return null; },
    xcor: () => ({ __pyfloat: 12.5 }),
  });
  const r = run('from turtle import *\nforward(100)\nright(90)\nprint(xcor())', {
    modules: { turtle: mod },
    globalNames: {
      forward: mod.table.get('forward'),
      right: mod.table.get('right'),
      xcor: mod.table.get('xcor'),
    }
  });
  check('turtle globals', !r.error && calls.length === 2 && calls[0][1] === 100 && r.output === '12.5\n', r.error ? r.error.msg : JSON.stringify(r.output));
  const r2 = run('import turtle\nturtle.forward(50)', { modules: { turtle: mod } });
  check('turtle module import', !r2.error && calls.length === 3, r2.error ? r2.error.msg : '');
  const r3 = run('forward(1)');
  check('no turtle without import', r3.error && r3.error.type === 'NameError', '');
}

/* ---------------- friendly flags on errors ---------------- */
{
  const r = run('print(nope)');
  check('friendly nameerror', r.error && typeof r.error.friendly === 'string' && r.error.friendly.length > 5, '');
}
{
  const r = run('x = [1, 2]\nprint(x[10])');
  check('friendly indexerror', r.error && r.error.friendly && r.error.friendly.includes('indexes start at 0'), r.error && r.error.friendly);
}

/* ---------------- vars snapshot ---------------- */
{
  const r = run('a = 5\nname = "x"\n\ndef f():\n    pass');
  check('vars snapshot', r.vars && r.vars.a === '5' && r.vars.name === 'x' && !r.vars.f, JSON.stringify(r.vars));
}

console.log(`\n===== ENGINE: ${passed} passed, ${failed} failed =====`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
