import React from "react";
import styled from "styled-components";
import CircularProgress from "@material-ui/core/CircularProgress";
import useIsConnected from "../hooks/useIsConnected";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  background-color: black;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function LoadingOverlay({ children }: { children?: React.ReactChild }) {
  const isConnected = useIsConnected();

  return (
    <Container>
      {!isConnected && (
        <Overlay>
          <CircularProgress />
        </Overlay>
      )}
      {children}
    </Container>
  );
}

export default LoadingOverlay;
