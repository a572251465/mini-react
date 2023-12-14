import * as SimplePlugin from "./plugins/SimpleEventPlugin";
import { allNativeEvents } from "react-dom-bindings/src/events/EventRegistry";
import { IS_CAPTURE_PHASE } from "react-dom-bindings/src/events/EventSystemFlags";
import { createEventListenerWrapperWithPriority } from "react-dom-bindings/src/events/ReactDOMEventListener";
import {
  addEventBubbleListener,
  addEventCaptureListener,
} from "react-dom-bindings/src/events/EventListener";
import { getEventTarget } from "react-dom-bindings/src/events/getEventTarget";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import { getListener } from "react-dom-bindings/src/events/getListener";

// 表示监听的mark 标识 避免多次绑定
const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);

// 0. 插件系统 开始注册插件
SimplePlugin.registerEvents();

/**
 * 执行注册事件
 *
 * @author lihh
 * @param rootContainerElement 事件注册到的 root容器
 */
export function listenToAllSupportedEvents(rootContainerElement) {
  // 判断是否已经绑定过
  if (rootContainerElement[listeningMarker]) return;
  rootContainerElement[listeningMarker] = true;

  // allNativeEvents 表示所有的原生的事件
  // 通过遍历所有的原生事件 依次就捕获/ 冒泡 进行注册
  allNativeEvents.forEach((domEventName) => {
    // 监听原生的事件/ 捕获
    listenToNativeEvent(domEventName, true, rootContainerElement);
    // 监听原生的事件/ 冒泡
    listenToNativeEvent(domEventName, false, rootContainerElement);
  });
}

/**
 * 开始监听原生的事件
 *
 * @author lihh
 * @param domEventName 原生事件的名称
 * @param isCapturePhaseListener 冒泡？？？ 捕获？？？
 * @param target 事件源
 */
export function listenToNativeEvent(
  domEventName,
  isCapturePhaseListener,
  target,
) {
  // 0 冒泡  4 捕获
  let eventSystemFlags = 0;
  // 判断是否是捕获 如果是捕获的话 给【eventSystemFlags】 赋值表示捕获的标志
  if (isCapturePhaseListener) eventSystemFlags |= IS_CAPTURE_PHASE;

  // 开始添加事件监听
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  );

  /**
   * 开始添加注册事件
   *
   * @author lihh
   * @param targetContainer 事件容器
   * @param domEventName 事件名称
   * @param eventSystemFlags 事件冒泡 还是 事件捕获
   * @param isCapturePhaseListener
   */
  function addTrappedEventListener(
    targetContainer,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  ) {
    // 创建事件包裹器 原生事件触发的都是这个包裹器
    const listener = createEventListenerWrapperWithPriority(
      targetContainer,
      domEventName,
      eventSystemFlags,
    );

    // 判断是否是捕获事件
    if (isCapturePhaseListener)
      addEventCaptureListener(targetContainer, domEventName, listener);
    else addEventBubbleListener(targetContainer, domEventName, listener);
  }
}

/**
 * 针对插件系统 派发事件
 *
 * @author lihh
 * @param domEventName 事件名称
 * @param eventSystemFlags 事件状态
 * @param nativeEvent 原生事件
 * @param targetInst 实例
 * @param targetContainer 容器
 */
export function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer,
) {
  dispatchEventsForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer,
  );
}

/**
 * 针对多种插件  开发事件系统
 *
 *@author lihh
 * @param domEventName 事件名称
 * @param eventSystemFlags 事件标识
 * @param nativeEvent 事件状态
 * @param targetInst 事件实例
 * @param targetContainer 事件容器
 */
export function dispatchEventsForPlugins(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer,
) {
  // 拿到原生的事件
  const nativeEventTarget = getEventTarget(nativeEvent);

  // 保存事件的队列
  const dispatchQueue = [];
  // 抽离事件
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  );

  // 处理派发的事件队列
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

/**
 * 抽离事件
 *
 * @author lihh
 * @param dispatchQueue 保存事件的队列
 * @param domEventName 事件名称
 * @param targetInst 原实例
 * @param nativeEvent 原事件
 * @param nativeEventTarget 原生事件源
 * @param eventSystemFlags 捕获/ 冒泡
 * @param targetContainer 容器
 */
function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer,
) {
  SimplePlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  );
}

/**
 * 处理 派发的事件队列
 *
 * @author lihh
 * @param dispatchQueue 派发的事件队列
 * @param eventSystemFlags 捕获/ 冒泡
 */
export function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;

  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
}

/**
 * 处理单个队列事件
 *
 * @author lihh
 * @param event 事件event
 * @param dispatchListeners 事件数组
 * @param inCapturePhase 是否捕获
 */
function processDispatchQueueItemsInOrder(
  event,
  dispatchListeners,
  inCapturePhase,
) {
  // 捕获的场合
  if (inCapturePhase) {
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const { currentTarget, listener } = dispatchListeners[i];
      if (event.isPropagationStopped()) return;
      executeDispatch(event, listener, currentTarget);
    }
  } else {
    for (let i = 0; i < dispatchListeners.length; i++) {
      const { currentTarget, listener } = dispatchListeners[i];
      if (event.isPropagationStopped()) return;
      executeDispatch(event, listener, currentTarget);
    }
  }
}

/**
 * 执行派发的事件
 *
 * @author lihh
 * @param event 事件 event
 * @param listener 事件
 * @param currentTarget 当前指向的target
 */
function executeDispatch(event, listener, currentTarget) {
  event.currentTarget = currentTarget;
  listener(event);
  event.currentTarget = null;
}

/**
 * 累加单个事件
 *
 * @author lihh
 * @param targetFiber 原fiber
 * @param reactName react 名称
 * @param nativeEventType 原事件类型
 * @param inCapturePhase 是否冒泡
 */
export function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeEventType,
  inCapturePhase,
) {
  // 冒泡事件名称
  const captureName = reactName + "Capture";
  // react 事件名称
  const reactEventName = inCapturePhase ? captureName : reactName;
  // 用来收集所有的事件  为什么要用数组呢 收集某个事件中从body =》 事件源的所有的事件
  const listeners = [];

  let instance = targetFiber;
  // 遍历从target fiber中 自下而上拿到stateNode
  while (instance !== null) {
    const { stateNode, tag } = instance;
    if (tag === HostComponent && stateNode !== null) {
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName);
        if (listener !== null && listener !== undefined) {
          // instance 这是一个fiber
          // listener 将来要触发的事件
          // stateNode 静态dom节点（html dom节点） 将来做currentTarget
          listeners.push(createDispatchListener(instance, listener, stateNode));
        }
      }
    }

    instance = instance.return;
  }

  return listeners;
}

/**
 * 创建派遣的事件
 *
 * @author lihh
 * @param instance fiber实例
 * @param listener 事件
 * @param currentTarget 静态节点
 */
function createDispatchListener(instance, listener, currentTarget) {
  return { instance, listener, currentTarget };
}
