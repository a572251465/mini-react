/**
 * 设置/ 删除 属性
 *
 * @author lihh
 * @param node 元素节点
 * @param name 属性名称
 * @param value 属性值
 */
export function setValueForProperty(node, name, value = null) {
  if (value === null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}
