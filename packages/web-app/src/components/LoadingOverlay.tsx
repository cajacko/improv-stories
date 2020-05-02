import React from "react";
import styled from "styled-components";
import CircularProgress from "@material-ui/core/CircularProgress";
import getZIndex, { ZIndex } from "../utils/getZIndex";
import AppLoading from "../context/AppLoading";

const Overlay = styled.div<{ zIndex: ZIndex }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ zIndex }) => getZIndex(zIndex)};
  background-color: black;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function LoadingOverlay({
  children,
  zIndex,
  shouldRenderIfAppIsLoading,
}: {
  children?: React.ReactChild;
  zIndex: ZIndex;
  shouldRenderIfAppIsLoading?: boolean;
}) {
  const isAppLoading = React.useContext(AppLoading);
  const shouldShowLoading = !isAppLoading || shouldRenderIfAppIsLoading;

  return (
    <>
      {shouldShowLoading && (
        <Overlay zIndex={zIndex}>
          <CircularProgress />
        </Overlay>
      )}
      {children}
    </>
  );
}

export default React.memo(LoadingOverlay);
