/* ============================================================================
   LearnPy — turtle.js
   An animated Python-turtle-like canvas. Records every API call as an op so
   levels can verify drawings (same op format as the Node test fake).
   ========================================================================== */
(function (root) {
  'use strict';

  const API_NAMES = ['forward', 'fd', 'backward', 'back', 'bk', 'right', 'rt', 'left', 'lt',
    'goto', 'setpos', 'setx', 'sety', 'setheading', 'seth', 'home', 'circle', 'dot',
    'penup', 'pu', 'up', 'pendown', 'pd', 'down', 'pensize', 'width', 'speed', 'color',
    'pencolor', 'fillcolor', 'begin_fill', 'end_fill', 'bgcolor', 'write', 'clear',
    'reset', 'hideturtle', 'ht', 'showturtle', 'st'];

  function TurtleCanvas(container, opts) {
    opts = opts || {};
    this.width = opts.width || 520;
    this.height = opts.height || 400;
    this.container = container;
    this.ops = [];                    // [{name, args}] for level checks
    this.onIdle = null;               // called when animation queue empties
    this.idleTimer = null;

    container.innerHTML = '';
    container.classList.add('turtle-stage');

    this.bgDiv = document.createElement('div');
    this.bgDiv.className = 'turtle-bg';
    container.appendChild(this.bgDiv);

    this.drawCanvas = document.createElement('canvas');
    this.drawCanvas.width = this.width;
    this.drawCanvas.height = this.height;
    this.drawCanvas.className = 'turtle-canvas';
    container.appendChild(this.drawCanvas);

    this.overlay = document.createElement('canvas');
    this.overlay.width = this.width;
    this.overlay.height = this.height;
    this.overlay.className = 'turtle-canvas turtle-overlay';
    container.appendChild(this.overlay);

    this.ctx = this.drawCanvas.getContext('2d');
    this.octx = this.overlay.getContext('2d');

    this.skipBtn = document.createElement('button');
    this.skipBtn.className = 'turtle-skip';
    this.skipBtn.textContent = (root.LearnPyI18N && root.LearnPyI18N.t('turtle.skip')) || '⏩ Skip drawing';
    this.skipBtn.addEventListener('click', () => this.finishAll());
    container.appendChild(this.skipBtn);
    this.skipBtn.style.display = 'none';

    this.reset(true);
  }

  TurtleCanvas.prototype.reset = function (silent) {
    this.x = 0; this.y = 0;
    this.heading = 0;               // facing east, like python turtle
    this.penDown = true;
    this.penSize = 2;
    this.penColor = '#e2e8f0';
    this.fillColor = this.penColor;
    this.fillPoints = null;
    this.speed = 6;                 // 0 instant, 1 slow, 10 fast
    this.queue = [];
    this.busyStep = null;
    this.visible = true;
    if (!silent) this.ops = [];
    this.outLen = 0;
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.translate(this.width / 2, this.height / 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.bgDiv.style.background = '#0d1530';
    this.drawSprite();
    if (this.onIdle) { const cb = this.onIdle; this.onIdle = null; cb(); }
  };

  TurtleCanvas.prototype.toPx = function (x, y) { return { x: x, y: -y }; };

  TurtleCanvas.prototype.finishAll = function () {
    // instantly execute whatever remains in the queue
    const q = this.queue.splice(0);
    for (const item of q) this.execOp(item, true);
    this.queue.length = 0;
    this.busyStep = null;
    this.drawSprite();
    this.skipBtn.style.display = 'none';
    if (this.onIdle) { const cb = this.onIdle; this.onIdle = null; cb(); }
  };

  TurtleCanvas.prototype.enqueue = function (name, args) {
    this.ops.push({ name: name, args: args });
    this.queue.push({ name: name, args: args });
    this.skipBtn.style.display = '';
    if (!this.busyStep) this.nextOp();
    // idle watchdog: report idle even if queue starves
    if (this.idleTimer) clearTimeout(this.idleTimer);
  };

  TurtleCanvas.prototype.nextOp = function () {
    if (!this.queue.length) {
      this.busyStep = null;
      this.skipBtn.style.display = 'none';
      this.drawSprite();
      if (this.onIdle) { const cb = this.onIdle; this.onIdle = null; cb(); }
      return;
    }
    const item = this.queue.shift();
    this.busyStep = true;
    this.execOp(item, false);
  };

  TurtleCanvas.prototype.speedDelay = function () {
    if (this.speed <= 0) return 0;
    // speed 1 => slow (~24 px/s per step chunk), 10 => fast
    const f = 11 - this.speed;          // 10..1
    return 4 + f * f * 2.2;             // ms per small chunk
  };

  TurtleCanvas.prototype.execOp = function (item, instant) {
    const self = this;
    const [x, y] = [this.x, this.y];
    const done = () => setTimeout(() => self.nextOp(), 0);

    const moveBy = (dist, newHeading, cb) => {
      // animate in chunks
      if (instant || this.speed <= 0 || dist === 0) {
        this.applyMove(dist, newHeading);
        this.drawSprite();
        return cb();
      }
      const chunk = 6;
      let moved = 0;
      const step = () => {
        const remain = dist - moved;
        const d = Math.min(chunk, Math.abs(remain)) * Math.sign(remain);
        this.applyMove(d, newHeading);
        moved += d;
        this.drawSprite();
        if (Math.abs(dist - moved) > 0.01) setTimeout(step, this.speedDelay());
        else cb();
      };
      step();
    };

    switch (item.name) {
      case 'forward': case 'fd':
        moveBy(num(item.args[0]), this.heading, done); break;
      case 'backward': case 'back': case 'bk':
        moveBy(-num(item.args[0]), this.heading, done); break;
      case 'right': case 'rt':
        this.turnBy(-num(item.args[0]), instant, done); break;
      case 'left': case 'lt':
        this.turnBy(num(item.args[0]), instant, done); break;
      case 'goto': case 'setpos': {
        const tx = num(item.args[0]), ty = item.args.length > 1 ? num(item.args[1]) : this.y;
        this.goTo(tx, ty, instant, done); break;
      }
      case 'setx': this.goTo(num(item.args[0]), this.y, instant, done); break;
      case 'sety': this.goTo(this.x, num(item.args[0]), instant, done); break;
      case 'setheading': case 'seth':
        this.heading = num(item.args[0]);
        this.drawSprite(); done(); break;
      case 'home':
        this.goTo(0, 0, instant, () => { this.heading = 0; self.drawSprite(); done(); }); break;
      case 'circle': {
        const r = num(item.args[0]);
        const extent = item.args.length > 1 && item.args[1] !== null ? num(item.args[1]) : 360;
        this.circleBy(r, extent, instant, done); break;
      }
      case 'dot': {
        const size = item.args.length ? num(item.args[0]) : Math.max(this.penSize + 4, this.penSize * 2);
        const col = item.args.length > 1 && item.args[1] ? String(item.args[1]) : this.penColor;
        this.stampDot(size, col);
        done(); break;
      }
      case 'penup': case 'pu': case 'up': this.penDown = false; done(); break;
      case 'pendown': case 'pd': case 'down': this.penDown = true; done(); break;
      case 'pensize': case 'width': this.penSize = num(item.args[0]); done(); break;
      case 'speed': this.speed = num(item.args[0]); done(); break;
      case 'color': {
        if (item.args.length >= 2) { this.penColor = str(item.args[0]); this.fillColor = str(item.args[1]); }
        else if (item.args.length === 1) {
          if (Array.isArray(item.args[0])) { this.penColor = str(item.args[0][0]); this.fillColor = str(item.args[0][1]); }
          else { this.penColor = str(item.args[0]); this.fillColor = str(item.args[0]); }
        }
        done(); break;
      }
      case 'pencolor': if (item.args.length) this.penColor = str(item.args[0]); done(); break;
      case 'fillcolor': if (item.args.length) this.fillColor = str(item.args[0]); done(); break;
      case 'begin_fill': this.fillPoints = [[this.x, this.y]]; done(); break;
      case 'end_fill': this.endFill(); done(); break;
      case 'bgcolor': this.bgDiv.style.background = str(item.args[0]); done(); break;
      case 'write': this.stampText(item); done(); break;
      case 'clear': {
        this.ctx.save(); this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height); this.ctx.restore();
        this.fillPoints = null; done(); break;
      }
      case 'reset': this.reset(false); done(); break;
      case 'hideturtle': case 'ht': this.visible = false; this.octx.clearRect(0, 0, this.width, this.height); done(); break;
      case 'showturtle': case 'st': this.visible = true; this.drawSprite(); done(); break;
      default: done();
    }
  };

  TurtleCanvas.prototype.applyMove = function (dist, headingDeg) {
    const rad = headingDeg * Math.PI / 180;
    const nx = this.x + Math.cos(rad) * dist;
    const ny = this.y + Math.sin(rad) * dist;
    this.lineTo(nx, ny);
    this.x = nx; this.y = ny;
  };

  TurtleCanvas.prototype.lineTo = function (nx, ny) {
    if (this.penDown) {
      const ctx = this.ctx;
      const a = this.toPx(this.x, this.y), b = this.toPx(nx, ny);
      ctx.beginPath();
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.penSize;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    if (this.fillPoints) this.fillPoints.push([nx, ny]);
    this.x = nx; this.y = ny;
  };

  TurtleCanvas.prototype.turnBy = function (deg, instant, done) {
    const self = this;
    if (instant || this.speed <= 0 || Math.abs(deg) < 2) {
      this.heading += deg;
      this.drawSprite();
      return done();
    }
    let turned = 0;
    const chunk = 6;
    const step = () => {
      const remain = deg - turned;
      const d = Math.min(chunk, Math.abs(remain)) * Math.sign(remain);
      self.heading += d;
      turned += d;
      self.drawSprite();
      if (Math.abs(deg - turned) > 0.01) setTimeout(step, self.speedDelay());
      else done();
    };
    step();
  };

  TurtleCanvas.prototype.goTo = function (tx, ty, instant, done) {
    const self = this;
    const dist = Math.hypot(tx - this.x, ty - this.y);
    if (dist < 0.5) { this.x = tx; this.y = ty; this.drawSprite(); return done(); }
    if (instant || this.speed <= 0) {
      this.lineTo(tx, ty);
      this.drawSprite();
      return done();
    }
    const steps = Math.min(60, Math.max(2, Math.round(dist / 6)));
    let i = 0;
    const step = () => {
      i++;
      const t = i / steps;
      const nx = this.x + (tx - this.x) * (6 / steps) / 1;
      // move in geometric chunks toward target
      const remainX = tx - this.x, remainY = ty - this.y;
      const d = Math.min(6, Math.hypot(remainX, remainY));
      const ux = remainX / Math.hypot(remainX, remainY), uy = remainY / Math.hypot(remainX, remainY);
      this.lineTo(this.x + ux * d, this.y + uy * d);
      this.drawSprite();
      if (Math.hypot(tx - this.x, ty - this.y) > 0.5 && i < 400) setTimeout(step, this.speedDelay());
      else { this.x = tx; this.y = ty; this.drawSprite(); done(); }
    };
    step();
  };

  TurtleCanvas.prototype.circleBy = function (r, extentDeg, instant, done) {
    // approximate: many small forward/left steps
    const self = this;
    const steps = Math.max(8, Math.round(Math.abs(extentDeg) / 5));
    const turn = Math.abs(extentDeg) / steps * (r >= 0 ? 1 : -1);
    const chord = 2 * Math.abs(r) * Math.sin(Math.abs(turn) * Math.PI / 360);
    let i = 0;
    const step = () => {
      const n = instant ? steps : 1;
      for (let k = 0; k < n; k++) {
        i++;
        this.applyMove(chord, this.heading);
        this.heading += turn;
      }
      this.drawSprite();
      if (i < steps) setTimeout(step, this.speedDelay());
      else done();
    };
    step();
  };

  TurtleCanvas.prototype.endFill = function () {
    if (!this.fillPoints || this.fillPoints.length < 3) { this.fillPoints = null; return; }
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    const first = this.toPx(this.fillPoints[0][0], this.fillPoints[0][1]);
    ctx.moveTo(first.x, first.y);
    for (const p of this.fillPoints.slice(1)) {
      const q = this.toPx(p[0], p[1]);
      ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.restore();
    this.fillPoints = null;
  };

  TurtleCanvas.prototype.stampDot = function (size, color) {
    const ctx = this.ctx;
    const p = this.toPx(this.x, this.y);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  TurtleCanvas.prototype.stampText = function (item) {
    const text = String(item.args.length ? item.args[0] : '');
    const ctx = this.ctx;
    const p = this.toPx(this.x, this.y);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = this.penColor;
    ctx.font = '13px ui-monospace, monospace';
    ctx.fillText(text, p.x, p.y);
    ctx.restore();
  };

  TurtleCanvas.prototype.drawSprite = function () {
    const ctx = this.octx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    if (!this.visible) return;
    ctx.translate(this.width / 2, this.height / 2);
    const p = this.toPx(this.x, this.y);
    ctx.translate(p.x, p.y);
    // python turtle heading: 0=east, 90=north; sprite nose points up
    ctx.rotate((90 - this.heading) * Math.PI / 180);
    // cute turtle: shell + head + flippers
    ctx.fillStyle = '#34d399';
    ctx.strokeStyle = '#065f46';
    // shell
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // shell pattern
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    // head
    ctx.beginPath();
    ctx.arc(0, -16, 5.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // eyes
    ctx.fillStyle = '#052e1c';
    ctx.beginPath(); ctx.arc(-2.2, -17.5, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.2, -17.5, 1.1, 0, Math.PI * 2); ctx.fill();
    // flippers
    ctx.fillStyle = '#34d399';
    ctx.beginPath(); ctx.ellipse(-10, 6, 4, 2.4, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, 6, 4, 2.4, -0.6, 0, Math.PI * 2); ctx.fill();
  };

  TurtleCanvas.prototype.whenIdle = function (cb, fallbackMs) {
    if (!this.queue.length) { cb(); return; }
    this.onIdle = cb;
    const self = this;
    if (fallbackMs) setTimeout(() => { if (this.onIdle === cb) { this.onIdle = null; cb(); } }, fallbackMs);
  };

  function num(v) { return typeof v === 'number' ? v : (v && v.v !== undefined ? v.v : Number(v) || 0); }
  function str(v) { return String(v); }

  /* Builds the module object to hand to the Python engine */
  TurtleCanvas.prototype.makeModule = function (PyEngine) {
    const self = this;
    const table = {};
    for (const n of API_NAMES) {
      table[n] = function (args, kwargs) {
        const a = (args || []).map(v => typeof v === 'object' && v !== null && 'v' in v ? v.v : v);
        if (n === 'goto' || n === 'setpos') {
          // allow goto((x,y)) tuple form
          if (a.length === 1 && Array.isArray(a[0])) a.push(a[0][1]), a[0] = a[0][0];
        }
        self.enqueue(n, a);
        return null;
      };
    }
    table.xcor = () => ({ __pyfloat: Math.round(self.x * 100) / 100 });
    table.ycor = () => ({ __pyfloat: Math.round(self.y * 100) / 100 });
    table.heading = () => ({ __pyfloat: Math.round(self.heading * 100) / 100 });
    table.position = () => [table.xcor(), table.ycor()];
    return PyEngine.makeModule('turtle', table);
  };

  root.TurtleCanvas = TurtleCanvas;
})(typeof window !== 'undefined' ? window : globalThis);
