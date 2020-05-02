import React from "react";
import { v4 as uuid } from "uuid";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  RouteComponentProps,
} from "react-router-dom";
import Story from "./Story";
import "../store/socketActionDispatcher";
import LoadingOverlay from "./LoadingOverlay";
import useIsConnected from "../hooks/useIsConnected";
import AppLoading from "../context/AppLoading";

function Router() {
  const isConnected = useIsConnected();
  const isAppLoading = !isConnected;

  return (
    <AppLoading.Provider value={isAppLoading}>
      <BrowserRouter>
        {isAppLoading && (
          <LoadingOverlay
            zIndex="WHOLE_APP_LOADING_OVERLAY"
            shouldRenderIfAppIsLoading
          />
        )}
        <Switch>
          <Route
            path="/story/:storyId"
            component={React.useCallback(
              (props: RouteComponentProps<{ storyId: string }>) => (
                <Story storyId={props.match.params.storyId} />
              ),
              []
            )}
          ></Route>
          <Redirect to={`/story/${uuid()}`} />
        </Switch>
      </BrowserRouter>
    </AppLoading.Provider>
  );
}

export default Router;
