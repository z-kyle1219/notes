# 本地预览 LeetCode 笔记本
# 用法：右键此文件 → 使用 PowerShell 运行
# 停止：在这个窗口按 Ctrl+C
# 注意：本文件必须以 UTF-8 with BOM 保存，否则 Windows PowerShell 5.1 会按 GBK 解码导致报错

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$port = 8080

$python = $null
foreach ($cmd in @('python', 'py', 'python3')) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        & $cmd --version *> $null
        if ($LASTEXITCODE -eq 0) { $python = $cmd; break }
    }
}

if (-not $python) {
    Write-Host ''
    Write-Host '  没找到可用的 Python。' -ForegroundColor Yellow
    Write-Host '  可以改用 VS Code 的 Live Server 插件打开 index.html，' -ForegroundColor DarkGray
    Write-Host '  或者直接把这个仓库推到 GitHub Pages 在线阅读。' -ForegroundColor DarkGray
    Write-Host ''
    Read-Host '按回车退出'
    exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host '  LeetCode 笔记本' -ForegroundColor Green
Write-Host "  $url" -ForegroundColor Cyan
Write-Host '  按 Ctrl+C 停止' -ForegroundColor DarkGray
Write-Host ''

Start-Process $url
& $python -m http.server $port
