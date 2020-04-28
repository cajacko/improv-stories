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
  RouteComponentProps,
} from "react-router-dom";
import { store, persistor } from "../store";
import Story from "./Story";
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

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CssBaseline />
        <Global />
        <Router>
          <LoadingOverlay>
            <Switch>
              <Route
                path="/story/:storyId"
                component={(
                  props: RouteComponentProps<{ storyId: string }>
                ) => <Story storyId={props.match.params.storyId} />}
              ></Route>
              <Redirect to={`/story/${uuid()}`} />
            </Switch>
          </LoadingOverlay>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
