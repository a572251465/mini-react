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
