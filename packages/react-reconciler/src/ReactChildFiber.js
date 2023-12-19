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
   * 更新 element元素
   *
   * @author lihh
   * @param returnFiber 父类的fiber
   * @param current old fiber 老的fiber
   * @param element new element
   */
  function updateElement(returnFiber, current, element) {
    // 拿到类型
    const elementType = element.type;
    if (current !== null) {
      if (current.type === elementType) {
        // 开始复用fiber
        const existFiber = cloneFiber(current, element.props);
        existFiber.return = returnFiber;
        return existFiber;
      }
    }

    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  /**
   * 更新位置
   *
   * @author lihh
   * @param returnFiber 父类的fiber
   * @param oldFiber 老的fiber
   * @param newChild 新的element
   */
  function updateSlot(returnFiber, oldFiber, newChild) {
    const key = oldFiber !== null ? oldFiber.key : null;

    // 判断新的元素是对象 && 不为null
    if (!!newChild && typeof newChild === "object") {
      switch (newChild.$$typeof) {
        // 普通element
        case REACT_ELEMENT_TYPE: {
          // key 相同
          if (newChild.key === key)
            return updateElement(returnFiber, oldFiber, newChild);
        }
      }

      return null;
    }
  }

  /**
   * 标识节点的插入 以及返回 不需要动的老的节点索引
   *
   * @author lihh
   * @param newFiber 新的fiber
   * @param lastPlacedIndex 表示最后一个不需要移动的老节点
   * @param newIndex 将要替换都的索引
   */
  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) return lastPlacedIndex;

    const current = newFiber.alternate;
    if (current !== null) {
      // 老的索引
      const oldIndex = current.index;
      // 如果是小于的场合，说明本来old fiber应该在右侧，实际上到了左侧，所以需要移动
      // 综合起来是拿到最后一个不需要移动的节点索引
      if (oldIndex < lastPlacedIndex) {
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      } else {
        return oldIndex;
      }
    }
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }

  /**
   * 将fiber 转换为Map 结构
   *
   * @author lihh
   * @param returnFiber 父类fiber
   * @param currentFirstChild 子fiber中第一个fiber
   */
  function mapRemainingChildren(returnFiber, currentFirstChild) {
    const existingChildren = new Map();
    // 第一个存在的子元素
    let existingChild = currentFirstChild;

    // 遍历所有的子元素 将元素添加到Map中
    for (; existingChild !== null; existingChild = existingChild.sibling)
      existingChildren.set(
        existingChild.key !== null ? existingChild.key : existingChild.index,
        existingChild,
      );

    return existingChildren;
  }

  /**
   * 更新文本节点 node
   *
   * @author lihh
   * @param returnFiber 父类fiber
   * @param current old fiber
   * @param textContent text content
   */
  function updateTextNode(returnFiber, current, textContent) {
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent);
      created.return = returnFiber;
      return created;
    }

    // 复用fiber
    const existing = cloneFiber(current, textContent);
    existing.return = returnFiber;
    return existing;
  }

  /**
   * 更新来自map中的内容
   *
   * @author lihh
   * @param existingChildren 已经存在的children，已经被转换的Map
   * @param returnFiber 父类的fiber
   * @param newIdx 新的索引
   * @param newChild 新的子节点
   */
  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    // 判断是否是文本节点
    if (newChild !== "" && ["string", "number"].includes(typeof newChild)) {
      // 从map中拿到对应的值，如果是老的节点可以拿到值，但是如果是新的节点就为null
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, `${newChild}`);
    }

    // 判断是否是对象
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          // 同样是从map中拿值，目的就是为了复用
          const matchedFiber =
            existingChildren.get(
              newChild.key === null ? newIdx : newChild.key,
            ) || null;
          return updateElement(returnFiber, matchedFiber, newChild);
        }
      }
    }
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
    // 返回的第一个新节点
    let resultingFirstChild = null;
    // 表示上一个新的节点
    let previousNewFiber = null;
    // 表示新的索引
    let newIndex = 0;

    // 表示老的第一个fiber
    let oldFiber = currentFirstChild;
    // 表示下一个老的fiber
    let nextOldFiber = null;
    // 表示最后一个不需要移动的老节点
    let lastPlacedIndex = 0;

    // 遍历新的 fiber array children 此循环是一个前前比较的核心
    for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      nextOldFiber = oldFiber.sibling;
      //  这是前前对比 比较  如果是key不相同的话 直接返回null 从而跳出循环
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);
      if (newFiber === null) break;

      // 有副作用
      if (shouldTrackSideEffects) {
        // 老的fiber存在 && 但是构建了新的fiber 说明不能复用，直接删除老的fiber
        if (oldFiber && newFiber.alternate === null)
          deleteChild(returnFiber, oldFiber);
      }

      // 插入新的元素
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    // 满足这个判断 可能出现新的children比较少，或是 新的children length 跟old Fiber个数保持一致
    if (newIndex === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    // 说明老的fiber 比较少 或是 跟新的children 个数 保持一致
    if (oldFiber === null) {
      // 创建剩余的 new element
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex]);
        if (newFiber === null) continue;

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    // diff 比较的核心开始
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
    for (; newIndex < newChildren.length; newIndex++) {
      // 从map中拿到值，有可能是老节点，有可能是新的节点
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIndex,
        newChildren[newIndex],
      );

      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          // 满足此条件 表示其实是复用的节点，因为新建的节点属性【alternate】是null的
          if (newFiber.alternate !== null)
            existingChildren.delete(newFiber.key || newIndex);
        }
      }

      // 执行此方法就是为了判断  索引是否需要移动
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }

    // 如果有副作用  && 将map中剩余的节点 标记为删除节点
    if (shouldTrackSideEffects)
      existingChildren.forEach((child) => deleteChild(returnFiber, child));

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
        // 此时开始真正的diff 比较了
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
