import { hasOwnProperty } from "shared/hasOwnProperty";
import { setValueForStyles } from "react-dom-bindings/src/client/CSSPropertyOperations";
import { setTextContent } from "react-dom-bindings/src/client/setTextContent";
import { setValueForProperty } from "react-dom-bindings/src/client/DOMPropertyOperations";

const CHILDREN = "children";
const STYLE = "style";
const CLASSNAME = "className";

/**
 * 设置初期化的属性
 *
 * @author lihh
 * @param domElement dom html元素
 * @param tag html类型
 * @param props html属性
 */
export function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props);
}

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

/**
 * 设置初期的 dom属性
 *
 * @author lihh
 * @param tag html 标签
 * @param domElement html element
 * @param nextProps new props
 */
function setInitialDOMProperties(tag, domElement, nextProps) {
  for (const propKey in nextProps) {
    if (hasOwnProperty(nextProps, propKey)) {
      const nextProp = nextProps[propKey];

      // 判断是否等于样式 针对样式可以做单独的处理
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp);
        // 如果属性名字是children的话
        // （在生成fiber过程中，如果最后一个节点是一个文本节点是不做为fiber处理的，直接在这里进行处理）
        // 单独做处理，直接赋值textContent
      } else if (propKey === CHILDREN) {
        if (["string", "number"].includes(typeof nextProp))
          setTextContent(domElement, `${nextProp}`);
      } else if (propKey === CLASSNAME) {
        setValueForProperty(domElement, "class", nextProp);
      } else if (nextProp !== null) {
        // 如果是普通的属性，直接进行赋值（例如：class等）
        setValueForProperty(domElement, propKey, nextProp);
      }
    }
  }
}
