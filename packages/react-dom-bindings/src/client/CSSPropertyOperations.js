import { hasOwnProperty } from "shared/hasOwnProperty";

/**
 * 针对样式 设置值
 *
 * @author lihh
 * @param node 被设置的元素
 * @param styles 样式
 */
export function setValueForStyles(node, styles) {
  const { style } = node;

  for (const styleName in styles) {
    // 判断元素的样式 中是否存在
    if (hasOwnProperty(style, styleName)) {
      style[styleName] = styles[styleName];
    }
  }
}
