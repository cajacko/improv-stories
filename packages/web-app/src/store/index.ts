import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";
import rootReducer from "./reducers";

const persistConfig = {
  key: "root",
  storage,
  blacklist: []
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(persistedReducer, applyMiddleware(logger));

// @ts-ignore persist store doesn't accept that payload is required
const persistor = persistStore(store);

export { store, persistor };
