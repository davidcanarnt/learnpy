/* ============================================================================
   LearnPy — i18n-levels.js
   Spanish (es) translations for the curriculum defined in levels.js.
   English is canonical and lives in levels.js; this file only overrides the
   user-facing prose (titles, tasks, hints, quizzes, ...). Code examples,
   starters, solutions and expected outputs stay in English on purpose, so the
   learner works with real Python conventions.
   Loads in the browser (window.LearnPyI18NLevels) AND in Node (module.exports).
   ========================================================================== */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.LearnPyI18NLevels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    es: {
      worlds: {
        w1: {
          name: 'Hola, Isla Serpiente',
          blurb: 'Naufragaste en una isla misteriosa — ¡haz hablar a las máquinas!'
        },
        w2: {
          name: 'Valle de las Variables',
          blurb: 'Cajas que guardan valores — y el arte de intercambiarlos.'
        },
        w3: {
          name: 'Playa de las Cadenas',
          blurb: 'Texto con superpoderes: f-strings, rebanadas y métodos astutos.'
        },
        w4: {
          name: 'Laguna de las Listas',
          blurb: 'Colecciones de tesoros: append, sort, sum y mucho más.'
        },
        w5: {
          name: 'Delta de las Decisiones',
          blurb: 'Enseña a tu código a elegir: if, elif, else y lógica.'
        },
        w6: {
          name: 'Laguna de los Bucles',
          blurb: 'Otra vez... y otra vez: for, while, break y continue.'
        },
        w7: {
          name: 'Cascadas de Funciones',
          blurb: 'Envuelve poderes en hechizos reutilizables: def, parámetros y return.'
        },
        w8: {
          name: 'Profundidades de Diccionarios',
          blurb: 'Mapas del tesoro de clave → valor: los diccionarios.'
        },
        w9: {
          name: 'Pico de la Tortuga',
          blurb: '¡Dibuja con código! Guía a la tortuga y pinta la montaña.'
        },
        w10: {
          name: 'El Gran Bicho',
          blurb: 'Todo lo que has aprendido — contra el jefe final.'
        }
      },

      levels: {
        /* ---------------- World 1: Hello, Snake Island ---------------- */
        w1l1: {
          title: 'Di hola',
          task: 'El viaje de todo programador empieza igual.\n\nUsa `print()` para que la pantalla diga exactamente:\n\n**Hello, world!**\n\nEl texto necesita comillas, como `"Hello, world!"`.',
          starter: '# Imprime las palabras mágicas aquí\n',
          hints: [
            'print() muestra algo en la pantalla. Pon tu texto dentro de los paréntesis.',
            'El texto (una "cadena") debe ir entre comillas: print("Hello, world!")'
          ]
        },
        w1l2: {
          title: 'Cántico triple',
          task: 'La puerta de la isla despierta cuando entonas tres líneas.\n\nImprime cada una en su **propia línea**:\n\n**Snakes**\n**write**\n**code!**\n\nCada `print()` produce una línea.',
          starter: '# Tres llamadas a print() = tres líneas\n',
          hints: [
            'Necesitas 3 líneas print() separadas — una por palabra.',
            'Ejemplo de una línea: print("Snakes") — luego repite con las otras.'
          ]
        },
        w1l3: {
          title: 'Silencia al Bicho',
          task: 'Un gremlin se escondió en la máquina e imprime basura.\n\nLas líneas que empiezan con `#` son **comentarios** — Python los ignora.\n\nPon un `#` delante de la línea ruidosa para que solo se imprima **Systems online!**',
          hints: [
            'Los comentarios empiezan con el símbolo #. Todo lo que sigue a # en esa línea se ignora.',
            'Cambia la segunda línea a: #print("GRBLK XJ9 NOISE!!!")'
          ]
        },
        w1l4: {
          title: 'Las comas crean espacios',
          task: '`print()` puede recibir varias cosas separadas por comas — y añade un espacio entre ellas.\n\nHaz que imprima:\n\n**I love python**\n**2024-AI**\n\nPara la segunda línea usa la opción `sep="-"` dentro de print.',
          starter: '# print("I", "love", ...)\n# luego: print(2024, "AI", sep="-")\n',
          hints: [
            'Los elementos separados por comas llevan un espacio entre ellos: print("I", "love", "python")',
            'sep cambia el separador: print(2024, "AI", sep="-") imprime 2024-AI'
          ]
        },
        w1l5: {
          title: 'La trampa de las comillas',
          question: '¿Qué imprime este programa?',
          options: ['4', '2 + 2', '2 + 2 = 4', 'Da un error'],
          explain: 'Como "2 + 2" está entre comillas, Python lo trata como TEXTO y lo imprime tal cual. Sin las comillas, print(2 + 2) calcularía y mostraría 4.'
        },
        w1l6: {
          title: 'Completa el saludo',
          task: 'Toca el hueco y elige la palabra que hace que el programa imprima exactamente:\n\n**Hello, world!**',
          hints: [
            'La salida debe decir "Hello, world!" — elige la palabra que encaja.',
            'La palabra es "world" — en minúsculas.'
          ]
        },

        /* ---------------- World 2: Variable Valley ---------------- */
        w2l1: {
          title: 'Etiquetas de nombre',
          task: 'Una **variable** es una caja etiquetada para guardar un valor.\n\nCrea dos variables:\n\n- `name` = el nombre de tu explorador (usa **Pip**)\n- `age` = **3**\n\nLuego imprime exactamente:\n\n**Name: Pip**\n**Age: 3**\n\nConsejo: `print("Name:", name)` imprime la etiqueta y el valor.',
          starter: '# crea primero las variables\n# luego imprime las dos líneas\n',
          hints: [
            'Crea variables con =, así: name = "Pip"',
            'Luego: print("Name:", name) y print("Age:", age)'
          ]
        },
        w2l2: {
          title: 'Matemáticas de dados',
          task: 'Python es una supercalculadora.\n\nGuarda el resultado de `7 * 6` en una variable llamada `score`.\n\nImprime `score` y luego `score + 8`.\n\nSalida esperada:\n\n**42**\n**50**',
          hints: [
            'score = 7 * 6 guarda el resultado en la variable.',
            'print(score) muestra 42; print(score + 8) muestra 50.'
          ]
        },
        w2l3: {
          title: 'El truco del intercambio',
          task: 'El puente del valle da la vuelta a todo lo que llevas.\n\nOrdena las líneas para que los valores de `a` y `b` queden **intercambiados** e impresos.\n\nTruco de Python: ¡`a, b = b, a` intercambia dos variables en una línea!',
          hints: [
            'Crea primero a, luego b, después intercambia y por último imprime.',
            'Orden: a = 3 → b = 7 → a, b = b, a → print(a, b)'
          ]
        },
        w2l4: {
          title: 'Área de pi',
          task: 'Calcula el área de un círculo de radio **5**.\n\n- `area = 3.14159 * radius ** 2`\n\nImprímela **redondeada a 2 decimales** con `round(area, 2)`.\n\nSalida esperada: **78.54**',
          hints: [
            'area = 3.14159 * radius ** 2 (los ** significan "elevado a")',
            'round(area, 2) redondea a 2 decimales.'
          ]
        },
        w2l5: {
          title: 'Habla con desconocidos',
          task: '`input()` pide al usuario que escriba algo.\n\nEn este desafío el visitante ya escribió **Pip**, así que `input()` devolverá `"Pip"`.\n\nGuárdalo en `name` y luego imprime:\n\n**Welcome, Pip**\n\nConsejo: `name = input("Who goes there? ")`',
          starter: 'name = input("Who goes there? ")\n# ¡ahora saluda!\n',
          hints: [
            'input() devuelve el texto que escribió el usuario — guárdalo: name = input("Who goes there? ")',
            'Luego print("Welcome,", name)'
          ]
        },
        w2l6: {
          title: 'Barra simple vs. barra doble',
          question: '¿Qué imprime esto?',
          options: ['3.5', '3', '4', '2'],
          explain: '// es la división entera (suelo): corta los decimales. 7 // 2 = 3. La barra simple / daría 3.5.'
        },
        w2l7: {
          title: 'Detective de tipos',
          question: '¿Qué tipo produce `7 / 2` en Python?',
          options: ['int', 'float', 'str', 'bool'],
          explain: 'En Python 3, / es la "división real" y SIEMPRE devuelve un float — incluso 4 / 2 da 2.0. ¡Por eso ves el .0!'
        },

        /* ---------------- World 3: String Shore ---------------- */
        w3l1: {
          title: 'Fiebre de f-strings',
          task: 'Una **f-string** inserta valores de variables directamente en el texto:\n\n`print(f"Hello, {name}!")`\n\nCon `name = "Ada"`, haz que imprima exactamente:\n\n**Hello, Ada!**\n\n¡No olvides la pequeña `f` antes de las comillas!',
          hints: [
            'Pon una f justo antes de la comilla de apertura: f"..."',
            'Dentro, {name} se sustituye por el valor de la variable.'
          ]
        },
        w3l2: {
          title: 'Grita',
          task: 'Las cadenas tienen poderes incorporados llamados **métodos**.\n\nCon `word = "python"`, imprime su forma en MAYÚSCULAS y su longitud juntas:\n\n**PYTHON 6**\n\nPistas: `word.upper()` y `len(word)`.',
          hints: [
            'word.upper() devuelve "PYTHON".',
            'print(word.upper(), len(word)) imprime ambos con un espacio entre medias.'
          ]
        },
        w3l3: {
          title: 'Primera y última',
          task: 'El indexado agarra una letra: `s[0]` es la primera, `s[-1]` es la última.\n\nCon `s = "LearnPy"`, imprime la primera y la última letra:\n\n**L y**',
          hints: [
            'La cuenta empieza en 0: s[0] es "L".',
            'Los índices negativos cuentan desde el final: s[-1] es "y".'
          ]
        },
        w3l4: {
          title: 'Rebanada de costa',
          task: 'El rebanado (slicing) corta un trozo: `s[start:stop]` — inicio incluido, fin excluido.\n\nImprime las 5 primeras letras de `"LearnPy"`:\n\n**Learn**',
          hints: [
            's[0:5] toma las letras 0,1,2,3,4.',
            'Omitir el inicio es lo mismo que 0: s[:5]'
          ]
        },
        w3l5: {
          title: 'Robot censor',
          task: 'El robot censor oculta palabras prohibidas.\n\nUsa `.replace(old, new)` para cambiar `"secret"` por `"####"` en el mensaje.\n\nSalida esperada: **my #### code**',
          hints: [
            'msg.replace("secret", "####") devuelve una cadena nueva con el cambio.',
            'Imprime el resultado: print(msg.replace("secret", "####"))'
          ]
        },
        w3l6: {
          title: 'Palabras multiplicadas',
          question: '¿Qué imprime esto?',
          options: ['py * 3', 'pypypy', 'py py py', 'Da un error'],
          explain: 'Multiplicar una cadena por un número la repite: "py" * 3 da "pypypy". ¡Útil para patrones como "-" * 20!'
        },
        w3l7: {
          title: 'Combo de poder',
          task: 'Combina tus nuevos poderes: una f-string **y** un método.\n\nCon `friend = "grace"`, imprime:\n\n**HI GRACE!**\n\nConsejo: `{friend.upper()}` funciona dentro de una f-string.',
          hints: [
            'Las llamadas a métodos funcionan dentro de las llaves de una f-string.',
            'print(f"HI {friend.upper()}!")'
          ]
        },

        /* ---------------- World 4: List Lagoon ---------------- */
        w4l1: {
          title: 'Crea una lista',
          task: 'Una **lista** guarda muchos valores en orden, escrita con corchetes.\n\nCrea `pets` con `"cat"`, `"dog"`, `"parrot"` e imprímela.\n\nSalida esperada: **[\'cat\', \'dog\', \'parrot\']**',
          hints: [
            'Las listas usan corchetes con comas: ["cat", "dog", "parrot"]',
            'print(pets) muestra la lista completa.'
          ]
        },
        w4l2: {
          title: 'Elige dos',
          task: 'Toma elementos de la lista por su índice (¡empezando en **0**!).\n\nImprime la **primera** y la **última** mascota de `pets`:\n\n**cat parrot**\n\nConsejo: los índices negativos cuentan desde el final.',
          hints: [
            'pets[0] es el primer elemento.',
            'pets[-1] es el último — imprime ambos: print(pets[0], pets[-1])'
          ]
        },
        w4l3: {
          title: 'Llega un dragón',
          task: '`.append(value)` añade al final de una lista.\n\nAñade `"dragon"` a pets, luego imprime la lista y cuántas mascotas hay (`len(pets)`).\n\nSalida esperada:\n\n**[\'cat\', \'dog\', \'parrot\', \'dragon\']**\n**4**',
          hints: [
            'pets.append("dragon") — esto modifica la lista.',
            'Luego print(pets) y print(len(pets)).'
          ]
        },
        w4l4: {
          title: 'Guardián de puntuaciones',
          task: 'Las listas funcionan con ayudantes matemáticos:\n\n- `sum(scores)` — total\n- `max(scores)` — mayor\n- `min(scores)` — menor\n\nCon `scores = [9, 4, 7]` imprime los tres en una línea:\n\n**20 9 4**',
          hints: [
            'Un print puede recibir varios argumentos: print(sum(scores), max(scores), min(scores))',
            'Comprueba: 9+4+7 = 20, max = 9, min = 4.'
          ]
        },
        w4l5: {
          title: 'Ordenadas y limpias',
          task: '`.sort()` ordena una lista (modifica la lista en sí).\n\nOrdena `scores` e imprímela:\n\n**[4, 7, 9]**\n\n¿Quieres el orden inverso? Prueba `scores.sort(reverse=True)` por diversión cuando pases.',
          hints: [
            'scores.sort() ordena en el sitio — luego print(scores).',
            'No escribas print(scores.sort()) — ¡sort() no devuelve nada!'
          ]
        },
        w4l6: {
          title: 'Envía la misión',
          task: 'La lista del jefe del muelle se rompió. Reconstruye el programa que:\n\n1. crea la lista de tareas,\n2. añade `"ship game"`,\n3. imprime **3 tasks**,\n4. imprime la lista.',
          hints: [
            'Crea la lista, añade la tarea nueva y luego los dos print.',
            'print(len(todo), "tasks") imprime "3 tasks".'
          ]
        },
        w4l7: {
          title: 'Pensamiento desde cero',
          question: '¿Qué imprime esto?',
          options: ['10', '20', '30', '[10, 20]'],
          explain: 'Las listas se indexan desde 0: lst[0] es 10, lst[1] es 20, lst[2] es 30. ¡Los errores de "uno de más" son el rito de iniciación clásico de Python!'
        },
        /* ---------------- World 5: Decision Delta ---------------- */
        w5l1: {
          title: 'Aviso de calor',
          task: '`if` ejecuta código solo cuando una condición es True.\n\nCon `temp = 31`, imprime **Heat warning!** cuando `temp > 30`.\n\n¡Recuerda los dos puntos `:` y la línea indentada debajo!',
          starter: 'temp = 31\nif temp > 30\n    # imprime aquí el aviso\n',
          hints: [
            'Todo if necesita dos puntos al final: if temp > 30:',
            'La acción va en la línea siguiente, indentada con 4 espacios.'
          ]
        },
        w5l2: {
          title: 'Contraseña secreta',
          task: '`else` se ejecuta cuando el if es False.\n\nEl visitante escribió **open sesame**. Comprueba si `password` es igual a `"open sesame"`:\n\n- si sí → imprime **Welcome in!**\n- si no → imprime **Access denied**\n\nConsejo: `==` compara, `=` asigna.',
          hints: [
            'if password == "open sesame": — dos signos igual para comparar.',
            'El else: también necesita dos puntos y su propia línea indentada.'
          ]
        },
        w5l3: {
          title: 'Robot calificador',
          task: '`elif` comprueba más condiciones en orden (solo se ejecuta la primera que coincida).\n\nCon `score = 77`:\n\n- 90+ → **A**\n- 70+ → **B**\n- resto → **C**\n\nEste debería imprimir **B**.',
          hints: [
            '¡El orden importa! Comprueba primero la nota más alta.',
            'if score >= 90: ... elif score >= 70: ... else: ...'
          ]
        },
        w5l4: {
          title: 'Puertas lógicas',
          task: '`and` necesita que AMBOS lados sean True; `or` necesita al menos uno.\n\nCon `age = 15` y `has_pass = True`, imprime **Ticket granted!** solo si `age >= 13` **y** `has_pass` es True.',
          hints: [
            'if age >= 13 and has_pass:',
            'has_pass ya es True/False — no hace falta compararlo con nada.'
          ]
        },
        w5l5: {
          title: 'Cazadora de palabras',
          task: 'El operador `in` comprueba si algo está dentro de otra cosa.\n\nCon `word = "python"`, imprime **Found it!** si `"py"` está en `word`.',
          hints: [
            'if "py" in word: — ¡se lee casi como en inglés!',
            'in funciona con cadenas, listas y diccionarios.'
          ]
        },
        w5l6: {
          title: 'Caliente o frío',
          task: 'Completa el programa para que imprima **Warm** cuando temp sea mayor que 20, y si no, **Cold**.',
          hints: [
            'La palabra que falta acompaña a if y no lleva condición.',
            'Es "else" — else: en su propia línea.'
          ]
        },
        w5l7: {
          title: '¿Un igual o dos?',
          question: '¿Qué símbolo COMPARA dos valores (pregunta "¿son iguales?")?',
          options: ['=', '==', '=>', '!='],
          explain: '= guarda un valor en una variable. == pregunta "¿son iguales?". Y != pregunta "¿son diferentes?".'
        },

        /* ---------------- World 6: Loop Lagoon ---------------- */
        w6l1: {
          title: 'Cuenta las olas',
          task: '`for i in range(1, 6)` repite con i = 1, 2, 3, 4, 5 (¡el número final se excluye!).\n\nImprime los números del 1 al 5, uno por línea.',
          hints: [
            'La variable del bucle i toma cada valor por turno.',
            'Dentro del bucle (indentado con 4 espacios): print(i)'
          ]
        },
        w6l2: {
          title: 'Cuenta atrás del cohete',
          task: 'Un bucle **while** se repite mientras su condición siga siendo True.\n\nCuenta atrás 3, 2, 1 y luego imprime **Liftoff!**\n\nNo olvides `n -= 1` dentro del bucle, ¡o nunca terminará!',
          hints: [
            'Mientras la condición sea True, las líneas indentadas se repiten.',
            'Añade n -= 1 dentro del bucle para que la cuenta baje.'
          ]
        },
        w6l3: {
          title: 'El gimnasio de Gauss',
          task: 'Cuenta la leyenda que Gauss sumó 1..100 en segundos. ¡Tú tienes un bucle!\n\nSuma todos los números del 1 al 100 en `total` y luego imprímelo.\n\nEsperado: **5050**\n\nConsejo: `total += i` dentro de `for i in range(1, 101):`',
          hints: [
            'Dentro del bucle: total += i (suma i a total).',
            'print(total) va FUERA del bucle (sin indentar) — una sola vez, al final.'
          ]
        },
        w6l4: {
          title: 'Menú de aperitivos',
          task: 'Los bucles recorren listas directamente:\n\n`for snack in snacks:`\n\nImprime cada aperitivo con un guion, así:\n\n**- chips**\n**- cookie**\n**- apple**',
          hints: [
            'for snack in snacks: — snack va tomando cada elemento uno a uno.',
            'print("-", snack) imprime el guion, un espacio y el aperitivo.'
          ]
        },
        w6l5: {
          title: 'Escuadrón impar',
          task: '`continue` salta al siguiente turno del bucle.\n\nImprime solo los números impares del 1 al 7:\n\n**1**\n**3**\n**5**\n**7**\n\nConsejo: salta cuando `n % 2 == 0`.',
          hints: [
            'continue vuelve al inicio del bucle y se salta el resto.',
            'print(n) va después del if — solo se ejecuta para n impar.'
          ]
        },
        w6l6: {
          title: 'Constructor de estrellas',
          task: 'Multiplicación de cadenas + bucles = ¡arte de píxeles!\n\nImprime un triángulo de estrellas:\n\n**\\***\n**\\*\\***\n**\\*\\*\\***\n\nConsejo: `"*" * i` construye i estrellas.',
          hints: [
            'i vale 1, luego 2, luego 3.',
            'print("*" * i) imprime 1 estrella, luego 2, luego 3.'
          ]
        },
        w6l7: {
          title: 'El enigma de range',
          question: '¿Cuál es el ÚLTIMO número que se imprime?',
          options: ['7', '8', '6', '9'],
          explain: 'range(2, 8) va 2,3,4,5,6,7 — se detiene ANTES del número final. ¡El final siempre se excluye!'
        },

        /* ---------------- World 7: Function Falls ---------------- */
        w7l1: {
          title: 'Lanza un hechizo',
          task: 'Una **función** es un bloque de código con nombre que puedes ejecutar cuando quieras.\n\nDefine `greet()` que imprime **Hello from a function!** y luego llámala.\n\nOjo: definirla no hace nada — ¡tienes que LLAMARLA con `greet()`!',
          starter: 'def greet():\n    \n# llama a la función aquí\n',
          hints: [
            'El cuerpo va en una línea indentada bajo def greet():',
            'Llámala escribiendo greet() en una línea nueva.'
          ]
        },
        w7l2: {
          title: 'Hechizo personalizado',
          task: 'Los parámetros permiten pasar información.\n\nDefine `greet(name)` que imprima **Hi, {name}!** usando una f-string.\n\nLlámala dos veces: con `"Ada"` y con `"Pip"`.',
          hints: [
            'Dentro de la función: print(f"Hi, {name}!")',
            'Llámala dos veces: greet("Ada") y greet("Pip")'
          ]
        },
        w7l3: {
          title: 'El return',
          task: '`return` devuelve un valor a quien llamó a la función.\n\nDefine `double(n)` que devuelva `n * 2`, y luego imprime `double(21)`.\n\nEsperado: **42**',
          hints: [
            'return n * 2 devuelve el resultado.',
            'print(double(21)) — la llamada se convierte en el valor 42.'
          ]
        },
        w7l4: {
          title: 'Encanto predeterminado',
          task: 'Los parámetros pueden tener **valores por defecto** — se usan cuando no se da argumento.\n\nDefine `cheer(name="friend")` que imprima **Go, {name}!**\n\nLlama a `cheer()` y luego a `cheer("Pip")`.\n\nEsperado:\n\n**Go, friend!**\n**Go, Pip!**',
          hints: [
            'El valor por defecto va en la definición: def cheer(name="friend"):',
            'cheer() usa el valor por defecto; cheer("Pip") lo reemplaza.'
          ]
        },
        w7l5: {
          title: 'Oráculo par/impar',
          task: 'Las funciones brillan cuando se reutilizan en bucles.\n\nDefine `is_even(n)` que devuelva `n % 2 == 0`.\n\nLuego recorre `[1, 2, 3, 4]` imprimiendo cada número y su resultado:\n\n**1 False**\n**2 True**\n**3 False**\n**4 True**',
          hints: [
            'return n % 2 == 0 — la comparación YA es el booleano.',
            'El bucle ya está escrito — solo completa la función.'
          ]
        },
        w7l6: {
          title: 'Planos desordenados',
          task: 'Reconstruye el plano:\n\n1. define `area(w, h)`,\n2. devuelve `w * h`,\n3. imprime `area(3, 4)`,\n4. imprime `area(5, 2)`.\n\nSalida esperada: **12** y luego **10**.',
          hints: [
            'La línea indentada pertenece al interior de la función.',
            'def area(w, h): → return w * h → luego los dos print.'
          ]
        },
        w7l7: {
          title: 'Return vs. print',
          question: 'Quieres GUARDAR el resultado de una función en una variable: `x = my_func()`. ¿Qué debe usar my_func?',
          options: ['print', 'return', 'def', 'save'],
          explain: 'print solo MUESTRA un valor en pantalla. return devuelve el valor a quien llamó — eso es lo que acaba en x. Una función sin return da None.'
        },
        /* ---------------- World 8: Dict Depths ---------------- */
        w8l1: {
          title: 'Estadísticas del héroe',
          task: 'Un **diccionario** asocia claves con valores — como un mapa del tesoro:\n\n`hero = {"name": "Pip", "level": 3}`\n\nObtén valores con `hero["name"]`.\n\nImprime el nombre del héroe: **Pip**',
          hints: [
            'Corchetes + la clave obtienen el valor.',
            'print(hero["name"])'
          ]
        },
        w8l2: {
          title: 'Nueva ubicación',
          task: 'Asignar a una clave nueva la añade al diccionario.\n\nAñade `"city": "Snake Island"` a hero y luego imprime el héroe completo.\n\nEsperado: **{\'name\': \'Pip\', \'level\': 3, \'city\': \'Snake Island\'}**',
          hints: [
            'hero["city"] = "Snake Island" — clave nueva, valor nuevo.',
            'print(hero) lo muestra todo.'
          ]
        },
        w8l3: {
          title: 'Caminando por las claves',
          task: 'Un bucle for recorre las **claves** de un diccionario.\n\nImprime cada clave de hero, una por línea:\n\n**name**\n**level**\n**city**',
          hints: [
            'for key in hero: — key será "name", luego "level" y luego "city".',
            'print(key) dentro del bucle.'
          ]
        },
        w8l4: {
          title: 'Claves Y valores',
          task: '`.items()` te da ambos: `for k, v in hero.items():`\n\nImprime cada uno como **clave = valor**:\n\n**name = Pip**\n**level = 3**\n**city = Snake Island**',
          hints: [
            'Dos variables de bucle necesitan dos valores — .items() da pares clave/valor.',
            'print(k, "=", v)'
          ]
        },
        w8l5: {
          title: 'Cofres seguros',
          task: 'Leer una clave que no existe falla con KeyError... pero `.get(key, default)` mantiene la calma.\n\nImprime el `"weapon"` del héroe con valor por defecto **"bare hands"**.\n\nEsperado: **bare hands**',
          hints: [
            'hero.get("weapon") daría None — un segundo argumento fija el valor alternativo.',
            'print(hero.get("weapon", "bare hands"))'
          ]
        },
        w8l6: {
          title: 'El contador de votos',
          task: 'Combo de jefe: dict + bucle + `.get()`.\n\nCuenta cuántas veces se votó cada lenguaje. Por cada voto, suma 1 a su contador:\n\n`counts[v] = counts.get(v, 0) + 1`\n\nLuego imprime counts. Esperado: **{\'py\': 3, \'js\': 2}**',
          hints: [
            'Recorre votes; por cada voto, incrementa su contador.',
            'counts[v] = counts.get(v, 0) + 1 — .get devuelve 0 la primera vez que ves un lenguaje.'
          ]
        },
        w8l7: {
          title: 'Simulacro de clave perdida',
          question: 'La clave "weapon" podría NO existir. ¿Qué línea es a prueba de fallos?',
          options: ['print(hero["weapon"])', 'print(hero.get("weapon", "none"))', 'print(hero->weapon)', 'print(hero?weapon)'],
          explain: 'hero["weapon"] lanza KeyError si falta. .get() devuelve amablemente tu valor por defecto (o None) en lugar de romperse.'
        },

        /* ---------------- World 9: Turtle Peak ---------------- */
        w9l1: {
          title: 'Cuadrado básico',
          task: '`from turtle import *` desbloquea hechizos de dibujo: `forward(steps)` avanza, `right(degrees)` gira.\n\nDibuja un **cuadrado**: avanza 100, gira 90° — cuatro veces.\n\nEl bucle ya está empezado. ¡Mira a la tortuga!',
          hints: [
            'El código inicial ya es la respuesta — ¡ejecútalo y observa!',
            'forward(100) avanza, right(90) gira. El bucle lo hace 4 veces.'
          ]
        },
        w9l2: {
          title: 'Marco dorado',
          task: '¡Dale estilo!\n\n- `color("tomato")` fija el color del lápiz (prueba "gold", "hotpink", "purple"...)\n- `pensize(4)` hace las líneas más gruesas\n\nDibuja cualquier cuadrado con color y grosor de al menos 2.',
          hints: [
            'Llama a color("gold") ANTES de que el bucle empiece a dibujar.',
            'pensize(4) — ponlo también antes del bucle.'
          ]
        },
        w9l3: {
          title: 'Templo triangular',
          task: 'Secreto de geometría: para dibujar un triángulo equilátero, gira **120°** (¡no 60!) después de cada lado.\n\nDibuja un triángulo de lado 150.',
          hints: [
            'Dentro del bucle: forward(150) y luego right(120).',
            '¡El ángulo exterior del triángulo es 120 grados!'
          ]
        },
        w9l4: {
          title: 'Luna y sol',
          task: 'Nuevos hechizos: `circle(radius)` dibuja un círculo; `dot(size, color)` estampa un punto.\n\nDibuja un círculo de radio 80 y luego un `dot(30, "yellow")`.\n\nConsejo: muévete con `penup()`, `goto(x, y)` y `pendown()` para colocar cosas libremente.',
          hints: [
            'circle(80) dibuja justo donde está la tortuga.',
            'penup() levanta el lápiz para que al moverse no dibuje; pendown() lo baja otra vez.'
          ]
        },
        w9l5: {
          title: 'Espiral hipnótica',
          task: 'La famosa espiral: cada paso un poco MÁS LARGO que el anterior.\n\n`forward(i * 6)` con `right(90)` en un bucle de 40 — ¡hipnótico!\n\nUsa `speed(0)` primero para dibujo instantáneo.',
          hints: [
            'forward(i * 6) — el paso crece en cada vuelta.',
            'right(90) después de cada forward crea la espiral cuadrada.'
          ]
        },
        w9l6: {
          title: 'Estrella de la cima',
          task: 'Hechizo final del pico: la estrella de cinco puntas.\n\nEl ángulo secreto es **144°**: avanza 160, gira 144 — cinco veces.\n\nPíntala de `"gold"` y disfruta de las vistas.',
          hints: [
            'forward(160) y luego right(144) dentro del bucle.',
            '144° es el ángulo exterior mágico de la estrella.'
          ]
        },
        w9l7: {
          title: 'Estudio de arte libre',
          task: 'El estudio de la cima es TUYO. Crea lo que quieras — al menos 8 movimientos de dibujo.\n\nIdeas: hexágonos (`range(6)` + `right(60)`), puntos arcoíris, un paseo aleatorio con `randint`, tu inicial...\n\nSin reglas. Solo arte. 🎨',
          starter: 'from turtle import *\n\nspeed(0)\n# ¡tu obra maestra aquí!\n\n',
          hints: [
            'Cada forward / circle / dot / goto cuenta como movimiento — necesitas 8 o más.',
            '¡Prueba círculos de distintos colores con saltos goto entre ellos!'
          ]
        },

        /* ---------------- World 10: The Great Bug ---------------- */
        w10l1: {
          title: 'Combate final: arregla el caos',
          task: 'El Gran Bicho corrompió este programa. Arregla los tres errores para que imprima:\n\n**Total: 80**\n**Average: 20.0**\n\n- BUG 1: al bucle le falta algo...\n- BUG 2: `total` empieza mal y nunca acumula\n- BUG 3: nada — el promedio está bien. ¿O no? ¡Ejecuta y verás!',
          starter: '# ¡El Gran Bicho desordenó este programa!\nscores = [10, 25, 15, 30]\ntotal = 1\nfor s in scores\n    total = s\nprint("Total:", total)\nprint("Average:", total / 4)\n',
          hints: [
            'Error 1: "for s in scores" necesita dos puntos y una línea indentada debajo.',
            'Error 2: empieza total en 0 y SUMA cada puntuación: total += s. (80 / 4 → 20.0 — ¡la / de Python siempre da float!)'
          ]
        },
        w10l2: {
          title: 'Acertijo del jefe: el acumulador',
          question: '¿Qué imprime el hechizo del Gran Bicho?',
          options: ['12', '246', '6', '2 4 6'],
          explain: 'El acumulador empieza en 0 y va sumando: 0+2=2, 2+4=6, 6+6=12. ¡Los bucles acumuladores están por todas partes en los programas reales!'
        },
        w10l3: {
          title: 'Coronación: tarjetas de héroe',
          task: 'Prueba final — forja la máquina de Tarjetas de Héroe.\n\nDefine `hero_card(name, level=1)` que DEVUELVA una f-string:\n\n`*** {NAME} — Level {level} ***` (nombre en MAYÚSCULAS)\n\nLuego imprime `hero_card("pip", 3)` y `hero_card("ada")`.\n\nEsperado:\n\n**\\*\\*\\* PIP — Level 3 \\*\\*\\***\n**\\*\\*\\* ADA — Level 1 \\*\\*\\***',
          starter: 'def hero_card(name, level=1):\n    # construye la cadena de la tarjeta y devuélvela\n    \n\nprint(hero_card("pip", 3))\nprint(hero_card("ada"))\n',
          hints: [
            'return f"*** {name.upper()} — Level {level} ***"',
            'hero_card("ada") usa el nivel por defecto 1.'
          ]
        }
      },

      ranks: [
        'Novato del Byte',
        'Cadete del Código',
        'Cazador de Bucles',
        'Artesano de Código',
        'Susurrador de Datos',
        'Caballero Lógico',
        'Sabio de Python',
        'Maestro Serpiente'
      ],

      achievements: {
        first_run: { name: '¡Hola, mundo!', desc: 'Ejecuta tu primer programa' },
        first_level: { name: 'Primeros pasos', desc: 'Completa tu primer nivel' },
        combo5: { name: 'En racha', desc: '5 ejecuciones correctas seguidas' },
        combo10: { name: 'Imparable', desc: '10 ejecuciones correctas seguidas' },
        no_hint5: { name: 'Cerebro puro', desc: 'Termina 5 niveles sin pistas' },
        perfect_world: { name: 'Victoria impecable', desc: '3 estrellas en cada nivel de un mundo' },
        world_done: { name: 'Explorador de mundos', desc: 'Completa todos los niveles de un mundo' },
        turtle_artist: { name: 'Tortuga Da Vinci', desc: 'Completa todo el Pico de la Tortuga' },
        quiz_ace: { name: 'Mente rápida', desc: 'Acierta 5 quizzes al primer intento' },
        night_owl: { name: 'Ave nocturna', desc: 'Programa entre medianoche y las 5 AM' },
        sandbox5: { name: 'Científico loco', desc: 'Ejecuta 5 programas en el Laboratorio' },
        xp500: { name: 'Estrella naciente', desc: 'Alcanza 500 XP' },
        xp1000: { name: 'Máquina de XP', desc: 'Alcanza 1000 XP' },
        bugslayer: { name: 'Cazabichos', desc: 'Derrota al Gran Bicho — termina la aventura' },
        daily: { name: 'Devoto diario', desc: 'Completa un Desafío del Día' }
      },

      daily: [
        { q: '¿Cuál imprime el número 5?', options: ['print("5")', 'print(5)', 'print 5', 'echo(5)'], explain: 'print(5) muestra el número 5. print("5") también muestra 5 — pero es texto; ambos se ven igual en pantalla, ¡aunque print(5) es la forma numérica!' },
        { q: '¿Qué devuelve len("snake")?', options: ['4', '5', '6', 'Da error'], explain: 's-n-a-k-e — 5 caracteres, así que len("snake") es 5.' },
        { q: '¿Qué muestra print(3 * "ha")?', options: ['hahaha', 'ha ha ha', '3ha', 'Da error'], explain: '3 * "ha" repite la cadena tres veces: "hahaha".' },
        { q: '¿Cuál es un nombre de variable correcto?', options: ['2cool', 'my-score', 'my_score', 'my score'], explain: 'Los nombres pueden usar letras, dígitos y _ — pero no pueden EMPEZAR con un dígito ni contener guiones o espacios.' },
        { q: '¿Qué muestra print(10 % 3)?', options: ['3', '3.33', '1', '0'], explain: '% es el resto: 10 = 3*3 + 1, así que el resto es 1.' },
        { q: '¿Cuál es el resultado de True + True en Python?', options: ['TrueTrue', '2', '1', 'Da error'], explain: 'Los booleanos SON números disfrazados: True es 1, así que True + True = 2. ¡Truco de fiesta!' },
        { q: '¿Qué bucle imprime exactamente 4 veces?', options: ['for i in range(4):', 'for i in range(1, 4):', 'for i in range(0, 3):', 'for i in range(5):'], explain: 'range(4) da 0,1,2,3 — ¡cuatro valores! range(1,4) solo da 1,2,3.' },
        { q: '¿Qué da "abcdef"[1:3]?', options: ['"abc"', '"bc"', '"bcd"', '"ab"'], explain: 'La rebanada [1:3] empieza en el índice 1 y se detiene ANTES del índice 3: las letras b y c → "bc".' },
        { q: '¿Qué método de lista añade un elemento al final?', options: ['.add()', '.push()', '.append()', '.insert_end()'], explain: 'Las listas de Python usan .append(). (push es de JavaScript y otros lenguajes, ¡no de Python!)' },
        { q: '¿Qué devuelve una función sin línea return?', options: ['0', 'None', '""', 'Da error'], explain: 'Las funciones sin return devuelven None — el valor "nada" de Python.' }
      ],

      tips: [
        'Usa 4 espacios para indentar el código dentro de bloques if/for/def. ¡Python es estricto con esto!',
        'print(type(x)) revela qué es x en realidad — una gran herramienta de detective.',
        'Las f-strings son la forma moderna de construir texto: f"Score: {score}"',
        'range(5) empieza en 0 y se detiene ANTES de 5. El final siempre se excluye.',
        'print(x) muestra un valor; return lo devuelve a quien llamó. ¡Son trabajos distintos!',
        'Las listas empiezan a contar en 0. lst[1] es el SEGUNDO elemento.',
        '.get() en los diccionarios es la forma a prueba de fallos de leer claves que faltan.',
        '¿Atascado? Lee el mensaje de error de abajo arriba — la última línea nombra el problema.',
        'Puedes experimentar libremente en el Laboratorio — ¡nada se rompe ahí!',
        'Pasos pequeños, ejecuta a menudo. Prueba después de cada una o dos líneas.'
      ],

      sandboxExamples: [
        '🌱 Primeros pasos',
        '🐢 Arte con tortuga',
        '🎲 Simulador de dados',
        '🔤 Estadísticas de palabras',
        '💰 Crecimiento del ahorro'
      ]
    }
  };
});
