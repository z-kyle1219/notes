---
title: list
tags: [Python, 列表, 容器]
subtitle: Python 基础 · 增删改查与浅拷贝
---

# list

批量处理一组关联数据：列表，元组，字典，集合

list本质是一个类，创建的每一个列表都是这个list类的一个实例对象，append,sort,等就是list定义好的内置方法

## 列表 List[]：元素可以重复

有序（可用下标访问），可变(创建后可修改，增删元素，动态扩容)，可存储任意类型元素(str,int ,float，bool)的容器

增删改查，切片，遍历，排序与反转

## 创建：两种方式

其中list()传入的参数必须是可迭代对象，字符串，元组，集合，range等，它会把可迭代对象拆开逐个元素放进新列表

```python
list("hello")
```

## 访问 / 索引

第一个索引，负索引，索引越界IndexError

## 切片 Slice

取一段子列表，注明是谁的切片

开头，结尾，步长

```python
numbers[1:3]    # 从下标 1 开始，取到下标 3 之前，左闭右开
nums[::2]       # 从头到尾，步长为2
```

默认会创建一个新的列表，而不会修改原列表

## 新增

- `append(x)`，在末尾添加单个元素，列表嵌套
- `extend(list)`，在末尾添加多个元素，可用来拼接列表
- `insert(i, x)`，在指定位置插入

## 删除

- `remove(x)` 删除第一个匹配的值  按值删除
- `pop(i)` 按索引删除并返回该值  `pop()`删除并返回最后一个元素  按索引删除

```python
fruits = ["apple", "banana", "orange"]
x = fruits.pop()
print(fruits.pop())
print(fruits)
```

- `clear()` 清空列表
- `del fruits[0]` 按索引删除，无返回值

## 修改

直接索引替换单元素或者切片批量修改

## 查找与判断

不会修改原列表

- `index("cherry")` ，返回第一个匹配的索引
- `count("apple")` ，统计出现次数

## 排序与反转

- `sort()`，原地排序，会修改原列表，数字排序，字符串不变，默认升序
- `print(num.sort())`  ##None
- `num.sort(reverse=True)`降序
- `nums.reverse()`  原地反转顺序
- `new_list = sorted(nums)`  sorted不修改原列表，返回一个排序后新列表

## 浅拷贝陷阱

外层容器复制一份，内部对象只复制“引用”，不会把内部对象重新复制一份

只不过 int等 是不可变的，感受不到共享引用带来的问题

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)                     # a和b指向内存中同一列表对象
```

如何不修改原列表？ 但切片和copy都是浅拷贝

### 列表切片（元组切片同理）

```python
a = [1, 2, 3]
b = a[:]
b.append(4)
print(a)
print(b)
```

### 使用 .copy()

```python
b = a.copy()
```

```python
tom = (3, [7])
w = tom[::1]
x, y = w
y.append(8)      ##[7,8]
print(tom)
print(w)    ##输出一致
```

## 遍历列表

使用`for...in...`结构，从列表中按顺序一次取出元素，赋值给变量

设计思维，区分于`for (int i = 0; i < len; i++)`，不暴露也不考虑索引，直接访问并拿出元素，避免索引越界错误

## 列表推导式

```python
squares = []
for x in range(5):
    squares.append(x**2)
print(squares)
```

进阶：

```python
squares = [x ** 2 for x in range(5)]
evens = [x for x in range(10) if x % 2 == 0]
```

## If 与列表结合

空列表是假，非空列表是真

同理非空字符串是真，空字符串是假

`if ... in ...`用来判断元素在不在列表中

in是 Python 的成员运算符，用来判断某个元素是否存在于一个容器里，返回值是True / False
