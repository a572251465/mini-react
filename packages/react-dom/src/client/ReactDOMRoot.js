import {createContainer} from "react-reconciler/src/ReactFiberReconciler";
import {ConcurrentRoot} from "react-reconciler/src/ReactRootTags";

/**
 * 创建 root 节点
 *
 * @author lihh
 * @param container 容器节点
 */
export function createRoot(container) {
  return createContainer(container, ConcurrentRoot);
}
