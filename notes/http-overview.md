---
title: HTTP协议
tags: [HTTP, 网络, 协议]
subtitle: HTTP · 一次请求，一次响应
---

# HTTP协议

HTTP协议是客户端和服务端之间传输数据的一套约定。只规定报文格式，不提供任何内置函数/方法

特点是：

- request-response，即客户端发请求，服务器回响应
- 无状态，即每次请求相互独立
- Headers 是纯文本，key-value 格式

## 一次交互

一次HTTP交互，就是一份请求，一份响应

客户端发出 Request，服务端收到请求后处理，服务端响应 Response

## 三段结构

| 都包含 | Request / Response |
| --- | --- |
| 起始行：说明要干啥/结果如何 | 请求行 / 状态行 |
| 头部 Header：附带元信息 | 请求头 / 响应头 |
| 正文 Body：实际数据 | 请求体 / 响应体 |
