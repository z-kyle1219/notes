/* 首页 — 终端观感的入口页。无依赖，读完 index.json 再补字数/体积。 */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THEME_KEY = "notes.theme";

  var FALLBACK = {
    groups: [{
      title: "第三章 · 栈与队列",
      items: [{
        id: "ds-stack-queue",
        num: "03",
        title: "栈与队列 · 知识点",
        file: "notes/03-stack-queue.md",
        difficulty: null
      }]
    }]
  };

  /* ── 主题 ─────────────────────────────────────────── */
  var ICON_SUN = '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var ICON_MOON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 14.5A8.2 8.2 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = $("#themeBtn");
    if (btn) {
      btn.innerHTML = t === "dark" ? ICON_SUN : ICON_MOON;
      btn.title = t === "dark" ? "切换到浅色" : "切换到深色";
      btn.setAttribute("aria-label", btn.title);
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#030508" : "#F7F9F8");
    setBoot("theme", t);
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved === "light" ? "light" : "dark");
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  /* ── 小工具 ───────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function comma(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function setBoot(key, val) {
    $$('[data-boot="' + key + '"]').forEach(function (el) { el.textContent = val; });
  }

  function countUp(el, to, dur) {
    if (!el) return;
    if (reduce) { el.textContent = pad2(to); return; }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pad2(Math.round(to * e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── 时钟 ─────────────────────────────────────────── */
  function startClock() {
    var el = $("#clock");
    if (!el) return;
    function tick() {
      var d = new Date();
      el.textContent = pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── 打字机 ───────────────────────────────────────── */
  function typeText(el, text) {
    if (!el) return;
    if (reduce) { el.textContent = text; return; }
    var i = 0;
    el.textContent = "";
    setTimeout(function step() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 24 + Math.random() * 42);
    }, 420);
  }

  /* ── Markdown 预处理：字数与体积 ──────────────────── */
  function parseFrontmatter(raw) {
    var m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
    if (!m) return { data: {}, body: raw };
    var data = {};
    m[1].split(/\r?\n/).forEach(function (line) {
      var i = line.indexOf(":");
      if (i < 0) return;
      var k = line.slice(0, i).trim();
      var v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!k) return;
      if (v.charAt(0) === "[") {
        data[k] = v.slice(1, -1).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      } else {
        data[k] = v;
      }
    });
    return { data: data, body: raw.slice(m[0].length) };
  }

  function countWords(body) {
    var t = body
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_`\[\]()!|~-]/g, " ");
    var cjk = (t.match(/[\u3400-\u9fff]/g) || []).length;
    var latin = (t.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g) || []).length;
    return cjk + latin;
  }

  function kb(text) {
    var bytes = new Blob([text]).size;
    return (bytes / 1024).toFixed(1) + "K";
  }

  /* ── 目录 ─────────────────────────────────────────── */
  var flat = [];

  function renderIndex(groups) {
    var box = $("#chapterList");
    if (!box) return;
    var html = "";
    groups.forEach(function (g) {
      html += '<div class="idx-group">' + esc(g.title) + "</div>";
      g.items.forEach(function (it) {
        var tags = "";
        if (it.tags && it.tags.length) {
          tags = it.tags.map(function (t) { return "#" + t; }).join(" ");
        }
        html += '<a class="idx-row" href="index.html#/' + encodeURIComponent(it.id) + '" data-id="' + esc(it.id) + '">' +
          '<span class="r-num">' + esc(it.num || "—") + "</span>" +
          '<span class="r-main">' +
            '<span class="r-title">' + esc(it.title) + "</span>" +
            '<span class="r-tags" data-tags>' + esc(tags) + "</span>" +
          "</span>" +
          '<span class="r-file">' + esc(it.file) + "</span>" +
          '<span class="r-size" data-size>—</span>' +
          '<span class="r-go">→</span>' +
        "</a>";
      });
    });
    box.innerHTML = html;

    var total = $("#idxTotal");
    if (total) {
      total.innerHTML = "TOTAL · <b>" + pad2(flat.length) + "</b> FILE";
    }
  }

  function fillMeta(item, raw) {
    var fm = parseFrontmatter(raw);
    var row = $('.idx-row[data-id="' + item.id + '"]');
    var tags = [];
    if (row) {
      var tEl = row.querySelector("[data-tags]");
      if (fm.data.tags) {
        tags = Array.isArray(fm.data.tags) ? fm.data.tags : [fm.data.tags];
        if (tEl) tEl.textContent = tags.map(function (t) { return "#" + t; }).join(" ");
      }
      var sizeEl = row.querySelector("[data-size]");
      if (sizeEl) sizeEl.textContent = kb(raw);
    }
    return { words: countWords(fm.body), bytes: new Blob([raw]).size, tags: tags.length };
  }

  function hydrate(items) {
    var words = 0, bytes = 0, tags = 0, done = 0;
    var totalEl = $("#idxSize");
    var wordsEl = $("#statWords");
    var tagsEl = $("#statTags");

    items.forEach(function (it) {
      fetch(it.file, { cache: "force-cache" })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (text) {
          if (!text) return;
          var m = fillMeta(it, text);
          words += m.words;
          bytes += m.bytes;
          tags += m.tags;
        })
        .catch(function () {})
        .then(function () {
          done++;
          if (done < items.length) return;
          if (totalEl) {
            totalEl.innerHTML = "SIZE · <b>" + (bytes / 1024).toFixed(1) + "K</b>" +
              (words ? " · <b>" + comma(words) + "</b> 字" : "");
          }
          if (wordsEl) wordsEl.textContent = words ? comma(words) : "—";
          if (tagsEl) tagsEl.textContent = pad2(tags);
        });
    });
  }

  /* ── 启动 ─────────────────────────────────────────── */
  function boot() {
    initTheme();
    startClock();

    var themeBtn = $("#themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // 面板里的入场错峰
    $$(".bootline").forEach(function (el, i) { el.style.setProperty("--d", String(i + 1)); });
    var panelBody = $(".panel-body");
    if (panelBody) {
      panelBody.classList.add("ready");
    }

    fetch("notes/index.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .catch(function () { return FALLBACK; })
      .then(function (data) {
        var groups = (data && data.groups) || FALLBACK.groups;
        flat = [];
        groups.forEach(function (g) {
          g.items.forEach(function (it) { flat.push(it); });
        });

        renderIndex(groups);

        countUp($("#statChapters"), groups.length, 620);
        countUp($("#statNotes"), flat.length, 760);
        setBoot("notes", pad2(flat.length) + " indexed");

        typeText($("#cmdText"), "cat ./" + (flat[0] ? flat[0].file : "notes/"));

        var cta = $("#ctaMain");
        if (cta && flat[0]) cta.setAttribute("href", "index.html#/" + encodeURIComponent(flat[0].id));

        hydrate(flat);
      });

    // 快捷键：t 换主题，↵ 打开最新一篇
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === "Enter" && document.activeElement === document.body && flat.length) {
        e.preventDefault();
        location.href = "index.html#/" + encodeURIComponent(flat[0].id);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
