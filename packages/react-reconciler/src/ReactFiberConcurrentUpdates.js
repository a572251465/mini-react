import { HostRoot } from "react-reconciler/src/ReactWorkTags";

// 队列定义一个并发的队列
const concurrentQueues = [];
// 并发队列的下标
let concurrentQueuesIndex = 0;

/**
 * 标记从底到上的更新赛道，来自fiber root节点
 *
 * @param sourceFiber
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  // 表示当前fiber 父fiber
  let parent = sourceFiber.return;
  // 这是fiber 本身
  let node = sourceFiber;

  // 循环判断
  while (parent != null) {
    node = parent;
    parent = parent.return;
  }

  // 判断是否是root 标签
  if (node.tag === HostRoot) {
    // stateNode 表示FiberRootNode
    const root = node.stateNode;
    return root;
  }
  return null;
}

/**
 * 拿到节点，更新fiber
 *
 * @author lihh
 * @param sourceFiber 原来的fiber
 */
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }

  return node.tag === HostRoot ? node.stateNode : null;
}

/**
 * 将更新的hook 添加到队列中
 *
 * @author lihh
 * @param fiber 当前执行的fiber
 * @param queue 更新队列
 * @param update hook的状态
 * @param lane 表示赛道
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}

/**
 * 将更新的信息 添加到队列中
 *
 * @author lihh
 * @param fiber 执行的fiber
 * @param queue hook 队列
 * @param update hook状态的值
 */
function enqueueUpdate(fiber, queue, update, lane) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
}

/**
 * 并发的class 刚更新
 *
 * @au lihh
 * @param fiber 运行的fiber
 * @param queue 队列
 * @param update 更新内容
 * @param lane 赛道
 */
export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}

/**
 * 更新 并发队列中的信息
 *
 * @author lihh
 */
export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;

  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueues[i++];
    const queue = concurrentQueues[i++];
    const update = concurrentQueues[i++];
    const lane = concurrentQueues[i++];

    // 表示数组中三个为一组，各自维护各自的 queue（循环链表）
    if (queue !== null && update !== null) {
      const pending = queue.pending;
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }

      queue.pending = update;
    }
  }
}
