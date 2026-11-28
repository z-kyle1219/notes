---
title: 运算符与流程控制
tags: [Python, 运算符, 流程控制]
subtitle: Python 基础 · 判断与循环
---

# 运算符与流程控制

## 基本运算

算数，赋值，比较，逻辑

## 算术运算符

`+  -  * / //  % **`

## 赋值运算符

`+=  -=`

## 比较运算符

`==`  `!=`  `>` `>=` `<` `<=`运算后返回bool值，一般用于条件判断

## 逻辑运算符

`and or not` 一般连接多个布尔判定条件，输出最终bool值

```python
sum = x > y and x < 0
x = 10
y = 2
if not x > y and x < 0:
    print("x is not greater than y and x is less than 0")
```

## 流程控制

选择能力与处理重复工作

## if 条件判定

关键是得到True或False

某个条件满足后，整个 if / elif / else 结构结束

py非常注重缩进，缩进后的代码才属于if控制流

```python
if x > 5:
    print("A")
elif x > 8:
    print("B")
```

## 循环

1. 遍历列表  for
2. range()内置函数，按规则生成一串连续的整数序列
3. while语句重复执行缩进代码块，直到判定条件是False  ,只知道结束条件时使用while
4. for循环适合遍历序列，列表，可迭代容器，把一批数据一个个处理

## range()

range(stop) 从0开始到stop - 1 结束。左闭右开，同列表切片

range(start, stop)

range(start, stop, step)

类似列表的切片

## while

必须写循环终止逻辑，否则循环无限卡死，循环进度要自己控制

## for

for 会自动从可迭代对象中依次取出元素，自动控制循环进度

for格式：for循环变量in序列(可迭代对象)

```python
for i in range(3):
    for j in range(4):
        print(i, j)
```

## continue 与 break

循环的控制，遇到特殊要求，比如提前结束循环时使用continue,break

continue立刻终止本次迭代，直接进入下一轮循环

break直接跳出当前循环，循环终止

```python
for i in range(1, 11):
    if i % 2 == 0:
        continue
    print(i)
```

## print 的换行

print函数：每次调用print函数会默认自带换行符，解决办法： print(fruit, end=' ')
