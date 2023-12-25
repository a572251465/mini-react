import {
  enqueueConcurrentClassUpdate,
  markUpdateLaneFromFiberToRoot
} from "react-reconciler/src/ReactFiberConcurrentUpdates";
import { assign } from "shared/assign";
import {
  isSubsetOfLanes,
  mergeLanes,
  NoLane,
  NoLanes,
} from "react-reconciler/src/ReactFiberLane";

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
 * @param nextProps 表示下一个最新的属性
 */
function getStateFromUpdate(update, prevState, nextProps) {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update;
      // 部分状态
      let partialState;
      if (typeof payload === "function") {
        partialState = payload.call(null, prevState, nextProps);
      } else {
        partialState = payload;
      }
      return assign({}, prevState, partialState);
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
 * @param props 属性 next props
 * @param workInProgressRootRenderLanes 工作的root 节点的赛道
 */
export const processUpdateQueue = (
  workInProgress,
  props,
  workInProgressRootRenderLanes,
) => {
  // 获取新的更新队列
  const queue = workInProgress.updateQueue;
  // 第一个跳过的更新（跳过fiber的第一个元素，链表的头部）
  let firstBaseUpdate = queue.firstBaseUpdate;
  // 最后一个跳过的更新（跳过fiber的最后一个元素，链表的尾部）
  let lastBaseUpdate = queue.lastBaseUpdate;
  // 获取待生效的队列（此queue 可以理解为刚添加的queue）
  const pendingQueue = queue.shared.pending;

  /**   如果有新链表合并新旧链表开始  */
  // 如果有新的待生效的队列， 需要将两个链表进行合并（其实就是两个链表的头尾相连）
  if (pendingQueue !== null) {
    // 先清空待生效的队列
    queue.shared.pending = null;
    // 最后一个待生效的更新  因为pendingQueue 总是指向尾节点
    const lastPendingUpdate = pendingQueue;
    // 第一个待生效的更新
    const firstPendingUpdate = lastPendingUpdate.next;
    // 把环状链表剪开
    lastPendingUpdate.next = null;

    // 如果没有老的更新队列
    if (lastBaseUpdate === null) {
      // 第一个基本更新就是待生效队列的第一个更新
      firstBaseUpdate = firstPendingUpdate;
    } else {
      // 否则把待生效更新队列添加到基本更新的尾部，链表的首尾相连
      lastBaseUpdate.next = firstPendingUpdate;
    }
    // 最后一个基本更新肯定就是最后一个待生效的更新
    lastBaseUpdate = lastPendingUpdate;
    /**  合并新旧链表结束  */
  }

  // 如果有更新，表示旧的链表中是存在的
  if (firstBaseUpdate !== null) {
    // 基本状态
    let newState = queue.baseState;
    // 新的车道
    let newLanes = NoLanes;
    // 新的基本状态
    let newBaseState = null;
    // 新的第一个基本更新
    let newFirstBaseUpdate = null;
    // 新的最后一个基本更新
    let newLastBaseUpdate = null;
    // 第一个更新
    let update = firstBaseUpdate;

    do {
      // 表示更新赛道
      const updateLane = update.lane;
      // 判断是否应该跳过更新，优先级是更新的依据
      const shouldSkipUpdate = !isSubsetOfLanes(
        workInProgressRootRenderLanes,
        updateLane,
      );
      // 判断优先级是否足够,如果不够就跳过此更新
      if (shouldSkipUpdate) {
        // 复制一个新的更新并添加新的基本链表中
        const clone = {
          lane: updateLane,
          tag: update.tag,
          payload: update.payload,
          next: null,
        };
        if (newLastBaseUpdate === null) {
          newFirstBaseUpdate = newLastBaseUpdate = clone;
          newBaseState = newState;
        } else {
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        // 保存此fiber上还剩下的更新车道
        newLanes = mergeLanes(newLanes, updateLane);
      } else {
        // 如果已经有跳过的更新了，即使优先级足够也需要添到新的基本链表中
        if (newLastBaseUpdate !== null) {
          const clone = {
            lane: NoLane,
            tag: update.tag,
            payload: update.payload,
            next: null,
          };
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        // 根据更新计算新状态
        newState = getStateFromUpdate(update, newState, props);
        update = update.next;
      }
    } while (update);
    // 如果没有跳过的更新
    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }
    queue.baseState = newBaseState;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    workInProgress.lanes = newLanes;
    workInProgress.memoizedState = newState;
  }
};

export function cloneUpdateQueue(current, workInProgress) {
  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;
  if (queue === currentQueue) {
    const clone = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
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
  return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
}
