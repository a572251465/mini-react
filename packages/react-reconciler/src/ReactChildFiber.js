import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { isArray } from "shared/isArray";
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress,
  FiberNode,
} from "react-reconciler/src/ReactFiber";
import { ChildDeletion, Placement } from "react-reconciler/src/ReactFiberFlags";
import { HostText } from "react-reconciler/src/ReactWorkTags";

/**
 * 创建子元素 child 的调和
 *
 * @author lihh
 * @param shouldTrackSideEffects 是否追踪副作用
 */
export function createChildReconciler(shouldTrackSideEffects) {
  /**
   * 克隆一个新的fiber
   *
   * @author lihh
   * @param fiber 旧的fiber
   * @param pendingProps 以及参数
   */
  function cloneFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  /**
   * 标记删除子节点
   *
   * @author lihh
   * @param returnFiber 父fiber
   * @param childToDelete 子fiber 是将来要删除的
   */
  function deleteChild(returnFiber, childToDelete) {
    // 如果是初次渲染的话，不需要管
    if (!shouldTrackSideEffects) return;

    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      // 标识 父fiber中有子节点需要删除
      returnFiber.flag |= ChildDeletion;
    } else {
      returnFiber.deletions.push(childToDelete);
    }
  }

  /**
   * 删除剩余的节点
   *
   * @author lihh
   * @param returnFiber 父类fiber
   * @param currentFirstChild 剩余节点中第一个节点
   */
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) return;

    let child = currentFirstChild;
    for (; child !== null; child = child.sibling)
      deleteChild(returnFiber, child);
  }

  /**
   * 调和单个element 元素
   *
   * new: element{}
   * old: element{} element{} ...
   *
   * @author lihh
   * @param returnFiber 父fiber
   * @param currentFirstChild 第一个child
   * @param element 更新元素
   */
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // 此处为单节点的diff
    const { key, type } = element;
    let child = currentFirstChild;

    // 将新的虚拟dom 跟child 一一做比较
    while (child !== null) {
      // 判断是否是可以复用的fiber节点
      if (child.key === key) {
        if (child.type === type) {
          // 已经找到了可以 克隆的节点，删除剩余的节点
          deleteRemainingChildren(returnFiber, child.sibling);

          // 克隆复制 Fiber节点，内部将sibling 重置为空
          const existFiber = cloneFiber(child, element.props);
          existFiber.return = returnFiber;
          return existFiber;
        }
      }
      // 无论是key不同 还是 type不同，都要删除该节点
      deleteChild(returnFiber, child);

      child = child.sibling;
    }

    // 通过element 创建fiber 节点
    const created = createFiberFromElement(element);
    // 然后连接父子 fiber关系
    created.return = returnFiber;
    // 返回子节点
    return created;
  }

  /**
   * 表示更新单个元素
   *
   * @author lihh
   * @param newFiber 新的fiber
   */
  function placeSingleChild(newFiber) {
    // 因为只有alternate 为null的场合才是初次挂载
    if (shouldTrackSideEffects && newFiber.alternate === null)
      newFiber.flags |= Placement;
    return newFiber;
  }

  /**
   * 调和当前的text
   *
   * @author lihh
   * @param returnFiber 父fiber
   * @param currentFirstChild 第一个子元素
   * @param content text 内容
   */
  function reconcileSingleTextNode(returnFiber, currentFirstChild, content) {
    const node = new FiberNode(HostText, { content }, null);
    node.return = returnFiber;
    return node;
  }

  /**
   * 创建子元素
   *
   * @author lihh
   * @param returnFiber 父类fiber
   * @param newChild 子元素
   */
  function createChild(returnFiber, newChild) {
    // 如果是文本的话 直接创建文本fiber
    if (newChild !== "" && ["string", "number"].includes(typeof newChild)) {
      const node = createFiberFromText(`${newChild}`);
      node.return = returnFiber;
      return node;
    }

    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(newChild);
          created.return = returnFiber;
          return created;
        }
        default:
          break;
      }
    }

    return null;
  }

  /**
   * 更新标记 child
   *
   * @author lihh
   * @param newFiber 新fiber
   * @param newIndex 索引下标
   */
  function placeChild(newFiber, newIndex) {
    newFiber.index = newIndex;
    if (shouldTrackSideEffects) newFiber.flags |= Placement;
  }

  /**
   * 协调数组组件
   *
   * @author lihh
   * @param returnFiber 父类fiber
   * @param currentFirstChild 第一个child
   * @param newChildren 新儿子
   */
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let newIndex = 0;

    for (; newIndex < newChildren.length; newIndex++) {
      // 针对数组中的元素 创建每个newFiber
      const newFiber = createChild(returnFiber, newChildren[newIndex]);
      if (newFiber === null) continue;

      placeChild(newFiber, newIndex);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }

    return resultingFirstChild;
  }

  /**
   * 调和所有的子fiber
   *
   * @author lihh
   * @param returnFiber 父类的fiber
   * @param currentFirstChild 第一个儿子 其实对于父fiber而言的话，只有第一个儿子是child，不关心其他的儿子
   * @param newChild 新的儿子（第一次执行的时候，child 一定是虚拟dom）
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild),
          );
        }
        default:
          break;
      }

      // 判断子元素是否是数组
      if (isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
      }

      if (typeof newChild === "string") {
        return placeSingleChild(
          reconcileSingleTextNode(returnFiber, currentFirstChild, newChild),
        );
      }

      return null;
    }

    return null;
  }

  return reconcileChildFibers;
}

export const reconcileChildFibers = createChildReconciler(true);
export const mountChildFibers = createChildReconciler(false);
