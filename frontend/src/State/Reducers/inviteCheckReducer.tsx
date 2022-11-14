import { inviteCheckActionType } from "../Action-Types";
import { inviteCheckAction } from "../Actions";

export interface inviteCheck {
    verif: boolean,
    reload: boolean
}

export const initialState: inviteCheck = {
    verif: false,
    reload: false
}

export const inviteCheckReducer = (state: inviteCheck = initialState, action: inviteCheckAction) => {
    switch (action.type) {
        case inviteCheckActionType.SETINVITECHECK: {
            return {
                ...state,
                verif: action.payload
            };
        }
        case inviteCheckActionType.SETINVITECHECKRELOAD: {
            return {
                ...state,
                reload: action.payload
            };
        }
        default:
            return state;
    }
}