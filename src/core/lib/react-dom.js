/**
 * @author lihh
 * @description 通过虚拟dom 生成真实dom
 * @param vdom 虚拟dom
 */
import {
  classComponentFlag,
  elementContext,
  elementInsert,
  elementMemo,
  elementMove,
  elementProvider,
  reactForwardRef,
  reactFragment,
  reactText
} from '../utils/constant'
import addEvent from './event'
// 表示当前hook所处的下标位置
let hookIndex = 0
// 存储所有的hook状态
const valueStack = []
// 预定更新
let scheduleUpdate

/**
 * @author lihh
 * @description state hook
 * @param {*} initValue
 */
export function useState(initValue) {
  valueStack[hookIndex] = valueStack[hookIndex] || initValue
  let currentIndex = hookIndex

  const callback = (action) => {
    const oldState = valueStack[currentIndex]
    const newState = typeof action === 'function' ? action(oldState) : action
    valueStack[currentIndex] = newState
    scheduleUpdate()
  }

  return [valueStack[hookIndex++], callback]
}

/**
 * @author lihh
 * @description memo 函数
 * @param {*} factory 生成data 的函数
 * @param {*} deps 监听变化的依赖项
 */
export function useMemo(factory, deps) {
  if (valueStack[hookIndex]) {
    const [lastMemo, lastDeps] = valueStack[hookIndex]
    const same = deps.every((item, index) => item === lastDeps[index])
    if (same) {
      hookIndex++
      return lastMemo
    } else {
      const newMemo = factory()
      valueStack[hookIndex++] = [newMemo, deps]
      return newMemo
    }
  } else {
    const newMemo = factory()
    valueStack[hookIndex++] = [newMemo, deps]
    return newMemo
  }
}

/**
 * @author lihh
 * @description callback 回调函数
 * @param {*} callback
 * @param {*} deps
 */
export function useCallback(callback, deps) {
  if (valueStack[hookIndex]) {
    const [lastCallback, lastDeps] = valueStack[hookIndex]
    const some = deps.every((item, index) => item === lastDeps[index])
    if (some) {
      hookIndex++
      return lastCallback
    } else {
      valueStack[hookIndex++] = [callback, deps]
      return callback
    }
  } else {
    valueStack[hookIndex++] = [callback, deps]
    return callback
  }
}

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
  childrens.forEach((children, i) => {
    children.mountIndex = i
    mount(children, dom)
  })
}

/**
 * @author lihh
 * @description 挂载类组件
 * @param vdom 虚拟dom
 */
function mountClassComponent(vdom) {
  const { type, props, ref } = vdom
  const classInstance = new type(props)
  vdom.classInstance = classInstance

  if (type.contextType) {
    classInstance.context = type.contextType._currentValue
  }

  if (ref) {
    ref.current = classInstance
  }

  // componentWillMount 实现
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }

  const renderVdom = classInstance.render()
  const realDom = createDom(renderVdom)
  classInstance.oldRenderVdom = renderVdom

  // componentDidMount 实现
  if (classInstance.componentDidMount) {
    realDom.componentDidMount =
      classInstance.componentDidMount.bind(classInstance)
  }
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
 * @description 挂载forward 函数
 * @param vdom 虚拟dom
 */
function mountForwardRefFunction(vdom) {
  const { type, ref, props } = vdom
  const renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  const dom = createDom(renderVdom)
  return dom
}

/**
 * @author lihh
 * @description 挂载provider组件
 * @param {*} vdom 虚拟dom
 */
