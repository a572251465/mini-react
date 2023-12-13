import { hasOwnProperty } from "shared/hasOwnProperty";
import { assign } from "shared/assign";

/**
 * 返回true固定值
 *
 * @author lihh
 * @return {boolean}
 */
function functionThatReturnsTrue() {
  return true;
}

/**
 * 返回false 固定值
 *
 * @author lihh
 * @return {boolean}
 */
function functionThatReturnsFalse() {
  return false;
}

// 表示鼠标事件接口
const MouseEventInterface = {
  clientX: 0,
  clientY: 0,
};

/**
 * 创建基础事件
 *
 * @author lihh
 * @param interfaces 不同事件 需要的接口
 * @return {SyntheticBaseEvent}
 */
function createSyntheticEvent(interfaces) {
  /**
   * 表示基础事件
   *
   * @author lihh
   * @param reactName react 事件名称 例如 onClick
   * @param reactEventType react 事件类型
   * @param targetInst fiber 实例
   * @param nativeEvent 原生事件 通过事件触发的event
   * @param nativeEventTarget 静态html dom
   * @constructor
   */
  function SyntheticBaseEvent(
    reactName,
    reactEventType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  ) {
    this._reactName = reactName;
    this.type = reactEventType;
    this._targetInst = targetInst;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;

    for (const propName in interfaces) {
      // 如果不是特有属性 跳过
      if (!hasOwnProperty.call(interfaces, propName)) continue;

      this[propName] = nativeEvent[propName];
    }

    // 默认事件等
    this.isDefaultPrevented = functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
  }

  assign(SyntheticBaseEvent.prototype, {
    preventDefault() {
      const event = this.nativeEvent;
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      this.isDefaultPrevented = functionThatReturnsTrue;
    },
    stopPropagation() {
      const event = this.nativeEvent;
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
      this.isPropagationStopped = functionThatReturnsTrue;
    },
  });

  return SyntheticBaseEvent;
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
