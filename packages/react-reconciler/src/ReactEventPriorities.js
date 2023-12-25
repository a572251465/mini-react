import {
  DefaultLane,
  getHighestPriorityLane,
  IdleLane,
  includesNonIdleWork,
  InputContinuousLane,
  NoLane,
  SyncLane,
} from "react-reconciler/src/ReactFiberLane";

// 默认事件的优先级
export const DefaultEventPriority = DefaultLane;
// 离散的事件优先级（例如：点击事件）
export const DiscreteEventPriority = SyncLane;
// 连续的事件优先级（例如：scroll）
export const ContinuousEventPriority = InputContinuousLane;
// 空闲的事件优先级
export const IdleEventPriority = IdleLane;

// 当前更新的优先级
let currentUpdatePriority = NoLane;

/**
 * 获取当前更新的优先级
 *
 * @author lihh
 * @return {number} 返回的优先级
 */
export function getCurrentUpdatePriority() {
  return currentUpdatePriority;
}

/**
 * 设置当前更新的优先级
 *
 * @author lihh
 * @param newPriority 新的优先级
 */
export function setCurrentUpdatePriority(newPriority) {
  currentUpdatePriority = newPriority;
}

/**
 * 是否高 事件优先级
 *
 * @author lihh
 * @param a 事件优先级a
 * @param b 事件优先级b
 */
export function isHigherEventPriority(a, b) {
  return a !== 0 && a < b;
}

/**
 * 这是一个赛道转换优先级的方法
 *
 * @author lihh
 * @param lanes 传递的赛道
 */
export function lanesToEventPriority(lanes) {
  // 拿到高优先级赛道
  const lane = getHighestPriorityLane(lanes);

  // 是否离散
  if (!isHigherEventPriority(DiscreteEventPriority, lane))
    return DiscreteEventPriority;

  // 是否连续事件
  if (!isHigherEventPriority(ContinuousEventPriority, lane))
    return ContinuousEventPriority;

  // 是否非空闲
  if (includesNonIdleWork(lane)) return DefaultEventPriority;
  return IdleEventPriority;
}
