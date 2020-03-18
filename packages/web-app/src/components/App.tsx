import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { Provider } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import apolloClient from "../utils/apolloClient";
import Story from "./Story";
import Toolbar from "./Toolbar";

const Global = createGlobalStyle``;

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Global />
          <Toolbar />
          <Story />
        </PersistGate>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
