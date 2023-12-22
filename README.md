# micro-react

> 一比一实现 react18.2的源码，尽可能的目录结构跟 源码中保持一致

## Task

- [x] 实现 JSX 转换的功能
- [x] 实现 RootFiber 构建
- [x] 实现 beginWork 相关的内容（将所有的节点转换为fiber）
- [x] 实现 commitRoot主要逻辑，将Fiber节点渲染到页面上
- [x] 实现 兼容函数式组件
- [x] 实现 合成事件
- [x] 实现 useReducer 挂载
- [x] 实现 useReducer 更新 以及commit
- [x] 实现 useState 逻辑
- [x] 实现 DOM DIFF 逻辑
- [x] 实现 useEffect 逻辑
- [x] 实现 useLayoutEffect逻辑
- [x] 实现 异步调度
- [ ] 实现 lane模型初次渲染
- [ ] 实现 并发渲染
- [ ] 实现 useRef 逻辑
- [ ] 实现 useContext 逻辑
- [ ] 实现 类组件的逻辑

## 面试题

## 关键截图

### 1. `useReducer` Mount的过程

![useReducerMount.png](images%2FuseReducerMount.png)

## 2. `hook` 的Mount以及Update

![hookMountOrUpdate.png](images%2FhookMountOrUpdate.png)

![fiberAndHook.png](images%2FfiberAndHook.png)

## 3. diff 比较核心关键点

> - 第一轮比较 A 和 A，相同可以复用，更新，然后比较 B 和 C，key 不同直接跳出第一个循环
> - 把剩下 oldFiber 的放入 existingChildren 这个 map 中 然后声明一个lastPlacedIndex变量，表示不需要移动的老节点的索引
>   继续循环剩下的虚拟 DOM 节点
> - 如果能在 map 中找到相同 key 相同 type 的节点则可以复用老 fiber,并把此老 fiber 从 map 中删除
> - 如果能在 map 中找不到相同 key 相同 type 的节点则创建新的 fiber
> - 如果是复用老的 fiber,则判断老 fiber 的索引是否小于 lastPlacedIndex，如果是要移动老 fiber，不变
> - 如果是复用老的 fiber,则判断老 fiber 的索引是否小于 lastPlacedIndex，如果否则更新 lastPlacedIndex 为老 fiber 的 index
> - 把所有的 map 中剩下的 fiber 全部标记为删除

![diff-dom.png](images%2Fdiff-dom.png)

## 4. effect 核心结构

![effect.png](images%2Feffect.png)

> 1. 【currentlyRenderingFiber】 代表着执行函数的fiber。函数中可能包含多个effect
> 2. 在fiber中 使用字段【updateQueue】连接着一个 effect循环链表
> 3. 每个函数中的effect， 是通过字段【memoizedState】来连接的单项链表

## 5. useLayoutEffect 核心

> - 其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect
> - useEffect不会阻塞浏览器渲染，而 useLayoutEffect 会浏览器渲染
> - useEffect会在浏览器渲染结束后执行,useLayoutEffect 则是在 DOM 更新完成后,浏览器绘制之前执行

![useLayoutEffect.png](images%2FuseLayoutEffect.png)
