import { reactText } from './constant'

export const wrapStringToVdom = (element) =>
  element && typeof element === 'object'
    ? element
    : { $$typeof: reactText, type: reactText, props: element }

// 通过浅比较 判断两个对象是否相同
export const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  )
    return false

  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false

  for (const item in obj1) {
    if (item === 'children') continue
    if (!obj2.hasOwnProperty(item) || obj2[item] !== obj1[item]) return false
  }

  return true

}
