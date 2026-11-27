---
title: Request & Response
tags: [HTTP, 请求, 响应]
subtitle: HTTP 协议 · 请求与响应的三段结构
---

# Request & Response

## Request

包含三部分：请求行，请求头，请求体

### 请求行

如 `GET http://localhost:3000/health`

请求方法 + 请求路径（协议 + 服务器 + 端口(base_url)，url 参数）

`localhost` = `127.0.0.1`

### 请求方法

- **GET** 拿数据，且 Query 参数直接拼接在 URL 路径后面，用于筛选、查询、分页、排序，通常没有 body
- **POST** 提交，一般没有 query 参数，将数据放在请求体（Request Body）中发送
- **PUT** 整体替换
- **PATCH** 局部修改
- **DELETE** 删除

### URL 参数

1. Path Parameter：`GET /users/1001`，URL 接路径
2. Query Parameter：`GET /users?page=2&limit=20`

其中 `?` 表示 Query 参数开始，`&` 是参数之间分隔符

### 请求头 Headers

- `Content-Type` 用于说明 Body 的数据格式
  - `application/json` 说明 body 是 JSON，服务端会按照 json 解析
  - `image/png` 说明 body 是 png 图片的二进制数据
- `Content-Length` 标识 Body 的字节长度，让接收方知道多少才算完
- `Authorization` `Bearer <token>` 携带身份凭证
- `Host` 访问哪个域名
- `User-Agent` 客户端是什么
- `Accept` 我能接收什么格式
- `Cookie` 客户端自动携带的本地状态凭证

### 请求体 Body

一般放 JSON

## Response

包含三部分：状态行，响应头，响应体

### 状态行

包含状态码 `200 OK` 的那行

状态码反映请求结果如何

- `200 OK`：成功
- `201 Created`：创建成功
- `400 Bad Request`：请求有问题
- `404 Not Found`：路径不存在
- `500 Internal Server Error`：服务端出错

### 响应头 Headers

- `Content-Type` 用于说明 Body 的数据格式
  - `application/json` 说明 body 是 JSON，服务端会按照 json 解析
  - `image/png` 说明 body 是 png 图片的二进制数据
- `Content-Length` 标识 Body 的字节长度，让接收方知道多少才算完
- `Set-Cookie`：让客户端保存新 Cookie

### 响应体 Body

如 JSON 数据
