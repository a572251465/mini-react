/**
 * @author lihh
 * @description 通过虚拟dom 生成真实dom
 * @param vdom 虚拟dom
 */
import { classComponentFlag, reactText } from '../utils/constant'
import addEvent from './event'

/**
 * @author lihh
 * @description 表示更新属性
 * @param dom 表示真实的dom
 * @param oldProps 表示旧属性
 * @param newProps 表示新属性
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
  if (typeof oldProps !== 'object' || typeof newProps !== 'object') return

  for (const item in newProps) {
    if (item === 'children') continue

    if (item === 'style') {
      const styleObj = newProps[item]
      for (const attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (/^on.*/.test(item)) {
      dom[item.toLowerCase()] = addEvent(
        dom,
        item.toLowerCase(),
        newProps[item]
      )
    } else {
      dom[item] = newProps[item]
    }
  }

  for (const item in oldProps) {
    if (!newProps.hasOwnProperty(item)) {
      dom[item] = null
    }
  }
}

/**
 * @author lihh
 * @description 表示子类虚拟dom
 * @param childrens 表示子类
 * @param dom 表示真实dom
 */
function resolveChildren(childrens = [], dom) {
  childrens.forEach((children) => {
    render(children, dom)
  })
}

/**
 * @author lihh
 * @description 挂载类组件
 * @param vdom 虚拟dom
 */
function mountClassComponent(vdom) {
  const { type, props } = vdom
  const classInstance = new type(props)
  const renderVdom = classInstance.render()
  const realDom = createDom(renderVdom)
  classInstance.oldRenderVdom = renderVdom
  return realDom
}

/**
 * @author lihh
 * @description 进行函数挂载
 * @param vdom
 */
function mountFunctionComponent(vdom) {
  const { type, props } = vdom
  const renderVdom = type(props)
  const realDom = createDom(renderVdom)
  vdom.oldRenderVdom = renderVdom
  return realDom
}

/**
 * @author lihh
 * @description 从虚拟dom 转换为真实的dom
 * @param vdom 虚拟dom
 * @returns {Text}
 */
function createDom(vdom) {
  const { type, props, ref } = vdom
  let dom

  if (type === reactText) {
    dom = document.createTextNode(props)
  } else if (typeof type === 'function') {
    // 判断是函数组件 还是类组件
    if (type.isClassComponent === classComponentFlag) {
      return mountClassComponent(vdom)
    } else {
      return mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }

  if (props) {
    updateProps(dom, {}, props)
  }

  if (props && props.children) {
    if (!Array.isArray(props.children)) {
      render(props.children, dom)
    } else {
      resolveChildren(props.children, dom)
    }
  }

  // 将真实dom 挂载到虚拟dom上
  vdom.dom = dom

  // ref直接绑定dom
  if (ref) {
    ref.current = dom
  }
  return dom
}

/**
 * @author lihh
 * @description 渲染dom
 * @param vdom 虚拟dom
 * @param container 挂载节点
 */
function render(vdom, container) {
  const dom = createDom(vdom)
  container.appendChild(dom)
}

/**
 * @author lihh
 * @description 通过虚拟dom 寻找真实dom
 * @param vdom 虚拟dom
 * @returns {*}
 */
export function findDom(vdom) {
  if (!vdom) return
  if (vdom.dom) {
    return vdom.dom
  } else {
    const oldRenderVdom = vdom.oldRenderVdom
    return findDom(oldRenderVdom)
  }
}

/**
 * @author lihh
 * @description 新旧dom的比较
 * @param parentDom 真实dom父类节点
 * @param oldVdom 老虚拟dom
 * @param newVdom 真的虚拟dom
 */
export function compareTwoVdom(parentDom, oldVdom, newVdom) {
  const oldDom = findDom(oldVdom)
  const newDom = createDom(newVdom)
  parentDom.replaceChild(newDom, oldDom)
}

const ReactDom = { render }
export default ReactDom
