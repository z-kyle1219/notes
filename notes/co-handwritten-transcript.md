---
title: 手写笔记 · 原文转录稿
tags: [计算机组织, 手写笔记, 转录]
subtitle: 逐字转录，不加解释。
---

# 手写笔记 · 原文转录稿

<p class="pagemark">原图第 1 页</p>

## 性能问题

### 1. Amdahl 定律

加速比 S = <span class="frac"><span class="n">1</span><span class="d">(1−f) + <span class="frac"><span class="n">f</span><span class="d">n</span></span></span></span>

- 含义：多核计算机加速比由两因素决定
  - 可并行执行程序比例 f
  - 处理器核的数量 n
- 并行执行比例决定加速比的上限
- 当计算机处理程序适应并行执行环境，采用多核处理器才有意义

### 2. 衡量 CPU 速度

- CPI：每条指令平均花多少时钟周期
- MIPS：每秒多少百万条指令

CPI = <span class="frac"><span class="n">总时钟周期数</span><span class="d">总指令数</span></span>

主频与时钟周期是倒数关系 f = <span class="frac"><span class="n">1</span><span class="d">Tc</span></span>

- 主频：1 秒产生几个时钟周期；时钟周期：每个时钟周期多少秒
- 主频 1GHz，时钟周期 1ns
- 主频 1MHz，时钟周期 10⁻⁶ s

执行时间 T = 指令条数 Ic × 平均 CPI × 时钟周期 Tc（一拍多少秒）

MIPS = <span class="frac"><span class="n">总指令数</span><span class="d">执行时间 × 10⁶</span></span> = <span class="frac"><span class="n">Ic</span><span class="d">Ic × CPI × Tc × 10⁶</span></span>
= <span class="frac"><span class="n">f</span><span class="d">CPI × 10⁶</span></span>

<p class="pagemark">原图第 2 页</p>

## 指令执行与中断

指令/数据存到内存里，CPU 通过地址取指/数据

- PC：存指令所在地址
- IR：指令寄存器

CPU 读 PC 取地址，去对应地址取指存到 IR，PC+1 到下一个指令地址 → 取指周期

指令周期 = 取指周期 + 执行周期

<figure class="fig">
<img src="assets/note_p2_flow.png" alt="取指 → 执行 → 检查中断 流程图" loading="lazy" />
<figcaption>取指 → 执行 → 检查中断</figcaption>
</figure>

多重中断：

- 顺序处理
- 中断嵌套：高优先级能及时处理

<p class="pagemark">原图第 3 页</p>

## 数据传输速率

1 字节 8 位

带宽：每秒搬多少字节 = 每次搬多少字节（<span class="frac"><span class="n">总线宽度</span><span class="d">8</span></span>）× 每秒几次（工作频率）

工作频率：每秒发几次数据传输

时钟频率：每秒几个时钟周期

工作频率 = 时钟频率 × 每时钟周期搬运几次

数据总线：总线宽度 32 位：一次搬 32 个二进制位

地址总线：n 位地址编出 2ⁿ 个存储单元

- 32 位地址总线 2³² = 4G 个存储单元
- 默认为字节编址是 4GB，若按 32 位字编址是 4G×4B = 16GB

字长：CPU 一次运算处理几位

- 32 位：一字是 4B
- 64 位：一字是 8B

地址容量换算

- 2¹⁰ = 1K
- 2²⁰ = 1M
- 2³⁰ = 1G

<p class="pagemark">原图第 4 页</p>

## CPU 平均存取时间公式

T = H × T1 + (1−H) × (T1+T2)

- H：命中率
- T1：访问一次 cache 时间
- T2：访问主存时间

## cache 映射

- 直接映射
- 全相联映射
- 组相联

缓存太小，装不下整个内存，所以作映射

缓存一行对应主存一块，缓存行同一时刻只能存一块，cache 与内存之间以块为搬运单位

### 1）直接映射

- 每个内存块都有一个固定对应的 cache 行
- 对应 cache 行号 = 所在内存块号 mod cache 行数
- 由 Tag 确定当前是第几轮的块

内存地址 = Tag（标志位）+ 行号 + 块内地址

内存容量 2ⁿ，内存地址位数 n

<p class="pagemark">原图第 5 页</p>

CPU 发出地址，先去 cache 找，行号定位，比 Tag

Tag 一样就取对应字节，取哪个字节看块内地址

如果命中再去访问主存

