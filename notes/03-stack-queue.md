---
title: 栈与队列
tags: [栈, 队列, 数据结构]
subtitle: 第三章 · 一个后进先出，一个先进先出 —— 概念 → 代码 → 应用 → 习题
---

# 栈与队列

栈和队列是同一种东西的两个方向：**都只允许在一端动，区别只在于动的是哪一端**。栈优先服务最新的元素，队列优先服务最早的元素。理解了这一点，后面所有的实现细节都只是「怎么把这件事塞进数组或链表里」。

<nav class="kmap">
<div class="kmap-head">chapter 03 · contents</div>
<ol>
<li><a href="#s1" data-jump="s1"><span class="n">01</span><span class="s">栈 Stack</span><span class="d">LIFO / 顺序栈 / 链栈</span></a></li>
<li><a href="#s2" data-jump="s2"><span class="n">02</span><span class="s">队列 Queue</span><span class="d">FIFO / 假溢出 / 循环 / 链式</span></a></li>
<li><a href="#s3" data-jump="s3"><span class="n">03</span><span class="s">栈的四个经典应用</span><span class="d">括号 / 后缀 / 中缀转后缀 / 进制</span></a></li>
<li><a href="#s4" data-jump="s4"><span class="n">04</span><span class="s">栈与递归</span><span class="d">递归出口 / 递归关系</span></a></li>
<li><a href="#s5" data-jump="s5"><span class="n">05</span><span class="s">易错点对照</span><span class="d">数组下标 / 指针 / 边界</span></a></li>
<li><a href="#s6" data-jump="s6"><span class="n">06</span><span class="s">代码速查</span><span class="d">四个可直接背的类</span></a></li>
<li><a href="#s7" data-jump="s7"><span class="n">07</span><span class="s">习题</span><span class="d">做完回到对应小节</span></a></li>
</ol>
</nav>

## 栈 Stack：后进先出

栈是**后进先出（LIFO）**的线性结构，只允许在**栈顶**插入和删除。生活里的原型就是「应用程序的撤销功能」：最后写进去的操作最先被撤销，前面的操作要等它撤完才轮得到。

两个基本操作：

- `push()` 压入 —— 执行前要判断**栈是否满**
- `pop()` 弹出 —— 执行前要判断**栈是否空**

所有栈的题、所有栈的 bug，几乎都出在这两个判断上。

### 顺序栈：一个数组 + 一个下标

顺序栈 = 一个数组 `data` + 一个 `top`。

`top` **不是真正的指针类型，就是一个整数下标**，存的是栈顶元素在数组里的位置。栈顶 = 最后进来的那个元素。

| 约定 | 空栈 | 满栈 | 入栈 | 出栈 |
| --- | --- | --- | --- | --- |
| `top` 指向**栈顶元素** | `top == -1` | `top == MAXSIZE - 1` | 先 `top + 1`，再写数据 | 先取数据，再 `top - 1` |
| `top` 指向**栈顶的下一个空位** | `top == 0` | `top == MAXSIZE` | 先写数据，再 `top + 1` | 先 `top - 1`，再取数据 |

第一种约定写出来是这样：

```cpp
data[++top] = e;      // 前置 ++：先把 top 加 1，再用加完后的 top
```

栈顶上移一格，把 `e` 写进新的栈顶格。因为只是把值放进去，**`push` 按值传参就够**。

```cpp
e = data[top--];      // 后置 --：先用 top 现在的值，用完再减 1
```

出栈时数组里的值其实**不会消失**，只是 `top` 退了一格、这个位置从此算作「无效」。取出的关键是把值带回给调用者 —— 一个函数结束后依然存在的变量，所以 **`pop` 要用引用传参**（`void pop(ElemType &e)`）。

第二种约定（`top` 指向下一个空位）只是把「先加再写」换成了「先写再加」：

```cpp
data[top] = e;  top++;      // 入栈
e = data[--top];            // 出栈
```

> 考试特别喜欢在这里换约定出题：看到 `top == -1` 和 `top == 0` 两种写法，先确认题意用的是哪一种，再算元素个数。元素个数永远是 `top + 1`（第一种）或 `top`（第二种）。

### 链栈：本质就是单链表

