import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/ReactFiberReconciler";
import { ConcurrentRoot } from "react-reconciler/src/ReactRootTags";

/**
 * 创建 react dom root 元素
 *
 * @author lihh
 * @param internalRoot 创建的Fiber Root Node节点
 * @constructor
 */
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

/**
 * 基于fiber 渲染root 组件
 *
 * @author lihh
 * @param children 表示子组件 此时就是虚拟节点 以我们的实例来说的话 就是App组件
 */
ReactDOMRoot.prototype.render = function (children) {
  // 表示fiber node
  const root = this._internalRoot;

  updateContainer(children, root);
};

/**
 * 创建 root 节点
 *
 * @author lihh
 * @param container 容器节点
 */
export function createRoot(container) {
  const root = createContainer(container, ConcurrentRoot);
  return new ReactDOMRoot(root);
}