function mountProviderComponent(vdom) {
  const { type, props } = vdom
  const { value } = props
  const _context = type._context
  _context._currentValue = value

  const renderVdom = props.children
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

/**
 * @author lihh
 * @description 挂载context/ consumer模板
 * @param {*} vdom 虚拟dom
 */
function mountContextComponent(vdom) {
  const { type, props } = vdom
  const _context = type._context
  const renderVdom = (
    typeof props.children === 'function' ? props.children : props.children.props
  )(_context._currentValue)

  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
}

/**
 * @author lihh
 * @description 挂载memo节点
 * @param {*} vdom
 */
function mountMemoComponent(vdom) {
  // 表示需要执行的函数 functionComponent
  let {
    type: { functionComponent },
    props
  } = vdom
  // 挂载时候的props 为了后期的比较
  vdom.prevProps = props
  // 生成虚拟doom
  const renderVdom = functionComponent(props)
  vdom.oldRenderVdom = renderVdom
  return createDom(renderVdom)
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

  if (type && type.$$typeof === elementMemo) {
    return mountMemoComponent(vdom)
  } else if (type && type.$$typeof === elementProvider) {
    return mountProviderComponent(vdom)
  } else if (type && type.$$typeof === elementContext) {
    return mountContextComponent(vdom)
  } else if (type && type.$$typeof === reactForwardRef) {
    return mountForwardRefFunction(vdom)
  } else if (type === reactText) {
    dom = document.createTextNode(String(props) === 'null' ? '' : props)
  } else if (type === reactFragment) {
    dom = document.createDocumentFragment()
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
      props.children.mountIndex = 0
      mount(props.children, dom)
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
  mount(vdom, container)

  scheduleUpdate = () => {
    // 重置为0 因为更新的时候 需要重新获取
    hookIndex = 0
    // 开始比较，虽然新旧vdom一致 但是内容不同
    compareTwoVdom(container, vdom, vdom)
  }
}

/**
 * @author lihh
 * @description 对虚拟dom挂载
 * @param {*} vdom 虚拟dom
 * @param {*} container 容器
 */
function mount(vdom, container) {
  const dom = createDom(vdom)
  container.appendChild(dom)

  // 声明周期函数componentDidMount 将在这里执行
  if (dom.componentDidMount) {
    dom.componentDidMount()
  }
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
    const oldRenderVdom = vdom.classInstance
      ? vdom.classInstance.oldRenderVdom
      : vdom.oldRenderVdom
    return findDom(oldRenderVdom)
  }
}

/**
 * @author lihh
 * @description 进行dom的卸载
 * @param {*} vdom 虚拟dom
 */
function unMountVdom(vdom) {
  const { props, ref } = vdom
  // 根据虚拟的dom 获取真实的dom
  const currentDom = findDom(vdom)
  // 判断是否存在生命钩子[componentWillUnmount]钩子
  if (vdom.classInstance && vdom.classInstance.componentWillUnmount) {
    vdom.classInstance.componentWillUnmount()
  }

  if (ref) ref.current = null

  // 判断是否有children
  if (props && props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children]
    children.forEach(unMountVdom)
  }

  if (currentDom) currentDom.remove()
}

/**
 * @author lihh
 * @description 进行子类children的更新
 * @param {*} parentDom 父类的节点
 * @param {*} oldVChildren 老的虚拟dom
 * @param {*} newVChildren 新的虚拟dom
 */
function updateChildren(parentDom, oldVChildren, newVChildren) {
  oldVChildren = (
    Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]
  ).filter((child) => child)
  newVChildren = (
    Array.isArray(newVChildren) ? newVChildren : [newVChildren]
  ).filter((child) => child)

  // 收集所有的旧dom 以及对应的key值
  const keyedOldMap = {}
  // 表示最后一个可以复用的元素
  let lastPlacedIndex = 0

  // 将所有的旧的元素中 key值对应的值以及value进行收集
  oldVChildren.forEach((child, index) => {
    const oldKey = child.key || index
    keyedOldMap[oldKey] = child
  })

  // 表示补丁数组
  const patch = []
  newVChildren.forEach((newVChild, index) => {
    newVChild.mountIndex = index
    const newKey = newVChild.key || index

    // 筛选新的dom 是否在旧的中间存在 是否可以直接复用
    const oldChild = keyedOldMap[newKey]
    if (oldChild) {
      updateElement(oldChild, newVChild)
      // 如果存在老的元素中 在lastPlacedIndex之前 表示元素需要移动
      if (oldChild.mountIndex < lastPlacedIndex) {
        patch.push({
          type: elementMove,
          oldVChild: oldChild,
          newVChild,
          mountIndex: index
        })
      }
      delete keyedOldMap[newKey]
      lastPlacedIndex = Math.max(lastPlacedIndex, oldChild.mountIndex)
    } else {
      patch.push({ type: elementInsert, newVChild, mountIndex: index })
    }
  })

  // 筛选出所有的需要移动的元素
  const moveVChild = patch
    .filter((action) => action.type === elementMove)
    .map((item) => item.oldVChild)
  Object.values(keyedOldMap)
    .concat(moveVChild)
    .forEach((oldVChild) => {
      // 通过虚拟dom 寻找真实的dom 从而进行删除
      const currentDom = findDom(oldVChild)
      if (currentDom) parentDom.removeChild(currentDom)
    })

  patch.forEach((action) => {
    const { type, oldVChild, newVChild, mountIndex } = action
    const childNodes = parentDom.childNodes

    if (type === elementInsert) {
      const newDom = createDom(newVChild)
      // 虽然元素已经被删除，但是内存中的元素还是存在的
      const childNode = childNodes[mountIndex]
      if (childNode) {
        parentDom.insertBefore(newDom, childNode)
      } else {
        parentDom.appendChild(newDom)
      }
    } else {
      const oldDOm = findDom(oldVChild)
      const childNode = childNodes[mountIndex]
      if (childNode) {
        parentDom.insertBefore(oldDOm, childNode)
      } else {
        parentDom.appendChild(oldDOm)
      }
    }
  })
}

/**
 * @author lihh
 * @description 更新函数组件
 * @param {*} oldVdom 老的虚拟dom
 * @param {*} newVdom 新的虚拟dom
 */
function updateFunctionComponent(oldVdom, newVdom) {
  const currentDom = findDom(oldVdom)
  if (!currentDom) return

  const parentNode = currentDom.parentNode
  const { type, props } = newVdom
  const newRenderVdom = type(props)
  compareTwoVdom(parentNode, oldVdom.oldRenderVdom, newRenderVdom)
  newVdom.oldRenderVdom = newRenderVdom
}

