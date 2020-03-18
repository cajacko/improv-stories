import { StateType, ActionType } from "typesafe-actions";
import { Dispatch } from "redux";

declare module "ReduxTypes" {
  export type Store = StateType<typeof import("./index").default>;
  export type RootAction = ActionType<typeof import("./actions").default>;
  export type RootState = StateType<typeof import("./reducers").default>;
}

declare module "typesafe-actions" {
  interface Types {
    RootAction: ActionType<typeof import("./actions").default>;
  }
}

declare module "react-redux" {
  function useSelector<
    TState = StateType<typeof import("./reducers").default>,
    TSelected = unknown
  >(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;

  function useDispatch<
    TDispatch = Dispatch<ActionType<typeof import("./actions").default>>
  >(): TDispatch;
}
