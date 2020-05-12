import React from "react";
import {
  Redirect,
  RouteComponentProps,
  matchPath,
  useHistory,
} from "react-router-dom";
import Story from "../components/Story";
import "../store/socketActionDispatcher";
import ChooseStoryPage from "../components/ChooseStoryPage";

type RouteProps = RouteComponentProps<{ storyId: string }>;

type RouteKey = "standardStory" | "prevStoryPath" | "default" | "liveStory";

type BaseRoute<O> = O & {
  key: RouteKey;
  toolBarSubTitle?: string;
  isExact?: boolean;
};

type Route =
  | BaseRoute<{
      path: string;
      component: (props: RouteProps) => JSX.Element;
      children?: undefined;
    }>
  | BaseRoute<{
      path: string;
      component?: undefined;
      children: JSX.Element;
    }>
  | BaseRoute<{
      path?: undefined;
      component: (props: RouteProps) => JSX.Element;
      children?: undefined;
    }>
  | BaseRoute<{
      path?: undefined;
      component?: undefined;
      children: JSX.Element;
    }>;

function useRoutes() {
  const history = useHistory();

  const routesById: { [K in RouteKey]: Route } = {
    liveStory: {
      isExact: true,
      path: "/story/live/:storyId",
      key: "liveStory",
      toolBarSubTitle: "Live",
      component: React.useCallback(
        (props: RouteComponentProps<{ storyId: string }>) => (
          <Story storyId={props.match.params.storyId} />
        ),
        []
      ),
    },
    standardStory: {
      isExact: true,
      path: "/story/standard/:storyId",
      key: "standardStory",
      toolBarSubTitle: "Standard",
      component: React.useCallback(
        (props: RouteComponentProps<{ storyId: string }>) => (
          <Story storyId={props.match.params.storyId} />
        ),
        []
      ),
    },
    prevStoryPath: {
      isExact: true,
      path: "/story/:storyId",
      key: "prevStoryPath",
      component: React.useCallback(
        (props: RouteComponentProps<{ storyId: string }>) => (
          <Redirect to={`/story/live/${props.match.params.storyId}`} />
        ),
        []
      ),
    },
    default: {
      isExact: false,
      key: "default",
      children: <ChooseStoryPage />,
    },
  };

  const orderedRoutes: Route[] = [
    routesById.liveStory,
    routesById.standardStory,
    routesById.prevStoryPath,
    routesById.default,
  ];

  const matchedRoute =
    orderedRoutes.find((route) =>
      route.path ? matchPath(history.location.pathname, route) : true
    ) || routesById.default;

  return {
    orderedRoutes,
    matchedRoute,
    routesById,
  };
}

export default useRoutes;
