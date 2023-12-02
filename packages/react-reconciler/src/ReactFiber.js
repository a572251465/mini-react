import { NoFlags } from "react-reconciler/src/ReactFiberFlags";
import { HostRoot } from "react-reconciler/src/ReactWorkTags";

/**
 * 用来构建Fiber node 元素
 *
 * @author lihh
 * @param tag 标签
 * @param key 表示唯一的key
 * @param pendingProps 属性
 * @constructor
 */
function FiberNode(tag, key, pendingProps) {
  // Instance
  // 标签
  this.tag = tag;
  // 唯一的key
  this.key = key;
  // 元素类型
  this.elementType = null;
  this.type = null;
  // 对应的 dom元素
  this.stateNode = null;
  this.pendingProps = pendingProps;

  // Fiber
  // 父fiber
  this.return = null;
  // 儿子fiber
  this.child = null;
  // 兄弟fiber
  this.sibling = null;
  // 索引
  this.index = 0;

  // 表示ref 引用
  this.ref = null;
  this.refCleanup = null;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;

  // 属性
  this.memoizedProps = null;
  // 更新队列
  this.updateQueue = null;
  // 状态
  this.memoizedState = null;
  // 一对一 映射的Fiber
  this.alternate = null;
}

/**
 * 创建真正的fiber 节点
 *
 * @author lihh
 * @return {FiberNode} fiber 元素
 */
function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, key, pendingProps);
}

/**
 * 创建host root fiber 是控制各种属性的
 *
 * @author lihh
 * @param tag 传递的标签
 */
export function createHostRootFiber(tag) {
  return createFiber(HostRoot, null, null);
}
