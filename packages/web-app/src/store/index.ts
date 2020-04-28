import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer, { rawReducersObj } from "./reducers";

type ReducerKey = keyof typeof rawReducersObj;

const blacklist: ReducerKey[] | undefined = undefined;
const whitelist: ReducerKey[] | undefined = ["currentUser"];

const persistConfig = {
  key: "root",
  storage,
  blacklist,
  whitelist,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(
  persistedReducer,
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// @ts-ignore persist store doesn't accept that payload is required
const persistor = persistStore(store);

export { store, persistor };
