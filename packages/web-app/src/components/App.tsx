import React from "react";
import { Provider } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Router from "./Router";
import { store, persistor } from "../store";
import "../store/socketActionDispatcher";
import LoadingOverlay from "./LoadingOverlay";

const Global = createGlobalStyle`
  html, body, #root { 
    display: flex; 
    flex-direction: column;
    position: absolute; 
    top: 0; 
    left: 0;
    right: 0; 
    bottom: 0; 
    margin: 0;
    overflow: hidden;
  }
`;

const theme = createMuiTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Global />
      <Provider store={store}>
        <PersistGate
          loading={<LoadingOverlay zIndex="WHOLE_APP_LOADING_OVERLAY" />}
          persistor={persistor}
        >
          <Router />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}

export default React.memo(App);
