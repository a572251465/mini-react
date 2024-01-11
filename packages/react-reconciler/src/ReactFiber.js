import { NoFlags } from "react-reconciler/src/ReactFiberFlags";
import {
  ContextConsumer,
  ContextProvider,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "react-reconciler/src/ReactWorkTags";
import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE } from "shared/ReactSymbols";

/**
 * 用来构建Fiber node 元素
 *
 * @author lihh
 * @param tag 标签
 * @param key 表示唯一的key
 * @param pendingProps 属性
 * @constructor
 */
export function FiberNode(tag, key, pendingProps) {
  // Instance
  // 标签
  this.tag = tag;
  // 唯一的key
  this.key = key;
  // 元素类型
  this.elementType = null;
  this.type = null;
  // 对应的 dom元素
  this.stateNode = null;
  this.pendingProps = pendingProps;

  // Fiber
  // 父fiber
  this.return = null;
  // 儿子fiber
  this.child = null;
  // 兄弟fiber
  this.sibling = null;
  // 索引
  this.index = 0;
  // 表示需要删除的节点
  this.deletions = null;

  // 表示ref 引用
  this.ref = null;
  this.refCleanup = null;

  // Effects
  this.flags = NoFlags;
  this.subTreeFlags = NoFlags;

  // 属性
  this.memoizedProps = null;
  // 更新队列
  this.updateQueue = null;
  // 状态
  this.memoizedState = null;
  // 一对一 映射的Fiber
  this.alternate = null;
}

/**
 * 创建真正的fiber 节点
 *
 * @author lihh
 * @return {FiberNode} fiber 元素
 */
function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, key, pendingProps);
}

/**
 * 创建host root fiber 是控制各种属性的
 *
 * @author lihh
 * @param tag 传递的标签
 */
export function createHostRootFiber(tag) {
  return createFiber(HostRoot, null, null);
}

/**
 * 创建工作的进程
 *
 * @author lihh
 * @param current 表示fiber
 * @param pendingProps 传递的属性
 */
export function createWorkInProgress(current, pendingProps) {
  // 拿到当前fiber 的候补fiber （这是一种双缓存机制，两个节点 交替渲染以及展示）
  let workInProgress = current.alternate;
  // 判断候补的 workInProgress 是否为null
  if (workInProgress == null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);

    // 创建候补 节点的时候，复用一些老节点的属性
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    // 此时新旧 工作进程 相互指向
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subTreeFlags = NoFlags;
  }

  workInProgress.flags = current.flags;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  // 赋值一些特殊的属性
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}

/**
 * 通过类型 以及属性创建fiber
 *
 * @author lihh
 * @param type 标签类型
 * @param key 标签key 此key表示唯一的key 用来做dom diff
 * @param pendingProps 需要添加的属性
 */
export function createFiberFromTypeAndProps(type, key, pendingProps) {
  // 设置初期组件状态
  let fiberTag = IndeterminateComponent;

  // 判断是否是原生标签
  if (typeof type === "string") {
    fiberTag = HostComponent;
  } else if (type !== null && typeof type === "object") {
    switch (type.$$typeof) {
      case REACT_PROVIDER_TYPE:
        fiberTag = ContextProvider;
        break;
      case REACT_CONTEXT_TYPE:
        fiberTag = ContextConsumer;
        break;
    }
  }
  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.type = type;
  return fiber;
}

/**
 * 通过element 创建fiber
 *
 * @author lihh
 * @param element 元素
 */
export function createFiberFromElement(element) {
  const { type, key, props } = element;
  return createFiberFromTypeAndProps(type, key, props);
}

/**
 * 通过text 创建fiber
 *
 * @author lihh
 * @param content text内容
 */
export function createFiberFromText(content) {
  return createFiber(HostText, content, null);
}
