import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "react-reconciler/src/ReactWorkTags";
import {
  MutationMask,
  Passive,
  Placement,
  Update,
  LayoutMask,
  Ref,
} from "react-reconciler/src/ReactFiberFlags";
import {
  appendChild,
  commitUpdate,
  insertBefore,
  removeChild,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import {
  Passive as HookPassive,
  HasEffect as HookHasEffect,
  Layout as HookLayout,
} from "react-reconciler/src/ReactHookEffectTags";

let hostParent = null;

/**
 * 提交变更的effect
 *
 *@author lihh
 * @param finishedWork 结束的工作 work
 * @param root 根节点
 */
export function commitMutationEffects(finishedWork, root) {
  commitMutationEffectsOnFiber(finishedWork, root);
}

/**
 * 提交消极的 卸载函数的effect
 *
 * @author lihh
 * @param finishedWork 结束的work
 */
export function commitPassiveUnmountEffects(finishedWork) {
  commitPassiveUnmountOnFiber(finishedWork);
}

/**
 * 提交hook effect unMount事件
 *
 * @author lihh
 * @param flags
 * @param finishedWork
 */
function commitHookEffectListUnmount(flags, finishedWork) {
  // 拿到fiber中更新队列
  const updateQueue = finishedWork.updateQueue;
  // 拿到effect
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    // 拿到待执行的 第一个effect
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      // 满足条件的话 说明满足内部存在effect
      if ((effect.tag & flags) === flags) {
        // 拿到effect 副作用函数
        const destroy = effect.destroy;
        effect.destroy = null;

        if (destroy !== null) destroy();
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

/**
 * 提交执行 hook中消极的卸载函数effect
 *
 * @author lihh
 * @param finishedWork 完成work
 * @param nearestMountedAncestor 最近被挂载的节点
 * @param hookFlags hook的标志
 */
function commitHookPassiveUnmountEffects(
  finishedWork,
  nearestMountedAncestor,
  hookFlags,
) {
  commitHookEffectListUnmount(hookFlags, finishedWork, nearestMountedAncestor);
}

/**
 * 在fiber上 提交消极的卸载函数
 *
 * @author lihh
 * @param finishedWork 结束的fiber
 */
function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      //  递归遍历处理子节点
      recursivelyTraversePassiveUnmountEffects(finishedWork);

      // 判断fiber中是否包含effect
      if (!!(finishedWork.flags & Passive)) {
        commitHookPassiveUnmountEffects(
          finishedWork,
          finishedWork.return,
          // 表示存在useEffect & 有待执行的useEffect
          HookPassive | HookHasEffect,
        );
      }
      break;
    }

    default: {
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    }
  }
}

/**
 * 提交执行 useEffect的函数
 *
 * @author lihh
 * @param root 主 节点
 * @param finishedWork 完成的work
 */
export function commitPassiveMountEffects(root, finishedWork) {
  commitPassiveMountOnFiber(root, finishedWork);
}

/**
 * 递归遍历消息挂载effect（其实就是执行useEffect 时机）
 *
 * @author lihh
 * @param root 根节点
 * @param parentFiber 父类的fiber
 */
function recursivelyTraversePassiveMountEffects(root, parentFiber) {
  // 判断fiber上 是否包含effect
  if (!!(parentFiber.subTreeFlags & Passive)) {
    let child = parentFiber.child;
    for (; child !== null; child = child.sibling)
      commitPassiveMountOnFiber(root, child);
  }
}

/**
 * 在fiber上  执行useEffect的挂载过程
 *
 * @author lihh
 * @param finishedRoot 执行结束的root 节点
 * @param finishedWork 执行结束的 work
 */
function commitPassiveMountOnFiber(finishedRoot, finishedWork) {
  const flags = finishedWork.flags;

  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);

      // 判断fiber中是否包含effect
      if (!!(flags & Passive)) {
        commitHookPassiveMountEffects(
          finishedWork,
          HookPassive | HookHasEffect,
        );
      }
      break;
    }

    case HostRoot: {
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
      break;
    }

    default:
      break;
  }
}

/**
 * 提交执行 useEffect（挂载阶段）
 *
 * @author lihh
 * @param finishedWork 完成的work
 * @param hookFlags effect 标识
 */
function commitHookPassiveMountEffects(finishedWork, hookFlags) {
  commitHookEffectListMount(hookFlags, finishedWork);
}

/**
 *
 * @param flags
 * @param finishedWork
 */
function commitHookEffectListMount(flags, finishedWork) {
  // 更新队列
  const updateQueue = finishedWork.updateQueue;
  // 拿到第一个effect
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    // 此时这个是第一个effect
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & flags) === flags) {
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

/**
 * 递归遍历 消极的卸载effect 函数
 *
 * @author lihh
 * @param parentFiber 父类fiber
 */
function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  // 判断fiber 上是否有effect
  if (!!(parentFiber.subTreeFlags & Passive)) {
    let child = parentFiber.child;
    for (; child !== null; child = child.sibling)
      commitPassiveUnmountOnFiber(child);
  }
}

/**
 * 递归遍历删除的effect
 *
 * @author lihh
 * @param finishedRoot 已经完成的 root 节点
 * @param nearestMountedAncestor 最近的祖父节点
 * @param parent 父节点
 */
function recursivelyTraverseDeletionEffects(
  finishedRoot,
  nearestMountedAncestor,
  parent,
) {
  let child = parent.child;
  while (child !== null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
  }
}

