// 表示当前渲染的fiber
import { ReactCurrentDispatcher } from "react/src/ReactCurrentDispatcher";
import { scheduleUpdateOnFiber } from "react-reconciler/src/ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "react-reconciler/src/ReactFiberConcurrentUpdates";
import { assign } from "shared/assign";
import { isFunction } from "shared/isFunction";
import { is } from "shared/is";
import { Passive as PassiveEffect } from "./ReactFiberFlags";
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
} from "./ReactHookEffectTags";

let currentlyRenderingFiber = null;
// 表示工作中的hook
let workInProgressHook = null;
// 表示当前hook
let currentHook = null;

/**
 * 挂载 effect 的实现函数
 *
 * @author lihh
 * @param create 执行effect需要的函数
 * @param deps 依赖项
 */
function mountEffect(create, deps) {
  return mountEffectImpl(PassiveEffect, HookPassive, create, deps);
}

/**
 * 更新的是 执行effect
 *
 * @author lihh
 * @param create 执行effect的需要的函数
 * @param deps 再次执行effect 需要的依赖项
 */
function updateEffect(create, deps) {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
}

/**
 * 更新effect 的实现
 *
 * @author lihh
 * @param fiberFlags 给fiber的标识 标识fiber中包含effect
 * @param hookFlags 标识hook的标识  可能是useEffect/ useLayoutEffect
 * @param create 执行所依赖的函数
 * @param deps 再次执行effect 需要的依赖
 */
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 拿到更新时的hook
  const hook = updateWorkInProgressHook();
  // 依赖项
  const nextDeps = deps === undefined ? null : deps;

  // 要执行副作用的函数
  let destroy;
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    // 拿到 执行副作用函数
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps,
  );
}

/**
 * 比较hook的依赖 是否变化
 *
 * @param nextDeps
 * @param prevDeps
 */
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) continue;
    return false;
  }

  return true;
}

/**
 * mount effect的共同的实现部分
 *
 * @author lihh
 * @param fiberFlags 给fiber的标志 表示包含effect
 * @param hookFlags 给useEffect标识  表示包含useEffect
 * @param create 执行effect需要的函数
 * @param deps 函数再次执行需要的依赖
 */
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = mountWorkInProgressHook();
  // 依赖项
  const nextDeps = deps === undefined ? null : deps;
  // 给fiber标识  标识fiber中包含effect
  currentlyRenderingFiber.flags |= fiberFlags;

  // 每个hook中挂载自己的effect
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    null,
    nextDeps,
  );
}

/**
 * 添加effect 到链表中
 *
 * @author lihh
 * @param tag effect 标识
 * @param create effect 执行的函数
 * @param destroy 销毁的函数
 * @param deps effect 再次执行的依赖项
 */
function pushEffect(tag, create, destroy, deps) {
  // create new effect
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };

  // 拿到fiber中 更新队列 用来保存待执行effect
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  // 如果是第一次执行 一定是null
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    // 将effect 添加到队列中  然后维护一个循环链表
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    // 最后的effect
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      // 维护一个循环链表
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }

  return effect;
}

/**
 * 创建
 *
 * @return {{lastEffect: null}}
 */
function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null,
  };
}

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
  workInProgress.updateQueue = null;
  workInProgress.memoizedState = null;

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
 * 用来修改state 的方法  一般都是setState
 *
 * @author lihh
 * @param fiber 当前运行的fiber
 * @param queue 属于hook的 queue
 * @param action 状态/ 动作
 */
function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    next: null,
    // 是否是紧急状态
    hasEagerState: false,
    // 紧急状态的值
    eagerState: null,
  };
  // 上一次的reducer 函数
  const lastRenderedReducer = queue.lastRenderedReducer;
  // 执行到此处最新的状态
  const currentState = queue.lastRenderedState;
  // 拿到一个紧急的状态
  const eagerState = lastRenderedReducer(currentState, action);

  // 修改状态
  update.hasEagerState = true;
  update.eagerState = eagerState;
  // 判断状态是否变化
  if (is(eagerState, currentState)) return;

  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root, fiber);
}

/**
 * setState 的更新状态
 *
 * @author lihh
 * @param initialState 初始化状态（对于更新处理而言，这种状态是无用的）
 * @return {[*|null,*]}
 */
function updateState(initialState) {
  return updateReducer(basicStateReducer);
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
 * 其实 useState 是内置reducer版本的 useReducer
 *
 * @author lihh
 * @param state 传递的状态
 * @param action 修改状态的 action事件 有可能只是状态
 * @return {*} 返回最新的状态
 */
function basicStateReducer(state, action) {
  return isFunction(action) ? action(state) : action;
}

/**
 * 表示 useState的挂载方法
 *
 * @author lihh
 * @param initialArg 初期值
 */
function mountState(initialArg) {
  // 创建 use state hook
  const hook = mountWorkInProgressHook();

  // 设置 hook state 状态
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialArg,
  };
  hook.queue = queue;

  const dispatch = (queue.dispatch = dispatchSetState.bind(
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
      // 是否是一个紧急的state
      if (update.hasEagerState) {
        // 如果是紧急的state的话 因为之前已经计算过了 直接赋值
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
  useState: mountState,
  useEffect: mountEffect,
};
const HooksDispatcherOnUpdateInDEV = {
  useReducer: updateReducer,
  useState: updateState,
  useEffect: updateEffect,
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