/**
 * @author lihh
 * @description 更新类组件
 * @param {*} oldVdom
 * @param {*} newVdom
 */
function updateClassComponent(oldVdom, newVdom) {
  const classInstance = (newVdom.classInstance = oldVdom.classInstance)
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props)
  }
  classInstance.updater.emitUpdate(newVdom.props)
}

/**
 * @author lihh
 * @description 更新context组件
 * @param {*} oldVdom 旧虚拟dom
 * @param {*} newVdom 新虚拟dom
 */
function updateProviderComponent(oldVdom, newVdom) {
  const parentDom = findDom(oldVdom).parentNode
  const { type, props } = newVdom

  const _context = type._context
  _context._currentValue = props.value

  const renderVdom = props.children
  compareTwoVdom(parentDom, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}

/**
 * @author lihh
 * @description 更新provider组件
 * @param {*} oldVdom 旧虚拟dom
 * @param {*} newVdom 新虚拟dom
 */
function updateContextComponent(oldVdom, newVdom) {
  const parentDom = findDom(oldVdom).parentNode
  const { type, props } = newVdom

  const _context = type._context
  const renderVdom = (
    typeof props.children === 'function' ? props.children : props.children.props
  )(_context._currentValue)
  compareTwoVdom(parentDom, oldVdom.oldRenderVdom, renderVdom)
  newVdom.oldRenderVdom = renderVdom
}

/**
 * @author lihh
 * @description 表示更新memo组件
 * @param {*} oldVdom 旧虚拟dom
 * @param {*} newVdom 新虚拟dom
 */
function updateMemoComponent(oldVdom, newVdom) {
  const { type, prevProps } = oldVdom
  // 进行新旧props是否发生变化
  if (!type.compare(prevProps, newVdom.props)) {
    const oldDOM = findDom(oldVdom)
    const parentDom = oldDOM.parentNode

    const { type, props } = newVdom
    const renderVdom = type.functionComponent(props)
    compareTwoVdom(parentDom, oldVdom.oldRenderVdom, renderVdom)
    newVdom.prevProps = props
    newVdom.oldRenderVdom = renderVdom
  } else {
    newVdom.prevProps = prevProps
    newVdom.oldRenderVdom = oldVdom.oldRenderVdom
  }
}

/**
 * @author lihh
 * @description 进行元素的更新比较
 * @param {*} oldVdom 老的虚拟dom
 * @param {*} newVdom 新的虚拟dom
 */
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type.$$typeof === elementMemo) {
    updateMemoComponent(oldVdom, newVdom)
    return
  }

  if (oldVdom.type.$$typeof === elementContext) {
    updateContextComponent(oldVdom, newVdom)
    return
  }

  if (oldVdom.type.$$typeof === elementProvider) {
    updateProviderComponent(oldVdom, newVdom)
    return
  }

  // 首先判断是否是文本类型
  if (oldVdom.type === reactText) {
    const currentDom = (newVdom.dom = findDom(oldVdom))
    if (oldVdom.props !== newVdom.props) {
      currentDom.textContent =
        String(newVdom.props) === 'null' ? '' : newVdom.props
    }
    return
  }

  // 判断是否是普通的标签
  if (typeof oldVdom.type === 'string' || oldVdom.type === reactFragment) {
    const currentDom = (newVdom.dom = findDom(oldVdom))
    updateProps(currentDom, oldVdom.props, newVdom.props)
    updateChildren(currentDom, oldVdom.props.children, newVdom.props.children)
    return
  }

  if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isClassComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

/**
 * @author lihh
 * @description 新旧dom的比较
 * @param parentDom 真实dom父类节点
 * @param oldVdom 老虚拟dom
 * @param newVdom 真的虚拟dom
 * @param nextDom 表示下一个dom 用来进行参照
 */
export function compareTwoVdom(parentDom, oldVdom, newVdom, nextDom) {
  // 如果新旧dom都没有的话 直接返回
  if (!oldVdom && !newVdom) return

  // 如果老的dom有 但是新的dom没有的话
  if (oldVdom && !newVdom) {
    unMountVdom(oldVdom)
    return
  }

  // 如果老的没有 && 新的有
  if (!oldVdom && newVdom) {
    const newDom = createDom(newVdom)
    if (nextDom) {
      parentDom.insertBefore(newDom, nextDom)
    } else {
      parentDom.appendChild(newDom)
    }
    if (newDom.componentDidMount) {
      newDom.componentDidMount()
    }
    return
  }

  // 如果新的以及老的都有 但是类型不同
  if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    const newDom = createDom(newVdom)
    unMountVdom(oldVdom)
    parentDom.appendChild(newDom)
    if (newDom.componentDidMount) {
      newDom.componentDidMount()
    }
    return
  }

  // 两个dom保持一致 比较属性
  updateElement(oldVdom, newVdom)
}

const ReactDom = { render }
export default ReactDom
