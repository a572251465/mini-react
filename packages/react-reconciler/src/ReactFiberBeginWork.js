import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostRoot,
  IndeterminateComponent,
  LazyComponent,
} from "react-reconciler/src/ReactWorkTags";
import {
  cloneUpdateQueue,
  processUpdateQueue,
} from "react-reconciler/src/ReactFiberClassUpdateQueue";
import {
  mountChildFibers,
  reconcileChildFibers,
} from "react-reconciler/src/ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";

/**
 * 调和 children
 *
 * @author lihh
 * @param current old root fiber
 * @param workInProgress new root fiber
 * @param nextChildren 新的子children
 */
export function reconcileChildren(current, workInProgress, nextChildren) {
  // 表示挂载元素
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    );
  }
}

/**
 * 实现更新原生组件
 *
 * @author lihh
 * @param current old root fiber
 * @param workInProgress new root fiber
 */
function updateHostRoot(current, workInProgress) {
  // 克隆更新队列
  cloneUpdateQueue(current, workInProgress);
  // 处理更新队列
  processUpdateQueue(workInProgress);

  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  // 处理子元素
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 更新原生的组件
 *
 * @author lihh
 * @param current old fiber
 * @param workInProgress new fiber 此时表示创建的子节点
 */
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress;
  // fiber中的属性，其实属性【children】代表的子元素
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;

  // 判断是否是text content
  const isDirectTextChild = shouldSetTextContent(nextProps);
  // 如果最后节点是一个text，不将其作为一个fiber孩子来处理
  /* 下面中的内容是源码的内容 */
  // We special case a direct text child of a host node. This is a common
  // case. We won't handle it as a reified child. We will instead handle
  // this in the host environment that also has access to this prop. That
  // avoids allocating another HostText fiber and traversing it.
  if (isDirectTextChild) nextChildren = nextProps.children;

  // 再次解析子children
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 开始渲染工作
 *
 * @author lihh
 * @param current old root fiber
 * @param workInProgress new root fiber
 */
export function beginWork(current, workInProgress) {
  const tag = workInProgress.tag;
  debugger;

  // 渲染的时候 判断是何种标签
  switch (tag) {
    case IndeterminateComponent: {
      return null;
    }
    case LazyComponent: {
      return null;
    }
    case ClassComponent: {
      return null;
    }
    case FunctionComponent: {
      return null;
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostRoot:
      return updateHostRoot(current, workInProgress);
  }
}