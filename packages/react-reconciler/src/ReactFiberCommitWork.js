import {
  HostComponent,
  HostRoot,
  HostText,
} from "react-reconciler/src/ReactWorkTags";
import { MutationMask, Placement } from "react-reconciler/src/ReactFiberFlags";
import {
  appendChild,
  insertBefore,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";

/**
 * 递归解析 有副作用的fiber
 *
 * @author lihh
 * @param root 根节点
 * @param parentFiber 父fiber
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
  // 判断子child 是否有副作用
  if (!!(parentFiber.subTreeFlags & MutationMask)) {
    let { child } = parentFiber;

    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

/**
 * 判断是否是具有原生html的fiber
 *
 * @author lihh
 * @param fiber 被判断的fiber节点
 */
function isHostParent(fiber) {
  return [HostComponent, HostRoot].includes(fiber.tag);
}

/**
 * 拿到父类的fiber（具有html 元素的fiber）
 *
 * @author lihh
 * @param fiber 当前执行的fiber
 */
function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent !== null) {
    // 第一个原生标签的 fiber
    if (isHostParent(parent)) return parent;
    parent = parent.return;
  }
  return parent;
}

/**
 * 获取下一个有效的节点
 *
 * @author lihh
 * @param fiber 当前运行 以及判断的fiber
 * @return {null|*|null}
 */
function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    // 如果我们没有找到任何东西，让我们试试下一个弟弟
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // 如果我们是根Fiber或者父亲是原生节点，我们就是最后的弟弟
        return null;
      }
      node = node.return;
    }
    node = node.sibling;
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果它不是原生节点，并且，我们可能在其中有一个原生节点
      // 试着向下搜索，直到找到为止
      if (node.flags & Placement) {
        // 如果我们没有孩子，可以试试弟弟
        continue siblings;
      } else {
        // node.child.return = node
        node = node.child;
      }
    }
    // 检查此原生节点是否稳定可以放置
    if (!(node.flags & Placement)) {
      // 找到它了!
      return node.stateNode;
    }
  }
}

/**
 * 插入/ 添加 具有插入操作的节点
 *
 * @author lihh
 * @param node 将要插入的节点
 * @param before 插入位置之前的节点
 * @param parent 要插入节点的父类节点
 */
function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  // 判断是否是原生的节点
  const isHost = [HostComponent, HostText].includes(tag);

  // 判断是否是原生的节点
  if (isHost) {
    const { stateNode } = node;

    // 原生节点情况下 直接插入到html中
    if (!!before) insertBefore(parent, stateNode, before);
    else appendChild(parent, stateNode);
  } else {
    const { child } = node;
    if (child !== null) {
      // 插入 child 子节点
      insertOrAppendPlacementNode(child, before, parent);
      let { sibling } = child;
      // 循环遍历 相邻的子节点
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

/**
 * 提交插入操作
 *
 * @author lihh
 * @param finishedWork 完成的work
 */
function commitPlacement(finishedWork) {
  // 先拿到父类的fiber
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot:
      {
        const parent = parentFiber.stateNode.containerInfo;
        const before = getHostSibling(finishedWork);
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }

      break;
    case HostComponent:
      // 静态节点
      const parent = parentFiber.stateNode;
      // 获取前一个节点
      const before = getHostSibling(finishedWork);
      // 指定的节点之前添加
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    default:
      break;
  }
}

/**
 * 执行结束的工作fiber
 *
 * @author lihh
 * @param finishedWork 执行结束的工作fiber
 */
function commitReconciliationEffects(finishedWork) {
  const { flags } = finishedWork;
  if (!!(flags & Placement)) {
    commitPlacement(finishedWork);
    // 将插入状态 抹去
    finishedWork.flags &= ~Placement;
  }
}

/**
 * 在fiber 基础上 提交副作用的commit
 *
 * @author lihh
 * @param finishedWork 最终确立的工作work
 * @param root 根节点
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  // 针对tag 进行判断
  switch (finishedWork.tag) {
    case HostRoot:
    case HostComponent:
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    }
  }
}
