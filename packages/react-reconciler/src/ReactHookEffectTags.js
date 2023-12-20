export const NoFlags = /*   */ 0b0000;

// 是否包含effect
export const HasEffect = /* */ 0b0001;

// Represents the phase in which the effect (not the clean-up) fires.
export const Insertion = /* */ 0b0010;
// 表示 useLayoutEffect
export const Layout = /*    */ 0b0100;
// 表示useEffect
export const Passive = /*   */ 0b1000;
