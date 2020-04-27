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

const Global = createGlobalStyle``;

// TODO: Disable the view if have no user id. Don't hide, just grey out.

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CssBaseline />
        <Global />
        <Router>
          <Switch>
            <Route
              path="/story/:storyId"
              component={(props: RouteComponentProps<{ storyId: string }>) => (
                <Story storyId={props.match.params.storyId} />
              )}
            ></Route>
            <Redirect to={`/story/${uuid()}`} />
          </Switch>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
