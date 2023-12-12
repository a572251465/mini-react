import { createFiberRoot } from "react-reconciler/src/ReactFiberRoot";
import {
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from "react-reconciler/src/ReactFiberWorkLoop";
import {
  createUpdate,
  enqueueUpdate,
} from "react-reconciler/src/ReactFiberClassUpdateQueue";

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

/**
 * 更新容器节点
 *
 * @author lihh
 * @param element 此元素表示虚拟节点
 * @param container 表示 fiberRoot 节点
 */
export function updateContainer(element, container) {
  // 表示 rootFiber 节点  FiberNode
  const current = container.current;
  // 请求更新的赛道 todo
  const lane = requestUpdateLane(current);

  // 表示创建更新节点
  const update = createUpdate(lane);

  // 将children 虚拟节点设置到update中
  update.payload = { element };
  // 将更新的内容 添加到fiber 更新队列中
  const root = enqueueUpdate(current, update, lane);

  if (root !== null) {
    // 执行调度更新fiber
    scheduleUpdateOnFiber(root, current, lane);
  }
}
