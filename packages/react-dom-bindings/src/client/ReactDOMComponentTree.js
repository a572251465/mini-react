const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;
const internalPropsKey = "__reactProps$" + randomKey;

/**
 * 从节点中拿到实例
 *
 * @author lihh
 * @param targetNode 节点
 */
export function getClosestInstanceFromNode(targetNode) {
  const instance = targetNode[internalInstanceKey];
  return instance || null;
}

/**
 * 从node节点中 拿到fiber
 *
 * @author lihh
 * @param node node 节点
 */
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}

/**
 * 给node 中预置fiber节点
 *
 * @author lihh
 * @param hostInst fiber实例
 * @param node 原生的node节点
 */
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}

/**
 * 更新fiber 参数
 *
 * @author lihh
 * @param node 原生的node节点
 * @param props fiber 参数
 */
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}
