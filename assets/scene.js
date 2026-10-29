/* 字符雨 —— 背景层。低密度、慢速，靠 CSS 压暗，确保正文可读 */
(function () {
  "use strict";

  var canvas = document.getElementById("scene");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var GLYPHS = "0123456789ABCDEF{}[]<>/\\|=+-*._~^#$%&:;!?";
  var FONT_SIZE = 15;
  var COL_W = 24;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  var W = 0, H = 0, cols = 0;
  var drops = [];
  var raf = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT_SIZE + "px 'JetBrains Mono', Consolas, 'Courier New', monospace";
    ctx.textBaseline = "top";

    cols = Math.ceil(W / COL_W);
    drops = [];
    for (var i = 0; i < cols; i++) {
      drops.push({
        y: Math.random() * H,
        speed: 0.9 + Math.random() * 2.0,
        len: 7 + Math.floor(Math.random() * 14)
      });
    }
  }

  function glyphAt(col, row) {
    var t = Math.floor(Date.now() / 110);
    var n = ((col * 73856093) ^ (row * 19349663) ^ (t * 83492791)) >>> 0;
    return GLYPHS.charAt(n % GLYPHS.length);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < cols; i++) {
      var d = drops[i];
      var x = i * COL_W;

      for (var j = 0; j < d.len; j++) {
        var y = d.y - j * FONT_SIZE;
        if (y < -FONT_SIZE || y > H) continue;

        var fade = 1 - j / d.len;
        ctx.globalAlpha = j === 0 ? 1 : fade * fade * 0.5;
        ctx.fillStyle = j === 0 ? "#D7FFEC" : "#2FD8A0";
        ctx.fillText(glyphAt(i, Math.floor(y / FONT_SIZE)), x, y);
      }

      d.y += d.speed;
      if (d.y - d.len * FONT_SIZE > H) {
        d.y = -Math.random() * 240;
        d.speed = 0.9 + Math.random() * 2.0;
        d.len = 7 + Math.floor(Math.random() * 14);
      }
    }

    ctx.globalAlpha = 1;
  }

  function loop() {
    draw();
    raf = window.requestAnimationFrame(loop);
  }

  function start() {
    if (!raf) raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
  }

  var rt = null;
  window.addEventListener("resize", function () {
    if (rt) window.clearTimeout(rt);
    rt = window.setTimeout(function () {
      resize();
      if (!raf) draw();
    }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!reduce) start();
  });

  resize();

  if (reduce) {
    draw();
    return;
  }

  start();
})();
