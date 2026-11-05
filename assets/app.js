/* LeetCode 笔记本 — 轻量静态文档站 */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var mainEl = $("#main");
  var contentEl = $("#content");
  var navEl = $("#nav");
  var searchInput = $("#search");
  var searchPanel = $("#searchPanel");
  var progressBar = $("#progressBar");
  var sidebar = $("#sidebar");
  var scrim = $("#scrim");

  var manifest = null;
  var flat = [];          // 扁平化后的条目，按顺序
  var byId = {};
  var index = [];         // 全文检索索引
  var currentId = null;

  /* ── 主题 ─────────────────────────────────────────── */
  var THEME_KEY = "leet.theme";

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = $("#themeBtn");
    // 月亮 / 太阳
    btn.innerHTML = t === "dark"
      ? '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 14.5A8.2 8.2 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    btn.title = t === "dark" ? "切换到浅色" : "切换到深色";
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var t = saved || "dark";
    applyTheme(t);
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  /* ── 工具 ─────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

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

  var CN = { easy: "简单", medium: "中等", hard: "困难" };

  /* ── 侧栏 ─────────────────────────────────────────── */
  function buildNav() {
    var html = "";
    manifest.groups.forEach(function (g) {
      html += '<div class="nav-group"><div class="nav-group-title">' + esc(g.title) + "</div>";
      g.items.forEach(function (it) {
        var num = it.num ? '<span class="nav-num">' + esc(it.num) + "</span>" : '<span class="nav-num"></span>';
        var dot = it.difficulty ? '<span class="dot ' + it.difficulty + '"></span>' : "";
        html += '<a class="nav-item" data-id="' + esc(it.id) + '" href="#/' + encodeURIComponent(it.id) + '">' +
          num + '<span class="nav-label">' + esc(it.title) + "</span>" + dot + "</a>";
      });
      html += "</div>";
    });
    navEl.innerHTML = '<div class="nav-ind" id="navInd"></div>' + html;

    navEl.addEventListener("click", function (e) {
      var a = e.target.closest(".nav-item");
      if (a) { e.preventDefault(); goto(a.getAttribute("data-id")); }
    });

    $("#docCount").textContent = flat.length + " NOTES";
  }

  function moveIndicator(el) {
    var ind = document.getElementById("navInd");
    if (!ind) return;
    if (!el) { ind.style.opacity = "0"; return; }
    ind.style.height = el.offsetHeight + "px";
    ind.style.transform = "translateY(" + el.offsetTop + "px)";
    ind.style.opacity = "1";
  }

  function markActive(id) {
    var activeEl = null;
    $$(".nav-item", navEl).forEach(function (a) {
      var on = a.getAttribute("data-id") === id;
      a.classList.toggle("active", on);
      if (on) activeEl = a;
    });
    if (activeEl && activeEl.scrollIntoView) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
    moveIndicator(activeEl);
  }

  /* ── 渲染文章 ─────────────────────────────────────── */
  function renderDoc(item, raw) {
    var fm = parseFrontmatter(raw);
    var body = fm.body;
    var meta = fm.data;

    var html = marked.parse(body, { gfm: true, breaks: false });

    var head = "";
    var cmdName = String(item.file).split("/").pop();
    head += '<div class="term-cmd"><span class="prompt">$</span> cat ' + esc(cmdName) + "</div>";
    var badges = "";
    if (meta.status) {
      badges += '<span class="badge pass">' + esc(String(meta.status).toUpperCase()) + "</span>";
    }
    if (meta.difficulty) {
      badges += '<span class="badge ' + esc(meta.difficulty) + '">' + esc(CN[meta.difficulty] || meta.difficulty) + "</span>";
    }
    if (meta.tags) {
      var tags = Array.isArray(meta.tags) ? meta.tags : [meta.tags];
      tags.forEach(function (t) { badges += '<span class="tag">' + esc(t) + "</span>"; });
    }
    if (badges) head += '<div class="doc-meta">' + badges + "</div>";
    if (meta.subtitle) head += '<p class="doc-sub">' + esc(meta.subtitle) + "</p>";
    else if (badges) head += '<div class="doc-sub" style="border:0;padding:0;margin-bottom:34px"></div>';

    contentEl.innerHTML = head + html;

    var h1el = contentEl.querySelector("h1");
    if (h1el) h1el.setAttribute("data-num", item.num || "");

    // 代码高亮 + 复制条
    $$("pre", contentEl).forEach(function (pre) {
      var code = pre.querySelector("code");
      var lang = "";
      if (code) {
        var cls = code.className || "";
        var m = /language-([\w+#-]+)/.exec(cls);
        if (m) lang = m[1];
        if (lang === "text" || lang === "txt" || lang === "plaintext") {
          lang = "";
        } else if (window.hljs && code.textContent.trim()) {
          try { hljs.highlightElement(code); } catch (e) {}
        }
      }
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode.insertBefore(wrap, pre);

      var bodyEl = document.createElement("div");
      bodyEl.className = "code-body";

      var rawText = code ? code.textContent.replace(/\s+$/, "") : "";
      var lines = rawText ? rawText.split("\n").length : 1;
      if (lines > 1) {
        var gutter = document.createElement("div");
        gutter.className = "code-gutter";
        gutter.setAttribute("aria-hidden", "true");
        var frag = document.createDocumentFragment();
        for (var ln = 1; ln <= lines; ln++) {
          var sn = document.createElement("span");
          sn.textContent = ln;
          frag.appendChild(sn);
        }
        gutter.appendChild(frag);
        bodyEl.appendChild(gutter);
      }

      bodyEl.appendChild(pre);
      wrap.appendChild(bodyEl);

      var bar = document.createElement("div");
      bar.className = "code-bar";
      if (lang) {
        var lg = document.createElement("span");
        lg.className = "code-lang";
        lg.textContent = lang === "cpp" ? "c++" : lang;
        bar.appendChild(lg);
      }
      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "复制";
      btn.addEventListener("click", function () {
        var text = code ? code.textContent : pre.textContent;
        var done = function () {
          btn.textContent = "已复制";
          setTimeout(function () { btn.textContent = "复制"; }, 1400);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, fallback);
        } else { fallback(); }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      bar.appendChild(btn);
      wrap.appendChild(bar);
    });

    // 结尾光标
    contentEl.insertAdjacentHTML("beforeend",
      '<div class="term-end"><span class="prompt">$</span> <span class="caret">▊</span></div>');

    // 前后篇导航
    var i = flat.indexOf(item);
    var prev = flat[i - 1], next = flat[i + 1];
    if (prev || next) {
      var nv = '<nav class="doc-nav">';
      nv += prev
        ? '<a href="#/' + encodeURIComponent(prev.id) + '" data-id="' + esc(prev.id) + '"><div class="dn-label">← 上一节</div><div class="dn-title">' + esc(prev.title) + "</div></a>"
        : "<span></span>";
      nv += next
        ? '<a class="next" href="#/' + encodeURIComponent(next.id) + '" data-id="' + esc(next.id) + '"><div class="dn-label">下一节 →</div><div class="dn-title">' + esc(next.title) + "</div></a>"
        : "<span></span>";
      nv += "</nav>";
      contentEl.insertAdjacentHTML("beforeend", nv);
      $$(".doc-nav a", contentEl).forEach(function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          goto(a.getAttribute("data-id"));
        });
      });
    }

    document.title = (meta.title || item.title) + " · LeetCode 笔记本";

    var kids = contentEl.children;
    for (var k = 0; k < kids.length; k++) {
      kids[k].style.setProperty("--i", String(Math.min(k, 6)));
    }

    setCrumb(item);
    setupToc();
    setupZoom();
    setupReveal();
  }

  /* ── 点图看原图 ─────────────────────────────── */
  function setupZoom() {
    $$("figure.fig img", contentEl).forEach(function (img) {
      img.addEventListener("click", function () { openLightbox(img); });
    });
  }

  function openLightbox(img) {
    var box = document.createElement("div");
    box.className = "lightbox";

    var big = document.createElement("img");
    big.src = img.src;
    big.alt = img.alt || "";

    var hint = document.createElement("div");
    hint.className = "lightbox-hint";
    hint.textContent = "esc / click to close";

    box.appendChild(big);
    box.appendChild(hint);
    document.body.appendChild(box);

    function close() {
      document.removeEventListener("keydown", onKey);
      if (box.parentNode) box.parentNode.removeChild(box);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  }

  /* ── 章节锚点：给标题编号，导读里的链接平滑滚动 ── */
  function setupToc() {
    var counters = { H2: 0, H3: 0, H4: 0 };
    var prefix = { H2: "s", H3: "t", H4: "u" };
    $$("h2, h3, h4", contentEl).forEach(function (h) {
      var p = prefix[h.tagName];
      if (!p) return;
      if (!h.id) h.id = p + (++counters[h.tagName]);
    });

    $$("[data-jump]", contentEl).forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.getElementById(a.getAttribute("data-jump"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ── 顶栏路径 ─────────────────────────────────── */
  function setCrumb(item) {
    var crumb = $("#crumb");
    if (!crumb) return;
    var parts = String(item.file).split("/");
    var file = parts.pop();
    var dir = parts.join("/");
    crumb.innerHTML = "<span class=\"c-dim\">~/leetcode</span> / " +
      (dir ? '<span class="c-dim">' + esc(dir) + "</span> / " : "") +
      "<b>" + esc(file) + "</b>";
  }

  /* ── 滚动入场 ─────────────────────────────────── */
  var revObserver = null;

  function setupReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (!revObserver) {
      revObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            revObserver.unobserve(en.target);
          }
        });
      }, { root: mainEl, rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    }
    var vh = mainEl.clientHeight || window.innerHeight;
    $$(".code-wrap, table, blockquote, img, h2", contentEl).forEach(function (n) {
      if (n.getBoundingClientRect().top < vh * 0.9) return;
      n.classList.add(n.classList.contains("code-wrap") ? "reveal-clip" : "reveal");
      revObserver.observe(n);
    });
  }

  /* ── 光标光晕 ─────────────────────────────────── */
  function setupSpotlight() {
    var spot = $("#spot");
    if (!spot) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, shown = false;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        cx = tx; cy = ty;
        spot.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      spot.style.opacity = "0";
      shown = false;
    });

    function tick() {
      cx += (tx - cx) * 0.13;
      cy += (ty - cy) * 0.13;
      spot.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
  }

  /* ── 载入 ─────────────────────────────────────────── */
  function gone(id) {
    return flat.filter(function (f) { return f.id === id; })[0];
  }

  var cache = {};

  function loadDoc(id) {
    var item = byId[id] || flat[0];
    if (!item) return;
    if (currentId === item.id && contentEl.dataset.loaded === "1") {
      mainEl.scrollTo({ top: 0 });
      return;
    }
    currentId = item.id;
    markActive(item.id);
    mainEl.scrollTo({ top: 0, behavior: "auto" });

    if (cache[item.file]) {
      renderDoc(item, cache[item.file]);
      contentEl.dataset.loaded = "1";
      return;
    }

    contentEl.dataset.loaded = "0";
    contentEl.innerHTML = '<div class="state"><p>正在载入…</p></div>';

    fetch(item.file, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status + " " + item.file);
        return r.text();
      })
      .then(function (text) {
        cache[item.file] = text;
        renderDoc(item, text);
        contentEl.dataset.loaded = "1";
        if (location.hash !== "#/" + encodeURIComponent(item.id)) {
          history.replaceState(null, "", "#/" + encodeURIComponent(item.id));
        }
        buildIndexEntry(item, text);
      })
      .catch(function (err) {
        contentEl.dataset.loaded = "0";
        contentEl.innerHTML =
          '<div class="state"><h2>读不到这个文件</h2>' +
          "<p>浏览器不允许直接读取本地文件。请用 <code>start.ps1</code> 启动本地服务后再打开，<br />或者把这个仓库推到 GitHub Pages。</p>" +
          '<p style="margin-top:16px;font-size:12px;opacity:.7">' + esc(String(err.message || err)) + "</p></div>";
      });
  }

  function goto(id) {
    var item = byId[id] || flat[0];
    if (!item) return;
    history.replaceState(null, "", "#/" + encodeURIComponent(item.id));
    loadDoc(item.id);
    closeDrawer();
  }

  /* ── 全文检索 ─────────────────────────────────────── */
  function stripMd(s) {
    return s
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^[#>\-\*\s]+/gm, " ")
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildIndexEntry(item, raw) {
    if (index.some(function (e) { return e.id === item.id; })) return;
    var fm = parseFrontmatter(raw);
    var text = stripMd(fm.body);
    index.push({
      id: item.id,
      title: fm.data.title || item.title,
      tags: Array.isArray(fm.data.tags) ? fm.data.tags.join(" ") : (fm.data.tags || ""),
      text: text,
      lower: (item.title + " " + (fm.data.tags || "") + " " + text).toLowerCase()
    });
  }

  function preloadIndex() {
    var queue = flat.slice();
    var worker = function () {
      var it = queue.shift();
      if (!it) return;
      if (cache[it.file]) { buildIndexEntry(it, cache[it.file]); return setTimeout(worker, 0); }
      fetch(it.file, { cache: "force-cache" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (t) { if (t) { cache[it.file] = t; buildIndexEntry(it, t); } })
        .catch(function () {})
        .then(function () { setTimeout(worker, 40); });
    };
    setTimeout(worker, 300);
  }

  function snippetAround(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return text.slice(0, 80);
    var start = Math.max(0, i - 32);
    var s = text.slice(start, start + 96);
    return (start > 0 ? "…" : "") + s + (start + 96 < text.length ? "…" : "");
  }

  function runSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) { searchPanel.hidden = true; return; }
    var hits = index.filter(function (e) { return e.lower.indexOf(q) >= 0; }).slice(0, 8);

    if (!hits.length) {
      searchPanel.innerHTML = '<div class="sr-empty">没有找到「' + esc(q) + '」</div>';
      searchPanel.hidden = false;
      return;
    }

    searchPanel.innerHTML = hits.map(function (h) {
      var t = esc(h.title);
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      t = t.replace(re, "<mark>$1</mark>");
      var sn = esc(snippetAround(h.text, q)).replace(re, "<mark>$1</mark>");
      return '<a class="sr-item" data-id="' + esc(h.id) + '" href="#/' + encodeURIComponent(h.id) + '">' +
        '<div class="sr-title">' + t + "</div>" +
        '<div class="sr-snippet">' + sn + "</div></a>";
    }).join("");
    searchPanel.hidden = false;
  }

  /* ── 滚动进度 ─────────────────────────────────────── */
  function updateProgress() {
    var max = mainEl.scrollHeight - mainEl.clientHeight;
    var p = max > 0 ? mainEl.scrollTop / max : 0;
    progressBar.style.width = (p * 100).toFixed(1) + "%";

    var bar = document.querySelector(".topbar");
    if (bar) bar.classList.toggle("scrolled", mainEl.scrollTop > 6);
  }

  /* ── 抽屉 ─────────────────────────────────────────── */
  function openDrawer() {
    sidebar.classList.add("open");
    scrim.classList.add("show");
  }
  function closeDrawer() {
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
  }

  /* ── 启动 ─────────────────────────────────────────── */
  function boot() {
    initTheme();

    fetch("notes/index.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        manifest = data;
        manifest.groups.forEach(function (g) {
          g.items.forEach(function (it) { flat.push(it); byId[it.id] = it; });
        });
        buildNav();

        var id = decodeURIComponent((location.hash || "").replace(/^#\//, "")) || flat[0].id;
        loadDoc(byId[id] ? id : flat[0].id);
        preloadIndex();
        updateProgress();
      })
      .catch(function (err) {
        contentEl.innerHTML =
          '<div class="state"><h2>目录没读到</h2>' +
          "<p>确认 <code>notes/index.json</code> 存在，并且你是通过本地服务或 GitHub Pages 访问的。<br />直接双击打开 index.html 时，浏览器会拦截读取本地文件。</p>" +
          '<p style="margin-top:16px;font-size:12px;opacity:.7">' + esc(String(err.message || err)) + "</p></div>";
      });

    // 事件
    setupSpotlight();
    var themeBtn = $("#themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    var themeBtn2 = $("#themeBtn2");
    if (themeBtn2) themeBtn2.addEventListener("click", toggleTheme);
    var menuBtn = $("#menuBtn");
    if (menuBtn) menuBtn.addEventListener("click", openDrawer);
    if (scrim) scrim.addEventListener("click", closeDrawer);

    mainEl.addEventListener("scroll", updateProgress, { passive: true });

    searchInput.addEventListener("input", function () { runSearch(searchInput.value); });
    searchInput.addEventListener("focus", function () {
      if (searchInput.value.trim()) runSearch(searchInput.value);
    });

    searchPanel.addEventListener("click", function (e) {
      var a = e.target.closest(".sr-item");
      if (!a) return;
      e.preventDefault();
      goto(a.getAttribute("data-id"));
      searchPanel.hidden = true;
      searchInput.value = "";
      searchInput.blur();
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search")) searchPanel.hidden = true;
    });

    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchInput.focus();
      } else if (e.key === "Escape") {
        searchPanel.hidden = true;
        searchInput.blur();
        closeDrawer();
      }
    });

    window.addEventListener("hashchange", function () {
      var id = decodeURIComponent(location.hash.replace(/^#\//, ""));
      if (id && byId[id] && id !== currentId) loadDoc(id);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
