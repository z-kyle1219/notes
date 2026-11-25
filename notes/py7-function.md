---
title: 函数
tags: [Python, 函数]
subtitle: Python 基础 · 参数与返回值
---

# 函数

## 函数：给一段逻辑起名字

函数：给一段逻辑起名字，规定输入，规定输出，封装实现细节

三个核心：输入，处理，输出

```python
def calculate_price(price, count):
    return price * count
calculate_price(100, 3)    ##函数调用用来处理具体事务
```

## 语法

```python
def 函数名(参数):
    函数体
    return 返回值
```

## 形参与实参

定义是形参，调用是实参

## 默认参数

默认参数是在函数定义时给某个形参指定一个默认值；调用函数时，如果这个参数没有传入实参，就使用这个默认值

```python
def connect_database(host, port=5432):
    ...
```

## 关键字参数

在调用函数时，明确写出实参要传给哪个形参，相比于位置参数按位置顺序传参，可读性更高

```python
create_user(
    name="Tom",
    age=18,
    email="tom@example.com"
)
```

## return 与多值返回

元组解包+函数返回值 可返回多个值
