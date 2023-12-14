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

## 面试题


## 关键截图

### 1. `useReducer` Mount的过程

![useReducerMount.png](images%2FuseReducerMount.png)

## 2. `hook` 的Mount以及Update

![hookMountOrUpdate.png](images%2FhookMountOrUpdate.png)

![fiberAndHook.png](images%2FfiberAndHook.png)
