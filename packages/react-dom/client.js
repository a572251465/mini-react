import { createRoot as createRootImpl } from "./src/client/ReactDOM";

/**
 * 创建 root 节点
 *
 * @author lihh
 * @param container 表示根节点
 */
export function createRoot(container) {
  return createRootImpl(container);
}
