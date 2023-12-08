/**
 * 通过事件 requestIdleCallback 来实现回调任务的执行
 *
 * @author lihh
 * @param callback 回调事件
 */
export function scheduleCallback(callback) {
  requestIdleCallback(callback);
}
