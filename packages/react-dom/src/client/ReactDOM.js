import { createRoot as createRootImpl } from "./ReactDOMRoot";

/**
 * 创建 root节点元素
 *
 * @author lihh
 * @param container 容器节点
 */
export function createRoot(container) {
  return createRootImpl(container);
}
