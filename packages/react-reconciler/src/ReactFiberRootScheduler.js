import { scheduleCallback } from "react-reconciler/src/Scheduler";
import { performConcurrentWorkOnRoot } from "react-reconciler/src/ReactFiberWorkLoop";

/**
 * 通过 requestIdleCallback 执行调度任务
 *
 * @author lihh
 * @param root fiber root 节点
 */
function scheduleTaskForRootDuringMicrotask(root) {
  const newCallbackNode = scheduleCallback(
    performConcurrentWorkOnRoot.bind(null, root),
  );
}

/**
 * 确定 rootFiber 节点的调度
 *
 * @author lihh
 * @param root 表示root fiber 节点
 */
export function ensureRootIsScheduled(root) {
  // 通过微任务 进行root节点的调度任务
  scheduleTaskForRootDuringMicrotask(root);
}
