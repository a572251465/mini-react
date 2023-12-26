import * as Scheduler from "scheduler/src/forks/Scheduler";

export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const NormalPriority = Scheduler.unstable_NormalPriority;
export const ImmediatePriority = Scheduler.unstable_ImmediatePriority;
export const UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
export const IdlePriority = Scheduler.unstable_IdlePriority;
export const shouldYield = Scheduler.unstable_shouldYield;