链栈别想复杂，**它就是一条单链表**，只不过插入删除只发生在表头：

- **带头节点**（头节点不存数据）
- 栈顶放在链表头部 —— 因为链表头部插入和删除都是 `O(1)`
- `top` 指向头节点，`top->next` 才是真正的栈顶

入栈 = 把新节点插到头节点之后：

```cpp
s->next = top->next;    // 新节点先指向原来的第一个节点（原栈顶）
top->next = s;          // 头节点再指向新节点（新栈顶）
```

出栈 = 摘掉头节点后面的那个节点并释放：

```cpp
p = top->next;          // p 指向栈顶
top->next = p->next;    // 头节点的 next 指向栈顶的下一个节点
delete p;               // 释放原栈顶
```

**顺序栈和链栈的区别**只有一句：顺序栈有容量上限、可能满；链栈理论上不会满，除非内存用完。所以链栈的 `push` 只需要考虑「申请节点失败」，不用判满。

## 队列 Queue：先进先出

队列是**先进先出（FIFO）**的线性结构：一端插入（队尾 `rear`），另一端删除（队头 `front`）。

- `enqueue()` 入队 —— 在队尾添加元素，判断**队列是否已满**
- `dequeue()` 出队 —— 从队头移除元素，判断**队列是否为空**

### A. 顺序队列

一个数组 + 两个下标 `front`、`rear`。关键一点：**`rear` 不指向当前队尾元素，而是指向队尾的下一个空位置**。

```cpp
q[rear] = x;  rear++;      // 入队：先写进空位，再让 rear 后移
front++;                   // 出队：只把 front 往后挪一格
```

出队**并没有真的删除数组里的数据**，只是让 `front` 向后移动了一格。队列当前有效的数据永远是 `front` 到 `rear - 1` 这一段。

### 假溢出：普通顺序队列的致命缺点

数组容量 5，依次入队 `10 20 30 40 50`，再出队两个元素。

前两个位置明明空出来了，但 `rear` 已经等于 5，此时再 `enqueue(60)`，代码依旧会报「队列已满」。这种「前面有位置、后面越界」的满，叫**假溢出**。

原因很简单：`front` 和 `rear` 只会往后走，不会回头。

### 循环队列：让数组首尾相连

解决办法是让数组首尾接成一个环：队尾走到末尾时，如果前面有空位，就绕回开头继续存。绕回去靠**取余**：

```cpp
rear  = (rear  + 1) % MAX;     // 入队，% MAX 把下标永远限制在 0..MAX-1
front = (front + 1) % MAX;     // 出队
```

取余实现了「下标循环移动」，同时没有破坏先进先出：`front` 永远追着 `rear` 跑。

### 判空和判满为什么冲突

循环队列有个绕不过去的麻烦：**队空和队满都是 `front == rear`**。

- 队空：`front == rear`，两个下标撞在一起
- 队满：`rear` 走完了整圈又回到 `front`，也是 `front == rear`

同样一个条件，两种含义，机器分不出来。两种解法：

| 办法 | 做法 | 代价 |
| --- | --- | --- |
| 加计数器 | 额外维护 `count`，`count == 0` 空、`count == MAX` 满 | 多一个变量、每次进出都要加减 |
| 牺牲一个单元 | 永远留一个空位不给数据，`(rear + 1) % MAX == front` 就算满 | 容量为 `n` 的数组最多存 `n - 1` 个元素 |

第二种是教材默认写法：**在具有 `n` 个单元的循环队列中，队满时共有 `n - 1` 个元素**。

```cpp
bool isFull() {
    return (rear + 1) % MAX == front;
}
bool isEmpty() {
    return front == rear;
}
```

<aside class="callout warn">
<p class="t">坑</p>
<p>「牺牲一个单元」时，判满条件不是 <code>rear == front</code>，而是 <code>(rear + 1) % MAX == front</code>。写反了，队列会在还剩一个空位时就被判成满，或者永远判不满。</p>
</aside>

### B. 链式队列

其实很简单：**带头节点的单链表**，队头在头部（出队 `O(1)`），队尾在尾部（要 `rear` 指针才能 `O(1)` 入队）。

- 空队列时：`front` 和 `rear` **都指向头节点**
- `front` 指向头节点，`rear` 指向最后一个数据节点

