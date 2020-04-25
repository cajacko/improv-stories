import React from "react";
import { Provider } from "react-redux";
import { createGlobalStyle } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { v4 as uuid } from "uuid";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { store, persistor } from "../store";
import Story from "./Story";
import "../store/socketActionDispatcher";

const Global = createGlobalStyle``;

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CssBaseline />
        <Global />
        <Router>
          <Switch>
            <Route path="/story/:storyId">
              <Story />
            </Route>
            <Redirect to={`/story/${uuid()}`} />
          </Switch>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
