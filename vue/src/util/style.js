export const toClassSelector = className => `.${className}`;
export const toIdSelector = id => `#${id}`;
export const toNumber = px => Number(px.match(/^\d+/)[0]);
export const toPx = number => `${number}px`;
