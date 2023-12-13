// 保存 名称不重复的原生事件
export const allNativeEvents = new Set();

/**
 * 注册两阶段事件
 *
 * @author lihh
 * @param registrationName 注册的事件铭
 * @param dependencies 依赖
 */
export function registerTwoPhaseEvent(registrationName, dependencies) {
  registerDirectEvent(registrationName, dependencies);
  registerDirectEvent(registrationName + "Capture", dependencies);
}

/**
 * 直接注册事件 将事件名称添加到Set 集合中
 *
 * @author lihh
 * @param registrationName 注册的事件名
 * @param dependencies 依赖
 */
export function registerDirectEvent(registrationName, dependencies) {
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}