- 块内地址：行内/块内有 2ⁿ 个字节，n 位块内地址
- 行号：cache 有 2ⁿ 行，需要 n 位地址
  - cache 容量 = cache 行数 × cache 每行容量
- Tag：内存地址位数 − 块内地址 − 行号

### 全相联映射

- 内存任意一块，可放到缓存任意一行 ∴ 无行号
- 内存地址 = Tag（标志位）+ 块内地址
- Tag = 内存地址 − 块内地址

### 组相联映射

- 把缓存分成若干组，每组 k 行，为 k 路组相联
- 块固定映射到某个组，但组内可放任意一行
- 组数 = <span class="frac"><span class="n">缓存总行数</span><span class="d">K 路</span></span>
- 组数有 2ⁿ，组号地址 n 位
- 内存地址 = Tag（标志位）+ 组号 + 块内地址
- Tag = 内存地址 − 块内地址 − 组号

<p class="pagemark">原图第 6 页</p>

## 磁盘

磁道：盘面上同心圆环

扇区：磁道沿半径方向切成的圆弧段
是存取的最小单位

柱面：所有盘面上同一半径位置的那组磁道集合

- 一个磁盘有几个盘面，一个柱面就有几个磁道
- 柱面容量 = 磁道数 × 磁道容量
- 盘面的磁道数 = 磁盘柱面总数

寻道时间：磁头移动到目标磁道时间

旋转延迟：等待目标扇区旋转到磁头下方的时间，平均半圈

由转速求旋转延迟

- rpm：每分钟转几圈
- 3600 rpm = 60 转/s，转一圈 <span class="frac"><span class="n">1</span><span class="d">60</span></span> s = 16.67ms
- 旋转延迟：转半圈时间

由转速看真正读取时间：

- 转一圈正好读一个磁道
- 一个磁道：转一圈时间
- 读一个扇区：转一圈时间 × 扇区占比

读取时间 = 寻道时间 + 旋转延迟 + 真正读取时间

平均存取时间 = 寻道 + 旋转延迟

<p class="pagemark">原图第 7 页</p>

## 柱面组织与 I/O

按照柱面组织数据，存储到磁盘上

- n 个柱面相邻来减少存取时间
- 因为相邻柱面只需道间切换，不需重新寻道
- 柱面统一寻道，但磁头一圈一圈读

### 突发传送率

突发传送率：不考虑寻道和旋转延迟时间

- = <span class="frac"><span class="n">磁道容量</span><span class="d">转一圈时间</span></span>
- = <span class="frac"><span class="n">扇区数 × 扇区容量</span><span class="d">转一圈时间</span></span>

### I/O 模块五大功能

- ① 控制与定时：协调 CPU 与外设速度差异
- ② 处理器通信：I/O 与 CPU/主存通信
- ③ 设备通信：I/O 与外设通信
- ④ 数据缓冲：解决 CPU 长时间等待
- ⑤ 错误检测

### 三种 I/O 技术

| 技术 | 说明 |
| --- | --- |
| 程序查询 | 数据从设备到内存，全程占 CPU |
| 中断 | 外设就绪发中断，还是由 CPU 搬数据 |
| DMA | DMA 做数据搬运，占用 CPU 最小 |

### DMA 周期窃取

DMA 周期窃取：CPU 初始化 DMA，DMA 向 CPU 请求总线，CPU 完成当前总线周期让出总线使用权，DMA 占用总线搬数据

<p class="pagemark">原图第 8 页</p>

## 虚拟地址转换成主存物理地址

虚拟地址 = 虚页号 + 页内偏移

确定虚页号后通过页表，将虚页号映射为页帧号

将页帧号与页内偏移组合为物理地址

### 页面大小

- 虚页号 = <span class="frac"><span class="n">虚拟地址</span><span class="d">页面大小</span></span> 取商
- 页内偏移 = <span class="frac"><span class="n">虚拟地址</span><span class="d">页面大小</span></span> 取余

### 有效位

- valid bit = 1　虚拟页在主存
- valid bit = 0　虚拟页不在内存

查表，有效位 = 1，查虚页号对应的页帧号

物理地址 = 页帧号 × 页面大小 + 页内偏移

- 当进程页帧没占满，新页面 → 空闲帧即可，不用置换算法
- 若占满，再置换算法淘汰

### 置换算法 NRU

- 访问位 R
  - R = 1　最近被访问过
  - R = 0　未被访问过
- 修改位 m
  - m = 1　页面被修改过
  - m = 0　未被修改

淘汰顺序：R=0,m=0 > R=0,m=1 > R=1,m=0 > R=1,m=1
