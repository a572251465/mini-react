import { createHostRootFiber } from "react-reconciler/src/ReactFiber";
import { initializeUpdateQueue } from "react-reconciler/src/ReactFiberClassUpdateQueue";

/**
 * 可以构造一个fiber root元素（是携带dom元素的）
 *
 * @author lihh
 * @param containerInfo 容器节点
 * @param tag 标签
 * @constructor
 */
function FiberRootNode(containerInfo, tag) {
  // 节点标签（例如：并发等）
  this.tag = tag;
  // dom容器
  this.containerInfo = containerInfo;
  this.current = null;
}

/**
 * 创建 fiber root节点 其实就是所谓的第一个fiber
 *
 * @author lihh
 * @param containerInfo 表示dom 容器
 * @param tag tag标签 例如：1 并发标志
 */
export function createFiberRoot(containerInfo, tag) {
  // 构造的是 root fiber 实例(包含元素节点)
  const root = new FiberRootNode(containerInfo, tag);

  // 表示未初期化的fiber（包含各种状态）
  const uninitializedFiber = createHostRootFiber(tag);

  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  // 初期化 fiber的updateQueue
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
