import React from "react";
import { Switch, Route as RRRoute } from "react-router-dom";
import Link from "@material-ui/core/Link";
import "../store/socketActionDispatcher";
import LoadingOverlay from "./LoadingOverlay";
import useIsConnected from "../hooks/useIsConnected";
import AppLoading from "../context/AppLoading";
import ToolBar from "./ToolBar";
import useRoutes from "../hooks/useRoutes";

function Router() {
  const isConnected = useIsConnected();
  const isAppLoading = !isConnected;
  const { matchedRoute, orderedRoutes } = useRoutes();

  return (
    <AppLoading.Provider value={isAppLoading}>
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

        <ToolBar subTitle={matchedRoute.toolBarSubTitle} />

        <Switch>
          {orderedRoutes.map(({ key, component, children, path }) => (
            <RRRoute key={key} component={component} path={path}>
              {children}
            </RRRoute>
          ))}
        </Switch>
      </div>
    </AppLoading.Provider>
  );
}

export default Router;
