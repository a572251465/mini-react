import { getEventTarget } from "react-dom-bindings/src/events/getEventTarget";
import { dispatchEventForPluginEventSystem } from "react-dom-bindings/src/events/DOMPluginEventSystem";
import { getClosestInstanceFromNode } from "react-dom-bindings/src/client/ReactDOMComponentTree";
import {
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority,
} from "react-reconciler/src/ReactEventPriorities";

/**
 * 创建包裹事件的方法
 *
 * @author lihh
 * @param targetContainer 表示容器dom #root
 * @param domEventName 表示事件名称
 * @param eventSystemFlags 表示 冒泡/ 捕获标志
 */
export function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName,
  eventSystemFlags,
) {
  return dispatchDiscreteEvent.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer,
  );
}

/**
 * 派发事件的中转方法
 *
 * @author lihh
 * @param domEventName 事件名称
 * @param eventSystemFlags 事件捕获/ 冒泡状态
 * @param container 容器
 * @param nativeEvent 原生事件 是触发事件返回的
 */
function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

/**
 * 表示真正派发的事件
 *
 * @author lihh
 * @param domEventName 事件名称
 * @param eventSystemFlags 事件捕获/ 冒泡 标志
 * @param targetContainer 事件容器
 * @param nativeEvent 原生事件（前三个参数都是通过bind带过来的，唯独这个参数是通过点击事件触发的）
 */
function dispatchEvent(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent,
) {
  // 拿到真正的事件源（做了兼容性处理）
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 源实例  其实可以理解为获取fiber
  const targetInst = getClosestInstanceFromNode(nativeEventTarget);

  // 插件系统 派发事件
  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer,
  );
}

/**
 * 拿到 事件优先级
 *
 * @author lihh
 * @param domEventName  dom 事件名称
 */
export function getEventPriority(domEventName) {
  switch (domEventName) {
    case "click":
      return DiscreteEventPriority;
    case "drag":
      return ContinuousEventPriority;
    default:
      return DefaultEventPriority;
  }
}
