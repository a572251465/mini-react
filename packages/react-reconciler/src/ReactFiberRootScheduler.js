import { scheduleCallback } from "react-reconciler/src/Scheduler";
import { performConcurrentWorkOnRoot } from "react-reconciler/src/ReactFiberWorkLoop";

/**
 * 通过 requestIdleCallback 执行调度任务
 *
 * @author lihh
 * @param root fiber root 节点
 */
export function scheduleTaskForRootDuringMicrotask(root) {
  const newCallbackNode = scheduleCallback(
    performConcurrentWorkOnRoot.bind(null, root),
  );
}