```cpp
// 入队：rear 动
rear->next = s;
rear = s;

// 出队：front 动
p = front->next;
front->next = p->next;
delete p;
```

入队就是「原队尾节点指向新节点，`rear` 移动到新节点」。出队是摘掉头节点后面的第一个数据节点。

<aside class="callout warn">
<p class="t">坑</p>
<p>队列里只剩一个元素时，出队后 <code>rear</code> 还指着刚被 <code>delete</code> 掉的节点 —— 它变成了野指针，下次入队就写到已释放的内存里。必须兜底。</p>
</aside>

```cpp
// 出队后补一句
if (front->next == NULL) {
    rear = front;        // 队空，rear 退回指向头节点
}
```

### 只允许用两个栈实现队列

经典设计题，思路是「进的时候压 `s1`，出的时候从 `s2` 取，`s2` 空了才把 `s1` 整个倒过去」。倒一次就把顺序翻了回来，所以整体仍然是先进先出。

```cpp
void push(int x) { s1.push(x); }

int pop() {
    if (s2.empty()) {
        while (!s1.empty()) { s2.push(s1.top()); s1.pop(); }
    }
    int v = s2.top(); s2.pop();
    return v;
}
```

**每个元素最多被搬两次**（进 `s2` 一次、出队一次），所以均摊 `O(1)`，不是 `O(n)`。

## 栈的四个经典应用

栈的价值在于「**后出现的先处理**」：后出现的左括号先匹配、后出现的数先配运算符、后出现的运算符先算。凡是满足这个特点的问题，都该想到栈。

### 1. 括号匹配

因为括号有**后出现的左括号必须先匹配**的特点，天然就是栈。

规则：

- 遇到左括号 → 入栈
- 遇到右括号 → 栈空则报错；栈顶与它匹配则弹出；不匹配则报错
- 循环结束 → 栈必须为空

配套需要实现：初始化、判空、判满、入栈、出栈、取栈顶。三种非法情况分别是：**右括号多余**（弹的时候栈空）、**类型不匹配**（栈顶对不上）、**左括号多余**（结束时栈不空）。