/**
 * 在fiber上 提交删除副作用
 *
 * @author lihh
 * @param finishedRoot 完成的root节点
 * @param nearestMountedAncestor 附近最近的被挂载的祖先节点
 * @param deletedFiber 被删除的节点
 */
function commitDeletionEffectsOnFiber(
  finishedRoot,
  nearestMountedAncestor,
  deletedFiber,
) {
  switch (deletedFiber.tag) {
    case HostComponent:
    case HostText: {
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      if (hostParent !== null) removeChild(hostParent, deletedFiber.stateNode);
    }
    default:
      break;
  }
}

/**
 * 提交删除的副作用
 *
 * @author lihh
 * @param root root节点
 * @param returnFiber 父类fiber 其实父亲不一定是真的dom父亲，有可能是函数 fiber
 * @param deleteFiber 将要被删除的fiber
 */
function commitDeletionEffects(root, returnFiber, deleteFiber) {
  let parent = returnFiber;
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent: {
        hostParent = parent.stateNode;
        break findParent;
      }
      case HostRoot: {
        hostParent = parent.stateNode.containerInfo;
        break findParent;
      }
      default:
        break;
    }
    parent = parent.return;
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deleteFiber);
  hostParent = null;
}

/**
 * 递归解析 有副作用的fiber
 *
 * @author lihh
 * @param root 根节点
 * @param parentFiber 父fiber
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
  // 判断是否有子节点需要删除
  const deletions = parentFiber.deletions;
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      commitDeletionEffects(root, parentFiber, childToDelete);
    }
  }

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
 * 提交更新的effect
 *
 * @author lihh
 * @param finishedWork 执行结束的work
 */
function commitUpdateEffects(finishedWork) {
  const flags = finishedWork.flags;
  const current = finishedWork.alternate;

  // 表示更新的操作
  if (!!(flags & Update)) {
    // 拿到的这是一个html 节点
    const instance = finishedWork.stateNode;
    if (instance !== null) {
      const newProps = finishedWork.memoizedProps;
      const oldProps = current !== null ? current.memoizedProps : newProps;
      const type = finishedWork.type;
      const updatePayload = finishedWork.updateQueue;
      finishedWork.updateQueue = null;

      if (updatePayload !== null) {
        commitUpdate(
          instance,
          updatePayload,
          type,
          oldProps,
          newProps,
          finishedWork,
        );
      }
    }
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
  const flags = finishedWork.flags;

  // 针对tag 进行判断
  switch (finishedWork.tag) {
    case HostRoot:
    case FunctionComponent:
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);

      // layoutEffect 执行卸载
      if (!!(flags & Update))
        commitHookEffectListUnmount(
          HookLayout | HookHasEffect,
          finishedWork,
          finishedWork.return,
        );
      break;
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);

      // 提交更新的副作用
      commitUpdateEffects(finishedWork);
      break;
    }
  }
}

/**
 * 提交 layoutEffect
 *
 * @author lihh
 * @param finishedWork 完成的工作 work
 * @param root 根节点
 */
export function commitLayoutEffects(finishedWork, root) {
  const current = finishedWork.alternate;
  // 在fiber上 提交layoutEffect
  commitLayoutEffectOnFiber(root, current, finishedWork);
}

/**
 * 提交设置ref
 *
 * @author lihh
 * @param finishedWork 完成工作的work
 */
function commitAttachRef(finishedWork) {
  const ref = finishedWork.ref;

  // 判断ref 是否为null
  if (ref !== null) {
    // 拿到 dom节点
    const instance = finishedWork.stateNode;
    let instanceToUse;

    // 此处源码经过转换的，这种写法只是为了跟源码保持高度一致的
    switch (finishedWork.tag) {
      default:
        instanceToUse = instance;
    }

    ref.current = instanceToUse;
  }
}

/**
 * 安全的设置 ref的值
 *
 * @author lihh
 * @param current 当前完成工作的fiber
 */
function safelyAttachRef(current) {
  commitAttachRef(current);
}

/**
 * 在fiber上 提交layoutEffect
 *
 * @author lihh
 * @param finishedRoot 结束的root根节点
 * @param current 当前fiber
 * @param finishedWork 完成work
 */
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
  const flags = finishedWork.flags;

  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 递归遍历子fiber
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);

      // fiber上包含 useLayoutEffect
      if (!!(flags & Update)) {
        commitHookLayoutEffects(finishedWork, HookLayout | HookHasEffect);
      }
      break;
    }

    case HostComponent: {
      // 是否包含ref 标签
      if (flags & Ref) safelyAttachRef(finishedWork);
      break;
    }

    case HostRoot: {
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      break;
    }
    default:
      break;
  }
}

/**
 * 递归遍历子节点
 *
 * @author lihh
 * @param root root 根节点
 * @param parentFiber 父类fiber
 */
function recursivelyTraverseLayoutEffects(root, parentFiber) {
  if (!!(parentFiber.subTreeFlags & LayoutMask)) {
    let child = parentFiber.child;
    while (child !== null) {
      const current = child.alternate;
      commitLayoutEffectOnFiber(root, current, child);
      child = child.sibling;
    }
  }
}

/**
 * 提交 hook上 layoutEffect
 *
 * @author lihh
 * @param finishedWork 完成的work
 * @param hookFlags hook上标识
 */
function commitHookLayoutEffects(finishedWork, hookFlags) {
  commitHookEffectListMount(hookFlags, finishedWork);
}
