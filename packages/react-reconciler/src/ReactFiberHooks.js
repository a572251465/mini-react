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
  // 执行函数 返回虚拟dom
  const children = Component(props);
  return children;
}
