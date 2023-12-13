import { topLevelEventsToReactNames } from "react-dom-bindings/src/events/DOMEventProperties";
import { IS_CAPTURE_PHASE } from "react-dom-bindings/src/events/EventSystemFlags";
import { SyntheticMouseEvent } from "react-dom-bindings/src/events/SyntheticEvent";
import { accumulateSinglePhaseListeners } from "react-dom-bindings/src/events/DOMPluginEventSystem";

export { registerSimpleEvents as registerEvents } from "../DOMEventProperties";

/**
 * 抽离事件的 真正方法
 *
 * @author lihh
 * @param dispatchQueue 保存事件的队列
 * @param domEventName 事件名称
 * @param targetInst 原实例
 * @param nativeEvent 原事件
 * @param nativeEventTarget 事件源
 * @param eventSystemFlags 捕获/ 冒泡
 */
export function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  // 拿到react事件 名称
  const reactName = topLevelEventsToReactNames.get(domEventName);

  // 不同的事件 含义不同
  let SyntheticEventCtor;
  switch (domEventName) {
    case "click":
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      break;
  }

  // 是否是捕获状态
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  // 获取累加的实例对象
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase,
  );

  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(
      reactName,
      domEventName,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );
    dispatchQueue.push({ event, listeners });
  }
}
