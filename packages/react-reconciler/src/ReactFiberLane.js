// 总的赛道
export const TotalLanes = 31;
// 无赛道的时候
export const NoLanes = 0b0000000000000000000000000000000;
export const NoLane = 0b0000000000000000000000000000000;
// 同步赛道
export const SyncLane = 0b0000000000000000000000000000001; // 1
// 用户输入赛道
export const InputContinuousLane = 0b0000000000000000000000000000100; // 4
// 默认赛道
export const DefaultLane = 0b0000000000000000000000000010000; // 16
// 非空闲赛道
export const NonIdleLanes = 0b0001111111111111111111111111111;
// 空闲赛道
export const IdleLane = 0b0100000000000000000000000000000;

/**
 * 合并赛道
 *
 * @author lihh
 * @param a 赛道a
 * @param b 赛道b
 * @return {number} 赛道返回值
 */
export function mergeLanes(a, b) {
  return a | b;
}

/**
 * 标记root 节点被更新
 *
 * @author lihh
 * @param root root 根节点
 * @param updateLane 更新的赛道
 */
export function markRootUpdated(root, updateLane) {
  // 在root节点上，标记未处理的赛道
  root.pendingLanes |= updateLane;
}

/**
 * 拿到下一个赛道
 *
 *@author lihh
 * @param root 表示root 节点
 */
export function getNextLanes(root) {
  // pendingLanes 算是root 节点上 未生效的赛道
  const pendingLanes = root.pendingLanes;
  // 判断是否是非赛道
  if (pendingLanes === NoLane) return NoLanes;

  const nextLanes = getHighestPriorityLanes(pendingLanes);
  return nextLanes;
}

/**
 * 拿到高优先级的赛道
 *
 * @author lihh
 * @param lanes 等待处理的所有的赛道
 */
export function getHighestPriorityLanes(lanes) {
  return getHighestPriorityLane(lanes);
}

/**
 * 拿到最右侧的赛道
 *
 * @author lihh
 * @param lanes 等待处理的赛道
 */
export function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}

/**
 * 判断是否包含非空闲的赛道
 *
 * @author lihh
 * @param lanes 传递的赛道
 */
export function includesNonIdleWork(lanes) {
  return (lanes & NonIdleLanes) !== NoLanes;
}

/**
 * 包含阻塞的赛道
 *
 * @param root root 根节点
 * @param lanes 赛道
 * @return {boolean} 判断是否包含
 */
export function includesBlockingLane(root, lanes) {
  // 说明 输入 以及默认都是阻塞的
  const SyncDefaultLanes = InputContinuousLane | DefaultLane;
  return (lanes & SyncDefaultLanes) !== NoLanes;
}

/**
 * 是否包含子集指定的赛道
 *
 * @author lihh
 * @param set 父集合
 * @param subset 子集
 * @return {boolean} 包含与否
 */
export function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset;
}
