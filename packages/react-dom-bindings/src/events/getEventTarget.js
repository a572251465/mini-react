/**
 * 表示拿到原生事件的方法
 *
 * @author lihh
 * @param nativeEvent 表示原生事件
 */
export function getEventTarget(nativeEvent) {
  const target = nativeEvent.target || nativeEvent.srcElement || window;
  return target;
}
