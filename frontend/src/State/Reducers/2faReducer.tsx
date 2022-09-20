import { twoFactorActionType } from "../Action-Types";
import { twoFactorAction } from "../Actions";

export interface twoFactor {
    verif: boolean
}

export const initialState: twoFactor = {
    verif: false
}

export const twoFactorReducer = (state: twoFactor = initialState, action: twoFactorAction) => {
    switch (action.type) {
        case twoFactorActionType.SETTWOFACTOR: {
                return {
                ...state,
                verif: action.payload
                };
          }
          default:
          return state;
    }
}