/**
 * 实现小顶堆的逻辑
 *
 * @author lihh
 */

/**
 * 给小顶堆的中添加元素
 *
 * @author lihh
 * @param heap 传递的小顶堆
 * @param node 添加的元素
 */
export function push(heap, node) {
  const index = heap.length;
  // 将元素添加到堆的尾部
  heap.push(node);
  // 将元素进行上浮，一定要保持住 小顶堆的结构
  siftUp(heap, node, index);
}

/**
 * 拿到堆顶的值，但是不剔除
 *
 * @author lihh
 * @param heap 小顶堆
 */
export function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}

/**
 * 从小顶堆中弹出 第一个元素(其实就是堆顶的元素)
 *
 * @author lihh
 * @param heap 小顶堆
 */
export function pop(heap) {
  // 判断是否为空
  if (heap.length === 0) return null;

  // 拿到第一个元素
  const first = heap[0];
  // 拿到最后一个元素
  const last = heap.pop();

  if (first !== last) {
    // 最后一个元素 放到第一个位置
    heap[0] = last;
    // 将元素向下调整
    siftDown(heap, last, 0);
  }
  return first;
}

/**
 * 将元素下沉
 *
 * @author lihh
 * @param heap 小顶堆
 * @param node
 * @param i
 */
function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  // 半长度
  const halfLength = length >>> 1;
  while (index < halfLength) {
    // 左侧 元素下标
    const leftIndex = (index + 1) * 2 - 1;
    // 表示 左侧下标对应的值
    const leftValue = heap[leftIndex];

    // 右侧索引 以及右侧索引对应的值
    const rightIndex = leftIndex + 1;
    const rightValue = heap[rightIndex + 1];

    // 满足此条件的话，说明 node节点还是需要向下移动的，因为left节点比node节点小的
    if (compare(leftValue, node) < 0) {
      // 如果条件 rightIndex < length的话  说明right 元素是有值的
      // 如果满足第二个条件的话 说明右侧的值 比 左侧的值 更加小啊
      if (rightIndex < length && compare(rightValue, leftValue) < 0) {
        // 先跟right侧 进行交换
        heap[index] = rightValue;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // 能执行到这里，可能right的值 比 left的值要大
        heap[index] = leftValue;
        heap[leftIndex] = node;
        index = leftIndex;
      }

      // 能执行到此处，说明左侧的值 比 node大，那就开始比较右侧的值
    } else if (rightIndex < length && compare(rightValue, node) < 0) {
      heap[index] = rightValue;
      heap[rightIndex] = node;
      index = rightIndex;
    } else return;
  }
}

/**
 * 元素上调
 *
 * @author lihh
 * @param heap 小顶堆
 * @param node 添加的元素
 * @param i 下标 添加元素的下标 - 1
 */
function siftUp(heap, node, i) {
  let index = i;

  while (index > 0) {
    // 拿到父节点的下标
    const parentIndex = (index - 1) >>> 1;
    // 父亲的值
    const parent = heap[parentIndex];

    // 满足此条件意味着：node还没移动到想要的位置，如果满足小顶推的情况下必须是：任意父节点 都小于 子节点。
    // 所以此条件跟 小顶堆的条件互斥了，还需要不断的移动
    if (compare(parent, node) > 0) {
      // 互换位置
      heap[parentIndex] = node;
      heap[index] = parent;

      index = parentIndex;
    } else return;
  }
}

/**
 * 进行值的比较
 *
 * @author lihh
 * @param beforeValue 比较前的值
 * @param afterValue 比较后的值
 */
function compare(beforeValue, afterValue) {
  // 如果无法比较索引的情况下 ，需要比较id
  const diff = beforeValue.sortIndex - afterValue.sortIndex;
  return diff !== 0 ? diff : beforeValue.id - afterValue.id;
}
