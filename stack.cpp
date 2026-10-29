
#include <iostream>
#include <cassert>
using namespace std;

class MyStack {
private:
    int max=1000;
    int data[max];  // 存储栈中元素的普通数组
    int topIndex;    // 记录栈顶元素的下标

public:
    // 初始化栈
    MyStack() {
        topIndex = 0;
    }

    // 将元素压入栈顶
    void push(int value) {
        // TODO 1：补全算法
        if(topIndex==max-1){
            return -1;
        }
        data[topIndex]=value;
        topIndex++;


    }

    // 删除栈顶元素
    void pop() {
        // TODO 2：补全算法
        if(topIndex==0){
            return -1;
        }
         topIndex--;

    }

    // 返回栈顶元素，不删除
    int top() {
        // TODO 3：补全算法
        return data[topIndex];

    }

    // 判断栈是否为空
    bool empty() {
        // TODO 4：补全算法
        if(topIndex==0){
            return true;
        }

    }
};

int main() {
    MyStack s;

    // 测试 1：初始状态为空
    assert(s.empty() == true);

    // 测试 2：压入一个元素
    s.push(10);
    assert(s.empty() == false);
    assert(s.top() == 10);

    // 测试 3：连续压入
    s.push(20);
    s.push(30);
    assert(s.top() == 30);

    // 测试 4：弹出栈顶
    s.pop();
    assert(s.top() == 20);

    // 测试 5：继续弹出
    s.pop();
    assert(s.top() == 10);

    // 测试 6：弹出最后一个元素
    s.pop();
    assert(s.empty() == true);

    cout << "All tests passed!" << endl;
    return 0;
}
