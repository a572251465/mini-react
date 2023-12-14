// 表示当前渲染的fiber
import { ReactCurrentDispatcher } from "react/src/ReactCurrentDispatcher";
import { scheduleUpdateOnFiber } from "react-reconciler/src/ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "react-reconciler/src/ReactFiberConcurrentUpdates";
import { assign } from "shared/assign";

let currentlyRenderingFiber = null;
// 表示工作中的hook
let workInProgressHook = null;
// 表示当前hook
let currentHook = null;

/**
 * 渲染hooks（其实就是执行函数组件）
 *
 * @author lihh
 * @param current old fiber
 * @param workInProgress new fiber
 * @param Component 函数组件
 * @param props 参数
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  // 将此时渲染的fiber 挂载到全局上
  currentlyRenderingFiber = workInProgress;
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
  }

  // 执行函数 返回虚拟dom
  const children = Component(props);

  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

/**
 * 表示创建hook的工厂
 *
 * @param transferParams 传递的参数
 * @author lihh
 */
function createHookFactory(transferParams = {}) {
  return assign(
    {},
    {
      // 每个hook的状态
      memoizedState: null,
      // hook中的队列 更新状态队列
      queue: null,
      // 下一个值
      next: null,
    },
    transferParams,
  );
}

/**
 * 派发reducer action 方法，该方法是用户主动触发
 *
 * @author lihh
 * @param fiber 执行的fiber，通过bind绑定过来的
 * @param queue 挂载hook的队列 也是通过bind绑定过来的
 * @param action 用户主动传递的 action的内容
 */
function dispatchReducerAction(fiber, queue, action) {
  const update = { action, next: null };
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root, fiber);
}

/**
 * useReducer 核心方法
 *
 * @author lihh
 * @param reducer 执行reducer方法
 * @param initialArg 初始化参数
 */
function mountReducer(reducer, initialArg) {
  // 拿到一个工作中的hook
  const hook = mountWorkInProgressHook();

  // hook的状态
  hook.memoizedState = initialArg;
  // 创建一个队列
  // dispatch 此变量为了存储 用户的动作事件 比如：setNumber等
  const queue = { pending: null, dispatch: null };
  hook.queue = queue;

  const dispatch = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ));
  return [hook.memoizedState, dispatch];
}

/**
 * 表示 更新的hook
 *
 * @author lihh
 */
function updateWorkInProgressHook() {
  // 判断当前的hook 是否为null 如果为null的话 表示是第一个hook。 反之 不断的拿到下一个hook
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    currentHook = current.memoizedState;
  } else {
    currentHook = currentHook.next;
  }

  // 创建一个新的hook
  const newHook = createHookFactory({
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
  });

  // 创建 && 返回 运行的hook
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }

  return workInProgressHook;
}

/**
 * 更新时 调用的useReducer
 *
 * @param reducer 表示运行的事件
 * @author lihh
 */
function updateReducer(reducer) {
  // 执行更新时，拿到的是一个新的hook（但是内部复用了老hook的一些属性）
  const hook = updateWorkInProgressHook();

  const queue = hook.queue;
  queue.lastRenderedReducer = reducer;

  const current = currentHook;
  const pendingQueue = queue.pending;

  let newState = current.memoizedState;
  if (pendingQueue !== null) {
    queue.pending = null;
    const first = pendingQueue.next;

    // 拿到第一个更新内容
    let update = first;
    do {
      if (update.hasEagerState) {
        newState = update.eagerState;
      } else {
        const action = update.action;
        newState = reducer(newState, action);
      }
      update = update.next;
    } while (update !== null && update !== first);
  }

  hook.memoizedState = queue.lastRenderedState = newState;
  return [hook.memoizedState, queue.dispatch];
}

const HooksDispatcherOnMountInDEV = {
  useReducer: mountReducer,
};
const HooksDispatcherOnUpdateInDEV = {
  useReducer: updateReducer,
};

/**
 * 挂载工作中的hook
 *
 * @author lihh
 */
function mountWorkInProgressHook() {
  // 创建一个新的hook
  const hook = createHookFactory();

  // 表示此番执行的是第一个hook
  if (workInProgressHook === null)
    // currentlyRenderingFiber 当前渲染的fiber，作为一个全局变量，会在执行renderWithHooks 函数之前赋值的
    // 当renderWithHooks 函数执行结束后，将其内容重置为null
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  else workInProgressHook = workInProgressHook.next = hook;

  return workInProgressHook;
}
