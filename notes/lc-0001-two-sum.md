---
title: 两数之和
difficulty: easy
status: passed
tags: [哈希表, 数组]
subtitle: LeetCode 1 · 用空间换时间的第一课
---

# 两数之和

## 题目

给定一个整数数组 `nums` 和一个目标值 `target`，在数组中找出**和为目标值**的两个整数，返回它们的下标。

每种输入只会对应一个答案，同一元素不能重复使用。

```text
输入: nums = [2, 7, 11, 15], target = 9
输出: [0, 1]        // nums[0] + nums[1] = 2 + 7 = 9
```

## 思路

关键是这句话：**对每个数 `a`，我只需要知道 `target - a` 是否存在于数组里。**

于是问题从「两两配对」变成了「查一个数在不在」：

- 用数组查 → 遍历一遍，O(n) → 总体 O(n²)
- 用哈希表查 → O(1) → 总体 O(n)

这是刷题里最常见的一次思维转换：**拿空间换时间**。

## 暴力解法（先能跑，再优化）

```cpp
vector<int> twoSum(vector<int>& nums, int target) {
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) return {i, j};
        }
    }
    return {};
}
```

时间 O(n²)，空间 O(1)。n 到 10⁴ 就会超时。

## 哈希表解法（正解）

边遍历边存，**先查后存**：

```cpp
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;          // 值 -> 下标
    for (int i = 0; i < nums.size(); i++) {
        int need = target - nums[i];
        auto it = seen.find(need);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}
```

```python
def twoSum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []
```

时间 O(n)，空间 O(n)。

## 为什么能一次遍历

因为顺序不重要：当我在下标 `i` 处找 `target - nums[i]` 时，答案的**另一半一定已经出现过了**，否则它会在更后面的位置被找到。所以不需要先把整个数组装进哈希表——边查边存就够了，还顺手省掉了「同一个数被用两次」的判断。

**先查后存** 这四个字的顺序不能反。反了的话，`target = 2 * nums[i]` 的情况下会把自己配对自己。

## 坑

- 返回的是**下标**不是数值。题目没说要排序，所以**不能排序**（排序会丢原下标）。
- `nums` 里可能有重复元素，但答案唯一，所以哈希表直接覆盖旧下标没问题——因为旧下标已经在前面的循环里检查过了。
- `target` 可能是负数，别写 `target > 0` 这类想当然的剪枝。