> 对应练习 → [0020 有效的括号](#/lc20)

### 2. 后缀表达式（逆波兰式）

后缀表达式里运算符写在两个操作数后面，`a + b` 写成 `a b +`。求值规则：遇到数就入栈，遇到运算符就弹出两个数计算、结果再入栈。

**顺序不能搞反：先弹出的是右操作数，后弹出的是左操作数。** 对 `-` 和 `/` 来说，弹反了结果直接错。

### 3. 中缀表达式转后缀表达式（重点）

手算的四条规则：

1. **遇到字母或数字**：直接输出到后缀表达式，**不入栈**
2. **遇到运算符**：和栈顶运算符比优先级
   - 栈顶优先级**更高或相同**：先弹出栈顶并输出，再把新运算符入栈
   - 栈顶优先级**更低**：当前运算符直接入栈
3. **遇到括号**
   - `(`：直接入栈，当作一个边界
   - `)`：不断弹出并输出运算符，直到遇到 `(`；`(` **只弹出，不输出**
4. **遍历结束**：把栈里剩下的运算符依次弹出并输出

光看规则容易糊，直接跟着推一遍就通了。下面先看讲义上的三列对照（栈 / 输入 / 后缀串同步推进），再用完整的推演表把每一步的「为什么」补上。

<figure class="fig">
<img src="屏幕截图 2026-11-05 162815.png" alt="中缀转后缀演示：A*B+C*D 转成 AB*CD*+" loading="lazy" />
<figcaption>讲义原图 · Stack → / Input / Postfix String 三列同步推进，例题 <code>A*B+C*D</code> → <code>AB*CD*+</code>，蓝色的字符是这一步被弹出或刚写入的部分</figcaption>
</figure>

`A*B+C*D` 的推演过程：

| 输入 | 栈（栈底 → 栈顶） | 后缀串 | 为什么 |
| --- | --- | --- | --- |
| `A` | 空 | `A` | 操作数，直接输出 |
| `*` | `*` | `A` | 栈空，运算符入栈 |
| `B` | `*` | `AB` | 操作数，直接输出 |
| `+` | `+` | `AB*` | 栈顶 `*` 优先级更高 → 先弹出输出，`+` 再入栈 |
| `C` | `+` | `AB*C` | 操作数，直接输出 |
| `*` | `+ *` | `AB*C` | 栈顶 `+` 优先级更低 → `*` 直接入栈 |
| `D` | `+ *` | `AB*CD` | 操作数，直接输出 |
| 结束 | 空 | `AB*CD*+` | 栈里剩余的依次弹出 |

带括号的完整例子是第二张图，题面是 `a+b*c+(d*e+f)*g`，每个格子都写了操作原因：

<figure class="fig">
<img src="屏幕截图 2026-11-05 162718.png" alt="中缀转后缀完整推演表：a+b*c+(d*e+f)*g → abc*+de*f+g*+" loading="lazy" />
<figcaption>完整推演 · <code>a+b*c+(d*e+f)*g</code> 的每一步：当前输入、栈内状态、已生成的后缀串，以及这一步为什么这么操作</figcaption>
</figure>

这张表值得逐行读完，几个关键点在表里已经标出来了：

- 走到第二个 `+` 时，栈是 `+ *`，`*` 优先级高先弹，`+` 同级也弹，然后当前 `+` 入栈 —— **同级的也要弹**，不然 `a*b+c` 会算错顺序
- 进了括号以后，`*` 压在 `(` 上面，**运算符不能越过 `(`**
- 遇到 `)` 时把括号内剩的 `+` 弹完，然后把 `(` 丢掉（`只弹出，不输出`）
- 出括号后又是 `* g`，最后把栈里剩的 `+ *` 全部弹出

最后的结果：

```text
a+b*c+(d*e+f)*g   →   abc*+de*f+g*+
```

<aside class="callout key">
<p class="t">记住</p>
<p>手动转换时只要盯住三件事：<b>输入指针走到哪</b>、<b>栈里从底到顶是什么</b>、<b>已经输出了什么</b>。考试要求「写出每一步」，就是按这三列画表。</p>
</aside>

### 4. 进制转换

十进制转八进制：**不断除以 8，记录余数，最后把余数逆序输出**。

逆序输出正是栈的拿手活 —— 除出来的余数是低位先出，直接 `push` 进栈，全部除完再一个个 `pop` 出来，顺序就正了。

```cpp
void convert(int n, int base) {
    stack<int> st;
    if (n == 0) { cout << 0; return; }
    while (n > 0) { st.push(n % base); n /= base; }
    while (!st.empty()) { cout << st.top(); st.pop(); }
}
```

同一个思路还能处理**括号匹配、表达式求值、递归改非递归**，本质都是「把需要倒序处理的东西先压进去」。

## 栈与递归

递归和栈是同一个东西的两种写法：**递归调用本身就是用系统栈压栈**，返回时弹栈。

递归必须同时满足两个条件，缺一个就写不出来：

- **递归出口**：满足条件后停止递归，直接返回
- **递归关系**：把问题转化成规模更小的同类子问题

比如求阶乘：出口是 `n == 0 || n == 1` 时返回 1，递归关系是 `f(n) = n * f(n - 1)`。栈与递归的题目大多要求「把递归改成用栈实现」，改的时候就是把递归出口写成循环条件、把递归关系写成压栈。

## 易错点对照

| 情景 | 容易写错 | 正确做法 |
| --- | --- | --- |
| 顺序栈判空 | `top == 0` | 取决于约定：`top` 指栈顶元素时是 `top == -1` |
| `pop` 的传参 | 值传递 | 值要带回调用者，必须 `引用` |
| 循环队列判满 | `rear == front` | `(rear + 1) % MAX == front` |
| 循环队列容量 | 以为能存 `n` 个 | 牺牲一个单元，最多 `n - 1` 个 |
| 链式队列出队 | 删完最后一个元素不管 `rear` | `rear` 要退回 `front`，否则野指针 |
| 后缀表达式求值 | 先弹的是左操作数 | 先弹的是右操作数 |
| 中缀转后缀遇到 `)` | 把 `(` 也输出了 | `(` 只弹出，不输出 |
| 中缀转后缀遇到同级运算符 | 直接入栈 | 同级也要先弹出栈顶 |

## 代码速查

四个结构的最小可用版本，考试和实验都能直接用。

### 顺序栈

```cpp
const int MAXSIZE = 100;

struct SqStack {
    int data[MAXSIZE];
    int top;                       // 指向栈顶元素，空栈为 -1
    SqStack() : top(-1) {}

    bool isEmpty() { return top == -1; }
    bool isFull()  { return top == MAXSIZE - 1; }

    bool push(int e) {
        if (isFull()) return false;
        data[++top] = e;           // 先加再写
        return true;
    }
    bool pop(int &e) {
        if (isEmpty()) return false;
        e = data[top--];           // 先取再减，引用带回
        return true;
    }
    int getTop() { return data[top]; }
};
```

### 链栈

```cpp
struct LNode {
    int data;
    LNode *next;
};

struct LinkStack {
    LNode *top;                    // 指向头节点，头节点不存数据
    LinkStack() {
        top = new LNode;
        top->next = nullptr;
    }
    bool isEmpty() { return top->next == nullptr; }

    void push(int e) {
        LNode *s = new LNode{e, top->next};   // 新节点指向原栈顶
        top->next = s;                        // 头节点指向新栈顶
    }
    bool pop(int &e) {
        if (isEmpty()) return false;
        LNode *p = top->next;
        e = p->data;
        top->next = p->next;
        delete p;
        return true;
    }
};
```

### 循环队列

```cpp
const int MAXQ = 100;

struct CirQueue {
    int data[MAXQ];
    int front, rear;               // rear 指向队尾的下一个空位
    CirQueue() : front(0), rear(0) {}

    bool isEmpty() { return front == rear; }
    bool isFull()  { return (rear + 1) % MAXQ == front; }   // 牺牲一个单元

    bool enqueue(int x) {
        if (isFull()) return false;
        data[rear] = x;
        rear = (rear + 1) % MAXQ;
        return true;
    }
    bool dequeue(int &x) {
        if (isEmpty()) return false;
        x = data[front];
        front = (front + 1) % MAXQ;
        return true;
    }
    int size() { return (rear - front + MAXQ) % MAXQ; }
};
```

### 链式队列

```cpp
struct QNode {
    int data;
    QNode *next;
};

struct LinkQueue {
    QNode *front, *rear;           // front 指头节点，rear 指最后一个数据节点
    LinkQueue() {
        front = rear = new QNode{0, nullptr};   // 空队列两个指针都指头节点
    }
    bool isEmpty() { return front == rear; }

    void enqueue(int x) {
        QNode *s = new QNode{x, nullptr};
        rear->next = s;
        rear = s;
    }
    bool dequeue(int &x) {
        if (isEmpty()) return false;
        QNode *p = front->next;
        x = p->data;
        front->next = p->next;
        delete p;
        if (front->next == nullptr) rear = front;   // 删空后修 rear
        return true;
    }
};
```

## 习题

题目和知识点是同一套编号体系，**看到哪一节就去做对应的题**，做不出来就回到上面那一节重看，看完再回来。

<aside class="callout">
<p class="t">本节的题怎么放</p>
<p>习题按知识点顺序接在本章后面，一篇一题，编号接着 <code>03.1</code> <code>03.2</code> 往下排；做完点这里回来对下一题，不会跳出去变成另一章。</p>
</aside>

| 编号 | 题目 | 对应知识点 | 难度 | 状态 |
| --- | --- | --- | --- | --- |
| 0020 | [有效的括号](#/lc20) | 栈 · 括号匹配 | 简单 | 已收录 |
| 03.1 | 用两个栈实现队列 | 队列 · 两个栈模拟 | 简单 | 待接入 |
| 03.2 | 循环队列设计（判空判满） | 队列 · 循环队列 | 中等 | 待接入 |
| 03.3 | 中缀表达式转后缀并求值 | 栈 · 中缀转后缀 | 中等 | 待接入 |
| 03.4 | 进制转换 / 括号匹配变体 | 栈 · 经典应用 | 简单 | 待接入 |

> 做题顺序建议：先 0020 把「压左弹右」写熟，再 03.1（两个栈互相倒）体会「倒一次就翻顺序」，然后 03.2 手写 `isFull()`，最后 03.3 把上面两张图的算法真正用代码跑一遍。
