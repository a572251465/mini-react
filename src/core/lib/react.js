import { classComponentFlag, reactElement } from '../utils/constant'
import { wrapStringToVdom } from '../utils'

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

class Component {
  static isClassComponent = classComponentFlag
  constructor(props) {
    this.props = props
  }
}

const React = {
  createElement,
  Component
}
export default React
