import { combineReducers } from "redux";
import { clientListReducer } from "./clientListReducer";
import { logReducer } from "./logReducer";
import { userReducer } from "./userReducer";
import { utilsReducer } from "./utilsReducer";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { notifReducer } from "./notifReducer";
import { twoFactorReducer } from "./2faReducer";
import { chatNotifReducer } from "./chatNotifReducer";
import { inviteCheckReducer } from "./inviteCheckReducer";

const persistConfig = {
  key: 'root',
  storage,
}

const tmp = combineReducers({
  userReducer: userReducer,
  notifReducer: notifReducer,
  twoFactorReducer: twoFactorReducer,
  chatNotifReducer: chatNotifReducer,
  inviteCheckReducer: inviteCheckReducer,
})

const persistantReducer = persistReducer(persistConfig, tmp)

const reducers = combineReducers({
  log: logReducer,
  clientList: clientListReducer,
  utils: utilsReducer,
  persistantReducer: persistantReducer
});

export default reducers;

export type RootState = ReturnType<typeof reducers>