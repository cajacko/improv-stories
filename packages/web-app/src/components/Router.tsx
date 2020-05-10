import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  RouteComponentProps,
} from "react-router-dom";
import Link from "@material-ui/core/Link";
import Story from "./Story";
import "../store/socketActionDispatcher";
import LoadingOverlay from "./LoadingOverlay";
import useIsConnected from "../hooks/useIsConnected";
import AppLoading from "../context/AppLoading";
import ToolBar from "./ToolBar";
import ChooseStoryPage from "./ChooseStoryPage";

function Router() {
  const isConnected = useIsConnected();
  const isAppLoading = !isConnected;

  return (
    <AppLoading.Provider value={isAppLoading}>
      <BrowserRouter>
        <>
          <Link
            style={{
              height: 30,
              width: "100%",
              padding: 5,
              textAlign: "center",
              boxSizing: "border-box",
            }}
            href="https://forms.gle/hmCQCVqfwyZ3kueN7"
            rel="noopener noreferrer"
            target="_blank"
          >
            Click here to submit feedback
          </Link>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {isAppLoading && (
              <LoadingOverlay
                zIndex="WHOLE_APP_LOADING_OVERLAY"
                shouldRenderIfAppIsLoading
              />
            )}

            <ToolBar />

            <Switch>
              <Route
                path="/story/live/:storyId"
                component={React.useCallback(
                  (props: RouteComponentProps<{ storyId: string }>) => (
                    <Story storyId={props.match.params.storyId} />
                  ),
                  []
                )}
              ></Route>

              <Route
                path="/story/standard/:storyId"
                component={React.useCallback(
                  (props: RouteComponentProps<{ storyId: string }>) => (
                    <Story storyId={props.match.params.storyId} />
                  ),
                  []
                )}
              ></Route>

              <Route
                path="/story/:storyId"
                component={React.useCallback(
                  (props: RouteComponentProps<{ storyId: string }>) => (
                    <Redirect
                      to={`/story/live/${props.match.params.storyId}`}
                    />
                  ),
                  []
                )}
              ></Route>

              <Route>
                <ChooseStoryPage />
              </Route>
            </Switch>
          </div>
        </>
      </BrowserRouter>
    </AppLoading.Provider>
  );
}

export default Router;
