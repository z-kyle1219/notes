---
title: 字典
tags: [Python, 字典, 容器]
subtitle: Python 基础 · 键值对与安全取值
---

# 字典

## 字典 dict{}

是一组key-value的对应关系

字典键具备唯一性且必须为不可变类型，值可存放任意类型数据，字典无数字索引，仅通过键检索对应数值

字典的key必须是可哈希的，而可变对象不可哈希，可以用元组做key

给字典起名，一般情况下key是字符串要加双引号，多个键值对之间用逗号

## 取值：[] 与 .get()

字典的取值：访问字典名+key来取value

缺点：如果key不存在就直接抛异常，程序中断，KeyError

对于工业项目，配置文件存在遗漏字段或者旧版本配置，不推荐

使用字典自带的.get()方法来更安全的取值

```python
config.get("timeout")
```

`.get(key, default)`

- key 存在 → 返回对应的 value（跟 [] 一样）
- key 不存在 → 不报错，返回给的默认值（不给就返回 None）

## 嵌套字典：.get() 连写

嵌套字典，要.get()连写来逐层取值

```python
name = data2.get("data", {}).get("user", {}).get("name")
```

中间每一层的默认值都给 `{}`（空字典），而不是 None，为什么？

data user 不存在就返回`{}`，如果中间默认值返回None,会报AttributeError: 'NoneType' object has no attribute 'get'，

```python
info= {"a": {"b": {"c": 100}}}
result = info.get("a", {}).get("x", {}).get("c", "默认值")
print(result)
```

## 修改与新增

字典可以修改，新增：通过字典名key修改，新增

key存在就修改，不存在就新增

## 删除

字典的删除：`del 字典名+key`

或者字典名.pop（key）删除指定 key，并且把对应的 value 返回出来

## 与列表的区别

- 列表通过下标找元素 `index → value`
- 列表按下标访问 O(1)，列表按值搜索 O(n)
- 字典通过key找value `key → value` 时间复杂度是O(1)
- 字典没有下标

## 怎么判断 key 是否存在

`"name" in student`

key  in 字典名

## 遍历

- key: `for key in student` `print(key)` 或者 `print(student.keys())`
- value: `print(student.values())`
- `for key, value in student.items():print(key, value)`

.items:把字典里的每一个 "key → value" 对拿出来

## 变量是标签，key 是字符串

```python
age = "score"
student = {"score": 95, "age": 18}
print(student[age])  ##95
```

佐证变量是标签和key是字符串
