import { createFiberRoot } from "react-reconciler/src/ReactFiberRoot";

/**
 * 创建容器节点
 *
 * @author lihh
 * @param containerInfo 容器dom 节点
 * @param tag
 */
export function createContainer(containerInfo, tag) {
  // 创建 root 节点的fiber root节点
  return createFiberRoot(containerInfo, tag);
}
