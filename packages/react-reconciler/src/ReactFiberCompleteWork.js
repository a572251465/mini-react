import {
  HostComponent,
  HostRoot,
  HostText,
} from "react-reconciler/src/ReactWorkTags";
import {Update} from "react-reconciler/src/ReactFiberFlags";


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
  // fiber 元素节点
  const instance = workInProgress.stateNode;

  // 更新后的payload
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updatePayload;

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

      // 此条件表示更新节点
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(current, workInProgress, type, newProps);
      } else {

      }
    }
    case HostRoot: {
    }
    case HostText: {
    }
    default:
      break;
  }
}
