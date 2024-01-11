import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE } from "shared/ReactSymbols";

/**
 * react  创建上下文
 *
 * @author lihh
 * @param defaultValue 默认值
 */
export function createContext(defaultValue) {
  // 构建context 对象
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    // 表示 Provider value 设置的值
    _currentValue: defaultValue,
    _currentValue2: defaultValue,

    // 提供者
    Provider: null,
    // 消费者
    Consumer: null,
  };

  // provider 以及context 存在相互依赖的关系
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  // consumer 以及context 存在相互依赖的关系
  context.Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context,
  };

  return context;
}
