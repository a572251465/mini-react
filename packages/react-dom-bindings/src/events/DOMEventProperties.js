// 表示 预制的简单事件
import { registerTwoPhaseEvent } from "react-dom-bindings/src/events/EventRegistry";

const simpleEventPluginEvents = ["click"];
export const topLevelEventsToReactNames = new Map();

/**
 * 注册单个简单事件
 *
 * @author lihh
 * @param domEventName dom 原生事件
 * @param reactName react 事件名称
 */
function registerSimpleEvent(domEventName, reactName) {
  registerTwoPhaseEvent(reactName, [domEventName]);

  // 保存映射关系
  topLevelEventsToReactNames.set(domEventName, reactName);
}

/**
 * 注册简单事件
 *
 * @author lihh
 */
export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase();

    // 合成事件名称后部分
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    // 注册内容如：click => onClick
    registerSimpleEvent(domEventName, `on${capitalizedEvent}`);
  }
}
