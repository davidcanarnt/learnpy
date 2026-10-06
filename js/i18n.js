/* ============================================================================
   LearnPy — i18n.js
   Multilingual support (English / Español).

   - UI strings live here (UI.en / UI.es)
   - Curriculum prose lives in i18n-levels.js and is merged by bundle()
   - Language is auto-detected (navigator.language) and persisted in localStorage
   - applyStatic() translates DOM nodes marked with data-i18n / data-i18n-html /
     data-i18n-title attributes

   Loads in the browser (window.LearnPyI18N) AND in Node (module.exports).
   ========================================================================== */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(typeof require === 'function' ? require('./i18n-levels.js') : null);
  } else {
    root.LearnPyI18N = factory(root.LearnPyI18NLevels);
  }
})(typeof self !== 'undefined' ? self : this, function (LEVELS_I18N) {
  'use strict';

  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const UI = {
    /* ============================== ENGLISH ============================== */
    en: {
      /* -- static HTML -- */
      'app.title': 'LearnPy 🐍 — Learn Python by Playing',
      'title.bubble.default': 'Sssso… you want to learn <b>Python</b>? I\'m <b>Pip</b> — your guide. 65 levels, 10 worlds, one Great Bug. Ready?',
      'title.tagline': 'Learn <b>real Python</b> by playing — 10 worlds, 65 levels,<br>XP, streaks and a final boss. 🐍',
      'title.start': '▶\u00A0 Start Adventure',
      'title.continue': '⏩\u00A0 Continue',
      'title.sandbox': '🧪\u00A0 Sandbox',
      'title.settings': 'Settings',
      'map.hearts': 'Hearts: lost on failed runs, regained on wins',
      'map.settings': 'Settings',
      'map.daily.title': 'Challenge of the Day <span style="color:var(--gold)">+30 XP</span>',
      'map.daily.play': 'Play',
      'map.daily.done': 'Done ✓',
      'level.back': '← Map',
      'level.bubble': 'Read the mission, then write your code!',
      'level.expected': '🎯 Expected output',
      'level.hintTitle': '💡 Hint',
      'level.hintBtn': '💡 Hint',
      'level.anotherHint': '💡 Another hint',
      'level.resetCode': '🔄 Reset code',
      'level.editorKeys': '<span class="kbd">Tab</span> indent · <span class="kbd">Ctrl</span>+<span class="kbd">Enter</span> run',
      'arrange.title': '🧩 Tap the pieces in the right order',
      'arrange.startOver': '↩ Start over',
      'arrange.undo': '⌫ Undo last',
      'fill.title': '✏️ Fill in the blanks',
      'run.label': '▶ Run',
      'console.title': '📟 Console',
      'console.idle': 'Run your program to see its output here.',
      'sandbox.back': '← Title',
      'sandbox.bar': '🧪 Sandbox — no rules, no grades, pure experiments',
      'sandbox.whatTitle': '🧪 What is the Sandbox?',
      'sandbox.whatBody': 'A free playground: any Python you like, with <b>turtle graphics</b> included.<br><br>Try the examples in the dropdown, or write your own masterpiece.<br><br><code>input()</code> pops up a real prompt box.',
      'sandbox.cheatTitle': '✨ Cheat sheet',
      'sandbox.runLabel': '▶ Run',
      'sandbox.showTurtle': '🐢 Show turtle',
      'sandbox.hideTurtle': '🐢 Hide turtle',
      'sandbox.consoleIdle': 'Run a program to see its output here.',
      'success.title': 'Level complete!',
      'success.complete': 'ADVENTURE COMPLETE! 🏆',
      'success.replay': '↻ Replay',
      'success.next': 'Next level →',
      'success.backToMap': 'Back to map 🗺️',
      'settings.title': '⚙️ Settings',
      'settings.sound': 'Sound effects',
      'settings.soundSub': 'chimes, fanfares & bleeps',
      'settings.anim': 'Turtle animation',
      'settings.animSub': 'watch the turtle draw step by step',
      'settings.reset': 'Reset progress',
      'settings.resetSub': 'wipe XP, stars and achievements',
      'settings.resetBtn': 'Reset',
      'settings.language': 'Language',
      'settings.languageSub': 'choose your language',
      'settings.about': 'LearnPy v1.0 · a self-contained Python adventure.<br>Progress is saved in your browser.',
      'settings.close': 'Close',
      'daily.title': '🎯 Challenge of the Day',
      'daily.close': 'Close',
      'common.on': 'On',
      'common.off': 'Off',
      'common.ok': 'OK',
      'turtle.skip': '⏩ Skip drawing',

      /* -- dynamic -- */
      'toast.achievement': 'Achievement: {name}',
      'hearts.out.title': '💔 Out of hearts!',
      'hearts.out.body': 'Every failed run costs a heart — but hearts come back when you finish levels.<br><br>Meanwhile, here\'s a tip from Pip to keep your streak alive:',
      'hearts.out.btn': '💪 Got it — one mercy heart',
      'xp.max': 'MAX',
      'xp.toNext': '{n} XP → {rank}',
      'combo.streak': '🔥 {n} streak',
      'title.stats.levels': '{done}/{total} levels',
      'title.stats.stars': '{n} stars',
      'title.bubble.new': 'Sssso… you want to learn <b>Python</b>? I\'m <b>Pip</b> — your guide. {levels} levels, 10 worlds, one Great Bug. Ready?',
      'title.bubble.allDone': 'You did it! <b>Serpent Master</b>! 🎉 Come play in the Sandbox any time.',
      'title.bubble.welcomeBack': 'Welcome back! <b>{n}</b> levels to go. I smell a streak coming on… 🔥',
      'map.worldDone': '{done}/{total} done',
      'console.success': '✓ success',
      'console.error': '✗ error',
      'bubble.mission1': 'Read the mission closely — the expected output is your target! 🎯',
      'bubble.mission2': 'Small steps: write one or two lines, then run. Run early, run often!',
      'bubble.mission3': 'Psst — the expected output box shows exactly what to produce.',
      'bubble.mission4': 'Stuck? The hint button is not a defeat, it\'s a shortcut to wisdom. 💡',
      'bubble.quiz': 'No coding needed here — pick the answer and read the explanation! 🤔',
      'bubble.arrange': 'Tap the pieces in order. Indentation matters — the lines remember their spaces!',
      'bubble.fill': 'Tap a blank, then tap the chip that fits. Then press Run!',
      'quiz.why': '💡 Why: ',
      'quiz.wrongBubble': 'Not quite! Read the options again — you\'ve got this. 💪',
      'quiz.wrongConsole': 'Not the right answer — try again!',
      'arrange.empty': 'Tap pieces below to build the program…',
      'input.noMore': '(no more input provided)',
      'level.attempt': 'attempt {n}',
      'run.noOutput': '(no output — did you print anything?)',
      'fail.turtle': 'The turtle needs to follow the mission more closely — check the task again!',
      'fail.mismatchLead': 'Your program ran, but the output doesn\'t match yet.\n',
      'fail.expected': '🎯 Expected',
      'fail.got': '🖥 You got',
      'fail.nothing': '(nothing)',
      'fail.mismatchBubble': 'So close! Compare your output with the expected one — the difference is hiding in plain sight. 🔍',
      'fail.generic': 'Not quite there yet.',
      'fail.genericBubble': 'Not quite — check the mission card on the left!',
      'fail.bubble.NameError': 'Python met a name it doesn\'t know. Spelling trap, or used before created?',
      'fail.bubble.SyntaxError': 'Python can\'t even read that line — hunt for missing colons, commas or quotes!',
      'fail.bubble.IndentationError': 'The spacing police! Indent lines inside if/for/def with 4 spaces.',
      'fail.bubble.TypeError': 'Type clash! Maybe you\'re adding text to a number — f-strings fix that.',
      'fail.bubble.ZeroDivisionError': 'Dividing by zero breaks the universe (and Python).',
      'fail.bubble.KeyError': 'That key isn\'t in the dictionary — .get() is the safe way.',
      'fail.bubble.IndexError': 'That position doesn\'t exist. Indexes start at 0!',
      'fail.bubble.ValueError': 'The value doesn\'t fit — int() needs digits, for example.',
      'fail.bubble.TimeLimit': 'Infinite loop alert! Make sure your while condition can become False.',
      'fail.bubble.RecursionError': 'A function that never stops calling itself… give it a base case!',
      'fail.bubble.OutputLimit': 'That\'s a LOT of printing. Check your loop conditions!',
      'fail.bubble.other': 'Hmm, Python didn\'t like that. Read the error — it usually points right at the problem.',
      'friendly.NameError': 'Did you spell the name correctly? Create variables before using them.',
      'friendly.SyntaxError': 'Check for a missing colon (:), comma, quote or bracket on/above that line.',
      'friendly.IndentationError': 'Indent lines inside blocks with exactly 4 spaces.',
      'friendly.TypeError': 'You may be mixing types — convert with str() / int(), or use an f-string.',
      'friendly.ZeroDivisionError': 'Division by zero! Guard it with an if.',
      'friendly.KeyError': 'Use .get(key, default) to read a key that might be missing.',
      'friendly.IndexError': 'That index is out of range — lists have len(list) items, starting at 0.',
      'friendly.ValueError': 'The value can\'t be converted — int("12") works, int("hi") doesn\'t.',
      'friendly.TimeLimit': 'Infinite loop! Make sure the while condition eventually becomes False.',
      'friendly.RecursionError': 'Your function calls itself forever — add a stopping condition.',
      'friendly.ImportError': 'Only random, math and turtle are available here.',
      'friendly.EOFError': 'input() ran out of provided answers.',
      'friendly.AttributeError': 'That method name doesn\'t exist for this type — check spelling.',
      'friendly.OutputLimit': 'Your program printed too much — check your loops.',
      'friendly.fallback': 'Check your code and try again!',
      'win.bubble1': 'Ssspectacular! 🎉',
      'win.bubble2': 'You\'re getting scary good at this! 🐍',
      'win.bubble3': 'That\'s the way — clean and correct!',
      'win.bubble4': 'Brilliant! The Great Bug fears you now.',
      'world.complete': 'World complete!',
      'world.complete.desc': '{name} — every level cleared!',
      'xp.base': '{n} base',
      'xp.starBonus': '+{n} stars',
      'xp.comboBonus': '+{n} 🔥 streak',
      'success.sub': '“{title}” — {stars}',
      'success.certificate': v => {
        const pad = (s, n) => String(s).slice(0, n).padEnd(n);
        const mid = s => {
          const p = Math.max(0, 43 - s.length), l = Math.floor(p / 2);
          return '║' + ' '.repeat(l) + s + ' '.repeat(p - l) + '║';
        };
        const row = (label, val) => '║   ' + pad(label, 21) + ' ' + pad(val, 18) + '║';
        return [
          '╔═══════════════════════════════════════════╗',
          mid('🐍  LEARNPY CERTIFICATE  🐍'),
          mid(''),
          mid('"' + v.world + '"'),
          mid(''),
          row('Levels cleared .......', v.levels + ' / ' + v.total),
          row('Final rank ...........', v.rank),
          row('Total XP .............', String(v.xp)),
          row('Best streak ..........', String(v.streak)),
          row('Achievements .........', v.ach + ' / ' + v.achTotal),
          mid(''),
          mid('The Great Bug has been DEFEATED.'),
          mid('You write real Python now. Go build!'),
          '╚═══════════════════════════════════════════╝'
        ].join('\n');
      },
      'sandbox.noOutput': '(program finished — no output)',
      'sandbox.inputPrompt': 'input()',
      'reset.title': 'Reset everything?',
      'reset.body': 'This wipes all XP, stars and achievements. There is no undo.',
      'reset.cancel': 'Cancel',
      'reset.confirm': '🗑️ Yes, reset'
    },

    /* ============================== ESPAÑOL ============================== */
    es: {
      /* -- static HTML -- */
      'app.title': 'LearnPy 🐍 — Aprende Python jugando',
      'title.bubble.default': 'Ssssí… ¿quieres aprender <b>Python</b>? Soy <b>Pip</b>, tu guía. 65 niveles, 10 mundos, un Gran Bicho. ¿Listo?',
      'title.tagline': 'Aprende <b>Python de verdad</b> jugando — 10 mundos, 65 niveles,<br>XP, rachas y un jefe final. 🐍',
      'title.start': '▶\u00A0 Comenzar aventura',
      'title.continue': '⏩\u00A0 Continuar',
      'title.sandbox': '🧪\u00A0 Laboratorio',
      'title.settings': 'Ajustes',
      'map.hearts': 'Corazones: se pierden al fallar y se recuperan al ganar',
      'map.settings': 'Ajustes',
      'map.daily.title': 'Desafío del día <span style="color:var(--gold)">+30 XP</span>',
      'map.daily.play': 'Jugar',
      'map.daily.done': 'Hecho ✓',
      'level.back': '← Mapa',
      'level.bubble': '¡Lee la misión y luego escribe tu código!',
      'level.expected': '🎯 Salida esperada',
      'level.hintTitle': '💡 Pista',
      'level.hintBtn': '💡 Pista',
      'level.anotherHint': '💡 Otra pista',
      'level.resetCode': '🔄 Reiniciar código',
      'level.editorKeys': '<span class="kbd">Tab</span> sangría · <span class="kbd">Ctrl</span>+<span class="kbd">Enter</span> ejecutar',
      'arrange.title': '🧩 Toca las piezas en el orden correcto',
      'arrange.startOver': '↩ Empezar de nuevo',
      'arrange.undo': '⌫ Deshacer último',
      'fill.title': '✏️ Completa los huecos',
      'run.label': '▶ Ejecutar',
      'console.title': '📟 Consola',
      'console.idle': 'Ejecuta tu programa para ver la salida aquí.',
      'sandbox.back': '← Título',
      'sandbox.bar': '🧪 Laboratorio — sin reglas, sin notas, puros experimentos',
      'sandbox.whatTitle': '🧪 ¿Qué es el Laboratorio?',
      'sandbox.whatBody': 'Un patio de juegos libre: el Python que quieras, con <b>gráficos de tortuga</b> incluidos.<br><br>Prueba los ejemplos del menú desplegable o escribe tu propia obra maestra.<br><br><code>input()</code> muestra un cuadro de diálogo real.',
      'sandbox.cheatTitle': '✨ Chuleta',
      'sandbox.runLabel': '▶ Ejecutar',
      'sandbox.showTurtle': '🐢 Mostrar tortuga',
      'sandbox.hideTurtle': '🐢 Ocultar tortuga',
      'sandbox.consoleIdle': 'Ejecuta un programa para ver su salida aquí.',
      'success.title': '¡Nivel completado!',
      'success.complete': '¡AVENTURA COMPLETADA! 🏆',
      'success.replay': '↻ Repetir',
      'success.next': 'Siguiente nivel →',
      'success.backToMap': 'Volver al mapa 🗺️',
      'settings.title': '⚙️ Ajustes',
      'settings.sound': 'Efectos de sonido',
      'settings.soundSub': 'campanillas, fanfarrias y pitidos',
      'settings.anim': 'Animación de la tortuga',
      'settings.animSub': 'mira a la tortuga dibujar paso a paso',
      'settings.reset': 'Borrar progreso',
      'settings.resetSub': 'elimina XP, estrellas y logros',
      'settings.resetBtn': 'Borrar',
      'settings.language': 'Idioma',
      'settings.languageSub': 'elige tu idioma',
      'settings.about': 'LearnPy v1.0 · una aventura de Python autónoma.<br>El progreso se guarda en tu navegador.',
      'settings.close': 'Cerrar',
      'daily.title': '🎯 Desafío del día',
      'daily.close': 'Cerrar',
      'common.on': 'Sí',
      'common.off': 'No',
      'common.ok': 'OK',
      'turtle.skip': '⏩ Saltar dibujo',

      /* -- dynamic -- */
      'toast.achievement': 'Logro: {name}',
      'hearts.out.title': '💔 ¡Sin corazones!',
      'hearts.out.body': 'Cada intento fallido cuesta un corazón — pero los corazones vuelven al completar niveles.<br><br>Mientras tanto, aquí tienes un consejo de Pip para mantener viva tu racha:',
      'hearts.out.btn': '💪 Entendido — un corazón de gracia',
      'xp.max': 'MÁX',
      'xp.toNext': '{n} XP → {rank}',
      'combo.streak': '🔥 racha de {n}',
      'title.stats.levels': '{done}/{total} niveles',
      'title.stats.stars': '{n} estrellas',
      'title.bubble.new': 'Ssssí… ¿quieres aprender <b>Python</b>? Soy <b>Pip</b>, tu guía. {levels} niveles, 10 mundos, un Gran Bicho. ¿Listo?',
      'title.bubble.allDone': '¡Lo lograste! ¡<b>Maestro Serpiente</b>! 🎉 Pásate por el Laboratorio cuando quieras.',
      'title.bubble.welcomeBack': '¡Bienvenido de nuevo! Te quedan <b>{n}</b> niveles. Huelo una racha en camino… 🔥',
      'map.worldDone': '{done}/{total} hechos',
      'console.success': '✓ éxito',
      'console.error': '✗ error',
      'bubble.mission1': '¡Lee bien la misión: la salida esperada es tu objetivo! 🎯',
      'bubble.mission2': 'Paso a paso: escribe una o dos líneas y ejecuta. ¡Ejecuta pronto y a menudo!',
      'bubble.mission3': 'Psst — la caja de salida esperada muestra exactamente qué producir.',
      'bubble.mission4': '¿Atascado? El botón de pista no es rendirse, es un atajo a la sabiduría. 💡',
      'bubble.quiz': '¡Aquí no hace falta programar: elige la respuesta y lee la explicación! 🤔',
      'bubble.arrange': 'Toca las piezas en orden. La sangría importa: ¡las líneas recuerdan sus espacios!',
      'bubble.fill': 'Toca un hueco y luego la ficha que encaje. ¡Después pulsa Ejecutar!',
      'quiz.why': '💡 Por qué: ',
      'quiz.wrongBubble': '¡Casi! Lee otra vez las opciones — tú puedes. 💪',
      'quiz.wrongConsole': 'Esa no es la respuesta correcta — ¡inténtalo de nuevo!',
      'arrange.empty': 'Toca las piezas de abajo para construir el programa…',
      'input.noMore': '(no queda más entrada)',
      'level.attempt': 'intento {n}',
      'run.noOutput': '(sin salida — ¿imprimiste algo?)',
      'fail.turtle': 'La tortuga debe seguir la misión más de cerca — ¡vuelve a leer la tarea!',
      'fail.mismatchLead': 'Tu programa se ejecutó, pero la salida aún no coincide.\n',
      'fail.expected': '🎯 Esperado',
      'fail.got': '🖥 Obtuviste',
      'fail.nothing': '(nada)',
      'fail.mismatchBubble': '¡Tan cerca! Compara tu salida con la esperada — la diferencia se esconde a plena vista. 🔍',
      'fail.generic': 'Aún no está del todo.',
      'fail.genericBubble': 'Casi — ¡repasa la tarjeta de misión de la izquierda!',
      'fail.bubble.NameError': 'Python se encontró con un nombre que no conoce. ¿Falta de ortografía o usado antes de crearlo?',
      'fail.bubble.SyntaxError': 'Python no puede ni leer esa línea — ¡busca dos puntos, comas o comillas que falten!',
      'fail.bubble.IndentationError': '¡La policía del espaciado! Indenta las líneas dentro de if/for/def con 4 espacios.',
      'fail.bubble.TypeError': '¡Choque de tipos! Quizá estás sumando texto con un número — las f-strings lo arreglan.',
      'fail.bubble.ZeroDivisionError': 'Dividir entre cero rompe el universo (y Python).',
      'fail.bubble.KeyError': 'Esa clave no está en el diccionario — .get() es la forma segura.',
      'fail.bubble.IndexError': 'Esa posición no existe. ¡Los índices empiezan en 0!',
      'fail.bubble.ValueError': 'El valor no encaja — int() necesita dígitos, por ejemplo.',
      'fail.bubble.TimeLimit': '¡Alerta de bucle infinito! Asegúrate de que tu condición del while pueda volverse False.',
      'fail.bubble.RecursionError': 'Una función que nunca deja de llamarse… ¡ponle un caso base!',
      'fail.bubble.OutputLimit': 'Eso es MUCHÍSIMO imprimir. ¡Revisa las condiciones de tus bucles!',
      'fail.bubble.other': 'Mmm, a Python no le gustó eso. Lee el error — suele señalar justo el problema.',
      'friendly.NameError': '¿Escribiste bien el nombre? Crea las variables antes de usarlas.',
      'friendly.SyntaxError': 'Revisa si falta un dos puntos (:), una coma, comillas o un paréntesis en esa línea o la de arriba.',
      'friendly.IndentationError': 'Indenta las líneas dentro de los bloques con exactamente 4 espacios.',
      'friendly.TypeError': 'Puede que estés mezclando tipos — convierte con str() / int(), o usa una f-string.',
      'friendly.ZeroDivisionError': '¡División entre cero! Protégela con un if.',
      'friendly.KeyError': 'Usa .get(clave, valor_por_defecto) para leer una clave que podría faltar.',
      'friendly.IndexError': 'Ese índice está fuera de rango — las listas tienen len(lista) elementos, empezando en 0.',
      'friendly.ValueError': 'El valor no se puede convertir — int("12") funciona, int("hola") no.',
      'friendly.TimeLimit': '¡Bucle infinito! Asegúrate de que la condición del while acabe siendo False.',
      'friendly.RecursionError': 'Tu función se llama a sí misma para siempre — añade una condición de parada.',
      'friendly.ImportError': 'Aquí solo están disponibles random, math y turtle.',
      'friendly.EOFError': 'input() se quedó sin respuestas disponibles.',
      'friendly.AttributeError': 'Ese nombre de método no existe para este tipo — revisa la ortografía.',
      'friendly.OutputLimit': 'Tu programa imprimió demasiado — revisa tus bucles.',
      'friendly.fallback': '¡Revisa tu código e inténtalo de nuevo!',
      'win.bubble1': '¡Es-ss-spectacular! 🎉',
      'win.bubble2': '¡Estás que asustas de lo bueno que eres! 🐍',
      'win.bubble3': '¡Así se hace: limpio y correcto!',
      'win.bubble4': '¡Brillante! El Gran Bicho ya te teme.',
      'world.complete': '¡Mundo completado!',
      'world.complete.desc': '{name} — ¡todos los niveles superados!',
      'xp.base': '{n} base',
      'xp.starBonus': '+{n} estrellas',
      'xp.comboBonus': '+{n} 🔥 racha',
      'success.sub': '“{title}” — {stars}',
      'success.certificate': v => {
        const pad = (s, n) => String(s).slice(0, n).padEnd(n);
        const mid = s => {
          const p = Math.max(0, 43 - s.length), l = Math.floor(p / 2);
          return '║' + ' '.repeat(l) + s + ' '.repeat(p - l) + '║';
        };
        const row = (label, val) => '║   ' + pad(label, 21) + ' ' + pad(val, 18) + '║';
        return [
          '╔═══════════════════════════════════════════╗',
          mid('🐍  CERTIFICADO LEARNPY  🐍'),
          mid(''),
          mid('"' + v.world + '"'),
          mid(''),
          row('Niveles superados ....', v.levels + ' / ' + v.total),
          row('Rango final ..........', v.rank),
          row('XP total .............', String(v.xp)),
          row('Mejor racha ..........', String(v.streak)),
          row('Logros ...............', v.ach + ' / ' + v.achTotal),
          mid(''),
          mid('El Gran Bicho ha sido DERROTADO.'),
          mid('Ya escribes Python de verdad. ¡A crear!'),
          '╚═══════════════════════════════════════════╝'
        ].join('\n');
      },
      'sandbox.noOutput': '(el programa terminó — sin salida)',
      'sandbox.inputPrompt': 'input()',
      'reset.title': '¿Reiniciar todo?',
      'reset.body': 'Esto borra todo el XP, las estrellas y los logros. No hay vuelta atrás.',
      'reset.cancel': 'Cancelar',
      'reset.confirm': '🗑️ Sí, reiniciar'
    }
  };

  const STORAGE_KEY = 'learnpy_lang';
  let lang = 'en';
  let detected = false;

  function hasStorage() {
    try { return typeof localStorage !== 'undefined' && !!localStorage; } catch (e) { return false; }
  }

  function detect() {
    if (detected) return lang;
    detected = true;
    if (hasStorage()) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && UI[saved]) { lang = saved; return lang; }
      } catch (e) { /* private mode */ }
    }
    const nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en';
    lang = /^es\b/i.test(nav) ? 'es' : 'en';
    return lang;
  }

  function getLang() { return detect(); }

  function setLang(code) {
    lang = UI[code] ? code : 'en';
    detected = true;
    if (hasStorage()) { try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {} }
    if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = lang;
    return lang;
  }

  /* t('key') or t('key', {name: 'Pip'}) — falls back to English, then the key */
  function t(key, vars) {
    const dict = UI[getLang()] || UI.en;
    let s = dict[key];
    if (s === undefined) s = UI.en[key];
    if (s === undefined) return key;
    if (typeof s === 'function') s = s(vars || {});
    if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return s;
  }

  function pack() {
    const code = getLang();
    if (code === 'en' || !LEVELS_I18N || !LEVELS_I18N[code]) return null;
    return LEVELS_I18N[code];
  }

  /* Returns a translated copy of the data object from levels.js for the
     current language. The original object is never mutated (save state and
     level ids stay identical across languages). */
  function bundle(D) {
    const p = pack();
    if (!p) return D;
    const worlds = D.WORLDS.map(w => {
      const wt = (p.worlds && p.worlds[w.id]) || {};
      return Object.assign({}, w, wt, {
        levels: w.levels.map(l => Object.assign({}, l, (p.levels && p.levels[l.id]) || {}))
      });
    });
    return {
      WORLDS: worlds,
      RANKS: D.RANKS.map((r, i) => Object.assign({}, r, { name: (p.ranks && p.ranks[i]) || r.name })),
      ACHIEVEMENTS: D.ACHIEVEMENTS.map(a => Object.assign({}, a, (p.achievements && p.achievements[a.id]) || {})),
      DAILY: D.DAILY.map((d, i) => Object.assign({}, d, (p.daily && p.daily[i]) || {})),
      TIPS: D.TIPS.map((tip, i) => (p.tips && p.tips[i]) || tip),
      SANDBOX_EXAMPLES: D.SANDBOX_EXAMPLES.map((ex, i) => Object.assign({}, ex, {
        name: (p.sandboxExamples && p.sandboxExamples[i]) || ex.name
      })),
      allLevels() {
        const out = [];
        for (const w of this.WORLDS) for (const l of w.levels) out.push({ world: w, level: l });
        return out;
      }
    };
  }

  /* Translate all DOM nodes with data-i18n / data-i18n-html / data-i18n-title */
  function applyStatic(rootEl) {
    if (typeof document === 'undefined') return;
    const root = rootEl || document;
    if (root === document && document.documentElement) document.documentElement.lang = getLang();
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.getAttribute('data-i18n-title')); });
  }

  /* Fill a <select> with the available languages */
  function fillLangSelect(sel) {
    if (!sel || typeof document === 'undefined') return;
    sel.innerHTML = '';
    for (const l of LANGS) {
      const o = document.createElement('option');
      o.value = l.code;
      o.textContent = l.label;
      if (l.code === getLang()) o.selected = true;
      sel.appendChild(o);
    }
  }

  return {
    LANGS, UI, t, getLang, setLang, bundle, applyStatic, fillLangSelect,
    hasPack: () => !!pack()
  };
});
