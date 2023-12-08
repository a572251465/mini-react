import { diffProperties } from "react-dom-bindings/src/client/ReactDOMComponent";

/**
 * 判断children 元素是否设置 text内容
 *
 * @author lihh
 * @param props 依附的属性
 */
export function shouldSetTextContent(props) {
  return ["string", "number"].includes(typeof props.children);
}

/**
 * 添加初始化 子元素
 *
 * @author lihh
 * @param parent 父类元素
 * @param child 子类元素
 */
export function appendInitialChild(parent, child) {
  if (!parent) throw new Error("parent is not empty");

  parent.appendChild(child);
}

/**
 * 创建text 文本实例
 *
 * @author lihh
 * @param context 表示text 文本内容
 * @return {Text}
 */
export const createTextInstance = (context) => document.createTextNode(context);

/**
 * 添加child 元素的 API
 *
 * @author lihh
 * @param parentInstance 父类实例
 * @param child 子类元素
 */
export function appendChild(parentInstance, child) {
  appendInitialChild(parentInstance, child);
}

/**
 * 在指定元素之前的元素插入
 *
 * @author lihh
 * @param parentInstance 父类实例元素
 * @param child 子元素
 * @param beforeChild 参照点子元素
 */
export function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild);
}

/**
 * 准备更新 样式以及属性
 *
 * @author lihh
 * @param domElement element 元素
 * @param type 元素类型
 * @param oldProps old 属性
 * @param newProps new 属性
 */
export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps);
}
