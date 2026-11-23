# 新建一篇笔记
# 用法：右键此文件 → 使用 PowerShell 运行，或者在终端执行 .\new-note.ps1

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$notesDir = Join-Path $PSScriptRoot 'notes'
$jsonPath = Join-Path $notesDir 'index.json'

if (-not (Test-Path $jsonPath)) {
    Write-Host '找不到 notes\index.json，请确认在笔记站根目录下运行。' -ForegroundColor Red
    Read-Host '按回车退出'; exit 1
}

Write-Host ''
Write-Host '  ── 新建笔记 ──' -ForegroundColor Green
Write-Host ''

$title = Read-Host '标题（中文，例如：三数之和）'
if ([string]::IsNullOrWhiteSpace($title)) {
    Write-Host '标题不能为空。' -ForegroundColor Red
    Read-Host '按回车退出'; exit 1
}
$title = $title.Trim()

$auto = 'note-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$slug = Read-Host "短名（英文，用于文件名；回车自动用 $auto）"
if ([string]::IsNullOrWhiteSpace($slug)) { $slug = $auto }
$slug = ($slug.Trim().ToLower() -replace '[^a-z0-9\-_]', '-')
$slug = ($slug -replace '-+', '-').Trim('-')
if (-not $slug) { $slug = $auto }

$group = Read-Host '分组（例如：哈希表 · 数组；回车 = 未分类）'
if ([string]::IsNullOrWhiteSpace($group)) { $group = '未分类' }
$group = $group.Trim()

Write-Host '难度：1 = 简单   2 = 中等   3 = 困难   回车 = 不标注' -ForegroundColor DarkGray
$d = (Read-Host '难度').Trim()
$diff = ''
if ($d -eq '1') { $diff = 'easy' }
elseif ($d -eq '2') { $diff = 'medium' }
elseif ($d -eq '3') { $diff = 'hard' }

Write-Host '状态：1 = 独立做出   2 = 看了题解才过   回车 = 不标注' -ForegroundColor DarkGray
$s = (Read-Host '状态').Trim()
$status = ''
if ($s -eq '1') { $status = 'passed' }
elseif ($s -eq '2') { $status = 'review' }

$tagLine = Read-Host '标签（逗号分隔，例如：双指针, 数组；回车跳过）'
$tags = @()
if (-not [string]::IsNullOrWhiteSpace($tagLine)) {
    $tags = $tagLine -split '[,，]' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$num = ''
if ($title -match '^(\d{1,4})') { $num = $matches[1].PadLeft(4, '0') }

$fileName = "notes/$slug.md"
$filePath = Join-Path $notesDir "$slug.md"

if (Test-Path $filePath) {
    Write-Host "notes\$slug.md 已存在，换个短名再试。" -ForegroundColor Red
    Read-Host '按回车退出'; exit 1
}

$fence = [string][char]96 * 3

$fm = "---`n"
$fm += "title: $title`n"
if ($diff) { $fm += "difficulty: $diff`n" }
if ($status) { $fm += "status: $status`n" }
if ($tags.Count -gt 0) { $fm += 'tags: [' + ($tags -join ', ') + "]`n" }
$fm += "---`n`n"

$body = @"
# $title

## 题目

## 思路

## 代码

@@F@@cpp

@@F@@

## 复杂度

- 时间：O()
- 空间：O()

## 坑

-
"@

$body = $body.Replace('@@F@@', $fence)

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, ($fm + $body), $utf8)

# ── 更新 notes/index.json ────────────────────────────────
$data = Get-Content -LiteralPath $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$target = $null
foreach ($g in $data.groups) {
    if ($g.title -eq $group) { $target = $g; break }
}
if (-not $target) {
    $target = [pscustomobject]@{ title = $group; items = @() }
    $data.groups = @($data.groups) + $target
}

$target.items = @($target.items) + [pscustomobject]@{
    id         = $slug
    num        = $num
    title      = $title
    file       = $fileName
    difficulty = $(if ($diff) { $diff } else { $null })
}

function Esc([string]$s) {
    if ([string]::IsNullOrEmpty($s)) { return '' }
    ($s -replace '\\', '\\') -replace '"', '\"'
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('{')
[void]$sb.AppendLine('  "title": "' + (Esc $data.title) + '",')
[void]$sb.AppendLine('  "groups": [')
for ($g = 0; $g -lt $data.groups.Count; $g++) {
    $grp = $data.groups[$g]
    [void]$sb.AppendLine('    {')
    [void]$sb.AppendLine('      "title": "' + (Esc $grp.title) + '",')
    [void]$sb.AppendLine('      "items": [')
    $items = @($grp.items)
    for ($i = 0; $i -lt $items.Count; $i++) {
        $it = $items[$i]
        $line = '        {"id": "' + (Esc $it.id) + '", "num": "' + (Esc $it.num) + '", "title": "' + (Esc $it.title) + '", "file": "' + (Esc $it.file) + '", "difficulty": '
        if ($it.difficulty) { $line += '"' + (Esc $it.difficulty) + '"' } else { $line += 'null' }
        $line += '}'
        if ($i -lt $items.Count - 1) { $line += ',' }
        [void]$sb.AppendLine($line)
    }
    [void]$sb.AppendLine('      ]')
    $tail = '    }'
    if ($g -lt $data.groups.Count - 1) { $tail += ',' }
    [void]$sb.AppendLine($tail)
}
[void]$sb.AppendLine('  ]')
[void]$sb.AppendLine('}')

[System.IO.File]::WriteAllText($jsonPath, $sb.ToString(), $utf8)

Write-Host ''
Write-Host "  已创建  notes\$slug.md" -ForegroundColor Green
Write-Host "  已登记到 notes\index.json  →  分组「$group」" -ForegroundColor Green
Write-Host ''
Write-Host '  刷新浏览器就能看到这篇笔记。' -ForegroundColor DarkGray
Write-Host "  提交：git add . ; git commit -m `"docs: 新增 $title`" ; git push" -ForegroundColor DarkGray
Write-Host ''
Read-Host '按回车退出'
