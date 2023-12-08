import { hasOwnProperty } from "shared/hasOwnProperty";

const CHILDREN = "children";
const STYLE = "style";

/**
 * 通过diff手段 比较属性
 *
 * @author lihh
 * @param domElement 比较的元素
 * @param tag tag类型
 * @param lastProps 旧属性
 * @param nextProps 新属性
 */
export function diffProperties(domElement, tag, lastProps, nextProps) {
  let updatePayload = null,
    propKey = null,
    styleName = null,
    styleUpdates = null;

  // 开始遍历旧的属性
  for (propKey in lastProps) {
    // 如果旧props的key 已经在新props中存在的话
    if (hasOwnProperty(nextProps, propKey) || lastProps[propKey] === null)
      continue;

    // 判断是否是样式
    if (propKey === "style") {
      // 拿到旧样式
      const lastStyle = lastProps[propKey];
      // 开始遍历样式
      for (const styleName in lastStyle) {
        if (!styleUpdates) styleUpdates = {};
        styleUpdates[styleName] = "";
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }

  // 遍历新的属性
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;

    // 判断 新旧属性是否有变化
    if (
      !hasOwnProperty(nextProps, propKey) ||
      nextProp === lastProp ||
      (nextProp === null && lastProp === null)
    )
      continue;

    // 样式判断
    if (propKey === STYLE) {
      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = "";
          }
        }
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === "string" || typeof nextProp === "number") {
        (updatePayload = updatePayload || []).push(propKey, "" + nextProp);
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }

  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}
