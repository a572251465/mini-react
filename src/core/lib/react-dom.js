/**
 * @author lihh
 * @description 通过虚拟dom 生成真实dom
 * @param vdom 虚拟dom
 */
import {reactText} from "../utils/constant";

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
  childrens.forEach(children => {
    render(children, dom)
  })
}

/**
 * @author lihh
 * @description 从虚拟dom 转换为真实的dom
 * @param vdom 虚拟dom
 * @returns {Text}
 */
function createDom(vdom) {
  const {type, props} = vdom
  let dom

  if (type === reactText) {
    dom = document.createTextNode(props)
  } else {
    dom = document.createElement(type)
  }

  if (props) {
    updateProps(dom, {}, props)
  }

  if (props.children) {
    if (!Array.isArray(props.children)) {
      render(props.children, dom)
    } else {
      resolveChildren(props.children, dom)
    }
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

const ReactDom = {render}
export default ReactDom
