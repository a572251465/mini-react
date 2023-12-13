import { getFiberCurrentPropsFromNode } from "react-dom-bindings/src/client/ReactDOMComponentTree";

/**
 * 拿到事件
 *
 * @author lihh
 * @param inst 实例 其实就是fiber
 * @param registrationName 注册的事件名称
 */
export function getListener(inst, registrationName) {
  const stateNode = inst.stateNode;
  if (stateNode === null) return null;

  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) return null;

  return props[registrationName];
}
