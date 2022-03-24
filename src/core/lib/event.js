import { updateQueue } from './react'

/**
 * @author lihh
 * @description 事件触发 本次事件是由document通过冒泡触发的
 * @param event 传递的事件对象
 */
function dispatchEvent(event) {
  const { type, target } = event
  updateQueue.isBatchingUpdate = true

  let currentTarget = target
  const synthesisEvent = createSynthesisEvent(event)
  synthesisEvent.isStopPropagation = false
  synthesisEvent.isPreventDefault = false

  // 模拟事件冒泡 通过不断的寻找_store来实现
  while (currentTarget) {
    const { _store } = currentTarget
    synthesisEvent.currentTarget = currentTarget

    if (_store) {
      _store[`on${type}`](synthesisEvent)
      if (synthesisEvent.isStopPropagation) break
    }
    currentTarget = currentTarget.parentNode
  }

  updateQueue.batchUpdate()
}

function stopPropagationHandle() {
  this.isStopPropagation = true
  const event = this.nativeEvent
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
}

function preventDefaultHandle() {
  this.isPreventDefault = true
  const event = this.nativeEvent
  if (event.preventDefault) {
    event.preventDefault()
  } else {
    event.returnValue = false
  }
}

/**
 * @author lihh
 * @description 生成事件函数
 * @param event 事件对象本身
 */
function createSynthesisEvent(nativeEvent) {
  const synthesisEvent = {}
  for (const key in nativeEvent) {
    let value = nativeEvent[key]
    if (typeof value === 'function') value = value.bind(nativeEvent)
    synthesisEvent[key] = value
  }

  synthesisEvent.nativeEvent = nativeEvent
  synthesisEvent.stopPropagation = stopPropagationHandle
  synthesisEvent.preventDefault = preventDefaultHandle

  return synthesisEvent
}

/**
 * @author lihh
 * @description 实现事件合成
 * @param dom 添加的dom
 * @param type 事件类型
 * @param handle 事件本身
 */
const addEvent = (dom, type, handle) => {
  const _store = dom._store || (dom._store = {})
  _store[type] = handle

  if (!document[type]) {
    document[type] = dispatchEvent
  }
}

export default addEvent
