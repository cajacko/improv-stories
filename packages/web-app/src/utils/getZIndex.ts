import zIndexes, { zIndexMap } from "../config/zIndexes";

export type ZIndex = keyof typeof zIndexMap;

function getZIndex(zIndex: ZIndex) {
  const index = zIndexes.indexOf(zIndex);

  if (index < 0) return 0;

  return index + 1;
}

export default getZIndex;
