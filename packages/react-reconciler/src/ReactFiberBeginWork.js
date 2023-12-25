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
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";

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
 * @param renderLanes 渲染的赛道
 */
function updateHostRoot(current, workInProgress, renderLanes) {
  // 未生效的属性
  const nextProps = workInProgress.pendingProps;
  // 克隆更新队列
  cloneUpdateQueue(current, workInProgress);
  // 处理更新队列
  processUpdateQueue(workInProgress, nextProps, renderLanes);

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
  if (isDirectTextChild) nextChildren = null;

  // 再次解析子children
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 挂载 未确定的组件
 *
 * @author lihh
 * @param _current old fiber
 * @param workInProgress new fiber
 * @param Component 函数组件
 */
function mountIndeterminateComponent(_current, workInProgress, Component) {
  const props = workInProgress.pendingProps;
  // 拿到虚拟节点
  const children = renderWithHooks(null, workInProgress, Component, props);
  // 标识是函数组件
  workInProgress.tag = FunctionComponent;

  reconcileChildren(null, workInProgress, children);
  return workInProgress.child;
}

/**
 * 更新函数组件
 *
 * @author lihh
 * @param current odl fiber
 * @param workInProgress new fiber
 * @param Component 函数组件
 * @param nextProps 新的参数
 */
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
) {
  // 拿到新的参数 重新执行，拿到新的虚拟dom
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
  );

  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 开始渲染工作
 *
 * @author lihh
 * @param current old root fiber
 * @param workInProgress new root fiber
 * @param renderLanes 表示渲染 赛道
 */
export function beginWork(current, workInProgress, renderLanes) {
  const tag = workInProgress.tag;

  // 渲染的时候 判断是何种标签
  switch (tag) {
    // 可能是函数组件 或是 类组件
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes,
      );
    case LazyComponent: {
      return null;
    }
    case ClassComponent: {
      return null;
    }
    case FunctionComponent: {
      // 针对函数 其函数就是type
      const Component = workInProgress.type;
      // 此参数 可以解析出 函数组件的参数
      const resolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
  }

  return null;
}
