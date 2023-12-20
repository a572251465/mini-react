import { ReactCurrentDispatcher } from "react/src/ReactCurrentDispatcher";

/**
 * 返回react 的派发器
 *
 * @author lihh
 * @return {null}
 */
function resolveDispatcher() {
  return ReactCurrentDispatcher.current;
}

/**
 * 定义 useReducer 函数
 *
 * @author lihh
 * @param reducer useReducer 触发的函数
 * @param initialArg 初期值
 * @param init 初期化
 */
export function useReducer(reducer, initialArg, init) {
  const dispatcher = resolveDispatcher();
  // 调用派发器上的useReducer（挂载 以及更新时的派发器不同）
  return dispatcher.useReducer(reducer, initialArg, init);
}

export function useState(initialArg) {
  const dispatcher = resolveDispatcher();
  // 调用派发器上的useReducer（挂载 以及更新时的派发器不同）
  return dispatcher.useState(initialArg);
}

/**
 * 实现调用 useEffect的方法
 *
 * @author lihh
 * @param create effect 中传递的函数
 * @param deps 执行effect的需要的依赖项
 * @return {*}
 */
export function useEffect(create, deps) {
  const dispatcher = resolveDispatcher();
  // 调用派发器上的useEffect（挂载 以及更新时的派发器不同）
  return dispatcher.useEffect(create, deps);
}
