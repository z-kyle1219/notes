# LeetCode 笔记本

**在线地址：[https://z-kyle1219.github.io/leetcode/](https://z-kyle1219.github.io/leetcode/)**

一个自己用的代码复习站：Markdown 写笔记，浏览器里读，推到 GitHub 就是公开网页。

- 左侧目录、右侧正文，支持**全文搜索**（按 `/` 直接唤起）
- 代码块带**语法高亮 + 一键复制**
- 浅色 / 深色两套主题，跟随系统
- 手机上也能看
- 不需要任何构建工具、不需要 Node.js，改完 md 刷新就是最新

---

## 一、本地预览

双击 **`start.ps1`**（右键 → 使用 PowerShell 运行），浏览器会自动打开预览页；改完 md 刷新即可看到最新内容。

> 别直接双击 `index.html`：浏览器不允许 `file://` 页面读取本地 `.md`，会提示读不到笔记。

## 二、目录结构

```text
D:\leetcode\
├─ index.html            页面骨架（一般不用动）
├─ assets\
│  ├─ style.css          全部样式，配色在文件最上面的变量里
│  ├─ app.js             渲染、搜索、主题切换
│  └─ scene.js           背景字符雨（Canvas，无依赖）
├─ notes\
│  ├─ index.json         ← 目录清单，新增笔记要登记在这里
│  ├─ 01-how-to-practice.md
│  ├─ 02-complexity.md
│  ├─ lc-0001-two-sum.md
│  ├─ lc-0020-valid-parentheses.md
│  └─ lc-0704-binary-search.md
├─ start.ps1             本地预览
├─ new-note.ps1          新建笔记
├─ .nojekyll             告诉 GitHub Pages 别走 Jekyll 处理（别删）
└─ README.md             就是本文件
```

## 三、新增一篇笔记

**方式 A：用脚本（推荐）**

```powershell
.\new-note.ps1
```

按提示输入标题、短名、分组、难度、标签，它会自动：

1. 生成 `notes\<短名>.md`，带上标准模板
2. 把条目追加进 `notes\index.json`

**方式 B：手动**

1. 在 `notes\` 里新建 `.md`，开头加 frontmatter：

```markdown
---
title: 三数之和
difficulty: medium
tags: [双指针, 数组]
subtitle: LeetCode 15
---
```

`difficulty` 填 `easy` / `medium` / `hard`，不填就不显示难度徽章。

2. 在 `notes\index.json` 对应的 group 里加一条：

```json
{ "id": "lc15", "num": "0015", "title": "三数之和", "file": "notes/lc-0015-three-sum.md", "difficulty": "medium" }
```

`id` 是 URL 里用的短标识，全站唯一；`file` 是相对 `index.html` 的路径。

## 四、发布与更新（已上线）

站点已经托管在 GitHub Pages 上：

| | |
|---|---|
| 在线地址 | https://z-kyle1219.github.io/leetcode/ |
| 源码仓库 | https://github.com/z-kyle1219/leetcode |
| 发布分支 | `main`，目录 `/ (root)` |

**日常更新就是三步**——改完笔记和 `notes\index.json` 后提交推送，Pages 会自动重新构建，一两分钟后线上就是新的：

```powershell
cd D:\leetcode
git add .
git commit -m "note: 新增 xxx"
git push
```

> 推送后先在本地 `start.ps1` 预览确认没问题，再 push；线上构建有缓存，看不到改动时用 `Ctrl+F5` 强刷一下。

配置项（已完成，只有换仓库/换账号时才需要重做）：仓库 **Settings** → **Pages** → Source 选 `Deploy from a branch` → 分支 `main`、目录 `/ (root)` → Save。

> ⚠️ 私有仓库要发 Pages 需要 GitHub Pro，免费账号请把仓库设为 Public。

## 五、改外观

想换配色，只改 `assets\style.css` 顶部 `:root`（浅色）和 `[data-theme="dark"]`（深色）两组变量即可：

```css
--bg: #030508;               /* 页面底色，玄墨 */
--accent: #3BFF9E;           /* 强调色，磷光绿 */
--veil: rgba(3, 5, 8, .90);  /* 正文区遮罩，压低字符雨保证可读 */
```

- 背景字符雨在 `assets\scene.js`：`COL_W` 控制列宽（改小更密），`speed` 控制下落速度。
- `style.css` 里 `#scene { opacity: .55 }` 控制整体浓度。
- CRT 扫描线在 `.app::after`，不想要就把它整段删掉。
- 代码块在两种主题下都是深色，语法色在 `--tk-key / --tk-str / --tk-fn` 那几个变量里。
- 默认主题是深色。想改回跟随系统，把 `assets\app.js` 里 `var t = saved || "dark";` 换成 `saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")`。

## 六、状态标记

每篇笔记的 frontmatter 可以加一行 `status`，会在标题上方显示成方括号标记：

```markdown
---
title: 两数之和
difficulty: easy
status: passed
tags: [哈希表, 数组]
---
```

`passed` → `[PASSED]`，`review` → `[REVIEW]`，写什么显示什么。不写就不显示。

用 `new-note.ps1` 新建笔记时会直接问你选，不用手写。
