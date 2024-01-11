import { createCursor, pop, push } from "react-reconciler/src/ReactFiberStack";

// 创建 value的游标
const valueCursor = createCursor(null);
// 当前运行的fiber
let currentlyRenderingFiber = null;

/**
 * 将 provider 添加到栈中
 *
 * @author lihh
 * @param providerFiber 执行的具有provider的 fiber
 * @param context  provider 的提供者context
 * @param nextValue 表示赋值provider 的value
 */
export function pushProvider(providerFiber, context, nextValue) {
  // 如果是第一次执行的话  _currentValue 就是默认值
  // 总是将上一次的值，添加进去
  push(valueCursor, context._currentValue, providerFiber);

  // 设置当前的value值
  context._currentValue = nextValue;
}

/**
 * 弹出 provider
 *
 * @author lihh
 * @param context 上下文
 * @param providerFiber 提供者的fiber
 */
export function popProvider(context, providerFiber) {
  // 拿到上一次的值
  context._currentValue = valueCursor.current;
  pop(valueCursor, providerFiber);
}

/**
 * 准备读取 上下文中的内容
 *
 * @author lihh
 * @param workInProgress 工作的fiber
 */
export function prepareToReadContext(workInProgress) {
  currentlyRenderingFiber = workInProgress;
}

/**
 * 对于消费者 读取context内容
 *
 * @author lihh
 * @param consumer 消费者fiber
 * @param context 上下文
 */
function readContextForConsumer(consumer, context) {
  // 拿到存储在上下文中的值
  return context._context._currentValue;
}

/**
 * 开始读取 context中的值
 *
 * @author lihh
 * @param context provider/ consumer 上下文
 */
export function readContext(context) {
  return readContextForConsumer(currentlyRenderingFiber, context);
}

/**
 * 读取 context的值
 *
 * @author lihh
 * @param consumer 其实是父类的fiber，也是消费者定义的fiber
 * @param context provider 上下文
 */
export function readContextDuringReconcilation(consumer, context) {
  if (currentlyRenderingFiber === null) prepareToReadContext(consumer);
  return readContextForConsumer(consumer, context);
}
