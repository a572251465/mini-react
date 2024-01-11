import {
  ContextConsumer,
  ContextProvider,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "react-reconciler/src/ReactWorkTags";
import { NoFlags, Ref, Update } from "react-reconciler/src/ReactFiberFlags";
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { popProvider } from "react-reconciler/src/ReactFiberNewContext";

/**
 * 标记 更新的fiber
 *
 * @author lihh
 * @param workInProgress 被标记的fiber
 */
function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}

/**
 * 用来标记是否包含属性【ref】
 *
 * @author lihh
 * @param workInProgress 工作的fiber
 */
function markRef(workInProgress) {
  workInProgress.flags |= Ref;
}

/**
 * 表示完成的fiber 进行属性冒泡
 *
 * @author lihh
 * @param completedWork 表示已经完成的fiber
 */
function bubbleProperties(completedWork) {
  // 默认子节点的状态
  let subTreeFlags = NoFlags;
  // 表示子节点
  let child = completedWork.child;

  // 遍历所有的子节点
  while (child !== null) {
    // 儿子的状态
    subTreeFlags |= child.subTreeFlags;
    // 表示自身的状态
    subTreeFlags |= child.flags;

    child = child.sibling;
  }
  // 合并自身的状态
  completedWork.subTreeFlags |= subTreeFlags;
}

/**
 * 添加所有的子元素到自己身上
 *
 * @author lihh
 * @param parent 表示父类的html
 * @param workInProgress 当前执行的fiber
 */
function appendAllChildren(parent, workInProgress) {
  // 从顶级fiber 自上而下开始寻找
  let node = workInProgress.child;
  while (node !== null) {
    // 判断是否是原生节点（有可能是函数节点）
    if ([HostComponent, HostText].includes(node.tag))
      // 给父类元素中 append子元素
      appendInitialChild(parent, node.stateNode);
    else if (node.child !== null) {
      // 一直递归向下寻找（深度优先遍历）
      node = node.child;
      continue;
    }

    if (node === workInProgress) return;

    // 如果能走到这里，最起码是没有弟弟了
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) return;
      node = node.return;
    }
    node = node.sibling;
  }
}

/**
 * 更新原生的组件
 *
 * @author lihh
 * @param current old fiber
 * @param workInProgress new fiber
 * @param type fiber 类型
 * @param newProps 设置props 属性
 */
function updateHostComponent(current, workInProgress, type, newProps) {
  // 老的props
  const oldProps = current.memoizedProps;
  // 当前fiber 元素节点
  const instance = workInProgress.stateNode;

  // 更新后的payload
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updatePayload;

  // 用来标记 更新节点
  if (updatePayload) markUpdate(workInProgress);
}

/**
 * 完成工作单元
 *
 * @author lihh
 * @param current old fiber
 * @param workInProgress new fiber
 */
export function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case HostComponent: {
      const { type } = workInProgress;

      // stateNode !== null 表示静态 dom已经被创建
      // current !== null 是更新节点 因为如果是创建节点的话  current一定是空的
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps);

        // 如果ref的值 发生变化了 重新标记
        if (current.ref !== workInProgress.ref) markRef(workInProgress);
      } else {
        // 表示创建节点实例(其实就是通过type 来创建html 元素)
        const instance = createInstance(type, newProps, workInProgress);
        // 添加所有的子元素（将所有的子元素 添加到自己身上）
        appendAllChildren(instance, workInProgress);
        // 给fiber 挂载html node属性（形成了一一对应的映射关系）
        workInProgress.stateNode = instance;
        // 最终初期化 children
        finalizeInitialChildren(instance, type, newProps);

        // 表示 标记ref
        if (workInProgress.ref !== null) markRef(workInProgress);
      }

      // 进行属性冒泡
      bubbleProperties(workInProgress);
      break;
    }
    case FunctionComponent:
    case ContextConsumer:
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostText: {
      workInProgress.stateNode = createTextInstance(newProps);
      bubbleProperties(workInProgress);
      break;
    }
    case ContextProvider: {
      // 拿到上下文
      const context = workInProgress.type._context;
      popProvider(context, workInProgress);
      bubbleProperties(workInProgress);
      break;
    }
    default:
      break;
  }
}
