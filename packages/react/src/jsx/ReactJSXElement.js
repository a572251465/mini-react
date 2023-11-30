// 固定的几个属性 不暴露到外面中
import { hasOwnProperty } from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 * 判断是否是有效的key
 *
 * @author lihh
 * @param config 传递的配置对象
 * @return {boolean} 是否是有效的key
 */
function hasValidKey(config, key) {
  if (!hasOwnProperty.call(config, "key")) return false;
  return config.key !== "undefined";
}

/**
 * 判断是否是有效的ref
 *
 * @author lihh
 * @param config 判断的配置文件
 * @return {boolean} 是否是有效的ref
 */
function hasValidRef(config, ref) {
  if (!hasOwnProperty.call(config, "ref")) return false;
  return config.ref !== "undefined";
}

/**
 * 生成 react element 虚拟dom
 *
 * @author lihh
 * @param type 标签类型
 * @param key 比较key
 * @param ref dom 引用的ref
 * @param self 自身
 * @param source 代码
 * @param owner
 * @param props 属性
 */
function ReactElement(type, key, ref, self, source, owner, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _source: source,
    _owner: owner,
  };
}

/**
 * 通过jsx 生成js代码
 *
 * @author lihh
 * @param type 标签类型
 * @param config 配置属性
 * @param maybeKey key
 * @param source 源代码
 * @param self 是否代表自己
 */
export function jsxDEV(type, config, maybeKey, source, self) {
  // 表示属性名称
  let propName = null;

  // 表示属性
  const props = {};

  // 特殊的key
  let key = null;
  let ref = null;

  // 判断是否是有效的key
  if (hasValidKey(config, "key")) key = config.key;
  // 判断是否是有效的ref
  if (hasValidRef(config, "ref")) ref = config.ref;

  // 循环遍历赋值
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    )
      props[propName] = config[propName];
  }

  return ReactElement(type, key, ref, undefined, undefined, undefined, props);
}
