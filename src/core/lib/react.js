import {
  classComponentFlag,
  reactElement,
  reactForwardRef,
  reactFragment
} from '../utils/constant'
import { wrapStringToVdom } from '../utils'
import { compareTwoVdom, findDom } from './react-dom'

// 实现批量更新的逻辑
export const updateQueue = {
  // 是否更新中
  isBatchingUpdate: false,
  // 收集更新的updater
  updaters: new Set(),
  // 更新组件的函数
  batchUpdate: function () {
    this.isBatchingUpdate = false
    for (const updater of this.updaters) {
      updater.updateComponent()
    }
    this.updaters.clear()
  }
}

function createElement(type, config, children) {
  let key, ref
  if (config) {
    delete config.__source
    delete config.__self

    key = config.key
    delete config.key
    ref = config.ref
    delete config.ref
  }
  const props = {
    ...config
  }
  if (arguments.length > 3) {
    props.children = Array.prototype.slice
      .call(arguments, 2)
      .map(wrapStringToVdom)
  } else {
    props.children = wrapStringToVdom(children)
  }

  const element = {
    $$typeof: reactElement,
    type,
    key,
    ref,
    props
  }

  return element
}

class Updater {
  constructor(instance) {
    this.instance = instance
    this.stateStack = []
    this.callbacks = []
  }

  addState(partState, callback) {
    this.stateStack.push(partState)
    if (typeof callback === 'function') this.callbacks.push(callback)
    this.emitUpdate()
  }

  emitUpdate(nextProps) {
    this.nextProps = nextProps
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this)
    } else {
      this.updateComponent()
    }
  }

  updateComponent() {
    const { instance, stateStack, nextProps } = this
    if (nextProps || stateStack.length > 0) {
      this.shouldUpdate(instance, nextProps, this.getState())
    }
  }

  shouldUpdate(instance, nextProps, nextState) {
    let willUpdate = true

    if (
      instance.shouldComponentUpdate &&
      !instance.shouldComponentUpdate(nextProps, nextState)
    ) {
      willUpdate = false
    }

    if (nextProps) {
      instance.props = nextProps
    }

    instance.state = nextState
    if (this.callbacks.length > 0) {
      this.callbacks.forEach((fn) => fn())
      this.callbacks.length = 0
    }

    if (willUpdate) {
      instance.forceUpdate()
    }
  }

  getState() {
    const { state: oldState } = this.instance
    let newState = { ...oldState }
    this.stateStack.forEach((state) => {
      newState = {
        ...newState,
        ...(typeof state === 'function' ? state(newState) : state)
      }
    })
    this.stateStack.length = 0
    return newState
  }
}

function createRef() {
  return {
    current: null
  }
}

class Component {
  static isClassComponent = classComponentFlag
  constructor(props) {
    this.props = props
    this.state = {}
    this.updater = new Updater(this)
  }

  setState(partState, callback) {
    this.updater.addState(partState, callback)
  }

  forceUpdate() {
    // 钩子componentWillUpdate执行位置
    if (this.componentWillUpdate) {
      this.componentWillUpdate()
    }

    const oldRenderVdom = this.oldRenderVdom
    const oldDom = findDom(oldRenderVdom)
    const newRenderVdom = this.render()
    compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom

    // 钩子componentDidUpdate执行位置
    if (this.componentDidUpdate) {
      this.componentDidUpdate()
    }
  }
}

function forwardRef(render) {
  return {
    $$typeof: reactForwardRef,
    render
  }
}

const React = {
  createElement,
  createRef,
  Component,
  forwardRef,
  Fragment: reactFragment
}
export default React
