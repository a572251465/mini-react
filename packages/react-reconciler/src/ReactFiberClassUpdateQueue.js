import { markUpdateLaneFromFiberToRoot } from "react-reconciler/src/ReactFiberConcurrentUpdates";
import { assign } from "shared/assign";

export const UpdateState = 0;

/**
 * 未初始化 结束的fiber
 *
 * @author lihh
 * @param fiber fiber 节点
 */
export function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      lanes: null,
      hiddenCallbacks: null,
    },
    callbacks: null,
  };
}

/**
 * 用来创建更新节点
 *
 * @author lihh
 * @param lane 表示赛道
 */
export function createUpdate(lane) {
  return {
    lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  };
}

/**
 * 对更新状态进行更新
 *
 * @author lihh
 * @param update 更新状态
 * @param prevState 上次状态
 */
function getStateFromUpdate(update, prevState) {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update;
      return assign({}, prevState, payload);
    }
    default:
      return prevState;
  }
}

/**
 * 处理更新队列
 *
 * @author lihh
 * @param workInProgress current root fiber
 * @param props 属性
 */
export function processUpdateQueue(workInProgress, props) {
  const queue = workInProgress.updateQueue;
  const pendingQueue = queue.shared.pending;

  if (pendingQueue !== null) {
    // 队列处理结束，结果直接重置为null
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;

    // 将链表切断
    lastPendingUpdate.next = null;
    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate;

    while (update) {
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }

    workInProgress.memoizedState = newState;
  }
}

/**
 * 表示更新队列
 *
 * @author lihh
 * @param current old root fiber
 * @param workInProgress new root fiber
 */
export function cloneUpdateQueue(current, workInProgress) {
  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;

  if (queue === currentQueue) {
    const clone = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
      callbacks: null,
    };
    workInProgress.updateQueue = clone;
  }
}

/**
 * 将更新的内容 添加到单项链表中
 *
 * @author lihh
 * @param fiber 表示更新内容的fiber
 * @param update 更新的内容
 * @param lane 表示赛道
 */
export function enqueueUpdate(fiber, update, lane) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) return null;

  const sharedQueue = updateQueue.shared;

  // 此方法表示更新队列
  const pending = sharedQueue.pending;
  if (pending === null) {
    // 构建只有一个节点的 单项循环链表
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  sharedQueue.pending = update;
  return markUpdateLaneFromFiberToRoot(fiber);
}
