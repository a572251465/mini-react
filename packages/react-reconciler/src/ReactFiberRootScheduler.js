import { performConcurrentWorkOnRoot } from "react-reconciler/src/ReactFiberWorkLoop";

import {
  NormalPriority as NormalSchedulerPriority,
  scheduleCallback as Scheduler_scheduleCallback,
} from "scheduler/src/Scheduler";

/**
 * 通过 requestIdleCallback 执行调度任务
 *
 * @author lihh
 * @param root fiber root 节点
 */
export function scheduleTaskForRootDuringMicrotask(root) {
  const newCallbackNode = Scheduler_scheduleCallback(
    NormalSchedulerPriority,
    performConcurrentWorkOnRoot.bind(null, root),
  );
}
