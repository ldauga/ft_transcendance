import { userActionType } from "../Action-Types";
import { userAction } from "../Actions";

export interface User {
    user: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        losses: number,
        rank: number,
        profile_pic: string,
        isTwoFactorAuthenticationEnabled: boolean,
        isFirstConnection: boolean,
        errorNickname: boolean
    } | null;
}

export const initialState: User = {
    user: null
}

export const userReducer = (state: User = initialState, action: userAction) => {
    switch (action.type) {
        case userActionType.SETUSER: {
                return {
                ...state,
                user: action.payload
                };
          }
          default:
          return state;
    }
}