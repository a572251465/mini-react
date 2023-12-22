import { frameYieldMs } from "scheduler/src/SchedulerFeatureFlags";
import {
  IdlePriority,
  ImmediatePriority,
  LowPriority,
  NormalPriority,
  UserBlockingPriority,
} from "scheduler/src/SchedulerPriorities";
import { peek, pop, push } from "scheduler/src/SchedulerMinHeap";

// 31 bit位 最大值
const maxSigned31BitInt = 1073741823;
// 紧急优先级调度 延迟时间
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// 用户阻塞 优先级调度延迟时间
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 普通优先级 调度延迟时间
const NORMAL_PRIORITY_TIMEOUT = 5000;
// 低优先级 调度延迟时间
const LOW_PRIORITY_TIMEOUT = 10000;
// 空闲时间 优先级调度延迟时间
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

// 任务队列
const taskQueue = [];
// 任务个数
let taskIdCounter = 1;
// 调度回调
let scheduledHostCallback = null;
// 开始时间
let startTime = 1;
// 当前的任务
let currentTask = null;
// 暂停时间
const frameInterval = frameYieldMs;
// 消息通信的messageChannel
const channel = new MessageChannel();
// 发送消息的端口
const port = channel.port2;

// 动态拿到当前的时间
const getCurrentTime = () => performance.now();
// 通过messageChannel  接受消息
channel.port1.onmessage = performWorkUntilDeadline;

/**
 * 调度工作 直到最后结束  调用此方法  将消息发送给messageChannel 的另一端
 *
 * @author lihh
 */
function schedulePerformWorkUntilDeadline() {
  // port2端口发送消息 port1端口可以接受到消息
  port.postMessage(null);
}

/**
 * 执行工作 直到最终结束
 *
 * @author lihh
 */
function performWorkUntilDeadline() {
  // 判断调度的回调工作是否为null
  if (scheduledHostCallback !== null) {
    // 开始时间
    startTime = getCurrentTime();

    // 此变量用来判断是否还有更多的work
    let hasMoreWork = true;
    try {
      // 其实scheduledHostCallback方法 就是flushWork 方法
      // 拿到是否有下一个方法需要执行
      hasMoreWork = scheduledHostCallback(startTime);
    } finally {
      // 如果存在的话 继续调用宏任务执行 反之 就重置为null
      if (hasMoreWork) schedulePerformWorkUntilDeadline();
      else scheduledHostCallback = null;
    }
  }
}

/**
 * 请求的回调
 *
 * @author lihh
 * @param callback 回调方法
 */
function requestHostCallback(callback) {
  // 表示要执行的任务
  scheduledHostCallback = callback;
  // 开始启动宏任务 进行调用
  schedulePerformWorkUntilDeadline();
}

/**
 * 不稳定的调度回调
 *
 * @author lihh
 * @param priorityLevel  调度优先级
 * @param callback 执行的回调函数
 */
function unstable_scheduleCallback(priorityLevel, callback) {
  // 调度开始 的开始时间
  const currentTime = getCurrentTime();
  const startTime = currentTime;

  // 表示延迟时间
  let timeout;
  // 延迟时间 以及到调度队列的转换，不同的调度任务时间不同
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  // 计算过期时间
  const expirationTime = startTime + timeout;
  // 创建一个新的task
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  newTask.sortIndex = expirationTime;
  push(taskQueue, newTask);
  requestHostCallback(flushWork);
  return newTask;
}

/**
 * 刷新工作
 *
 * @author lihh
 * @param initialTime 初期化的时间
 */
function flushWork(initialTime) {
  return workLoop(initialTime);
}

/**
 * 判断是否应该暂停（就是拿剩余的时间 以及申请的时间做比较）
 *
 * @author lihh
 */
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  // 剩余时间 比 申请的时间  大
  return timeElapsed >= frameInterval;
}

/**
 * 工作循环单元
 *
 * @author lihh
 * @param initialTime 初期时间
 */
function workLoop(initialTime) {
  let currentTime = initialTime;
  // 当前要执行的任务
  currentTask = peek(taskQueue);

  // 一直在循环工作
  while (currentTask !== null) {
    // 如果当前任务的过期时间 > 当前时间 && 应该暂停  只是暂停了 还有任务没有执行结束呢，后续还是要继续执行的
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) break;

    // 回调函数
    const callback = currentTask.callback;
    // 判断回调是否是一个方法
    if (typeof callback === "function") {
      currentTask.callback = null;

      // 说明已经过期了
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      // todo 执行函数 返回函数 说明要执行后续的任务。
      // 应该是任务中套任务
      const continuationCallback = callback(didUserCallbackTimeout);

      // 当前时间
      currentTime = getCurrentTime();
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true;
      }

      // 如果是正常到这个位置 拿出小顶堆的头任务
      if (currentTask === peek(taskQueue)) pop(taskQueue);
    } else {
      // 如果不是函数 直接抛出任务
      pop(taskQueue);
    }

    // 拿到下一 个任务
    currentTask = peek(taskQueue);
  }

  // 是否还有任务需要继续执行
  if (currentTask !== null) return true;
  else return false;
}

export { NormalPriority as unstable_NormalPriority, unstable_scheduleCallback };
