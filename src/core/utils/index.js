import {reactText} from "./constant";

export const wrapStringToVdom = (element) => (element && typeof element === 'object' ? element : {$$typeof: reactText, type: reactText, props: element})
