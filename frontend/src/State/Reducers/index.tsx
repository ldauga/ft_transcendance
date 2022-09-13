import { combineReducers } from "redux";
import { clientListReducer } from "./clientListReducer";
import { logReducer } from "./logReducer";
import { userReducer } from "./userReducer";
import { utilsReducer } from "./utilsReducer";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage,
  }
  
  const persistedReducer = persistReducer(persistConfig, userReducer)

const reducers = combineReducers({
    log: logReducer,
    clientList: clientListReducer,
    utils: utilsReducer,
    user: persistedReducer
});

export default reducers;

export type RootState = ReturnType<typeof reducers>