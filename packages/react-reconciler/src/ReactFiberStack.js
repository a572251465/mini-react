// 表示value 栈
const valueStack = [];
// 放到fiber上的栈
let fiberStack = [];

let index = -1;

/**
 * 创建游标
 *
 * @author lihh
 * @param defaultValue 表示默认的值
 * @return {{current}} 返回具有current属性对象
 */
export function createCursor(defaultValue) {
  return {
    current: defaultValue,
  };
}

/**
 * 判断是否为空
 *
 * @author lihh
 * @return {boolean}
 */
function isEmpty() {
  return index === -1;
}

/**
 * 弹出的方法
 *
 * @author lihh
 * @param cursor 游标
 * @param fiber 当前运行的fiber
 */
export function pop(cursor, fiber) {
  if (index < 0) return;

  // 对应索引的fiber
  cursor.current = valueStack[index];
  valueStack[index--] = null;
}

/**
 * 添加游标/ vale/ fiber 到栈中
 *
 * @author lihh
 * @param cursor 游标
 * @param value 设置的具体的值
 * @param fiber 执行的fiber
 */
export function push(cursor, value, fiber) {
  index++;

  valueStack[index] = cursor.current;
  cursor.current = value;
}
