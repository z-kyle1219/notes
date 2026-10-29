---
title: 二分查找
difficulty: easy
status: passed
tags: [二分, 数组]
subtitle: LeetCode 704 · 背下这个模板，别看一个错一个
---

# 二分查找

## 题目

在**升序**数组 `nums` 中查找 `target`，存在返回下标，不存在返回 `-1`。要求 O(log n)。

```text
nums = [-1, 0, 3, 5, 9, 12], target = 9  → 4
nums = [-1, 0, 3, 5, 9, 12], target = 2  → -1
```

## 思路

每次取中间，和 `target` 比较，扔掉一半。

难点从来不是思路，而是**边界**。90% 的二分写错，都是因为区间定义前后不一致。

## 唯一推荐：左闭右闭

把搜索区间定义为 `[left, right]`，两端都是有效下标。所有判断都围绕这个定义：

```cpp
int search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;     // 闭区间 [0, n-1]
    while (left <= right) {                    // 相等时区间还有一个元素
        int mid = left + (right - left) / 2;   // 防止 (l+r) 溢出
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;   // mid 已排除
        else right = mid - 1;                          // mid 已排除
    }
    return -1;
}
```

```python
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## 三处必须对上的地方

只要有一处不匹配，就会死循环或者漏答案：

| 区间定义 | 初始 right | 循环条件 | 收缩方式 |
| --- | --- | --- | --- |
| `[left, right]` | `n - 1` | `left <= right` | `left = mid + 1` / `right = mid - 1` |
| `[left, right)` | `n` | `left < right` | `left = mid + 1` / `right = mid` |

**别混着用。** 选一种，背下来，以后的题都用它。

## 坑

- `int mid = (left + right) / 2;` 在 `left + right` 超过 `INT_MAX` 时溢出。写 `left + (right - left) / 2`。
- 循环条件写 `left < right` 配闭区间，会漏掉最后一个元素。
- 数组为空时 `right = -1`，`while (0 <= -1)` 直接不进循环，返回 `-1`，正好正确——这点可以放心。

## 进阶

二分不只能查「等不等于」：

- **查左边界**：`nums[mid] >= target` 时收右边界
- **查右边界**：`nums[mid] <= target` 时收左边界
- **二分答案**：当问题满足「单调性」（比如「至少需要多久才能完成」），可以直接对答案二分

这三条是后面中等题的钥匙，先把基础模板写熟再说。
