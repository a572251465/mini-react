import { HostRoot } from "react-reconciler/src/ReactWorkTags";

/**
 * 标记从底到上的更新赛道，来自fiber root节点
 *
 * @param sourceFiber
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  // 表示当前fiber 父fiber
  let parent = sourceFiber.return;
  // 这是fiber 本身
  let node = sourceFiber;

  // 循环判断
  while (parent != null) {
    node = parent;
    parent = parent.return;
  }

  // 判断是否是root 标签
  if (node.tag === HostRoot) {
    // stateNode 表示FiberRootNode
    const root = node.stateNode;
    return root;
  }
  return null;
}
