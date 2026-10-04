/* ============================================================================
   LearnPy — levels.js
   The full curriculum: worlds, levels, quizzes, achievements, ranks, tips.
   Loads in browser (window.LearnPyData) AND Node (module.exports) for tests.
   ========================================================================== */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.LearnPyData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* helpers for turtle checks */
  const count = (ops, name) => ops.filter(o => o.name === name).length;
  const has = (ops, name) => ops.some(o => o.name === name);
  const hasArg = (ops, name, val) => ops.some(o => o.name === name && o.args[0] === val);

  const WORLDS = [
    {
      id: 'w1', name: 'Hello, Snake Island', emoji: '🌴', tint: '#22d3ee',
      blurb: 'Shipwrecked on a mysterious island — make the machines talk!',
      levels: [
        {
          id: 'w1l1', type: 'code', title: 'Say Hello', xp: 20,
          task: 'Every programmer\'s journey starts the same way.\n\nUse `print()` to make the screen say exactly:\n\n**Hello, world!**\n\nText needs quotes around it, like `"Hello, world!"`.',
          starter: '# Print the magic words below\n',
          solution: 'print("Hello, world!")\n',
          expected: 'Hello, world!',
          hints: [
            'print() shows something on the screen. Put your text inside the parentheses.',
            'Text (a "string") must be wrapped in quotes: print("Hello, world!")'
          ]
        },
        {
          id: 'w1l2', type: 'code', title: 'Triple Chant', xp: 20,
          task: 'The island gate awakens when you chant three lines.\n\nPrint each of these on its **own line**:\n\n**Snakes**\n**write**\n**code!**\n\nEach `print()` outputs one line.',
          starter: '# Three print() calls = three lines\n',
          solution: 'print("Snakes")\nprint("write")\nprint("code!")\n',
          expected: 'Snakes\nwrite\ncode!',
          hints: [
            'You need 3 separate print() lines — one per word.',
            'Example of one line: print("Snakes") — then repeat for the others.'
          ]
        },
        {
          id: 'w1l3', type: 'code', title: 'Silence the Bug', xp: 20,
          task: 'A gremlin hid inside the machine and it prints garbage.\n\nLines starting with `#` are **comments** — Python ignores them.\n\nPut a `#` in front of the noisy line so only **Systems online!** prints.',
          starter: 'print("Systems online!")\nprint("GRBLK XJ9 NOISE!!!")\n',
          solution: 'print("Systems online!")\n#print("GRBLK XJ9 NOISE!!!")\n',
          expected: 'Systems online!',
          hints: [
            'Comments start with the # symbol. Everything after # on that line is ignored.',
            'Change the second line to: #print("GRBLK XJ9 NOISE!!!")'
          ]
        },
        {
          id: 'w1l4', type: 'code', title: 'Commas Make Spaces', xp: 20,
          task: '`print()` can take several things, separated by commas — it adds a space between them.\n\nMake it print:\n\n**I love python**\n**2024-AI**\n\nFor the second line use a `sep="-"` option inside print.',
          starter: '# print("I", "love", ...)\n# then: print(2024, "AI", sep="-")\n',
          solution: 'print("I", "love", "python")\nprint(2024, "AI", sep="-")\n',
          expected: 'I love python\n2024-AI',
          hints: [
            'Comma-separated items get a space between them: print("I", "love", "python")',
            'sep changes the separator: print(2024, "AI", sep="-") prints 2024-AI'
          ]
        },
        {
          id: 'w1l5', type: 'quiz', title: 'Quotes Trap', xp: 15,
          question: 'What does this program print?',
          code: 'print("2 + 2")',
          options: ['4', '2 + 2', '2 + 2 = 4', 'It shows an error'],
          answer: 1,
          explain: 'Because "2 + 2" is inside quotes, Python treats it as TEXT and prints it literally. Without the quotes, print(2 + 2) would compute and show 4.'
        },
        {
          id: 'w1l6', type: 'fill', title: 'Complete the Greeting', xp: 20,
          template: 'print("Hello, ___!")',
          blanks: [{ answer: 'world', choices: ['world', 'Python', '42'] }],
          expected: 'Hello, world!',
          task: 'Tap the blank, then choose the word that makes the program print exactly:\n\n**Hello, world!**',
          hints: ['The output must say "Hello, world!" — pick the word that fits.', 'The word is "world" — lowercase.']
        }
      ]
    },
    {
      id: 'w2', name: 'Variable Valley', emoji: '📦', tint: '#a78bfa',
      blurb: 'Boxes that hold values — and the art of swapping them.',
      levels: [
        {
          id: 'w2l1', type: 'code', title: 'Name Tags', xp: 20,
          task: 'A **variable** is a labeled box for a value.\n\nCreate two variables:\n\n- `name` = your explorer name (use **Pip**)\n- `age` = **3**\n\nThen print exactly:\n\n**Name: Pip**\n**Age: 3**\n\nTip: `print("Name:", name)` prints the label and the value.',
          starter: '# create the variables first\n# then print both lines\n',
          solution: 'name = "Pip"\nage = 3\nprint("Name:", name)\nprint("Age:", age)\n',
          expected: 'Name: Pip\nAge: 3',
          hints: [
            'Create variables with =, like: name = "Pip"',
            'Then: print("Name:", name) and print("Age:", age)'
          ]
        },
        {
          id: 'w2l2', type: 'code', title: 'Dice Math', xp: 20,
          task: 'Python is a super calculator.\n\nStore the result of `7 * 6` in a variable called `score`.\n\nPrint `score`, then print `score + 8`.\n\nExpected output:\n\n**42**\n**50**',
          starter: 'score = \n',
          solution: 'score = 7 * 6\nprint(score)\nprint(score + 8)\n',
          expected: '42\n50',
          hints: [
            'score = 7 * 6 puts the result into the variable.',
            'print(score) shows 42; print(score + 8) shows 50.'
          ]
        },
        {
          id: 'w2l3', type: 'arrange', title: 'The Swap Trick', xp: 25,
          task: 'The valley bridge flips everything you carry.\n\nArrange the lines so the values of `a` and `b` are **swapped**, then printed.\n\nPython trick: `a, b = b, a` swaps two variables in one line!',
          lines: ['a = 3', 'b = 7', 'a, b = b, a', 'print(a, b)'],
          expected: '7 3',
          hints: [
            'Create a first, then b, then swap, then print.',
            'Order: a = 3 → b = 7 → a, b = b, a → print(a, b)'
          ]
        },
        {
          id: 'w2l4', type: 'code', title: 'Pi Area', xp: 20,
          task: 'Compute the area of a circle with radius **5**.\n\n- `area = 3.14159 * radius ** 2`\n\nPrint it **rounded to 2 decimals** with `round(area, 2)`.\n\nExpected output: **78.54**',
          starter: 'radius = 5\narea = \n',
          solution: 'radius = 5\narea = 3.14159 * radius ** 2\nprint(round(area, 2))\n',
          expected: '78.54',
          hints: [
            'area = 3.14159 * radius ** 2 (the ** means "to the power of")',
            'round(area, 2) rounds to 2 decimal places.'
          ]
        },
        {
          id: 'w2l5', type: 'code', title: 'Talk to Strangers', xp: 25,
          task: '`input()` asks the user to type something.\n\nIn this challenge the visitor already typed **Pip**, so `input()` will return `"Pip"`.\n\nStore it in `name`, then print:\n\n**Welcome, Pip**\n\nTip: `name = input("Who goes there? ")`',
          starter: 'name = input("Who goes there? ")\n# now greet them!\n',
          solution: 'name = input("Who goes there? ")\nprint("Welcome,", name)\n',
          expected: 'Welcome, Pip',
          stdin: ['Pip'],
          hints: [
            'input() returns the text the user typed — save it: name = input("Who goes there? ")',
            'Then print("Welcome,", name)'
          ]
        },
        {
          id: 'w2l6', type: 'quiz', title: 'Slash vs Double Slash', xp: 15,
          question: 'What does this print?',
          code: 'print(7 // 2)',
          options: ['3.5', '3', '4', '2'],
          answer: 1,
          explain: '// is integer (floor) division — it chops off the decimals. 7 // 2 = 3. The single / would give 3.5.'
        },
        {
          id: 'w2l7', type: 'quiz', title: 'Type Detective', xp: 15,
          question: 'What type does `7 / 2` produce in Python?',
          options: ['int', 'float', 'str', 'bool'],
          answer: 1,
          explain: 'In Python 3, / is "true division" and ALWAYS returns a float — even 4 / 2 gives 2.0. That is why you see the .0!'
        }
      ]
    },
    {
      id: 'w3', name: 'String Shore', emoji: '🐚', tint: '#f472b6',
      blurb: 'Text with superpowers: f-strings, slicing and sneaky methods.',
      levels: [
        {
          id: 'w3l1', type: 'code', title: 'F-String Fever', xp: 20,
          task: 'An **f-string** drops variable values right into text:\n\n`print(f"Hello, {name}!")`\n\nWith `name = "Ada"`, make it print exactly:\n\n**Hello, Ada!**\n\nDon\'t forget the little `f` before the quotes!',
          starter: 'name = "Ada"\n',
          solution: 'name = "Ada"\nprint(f"Hello, {name}!")\n',
          expected: 'Hello, Ada!',
          hints: [
            'Put an f right before the opening quote: f"..."',
            'Inside, {name} is replaced by the variable\'s value.'
          ]
        },
        {
          id: 'w3l2', type: 'code', title: 'Shout It', xp: 20,
          task: 'Strings have built-in powers called **methods**.\n\nWith `word = "python"`, print its UPPERCASE form and its length together:\n\n**PYTHON 6**\n\nTips: `word.upper()` and `len(word)`.',
          starter: 'word = "python"\n',
          solution: 'word = "python"\nprint(word.upper(), len(word))\n',
          expected: 'PYTHON 6',
          hints: [
            'word.upper() returns "PYTHON".',
            'print(word.upper(), len(word)) prints both with one space between.'
          ]
        },
        {
          id: 'w3l3', type: 'code', title: 'First & Last', xp: 20,
          task: 'Indexing grabs one letter: `s[0]` is the first, `s[-1]` is the last.\n\nWith `s = "LearnPy"`, print the first and last letter:\n\n**L y**',
          starter: 's = "LearnPy"\n',
          solution: 's = "LearnPy"\nprint(s[0], s[-1])\n',
          expected: 'L y',
          hints: [
            'Counting starts at 0: s[0] is "L".',
            'Negative indexes count from the end: s[-1] is "y".'
          ]
        },
        {
          id: 'w3l4', type: 'code', title: 'Slice of Shore', xp: 20,
          task: 'Slicing cuts a piece: `s[start:stop]` — start included, stop excluded.\n\nPrint the first 5 letters of `"LearnPy"`:\n\n**Learn**',
          starter: 's = "LearnPy"\n',
          solution: 's = "LearnPy"\nprint(s[:5])\n',
          expected: 'Learn',
          hints: [
            's[0:5] takes letters 0,1,2,3,4.',
            'Leaving out the start is the same as 0: s[:5]'
          ]
        },
        {
          id: 'w3l5', type: 'code', title: 'Censor Bot', xp: 25,
          task: 'The censor-bot hides forbidden words.\n\nUse `.replace(old, new)` to swap `"secret"` for `"####"` in the message.\n\nExpected output: **my #### code**',
          starter: 'msg = "my secret code"\n',
          solution: 'msg = "my secret code"\nprint(msg.replace("secret", "####"))\n',
          expected: 'my #### code',
          hints: [
            'msg.replace("secret", "####") returns a new string with the swap.',
            'Print the result: print(msg.replace("secret", "####"))'
          ]
        },
        {
          id: 'w3l6', type: 'quiz', title: 'Multiplying Words', xp: 15,
          question: 'What does this print?',
          code: 'print("py" * 3)',
          options: ['py * 3', 'pypypy', 'py py py', 'It shows an error'],
          answer: 1,
          explain: 'Multiplying a string by a number repeats it: "py" * 3 gives "pypypy". Handy for patterns like "-" * 20!'
        },
        {
          id: 'w3l7', type: 'code', title: 'Power Combo', xp: 25,
          task: 'Combine your new powers: an f-string **and** a method.\n\nWith `friend = "grace"`, print:\n\n**HI GRACE!**\n\nTip: `{friend.upper()}` works inside an f-string.',
          starter: 'friend = "grace"\n',
          solution: 'friend = "grace"\nprint(f"HI {friend.upper()}!")\n',
          expected: 'HI GRACE!',
          hints: [
            'Method calls work inside f-string braces.',
            'print(f"HI {friend.upper()}!")'
          ]
        }
      ]
    },
    {
      id: 'w4', name: 'List Lagoon', emoji: '🌊', tint: '#34d399',
      blurb: 'Collections of treasures: append, sort, sum and more.',
      levels: [
        {
          id: 'w4l1', type: 'code', title: 'Make a List', xp: 20,
          task: 'A **list** holds many values in order, written with square brackets.\n\nCreate `pets` with `"cat"`, `"dog"`, `"parrot"` and print it.\n\nExpected output: **[\'cat\', \'dog\', \'parrot\']**',
          starter: 'pets = \n',
          solution: 'pets = ["cat", "dog", "parrot"]\nprint(pets)\n',
          expected: "['cat', 'dog', 'parrot']",
          hints: [
            'Lists use square brackets with commas: ["cat", "dog", "parrot"]',
            'print(pets) shows the whole list.'
          ]
        },
        {
          id: 'w4l2', type: 'code', title: 'Pick Two', xp: 20,
          task: 'Grab list items by index (starting at **0**!).\n\nPrint the **first** and **last** pet from `pets`:\n\n**cat parrot**\n\nTip: negative indexes count from the end.',
          starter: 'pets = ["cat", "dog", "parrot"]\n',
          solution: 'pets = ["cat", "dog", "parrot"]\nprint(pets[0], pets[-1])\n',
          expected: 'cat parrot',
          hints: [
            'pets[0] is the first item.',
            'pets[-1] is the last item — print both: print(pets[0], pets[-1])'
          ]
        },
        {
          id: 'w4l3', type: 'code', title: 'A Dragon Arrives', xp: 20,
          task: '`.append(value)` adds to the end of a list.\n\nAppend `"dragon"` to pets, then print the list and how many pets there are (`len(pets)`).\n\nExpected output:\n\n**[\'cat\', \'dog\', \'parrot\', \'dragon\']**\n**4**',
          starter: 'pets = ["cat", "dog", "parrot"]\n',
          solution: 'pets = ["cat", "dog", "parrot"]\npets.append("dragon")\nprint(pets)\nprint(len(pets))\n',
          expected: "['cat', 'dog', 'parrot', 'dragon']\n4",
          hints: [
            'pets.append("dragon") — this changes the list itself.',
            'Then print(pets) and print(len(pets)).'
          ]
        },
        {
          id: 'w4l4', type: 'code', title: 'Score Keeper', xp: 25,
          task: 'Lists work with math helpers:\n\n- `sum(scores)` — total\n- `max(scores)` — biggest\n- `min(scores)` — smallest\n\nWith `scores = [9, 4, 7]` print all three on one line:\n\n**20 9 4**',
          starter: 'scores = [9, 4, 7]\n',
          solution: 'scores = [9, 4, 7]\nprint(sum(scores), max(scores), min(scores))\n',
          expected: '20 9 4',
          hints: [
            'One print can take several arguments: print(sum(scores), max(scores), min(scores))',
            'Check: 9+4+7 = 20, max = 9, min = 4.'
          ]
        },
        {
          id: 'w4l5', type: 'code', title: 'Neat & Sorted', xp: 25,
          task: '`.sort()` puts a list in order (it changes the list itself).\n\nSort `scores` and print it:\n\n**[4, 7, 9]**\n\nWant the reverse? Try `scores.sort(reverse=True)` for fun after you pass.',
          starter: 'scores = [9, 4, 7]\n',
          solution: 'scores = [9, 4, 7]\nscores.sort()\nprint(scores)\n',
          expected: '[4, 7, 9]',
          hints: [
            'scores.sort() sorts in place — then print(scores).',
            'Don\'t write print(scores.sort()) — sort() returns nothing!'
          ]
        },
        {
          id: 'w4l6', type: 'arrange', title: 'Ship the Quest', xp: 25,
          task: 'The dock master\'s checklist shattered. Rebuild the program that:\n\n1. creates the todo list,\n2. appends `"ship game"`,\n3. prints **3 tasks**,\n4. prints the list.',
          lines: ['todo = ["wake up", "learn python"]', 'todo.append("ship game")', 'print(len(todo), "tasks")', 'print(todo)'],
          expected: "3 tasks\n['wake up', 'learn python', 'ship game']",
          hints: [
            'Create the list, append the new task, then the two prints.',
            'print(len(todo), "tasks") prints "3 tasks".'
          ]
        },
        {
          id: 'w4l7', type: 'quiz', title: 'Zero-Based Thinking', xp: 15,
          question: 'What does this print?',
          code: 'lst = [10, 20, 30]\nprint(lst[1])',
          options: ['10', '20', '30', '[10, 20]'],
          answer: 1,
          explain: 'Lists are indexed from 0: lst[0] is 10, lst[1] is 20, lst[2] is 30. Off-by-one mistakes are the classic Python rite of passage!'
        }
      ]
    },
    {
      id: 'w5', name: 'Decision Delta', emoji: '🔀', tint: '#fbbf24',
      blurb: 'Teach your code to choose: if, elif, else and logic.',
      levels: [
        {
          id: 'w5l1', type: 'code', title: 'Heat Warning', xp: 20,
          task: '`if` runs code only when a condition is True.\n\nWith `temp = 31`, print **Heat warning!** when `temp > 30`.\n\nRemember the colon `:` and the indented line under it!',
          starter: 'temp = 31\nif temp > 30\n    # print the warning here\n',
          solution: 'temp = 31\nif temp > 30:\n    print("Heat warning!")\n',
          expected: 'Heat warning!',
          hints: [
            'Every if needs a colon at the end: if temp > 30:',
            'The action goes on the next line, indented 4 spaces.'
          ]
        },
        {
          id: 'w5l2', type: 'code', title: 'Secret Password', xp: 25,
          task: '`else` runs when the if is False.\n\nThe visitor typed **open sesame**. Check if `password` equals `"open sesame"`:\n\n- if yes → print **Welcome in!**\n- else → print **Access denied**\n\nTip: `==` compares, `=` assigns.',
          starter: 'password = input("Password? ")\n',
          solution: 'password = input("Password? ")\nif password == "open sesame":\n    print("Welcome in!")\nelse:\n    print("Access denied")\n',
          expected: 'Welcome in!',
          stdin: ['open sesame'],
          hints: [
            'if password == "open sesame": — two equals signs to compare.',
            'The else: also needs a colon, with its own indented line.'
          ]
        },
        {
          id: 'w5l3', type: 'code', title: 'Grading Robot', xp: 25,
          task: '`elif` checks more conditions in order (only the first match runs).\n\nWith `score = 77`:\n\n- 90+ → **A**\n- 70+ → **B**\n- else → **C**\n\nThis one should print **B**.',
          starter: 'score = 77\nif score >= 90:\n    print("A")\n',
          solution: 'score = 77\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")\n',
          expected: 'B',
          hints: [
            'Order matters! Check the highest grade first.',
            'if score >= 90: ... elif score >= 70: ... else: ...'
          ]
        },
        {
          id: 'w5l4', type: 'code', title: 'Logic Gates', xp: 25,
          task: '`and` needs BOTH sides to be True; `or` needs at least one.\n\nWith `age = 15` and `has_pass = True`, print **Ticket granted!** only if `age >= 13` **and** `has_pass` is True.',
          starter: 'age = 15\nhas_pass = True\n',
          solution: 'age = 15\nhas_pass = True\nif age >= 13 and has_pass:\n    print("Ticket granted!")\n',
          expected: 'Ticket granted!',
          hints: [
            'if age >= 13 and has_pass:',
            'has_pass is already True/False — no need to compare it to anything.'
          ]
        },
        {
          id: 'w5l5', type: 'code', title: 'Word Hunter', xp: 25,
          task: 'The `in` operator checks if something is inside something else.\n\nWith `word = "python"`, print **Found it!** if `"py"` is in `word`.',
          starter: 'word = "python"\n',
          solution: 'word = "python"\nif "py" in word:\n    print("Found it!")\n',
          expected: 'Found it!',
          hints: [
            'if "py" in word: — reads like English!',
            'in works on strings, lists and dictionaries.'
          ]
        },
        {
          id: 'w5l6', type: 'fill', title: 'Warm or Cold', xp: 25,
          template: 'temp = 25\nif temp > 20:\n    print("Warm")\n___:\n    print("Cold")',
          blanks: [{ answer: 'else', choices: ['else', 'elif', 'or', 'if'] }],
          expected: 'Warm',
          task: 'Complete the program so it prints **Warm** when temp is over 20, otherwise **Cold**.',
          hints: ['The missing keyword pairs with if and has no condition.', 'It\'s "else" — else: on its own line.']
        },
        {
          id: 'w5l7', type: 'quiz', title: 'One Equal or Two?', xp: 15,
          question: 'Which symbol COMPARES two values (asks "are these equal?")?',
          options: ['=', '==', '=>', '!='],
          answer: 1,
          explain: '= puts a value into a variable. == asks "are these equal?". And != asks "are these different?".'
        }
      ]
    },
    {
      id: 'w6', name: 'Loop Lagoon', emoji: '🌀', tint: '#60a5fa',
      blurb: 'Do it again... and again: for, while, break & continue.',
      levels: [
        {
          id: 'w6l1', type: 'code', title: 'Count the Waves', xp: 20,
          task: '`for i in range(1, 6)` repeats with i = 1, 2, 3, 4, 5 (the end number is excluded!).\n\nPrint the numbers 1 to 5, one per line.',
          starter: 'for i in range(1, 6):\n    \n',
          solution: 'for i in range(1, 6):\n    print(i)\n',
          expected: '1\n2\n3\n4\n5',
          hints: [
            'The loop variable i takes each value in turn.',
            'Inside the loop (indented 4 spaces): print(i)'
          ]
        },
        {
          id: 'w6l2', type: 'code', title: 'Rocket Countdown', xp: 25,
          task: 'A **while** loop repeats as long as its condition stays True.\n\nCount down 3, 2, 1, then print **Liftoff!**\n\nDon\'t forget `n -= 1` inside the loop — or it never ends!',
          starter: 'n = 3\nwhile n > 0:\n    print(n)\n    \nprint("Liftoff!")\n',
          solution: 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Liftoff!")\n',
          expected: '3\n2\n1\nLiftoff!',
          hints: [
            'While the condition is True, the indented lines repeat.',
            'Add n -= 1 inside the loop so it counts down.'
          ]
        },
        {
          id: 'w6l3', type: 'code', title: 'Gauss\' Gym', xp: 25,
          task: 'Legend says Gauss added 1..100 in seconds. You have a loop!\n\nAdd every number from 1 to 100 into `total`, then print it.\n\nExpected: **5050**\n\nTip: `total += i` inside `for i in range(1, 101):`',
          starter: 'total = 0\nfor i in range(1, 101):\n    \nprint(total)\n',
          solution: 'total = 0\nfor i in range(1, 101):\n    total += i\nprint(total)\n',
          expected: '5050',
          hints: [
            'Inside the loop: total += i (adds i to total).',
            'print(total) goes OUTSIDE the loop (not indented) — once, at the end.'
          ]
        },
        {
          id: 'w6l4', type: 'code', title: 'Snack Menu', xp: 20,
          task: 'Loops walk through lists directly:\n\n`for snack in snacks:`\n\nPrint each snack with a dash, like:\n\n**- chips**\n**- cookie**\n**- apple**',
          starter: 'snacks = ["chips", "cookie", "apple"]\n',
          solution: 'snacks = ["chips", "cookie", "apple"]\nfor snack in snacks:\n    print("-", snack)\n',
          expected: '- chips\n- cookie\n- apple',
          hints: [
            'for snack in snacks: — snack becomes each item one by one.',
            'print("-", snack) prints the dash, a space, then the snack.'
          ]
        },
        {
          id: 'w6l5', type: 'code', title: 'Odd Squad', xp: 30,
          task: '`continue` skips to the next turn of the loop.\n\nPrint only the odd numbers from 1 to 7:\n\n**1**\n**3**\n**5**\n**7**\n\nTip: skip when `n % 2 == 0`.',
          starter: 'for n in range(1, 8):\n    if n % 2 == 0:\n        continue\n    \n',
          solution: 'for n in range(1, 8):\n    if n % 2 == 0:\n        continue\n    print(n)\n',
          expected: '1\n3\n5\n7',
          hints: [
            'continue jumps back to the top of the loop, skipping the rest.',
            'print(n) comes after the if — it only runs for odd n.'
          ]
        },
        {
          id: 'w6l6', type: 'code', title: 'Star Builder', xp: 30,
          task: 'String multiplication + loops = pixel art!\n\nPrint a triangle of stars:\n\n**\\***\n**\\*\\***\n**\\*\\*\\***\n\nTip: `"*" * i` builds i stars.',
          starter: 'for i in range(1, 4):\n    \n',
          solution: 'for i in range(1, 4):\n    print("*" * i)\n',
          expected: '*\n**\n***',
          hints: [
            'i is 1, then 2, then 3.',
            'print("*" * i) prints 1 star, then 2, then 3.'
          ]
        },
        {
          id: 'w6l7', type: 'quiz', title: 'Range Riddle', xp: 15,
          question: 'What is the LAST number printed?',
          code: 'for i in range(2, 8):\n    print(i)',
          options: ['7', '8', '6', '9'],
          answer: 0,
          explain: 'range(2, 8) goes 2,3,4,5,6,7 — it stops BEFORE the end number. The end is always excluded!'
        }
      ]
    },
    {
      id: 'w7', name: 'Function Falls', emoji: '⚙️', tint: '#c084fc',
      blurb: 'Wrap powers into reusable spells: def, params and return.',
      levels: [
        {
          id: 'w7l1', type: 'code', title: 'Cast a Spell', xp: 20,
          task: 'A **function** is a named block of code you can run anytime.\n\nDefine `greet()` that prints **Hello from a function!**, then call it.\n\nNote: defining it does nothing — you must CALL it with `greet()`!',
          starter: 'def greet():\n    \n# call the function here\n',
          solution: 'def greet():\n    print("Hello from a function!")\n\ngreet()\n',
          expected: 'Hello from a function!',
          hints: [
            'The body goes on an indented line under def greet():',
            'Call it by writing greet() on a new line.'
          ]
        },
        {
          id: 'w7l2', type: 'code', title: 'Personalized Spell', xp: 25,
          task: 'Parameters let you pass information in.\n\nDefine `greet(name)` that prints **Hi, {name}!** using an f-string.\n\nCall it twice: with `"Ada"` and with `"Pip"`.',
          starter: 'def greet(name):\n    \n',
          solution: 'def greet(name):\n    print(f"Hi, {name}!")\n\ngreet("Ada")\ngreet("Pip")\n',
          expected: 'Hi, Ada!\nHi, Pip!',
          hints: [
            'Inside the function: print(f"Hi, {name}!")',
            'Call it twice: greet("Ada") and greet("Pip")'
          ]
        },
        {
          id: 'w7l3', type: 'code', title: 'The Return', xp: 25,
          task: '`return` sends a value BACK to whoever called the function.\n\nDefine `double(n)` that returns `n * 2`, then print `double(21)`.\n\nExpected: **42**',
          starter: 'def double(n):\n    \n',
          solution: 'def double(n):\n    return n * 2\n\nprint(double(21))\n',
          expected: '42',
          hints: [
            'return n * 2 sends the result back.',
            'print(double(21)) — the call becomes the value 42.'
          ]
        },
        {
          id: 'w7l4', type: 'code', title: 'Default Charm', xp: 25,
          task: 'Parameters can have **default values** — used when no argument is given.\n\nDefine `cheer(name="friend")` printing **Go, {name}!**\n\nCall `cheer()` then `cheer("Pip")`.\n\nExpected:\n\n**Go, friend!**\n**Go, Pip!**',
          starter: 'def cheer(name="friend"):\n    \n',
          solution: 'def cheer(name="friend"):\n    print(f"Go, {name}!")\n\ncheer()\ncheer("Pip")\n',
          expected: 'Go, friend!\nGo, Pip!',
          hints: [
            'The default goes right in the definition: def cheer(name="friend"):',
            'cheer() uses the default; cheer("Pip") overrides it.'
          ]
        },
        {
          id: 'w7l5', type: 'code', title: 'Even/Odd Oracle', xp: 30,
          task: 'Functions shine when reused in loops.\n\nDefine `is_even(n)` returning `n % 2 == 0`.\n\nThen loop over `[1, 2, 3, 4]` printing each number and its result:\n\n**1 False**\n**2 True**\n**3 False**\n**4 True**',
          starter: 'def is_even(n):\n    \nfor n in [1, 2, 3, 4]:\n    print(n, is_even(n))\n',
          solution: 'def is_even(n):\n    return n % 2 == 0\n\nfor n in [1, 2, 3, 4]:\n    print(n, is_even(n))\n',
          expected: '1 False\n2 True\n3 False\n4 True',
          hints: [
            'return n % 2 == 0 — the comparison IS the boolean.',
            'The loop is already written for you — just finish the function.'
          ]
        },
        {
          id: 'w7l6', type: 'arrange', title: 'Blueprint Bash', xp: 30,
          task: 'Rebuild the blueprint:\n\n1. define `area(w, h)`,\n2. return `w * h`,\n3. print `area(3, 4)`,\n4. print `area(5, 2)`.\n\nExpected output: **12** then **10**.',
          lines: ['def area(w, h):', '    return w * h', 'print(area(3, 4))', 'print(area(5, 2))'],
          expected: '12\n10',
          hints: [
            'The indented line belongs inside the function.',
            'def area(w, h): → return w * h → then the two prints.'
          ]
        },
        {
          id: 'w7l7', type: 'quiz', title: 'Return vs Print', xp: 15,
          question: 'You want to STORE a function\'s result in a variable: `x = my_func()`. What must my_func use?',
          options: ['print', 'return', 'def', 'save'],
          answer: 1,
          explain: 'print only SHOWS a value on screen. return hands the value back to the caller — that is what lands in x. A function without return gives None.'
        }
      ]
    },
    {
      id: 'w8', name: 'Dict Depths', emoji: '🗝️', tint: '#f87171',
      blurb: 'Treasure maps of key → value: dictionaries.',
      levels: [
        {
          id: 'w8l1', type: 'code', title: 'Hero Stats', xp: 20,
          task: 'A **dictionary** maps keys to values — like a treasure map:\n\n`hero = {"name": "Pip", "level": 3}`\n\nGet values with `hero["name"]`.\n\nPrint the hero\'s name: **Pip**',
          starter: 'hero = {"name": "Pip", "level": 3}\n',
          solution: 'hero = {"name": "Pip", "level": 3}\nprint(hero["name"])\n',
          expected: 'Pip',
          hints: [
            'Square brackets + the key fetch the value.',
            'print(hero["name"])'
          ]
        },
        {
          id: 'w8l2', type: 'code', title: 'New Location', xp: 25,
          task: 'Assigning to a new key adds it to the dictionary.\n\nAdd `"city": "Snake Island"` to hero, then print the whole hero.\n\nExpected: **{\'name\': \'Pip\', \'level\': 3, \'city\': \'Snake Island\'}**',
          starter: 'hero = {"name": "Pip", "level": 3}\n',
          solution: 'hero = {"name": "Pip", "level": 3}\nhero["city"] = "Snake Island"\nprint(hero)\n',
          expected: "{'name': 'Pip', 'level': 3, 'city': 'Snake Island'}",
          hints: [
            'hero["city"] = "Snake Island" — new key, new value.',
            'print(hero) shows everything.'
          ]
        },
        {
          id: 'w8l3', type: 'code', title: 'Walking the Keys', xp: 25,
          task: 'A for loop walks over a dictionary\'s **keys**.\n\nPrint every key of hero, one per line:\n\n**name**\n**level**\n**city**',
          starter: 'hero = {"name": "Pip", "level": 3, "city": "Snake Island"}\n',
          solution: 'hero = {"name": "Pip", "level": 3, "city": "Snake Island"}\nfor key in hero:\n    print(key)\n',
          expected: 'name\nlevel\ncity',
          hints: [
            'for key in hero: — key becomes "name", then "level", then "city".',
            'print(key) inside the loop.'
          ]
        },
        {
          id: 'w8l4', type: 'code', title: 'Keys AND Values', xp: 30,
          task: '`.items()` gives you both: `for k, v in hero.items():`\n\nPrint each as **key = value**:\n\n**name = Pip**\n**level = 3**\n**city = Snake Island**',
          starter: 'hero = {"name": "Pip", "level": 3, "city": "Snake Island"}\n',
          solution: 'hero = {"name": "Pip", "level": 3, "city": "Snake Island"}\nfor k, v in hero.items():\n    print(k, "=", v)\n',
          expected: 'name = Pip\nlevel = 3\ncity = Snake Island',
          hints: [
            'Two loop variables need two values — .items() provides key & value pairs.',
            'print(k, "=", v)'
          ]
        },
        {
          id: 'w8l5', type: 'code', title: 'Safe Chests', xp: 25,
          task: 'Reading a missing key crashes with KeyError... but `.get(key, default)` stays calm.\n\nPrint the hero\'s `"weapon"` with default **"bare hands"**.\n\nExpected: **bare hands**',
          starter: 'hero = {"name": "Pip", "level": 3}\n',
          solution: 'hero = {"name": "Pip", "level": 3}\nprint(hero.get("weapon", "bare hands"))\n',
          expected: 'bare hands',
          hints: [
            'hero.get("weapon") would give None — a second argument sets the fallback.',
            'print(hero.get("weapon", "bare hands"))'
          ]
        },
        {
          id: 'w8l6', type: 'code', title: 'The Vote Counter', xp: 40,
          task: 'Boss-level combo: dict + loop + `.get()`.\n\nCount how many times each language was voted for. For each vote, add 1 to its count:\n\n`counts[v] = counts.get(v, 0) + 1`\n\nThen print counts. Expected: **{\'py\': 3, \'js\': 2}**',
          starter: 'votes = ["py", "js", "py", "py", "js"]\ncounts = {}\n',
          solution: 'votes = ["py", "js", "py", "py", "js"]\ncounts = {}\nfor v in votes:\n    counts[v] = counts.get(v, 0) + 1\nprint(counts)\n',
          expected: "{'py': 3, 'js': 2}",
          hints: [
            'Loop over votes; for each vote, bump its counter.',
            'counts[v] = counts.get(v, 0) + 1 — .get returns 0 the first time you see a language.'
          ]
        },
        {
          id: 'w8l7', type: 'quiz', title: 'Missing Key Drill', xp: 15,
          question: 'The key "weapon" might NOT exist. Which line is crash-proof?',
          options: ['print(hero["weapon"])', 'print(hero.get("weapon", "none"))', 'print(hero->weapon)', 'print(hero?weapon)'],
          answer: 1,
          explain: 'hero["weapon"] raises KeyError if missing. .get() politely returns your default (or None) instead of crashing.'
        }
      ]
    },
    {
      id: 'w9', name: 'Turtle Peak', emoji: '🐢', tint: '#2dd4bf',
      blurb: 'Draw with code! Guide the turtle and paint the mountain.',
      levels: [
        {
          id: 'w9l1', type: 'code', title: 'Square One', xp: 30, world: 'turtle',
          task: '`from turtle import *` unlocks drawing spells: `forward(steps)` moves, `right(degrees)` turns.\n\nDraw a **square**: move 100, turn 90° — four times.\n\nThe loop is started for you. Watch the turtle go!',
          starter: 'from turtle import *\n\nfor i in range(4):\n    forward(100)\n    right(90)\n',
          solution: 'from turtle import *\n\nfor i in range(4):\n    forward(100)\n    right(90)\n',
          expected: '',
          expectedShow: false,
          check: ops => count(ops, 'forward') === 4 && count(ops, 'right') === 4,
          hints: [
            'The starter is already the answer — run it and watch!',
            'forward(100) moves, right(90) turns. The loop does it 4 times.'
          ]
        },
        {
          id: 'w9l2', type: 'code', title: 'Golden Frame', xp: 30, world: 'turtle',
          task: 'Style it up!\n\n- `color("tomato")` sets the pen color (try "gold", "hotpink", "purple"...)\n- `pensize(4)` makes lines thicker\n\nDraw any square with a color and pen size of **at least 2**.',
          starter: 'from turtle import *\n\nfor i in range(4):\n    forward(120)\n    right(90)\n',
          solution: 'from turtle import *\n\ncolor("tomato")\npensize(4)\nfor i in range(4):\n    forward(120)\n    right(90)\n',
          expected: '',
          expectedShow: false,
          check: ops => count(ops, 'forward') >= 4 && (has(ops, 'color') || has(ops, 'pencolor')) && (has(ops, 'pensize') || has(ops, 'width')),
          hints: [
            'Call color("gold") BEFORE the loop starts drawing.',
            'pensize(4) — put it before the loop too.'
          ]
        },
        {
          id: 'w9l3', type: 'code', title: 'Triangle Temple', xp: 35, world: 'turtle',
          task: 'Geometry secret: to draw an equilateral triangle, turn **120°** (not 60!) after each side.\n\nDraw a triangle with sides of 150.',
          starter: 'from turtle import *\n\nfor i in range(3):\n    \n',
          solution: 'from turtle import *\n\nfor i in range(3):\n    forward(150)\n    right(120)\n',
          expected: '',
          expectedShow: false,
          check: ops => count(ops, 'forward') >= 3 && ops.some(o => o.name === 'right' && o.args[0] === 120),
          hints: [
            'Inside the loop: forward(150) then right(120).',
            'The exterior angle of the triangle is 120 degrees!'
          ]
        },
        {
          id: 'w9l4', type: 'code', title: 'Moon & Sun', xp: 35, world: 'turtle',
          task: 'New spells: `circle(radius)` draws a circle; `dot(size, color)` stamps a dot.\n\nDraw a circle of radius 80, then a `dot(30, "yellow")`.\n\nTip: move with `penup()`, `goto(x, y)` and `pendown()` to place things freely.',
          starter: 'from turtle import *\n\n',
          solution: 'from turtle import *\n\ncircle(80)\npenup()\nforward(150)\npendown()\ndot(30, "yellow")\n',
          expected: '',
          expectedShow: false,
          check: ops => has(ops, 'circle') && has(ops, 'dot'),
          hints: [
            'circle(80) draws right where the turtle stands.',
            'penup() lifts the pen so moving draws nothing; pendown() puts it back.'
          ]
        },
        {
          id: 'w9l5', type: 'code', title: 'Hypno-Spiral', xp: 40, world: 'turtle',
          task: 'The famous spiral: each step a little LONGER than the last.\n\n`forward(i * 6)` with `right(90)` in a loop of 40 — hypnotic!\n\nUse `speed(0)` first for instant turbo drawing.',
          starter: 'from turtle import *\n\nspeed(0)\nfor i in range(40):\n    \n',
          solution: 'from turtle import *\n\nspeed(0)\nfor i in range(40):\n    forward(i * 6)\n    right(90)\n',
          expected: '',
          expectedShow: false,
          check: ops => count(ops, 'forward') >= 40,
          hints: [
            'forward(i * 6) — the step grows each turn.',
            'right(90) after each forward makes the square spiral.'
          ]
        },
        {
          id: 'w9l6', type: 'code', title: 'Star of the Summit', xp: 40, world: 'turtle',
          task: 'Final spell of the peak: the five-point star.\n\nThe secret angle is **144°**: forward 160, right 144 — five times.\n\nColor it `"gold"` and enjoy the view.',
          starter: 'from turtle import *\n\ncolor("gold")\nspeed(0)\nfor i in range(5):\n    \n',
          solution: 'from turtle import *\n\ncolor("gold")\nspeed(0)\nfor i in range(5):\n    forward(160)\n    right(144)\n',
          expected: '',
          expectedShow: false,
          check: ops => count(ops, 'forward') >= 5 && ops.some(o => o.name === 'right' && o.args[0] === 144),
          hints: [
            'forward(160) then right(144) inside the loop.',
            '144° is the star\'s magic exterior angle.'
          ]
        },
        {
          id: 'w9l7', type: 'code', title: 'Free Art Studio', xp: 40, world: 'turtle',
          task: 'The summit studio is YOURS. Create anything — at least 8 drawing moves.\n\nIdeas: hexagons (`range(6)` + `right(60)`), rainbow dots, a random walk with `randint`, your initial letter...\n\nNo rules. Just art. 🎨',
          starter: 'from turtle import *\n\nspeed(0)\n# your masterpiece here!\n\n',
          solution: 'from turtle import *\n\nspeed(0)\ncolors = ["red", "orange", "gold", "green", "cyan", "purple"]\nfor i in range(36):\n    color(colors[i % 6])\n    forward(i * 5)\n    right(70)\n',
          expected: '',
          expectedShow: false,
          check: ops => ops.filter(o => ['forward', 'circle', 'dot', 'goto', 'write', 'backward'].includes(o.name)).length >= 8,
          hints: [
            'Every forward / circle / dot / goto counts as a move — you need 8+.',
            'Try circles of different colors with goto jumps between them!'
          ]
        }
      ]
    },
    {
      id: 'w10', name: 'The Great Bug', emoji: '👑', tint: '#fb7185',
      blurb: 'Everything you\'ve learned — against the final boss.',
      levels: [
        {
          id: 'w10l1', type: 'code', title: 'Boss Fight: Fix the Chaos', xp: 50,
          task: 'The Great Bug corrupted this program. Fix all three bugs so it prints:\n\n**Total: 80**\n**Average: 20.0**\n\n- BUG 1: the loop is missing something...\n- BUG 2: `total` starts wrong and never accumulates\n- BUG 3: nothing — the average is actually fine. Or is it? Run and see!',
          starter: '# The Great Bug scrambled this program!\nscores = [10, 25, 15, 30]\ntotal = 1\nfor s in scores\n    total = s\nprint("Total:", total)\nprint("Average:", total / 4)\n',
          solution: '# The Great Bug scrambled this program!\nscores = [10, 25, 15, 30]\ntotal = 0\nfor s in scores:\n    total += s\nprint("Total:", total)\nprint("Average:", total / 4)\n',
          expected: 'Total: 80\nAverage: 20.0',
          hints: [
            'Bug 1: "for s in scores" needs a colon and an indented line under it.',
            'Bug 2: start total at 0 and ADD each score: total += s. (80 / 4 → 20.0 — Python\'s / always gives a float!)'
          ]
        },
        {
          id: 'w10l2', type: 'quiz', title: 'Boss Riddle: The Accumulator', xp: 30,
          question: 'What does the Great Bug\'s spell print?',
          code: 'total = 0\nfor n in [2, 4, 6]:\n    total += n\nprint(total)',
          options: ['12', '246', '6', '2 4 6'],
          answer: 0,
          explain: 'The accumulator starts at 0 and gathers each value: 0+2=2, 2+4=6, 6+6=12. Accumulator loops are everywhere in real programs!'
        },
        {
          id: 'w10l3', type: 'code', title: 'Coronation: Hero Cards', xp: 50,
          task: 'Final trial — forge the Hero Card machine.\n\nDefine `hero_card(name, level=1)` that RETURNS an f-string:\n\n`*** {NAME} — Level {level} ***` (name in CAPS)\n\nThen print `hero_card("pip", 3)` and `hero_card("ada")`.\n\nExpected:\n\n**\\*\\*\\* PIP — Level 3 \\*\\*\\***\n**\\*\\*\\* ADA — Level 1 \\*\\*\\***',
          starter: 'def hero_card(name, level=1):\n    # build the card string and return it\n    \n\nprint(hero_card("pip", 3))\nprint(hero_card("ada"))\n',
          solution: 'def hero_card(name, level=1):\n    return f"*** {name.upper()} — Level {level} ***"\n\nprint(hero_card("pip", 3))\nprint(hero_card("ada"))\n',
          expected: '*** PIP — Level 3 ***\n*** ADA — Level 1 ***',
          hints: [
            'return f"*** {name.upper()} — Level {level} ***"',
            'hero_card("ada") uses the default level 1.'
          ]
        }
      ]
    }
  ];

  const RANKS = [
    { xp: 0, name: 'Byte Rookie', icon: '🥚' },
    { xp: 80, name: 'Code Cadet', icon: '🐣' },
    { xp: 200, name: 'Loop Scout', icon: '🐍' },
    { xp: 400, name: 'Function Artisan', icon: '🎓' },
    { xp: 700, name: 'Data Whisperer', icon: '🔮' },
    { xp: 1100, name: 'Logic Knight', icon: '⚔️' },
    { xp: 1600, name: 'Python Sage', icon: '🧙' },
    { xp: 2200, name: 'Serpent Master', icon: '🐲' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_run', icon: '👋', name: 'Hello, World!', desc: 'Run your very first program' },
    { id: 'first_level', icon: '🎯', name: 'First Steps', desc: 'Complete your first level' },
    { id: 'combo5', icon: '🔥', name: 'On Fire', desc: '5 correct runs in a row' },
    { id: 'combo10', icon: '⚡', name: 'Unstoppable', desc: '10 correct runs in a row' },
    { id: 'no_hint5', icon: '🧠', name: 'Pure Brain', desc: 'Finish 5 levels with zero hints' },
    { id: 'perfect_world', icon: '💎', name: 'Flawless Victory', desc: '3 stars on every level of a world' },
    { id: 'world_done', icon: '🗺️', name: 'World Explorer', desc: 'Complete every level of a world' },
    { id: 'turtle_artist', icon: '🐢', name: 'Da Vinci Turtle', desc: 'Complete all of Turtle Peak' },
    { id: 'quiz_ace', icon: '💭', name: 'Quick Mind', desc: 'Answer 5 quizzes right on the first try' },
    { id: 'night_owl', icon: '🦉', name: 'Night Owl', desc: 'Code between midnight and 5 AM' },
    { id: 'sandbox5', icon: '🧪', name: 'Mad Scientist', desc: 'Run 5 programs in the Sandbox' },
    { id: 'xp500', icon: '⭐', name: 'Rising Star', desc: 'Reach 500 XP' },
    { id: 'xp1000', icon: '🌟', name: 'XP Machine', desc: 'Reach 1000 XP' },
    { id: 'bugslayer', icon: '🗡️', name: 'Bug Slayer', desc: 'Defeat the Great Bug — finish the adventure' },
    { id: 'daily', icon: '📅', name: 'Daily Devotee', desc: 'Complete a Challenge of the Day' }
  ];

  const DAILY = [
    { q: 'Which one prints the number 5?', options: ['print("5")', 'print(5)', 'print 5', 'echo(5)'], answer: 1, explain: 'print(5) outputs the number 5. print("5") also shows 5 — but it\'s text; both display 5 on screen, yet print(5) is the number way!' },
    { q: 'What does len("snake") give?', options: ['4', '5', '6', 'Error'], answer: 1, explain: 's-n-a-k-e — 5 characters, so len("snake") is 5.' },
    { q: 'What does print(3 * "ha") show?', options: ['hahaha', 'ha ha ha', '3ha', 'Error'], answer: 0, explain: '3 * "ha" repeats the string three times: "hahaha".' },
    { q: 'Which is a correct variable name?', options: ['2cool', 'my-score', 'my_score', 'my score'], answer: 2, explain: 'Names can use letters, digits and _ — but can\'t START with a digit, and can\'t contain dashes or spaces.' },
    { q: 'What does print(10 % 3) show?', options: ['3', '3.33', '1', '0'], answer: 2, explain: '% is the remainder: 10 = 3*3 + 1, so the remainder is 1.' },
    { q: 'What is the result of True + True in Python?', options: ['TrueTrue', '2', '1', 'Error'], answer: 1, explain: 'Booleans ARE numbers in disguise: True is 1, so True + True = 2. Fun party trick!' },
    { q: 'Which loop prints exactly 4 times?', options: ['for i in range(4):', 'for i in range(1, 4):', 'for i in range(0, 3):', 'for i in range(5):'], answer: 0, explain: 'range(4) gives 0,1,2,3 — four values! range(1,4) only gives 1,2,3.' },
    { q: 'What does "abcdef"[1:3] give?', options: ['"abc"', '"bc"', '"bcd"', '"ab"'], answer: 1, explain: 'Slice [1:3] starts at index 1 and stops BEFORE index 3: letters b and c → "bc".' },
    { q: 'Which list method adds one item to the end?', options: ['.add()', '.push()', '.append()', '.insert_end()'], answer: 2, explain: 'Python lists use .append(). (push is JavaScript/other languages — not Python!)' },
    { q: 'What does a function return if it has no return line?', options: ['0', 'None', '""', 'It errors'], answer: 1, explain: 'Functions without return give None — Python\'s "nothing here" value.' }
  ];

  const TIPS = [
    'Use 4 spaces to indent code inside if/for/def blocks. Python is strict about it!',
    'print(type(x)) reveals what x really is — great detective tool.',
    'f-strings are the modern way to build text: f"Score: {score}"',
    'range(5) starts at 0 and stops BEFORE 5. The end is always excluded.',
    'print(x) shows a value; return hands it back to the caller. Different jobs!',
    'Lists start counting at 0. lst[1] is the SECOND item.',
    '.get() on dictionaries is the crash-proof way to read missing keys.',
    'Stuck? Read the error message bottom-up — the last line names the problem.',
    'You can experiment freely in the Sandbox — nothing breaks there!',
    'Small steps, run often. Test after every one or two lines.'
  ];

  const SANDBOX_EXAMPLES = [
    {
      name: '🌱 First steps',
      code: '# Welcome to the Sandbox!\n# Everything you can imagine runs here.\n\nname = "Explorer"\nfor i in range(1, 4):\n    print(f"{name}, power level {i * 100}!")\n'
    },
    {
      name: '🐢 Turtle art',
      code: 'from turtle import *\n\nspeed(0)\ncolor("cyan")\nbgcolor("midnightblue")\n\nfor i in range(60):\n    forward(i * 4)\n    right(61)\n\ndot(40, "gold")\n'
    },
    {
      name: '🎲 Dice simulator',
      code: 'from random import randint\n\nprint("Rolling 2 dice, 10 times:")\nfor i in range(10):\n    d1 = randint(1, 6)\n    d2 = randint(1, 6)\n    total = d1 + d2\n    print(f"Roll {i + 1}: {d1} + {d2} = {total}", "*" * (total - 1))\n'
    },
    {
      name: '🔤 Word stats',
      code: 'sentence = "the quick brown fox jumps over the lazy dog"\n\nwords = sentence.split()\nprint("Words:", len(words))\nprint("Letters:", len(sentence.replace(" ", "")))\nprint("Longest:", max(words, key=len))\n\nfor w in sorted(words):\n    if len(w) > 3:\n        print(w.upper(), len(w))\n'
    },
    {
      name: '💰 Savings growth',
      code: 'money = 100\nrate = 1.07\nyear = 2025\n\nprint("Year  Money")\nfor i in range(1, 11):\n    money = money * rate\n    print(f"{year + i} {round(money, 2):>8}")\n'
    }
  ];

  /* flatten helper used by the game & tests */
  function allLevels() {
    const out = [];
    for (const w of WORLDS) for (const l of w.levels) out.push({ world: w, level: l });
    return out;
  }

  return { WORLDS, RANKS, ACHIEVEMENTS, DAILY, TIPS, SANDBOX_EXAMPLES, allLevels };
});
