import { createWorkInProgress } from "react-reconciler/src/ReactFiber";
import { beginWork } from "react-reconciler/src/ReactFiberBeginWork";
import { completeWork } from "react-reconciler/src/ReactFiberCompleteWork";
import {
  MutationMask,
  NoFlags,
  Passive,
} from "react-reconciler/src/ReactFiberFlags";
import {
  commitLayoutEffects,
  commitMutationEffects,
  commitPassiveMountEffects,
  commitPassiveUnmountEffects,
} from "react-reconciler/src/ReactFiberCommitWork";
import { finishQueueingConcurrentUpdates } from "react-reconciler/src/ReactFiberConcurrentUpdates";
import {
  scheduleCallback as Scheduler_scheduleCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
  UserBlockingPriority as UserBlockingSchedulerPriority,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority,
} from "scheduler/src/Scheduler";
import {
  getHighestPriorityLane,
  getNextLanes,
  includesBlockingLane,
  markRootUpdated,
  NoLane,
  NoLanes,
  SyncLane,
} from "react-reconciler/src/ReactFiberLane";
import {
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  IdleEventPriority,
  lanesToEventPriority,
} from "react-reconciler/src/ReactEventPriorities";
import { getCurrentEventPriority } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import {
  flushSyncCallbacks,
  scheduleSyncCallback,
} from "react-reconciler/src/ReactFiberSyncTaskQueue";

let workInProgressRoot = null;
let workInProgress = null;
let rootDoesHavePassiveEffects = false;
let rootWithPendingPassiveEffects = null;
// 工作中主节点渲染的赛道
let workInProgressRootRenderLanes = NoLanes;

/**
 * 表示请求更新的赛道
 *
 * @author lihh
 * @return {number} 返回更新时的赛道
 */
export function requestUpdateLane() {
  // 拿到更新赛道（此赛道是通过set 方法可以指定的）
  const updateLane = getCurrentUpdatePriority();
  if (updateLane !== NoLane) return updateLane;

  // 拿事件优先级（如果更新赛道拿不到的值的时候，拿事件赛道。默认是16）
  const eventLane = getCurrentEventPriority();
  return eventLane;
}

/**
 * 刷新 消极的effect
 *
 * @author lihh
 */
export function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects;
    commitPassiveUnmountEffects(root.current);
    commitPassiveMountEffects(root, root.current);
  }
}

/**
 * 准备刷新栈
 *
 * @author lihh
 * @param root 表示root 节点
 * @param lanes 赛道
 */
function prepareFreshStack(root, lanes) {
  workInProgressRoot = root;
  // 表示新的工作线程
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  // 表示工作中的progress
  workInProgress = rootWorkInProgress;

  // 设置全局正在运行的赛道
  workInProgressRootRenderLanes = lanes;
  finishQueueingConcurrentUpdates();

  return rootWorkInProgress;
}

/**
 * 表示调度更新fiber
 *
 * @author lihh
 * @param root FiberNode 元素
 * @param fiber 当前fiber
 * @param lane
 */
export function scheduleUpdateOnFiber(root, fiber, lane) {
  // 标记 root节点的赛道
  markRootUpdated(root, lane);

  // 表示确定root 节点的 调度
  ensureRootIsScheduled(root);
}

/**
 * 确定 rootFiber 节点的调度
 *
 * @author lihh
 * @param root 表示root fiber 节点
 */
export function ensureRootIsScheduled(root) {
  // 拿到最新的赛道
  const nextLanes = getNextLanes(root, NoLanes);
  // 拿到最高级的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  // 此判断  是否是同步赛道
  if (newCallbackPriority === SyncLane) {
    // 表示同步调度的回调
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    // 同步任务执行结束后，利用微任务的特征，来进行状态清除
    // 表示同步执行结束后 要求异步来进行commit
    queueMicrotask(flushSyncCallbacks);
  } else {
    // 此变量定义 调度等级
    let schedulerPriorityLevel;
    switch (lanesToEventPriority(nextLanes)) {
      case DiscreteEventPriority:
        schedulerPriorityLevel = ImmediateSchedulerPriority;
        break;
      case ContinuousEventPriority:
        schedulerPriorityLevel = UserBlockingSchedulerPriority;
        break;
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
      case IdleEventPriority:
        schedulerPriorityLevel = IdleSchedulerPriority;
        break;
      default:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
    }
    Scheduler_scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  }
}

