/**
 * 🎨 Background Animation — Fractal Lines
 * Original: classic codepen fractal lines animation
 * Adaptado por Copilot para:
 * - Encapsular em IIFE (não polui escopo global)
 * - Respeitar prefers-reduced-motion
 * - Pausar quando aba não está visível (economia de bateria)
 * - Debounce no resize
 * - Cleanup adequado
 */
(function () {
  "use strict";

  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  // Respeita preferência do usuário por menos movimento
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reducedMotion) {
    canvas.style.display = "none";
    return;
  }

  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);
  const ctx = canvas.getContext("2d");

  const opts = {
    len: 20,
    count: 50,
    baseTime: 10,
    addedTime: 10,
    dieChance: 0.05,
    spawnChance: 1,
    sparkChance: 0.1,
    sparkDist: 10,
    sparkSize: 2,

    color: "hsl(hue,100%,light%)",
    baseLight: 50,
    addedLight: 10,
    shadowToTimePropMult: 6,
    baseLightInputMultiplier: 0.01,
    addedLightInputMultiplier: 0.02,

    cx: w / 2,
    cy: h / 2,
    repaintAlpha: 0.04,
    hueChange: 0.1,
  };

  let tick = 0;
  let lines = [];
  let dieX = w / 2 / opts.len;
  let dieY = h / 2 / opts.len;
  const baseRad = (Math.PI * 2) / 6;
  let rafId = null;
  let isPaused = false;

  // Inicia com fundo preto
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  function Line () {
    this.reset();
  }

  Line.prototype.reset = function () {
    this.x = 0;
    this.y = 0;
    this.addedX = 0;
    this.addedY = 0;
    this.rad = 0;
    this.lightInputMultiplier =
      opts.baseLightInputMultiplier +
      opts.addedLightInputMultiplier * Math.random();
    this.color = opts.color.replace("hue", tick * opts.hueChange);
    this.cumulativeTime = 0;
    this.beginPhase();
  };

  Line.prototype.beginPhase = function () {
    this.x += this.addedX;
    this.y += this.addedY;
    this.time = 0;
    this.targetTime = (opts.baseTime + opts.addedTime * Math.random()) | 0;
    this.rad += baseRad * (Math.random() < 0.5 ? 1 : -1);
    this.addedX = Math.cos(this.rad);
    this.addedY = Math.sin(this.rad);

    if (
      Math.random() < opts.dieChance ||
      this.x > dieX ||
      this.x < -dieX ||
      this.y > dieY ||
      this.y < -dieY
    ) {
      this.reset();
    }
  };

  Line.prototype.step = function () {
    ++this.time;
    ++this.cumulativeTime;

    if (this.time >= this.targetTime) this.beginPhase();

    const prop = this.time / this.targetTime;
    const wave = Math.sin((prop * Math.PI) / 2);
    const x = this.addedX * wave;
    const y = this.addedY * wave;

    ctx.shadowBlur = prop * opts.shadowToTimePropMult;
    ctx.fillStyle = ctx.shadowColor = this.color.replace(
      "light",
      opts.baseLight +
      opts.addedLight *
      Math.sin(this.cumulativeTime * this.lightInputMultiplier)
    );

    ctx.fillRect(
      opts.cx + (this.x + x) * opts.len,
      opts.cy + (this.y + y) * opts.len,
      2,
      2
    );

    if (Math.random() < opts.sparkChance) {
      ctx.fillRect(
        opts.cx +
        (this.x + x) * opts.len +
        Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
        opts.sparkSize / 2,
        opts.cy +
        (this.y + y) * opts.len +
        Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
        opts.sparkSize / 2,
        opts.sparkSize,
        opts.sparkSize
      );
    }
  };

  function loop () {
    if (isPaused) return;

    rafId = window.requestAnimationFrame(loop);
    ++tick;

    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0," + opts.repaintAlpha + ")";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    if (lines.length < opts.count && Math.random() < opts.spawnChance) {
      lines.push(new Line());
    }

    for (let i = 0; i < lines.length; i++) {
      lines[i].step();
    }
  }

  // ---- Resize com debounce ----
  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);
      opts.cx = w / 2;
      opts.cy = h / 2;
      dieX = w / 2 / opts.len;
      dieY = h / 2 / opts.len;
    }, 200);
  });

  // ---- Pausa quando aba não está visível (economia de bateria) ----
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      isPaused = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (isPaused) {
      isPaused = false;
      loop();
    }
  });

  // Inicia o loop
  loop();
})();
