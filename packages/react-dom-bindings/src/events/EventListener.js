/**
 * 绑定捕获事件
 *
 * @author lihh
 * @param target 表示事件源
 * @param eventType 表示事件类型（click等）
 * @param listener 表示事件本身
 */
export function addEventCaptureListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, true);
}

/**
 * 绑定冒泡事件
 *
 * @author lihh
 * @param target 事件源
 * @param eventType 事件类型
 * @param listener 事件本身
 */
export function addEventBubbleListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, false);
}