/**
 * 在root节点上 执行同步工作的
 *
 * @author lihh
 * @param root root 根节点
 */
function performSyncWorkOnRoot(root) {
  const lanes = getNextLanes(root);
  // 以同步的方式进行渲染
  renderRootSync(root, lanes);

  // 完成的工作
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
  return null;
}

/**
 * 表示提交root 节点
 *
 * @author lihh
 * @param root root 根节点
 */
function commitRoot(root) {
  const { finishedWork } = root;

  // 表示fiber本身有值 或是 子fiber上有值
  if (
    (finishedWork.subTreeFlags & Passive) !== NoFlags ||
    (finishedWork.flags & Passive) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      // 表示useEffect 是放到宏任务之后执行的
      // 本身方法【scheduleCallback】 就是一个宏任务
      Scheduler_scheduleCallback(NormalSchedulerPriority, flushPassiveEffects);
    }
  }

  // 判断子元素是否存在副作用
  const subtreeHasEffects =
    (finishedWork.subTreeFlags & MutationMask) !== NoFlags;
  // 判断自身是否有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffects(finishedWork, root);
    // layoutEffect 是在dom更新后 浏览器绘制前执行。 并不是说基于微任务。而是执行的时机跟微任务很像而已
    commitLayoutEffects(finishedWork, root);
    root.current = finishedWork;

    if (rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = false;
      rootWithPendingPassiveEffects = root;
    }
  }
  root.current = finishedWork;
}

/**
 * 并发执行的工作
 *
 * @author lihh
 * @param root fiber root节点
 * @param didTimeout 过期时间
 */
export function performConcurrentWorkOnRoot(root, didTimeout) {
  // 获取下一个赛道
  const lanes = getNextLanes(root, NoLanes);
  if (lanes === NoLanes) return null;

  // 是否应该时间分片
  const shouldTimeSlice = !includesBlockingLane(root, lanes) && !didTimeout;
  if (shouldTimeSlice) {
    renderRootConcurrent(root, lanes);
  } else {
    renderRootSync(root, lanes);
  }

  // 表示最终的work
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  commitRoot(root);
}

/**
 * root节点 并发渲染
 *
 * @author lihh
 * @param root 根节点
 * @param lanes 赛道
 */
function renderRootConcurrent(root, lanes) {}

/**
 * 以同步的方式 渲染root fiber节点
 *
 * @author lihh
 * @param root root fiber 节点
 * @param lanes 表示赛道
 */
function renderRootSync(root, lanes) {
  prepareFreshStack(root, lanes);

  // 同步循环工作
  workLoopSync();
  workInProgressRoot = null;
}

/**
 * 定义执行单元的方法
 *
 * @author lihh
 * @param unitOfWork 最初是一个全新的 root fiber
 */
function performUnitOfWork(unitOfWork) {
  // 拿到缓存的fiber node
  const current = unitOfWork.alternate;

  // 开始工作
  // current 旧fiber
  // unitOfWork 新fiber
  // 此时 next 表示儿子
  let next = beginWork(current, unitOfWork, workInProgressRootRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  // 如果儿子不存在的话 表示当前节点 已经完成fiber创建
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    // 儿子存在开始遍历儿子
    workInProgress = next;
  }
}

/**
 * 完成工作单元
 *
 * @author lihh
 * @param unitOfWork 每个执行的工作单元
 */
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    // 拿到缓冲节点
    const current = completedWork.alternate;
    // 拿到父fiber
    const returnFiber = completedWork.return;

    // 表示自身已经完成了 如果child 已经完成了 也会执行这里
    completeWork(current, completedWork);

    // 判断是否存在兄弟
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }

    // 给与父 fiber
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork != null);
}

/**
 * 同步 执行工作
 *
 * @author lihh
 */
function workLoopSync() {
  // 工作进度是否为空
  while (workInProgress !== null) {
    // 工作执行单元
    // workInProgress 此时是一个全新的root fiber
    performUnitOfWork(workInProgress);
  }
}
