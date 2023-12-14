// 表示当前渲染的fiber
import { ReactCurrentDispatcher } from "react/src/ReactCurrentDispatcher";

let currentlyRenderingFiber = null;
// 表示工作中的hook
let workInProgressHook = null;

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
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
  }

  // 执行函数 返回虚拟dom
  const children = Component(props);

  currentlyRenderingFiber = null;
  return children;
}

/**
 * 表示创建hook的工厂
 *
 * @author lihh
 */
function createHookFactory() {
  return {
    // 每个hook的状态
    memoizedState: null,
    queue: null,
    next: null,
  };
}

/**
 * 派发reducer action 方法
 *
 * @author lihh
 * @param fiber 执行的fiber，通过bind绑定过来的
 * @param queue 挂载hook的队列 也是通过bind绑定过来的
 * @param action 用户主动传递的 action的内容
 */
function dispatchReducerAction(fiber, queue, action) {}

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
  const queue = { pending: null, dispatch: null };
  hook.queue = queue;

  const dispatch = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ));
  return [hook.memoizedState, dispatch];
}

const HooksDispatcherOnMountInDEV = {
  useReducer: mountReducer,
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
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  else workInProgressHook = workInProgressHook.next = hook;

  return workInProgressHook;
}
