import zIndexes, { zIndexMap } from "../config/zIndexes";

function getZIndex(zIndex: keyof typeof zIndexMap) {
  const index = zIndexes.indexOf(zIndex);

  if (index < 0) return 0;

  return index + 1;
}

export default getZIndex;
