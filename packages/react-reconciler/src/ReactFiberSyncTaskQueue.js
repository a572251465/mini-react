// 表示同步队列
import {
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
} from "react-reconciler/src/ReactEventPriorities";

let syncQueue = null;
// 是否刷新 同步队列
let isFlushingSyncQueue = false;

/**
 * 同步调度的callback 方法
 *
 * @author lihh
 * @param callback callback 回调函数
 */
export function scheduleSyncCallback(callback) {
  if (syncQueue === null) syncQueue = [callback];
  else syncQueue.push(callback);
}

/**
 * 刷新同步的回调函数
 *
 * @author lihh
 */
export function flushSyncCallbacks() {
  // 刷新同步队列为false && 同步队列不能为null
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;

    let i = 0;
    // 拿到当前执行的优先级
    const previousUpdatePriority = getCurrentUpdatePriority();
    try {
      const isSync = true,
        queue = syncQueue;

      setCurrentUpdatePriority(DiscreteEventPriority);
      for (; i < queue.length; i += 1) {
        let callback = queue[i];
        do {
          callback = callback(isSync);
        } while (callback !== null);
      }
    } finally {
      // 将重置的内容换原
      setCurrentUpdatePriority(previousUpdatePriority);
      isFlushingSyncQueue = false;
    }
  }
}
