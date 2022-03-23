import { classComponentFlag, reactElement } from '../utils/constant'
import { wrapStringToVdom } from '../utils'
import { compareTwoVdom, findDom } from './react-dom'

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

  emitUpdate() {
    this.updateComponent()
  }

  updateComponent() {
    this.shouldUpdate()
  }

  shouldUpdate() {
    const { instance } = this
    instance.state = this.getState()
    if (this.callbacks.length > 0) {
      this.callbacks.forEach((fn) => fn())
      this.callbacks.length = 0
    }
    instance.forceUpdate()
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
    const oldRenderVdom = this.oldRenderVdom
    const oldDom = findDom(oldRenderVdom)
    const newRenderVdom = this.render()
    compareTwoVdom(oldDom.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom
  }
}

const React = {
  createElement,
  Component
}
export default React
