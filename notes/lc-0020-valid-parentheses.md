---
title: 有效的括号
difficulty: easy
status: passed
tags: [栈, 字符串]
subtitle: LeetCode 20 · 栈的第一道经典题
---

# 有效的括号

## 题目

给定只包含 `(`、`)`、`{`、`}`、`[`、`]` 的字符串 `s`，判断括号是否有效匹配。

有效的条件：左括号必须用**相同类型**的右括号闭合，且必须**按正确顺序**闭合。

```text
"()[]{}"  → true
"([)]"    → false      // 顺序错
"(]"      → false      // 类型错
```

## 思路

括号匹配的天然结构就是**栈**：遇到左括号压栈，遇到右括号就弹出栈顶看是否配对。

`"([)]"` 为什么错？走到 `)` 时栈顶是 `[`，类型不符 → 直接 false。栈保证了「最近打开的必须先关闭」。

## 代码

```cpp
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;          // 右括号先出现
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return st.empty();                             // 别忘了这一步
}
```

```python
def isValid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    st = []
    for c in s:
        if c in pairs:
            if not st or st.pop() != pairs[c]:
                return False
        else:
            st.append(c)
    return not st
```

时间 O(n)，空间 O(n)。

## 三个必踩的坑

| 坑 | 反例 | 修法 |
| --- | --- | --- |
| 忘了判栈空 | `"]"` | 弹出前 `if (st.empty()) return false` |
| 循环结束后忘了查栈 | `"["` | 最后 `return st.empty()` |
| 只想用计数法 | `"([)]"` 会误判 | 计数法只能处理单一类型括号 |

最后一条值得多说一句：如果只有一种括号，确实可以用计数器代替栈。**一出现多种括号，计数法立刻失效**，因为丢失了顺序信息。

## 一句话记住

> 括号题 = 栈。压左弹右，弹的时候比对，最后看空不空。
