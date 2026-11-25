---
title: 集合
tags: [Python, 集合, 容器]
subtitle: Python 基础 · 去重、集合运算与选型
---

# 集合

## 集合 {}

可变容器，无重复无序

- 自动剔除重复元素
- 元素无固定存储顺序，无法数字索引取值

## 创建

非空集合可用 `{1,2}`，空集合必须 `set()`

## set 最重要的工业用途

- a.去重，
- b.快速判断数据是否存在，set底层使用的是哈希表

按值查找 ：list O(n)      set  O(1)

## 添加：add()

`add()`添加一个元素，添加重复元素不会报错，自动去重

## 删除：remove() 与 discard()

- `remove()`如果被删除的元素不存在，会报KeyError
- `discard()`如果被删除的元素不存在，不会报错，用来删不确定存在的元素

## 集合运算

对于A,B两个集合

- 并集：`A|B`  `A.union(B)`
- 交集：`A & B`  `A.intersection(B)`
- 差集：`A - B`  A有B没有  `A.difference(B)`

## 四容器怎么选

对于list，若经常in查询考虑用set:前提，只考虑是否存在但不考虑顺序时

- `x in list`    O(n)
- `x in set`    O(1)

总结：对于四种容器的使用，有顺序就考虑list,若不可修改就tuple,函数返回多个值也是tuple,有去重，集合运算，快速查找就set,有key ->value对应，JSON，配置就dict
