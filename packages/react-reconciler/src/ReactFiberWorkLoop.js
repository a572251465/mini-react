import { createWorkInProgress } from "react-reconciler/src/ReactFiber";
import { beginWork } from "react-reconciler/src/ReactFiberBeginWork";
import { completeWork } from "react-reconciler/src/ReactFiberCompleteWork";
import { MutationMask, NoFlags } from "react-reconciler/src/ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "react-reconciler/src/ReactFiberCommitWork";
import { finishQueueingConcurrentUpdates } from "react-reconciler/src/ReactFiberConcurrentUpdates";
import { scheduleTaskForRootDuringMicrotask } from "react-reconciler/src/ReactFiberRootScheduler";

let workInProgressRoot = null;
let workInProgress = null;

/**
 * 表示请求更新的赛道
 *
 * @author lihh
 * @param fiber 表示执行更新的fiber
 * @return {number}
 */
export function requestUpdateLane(fiber) {
  // todo
  return 1;
}

/**
 * 准备刷新栈
 *
 * @author lihh
 * @param root 表示root 节点
 */
function prepareFreshStack(root) {
  workInProgressRoot = root;
  // 表示新的工作线程
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  // 表示工作中的progress
  workInProgress = rootWorkInProgress;

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
  if (workInProgressRoot) return;
  workInProgressRoot = root;
  // 通过微任务 进行root节点的调度任务
  scheduleTaskForRootDuringMicrotask(root);
}

/**
 * 表示提交root 节点
 *
 * @author lihh
 * @param root root 根节点
 */
function commitRoot(root) {
  const { finishedWork } = root;

  // 判断子元素是否存在副作用
  const subtreeHasEffects =
    (finishedWork.subTreeFlags & MutationMask) !== NoFlags;
  // 判断自身是否有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffects || rootHasEffect)
    commitMutationEffectsOnFiber(finishedWork, root);
  root.current = finishedWork;
}

/**
 * 并发执行的工作
 *
 * @author lihh
 * @param root fiber root节点
 */
export function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);

  // 表示最终的work
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  commitRoot(root);
}

/**
 * 以同步的方式 渲染root fiber节点
 *
 * @author lihh
 * @param root root fiber 节点
 */
function renderRootSync(root) {
  prepareFreshStack(root);

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
  let next = beginWork(current, unitOfWork);
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
