import { Dispatch } from "redux"
import { clientListActionType, LogActionType, userActionType, notifActionType, twoFactorActionType, chatNotifActionType, inviteCheckActionType } from "../Action-Types"
import { clientListAction, logAction, userAction, notifAction, twoFactorAction, chatNotifAction, inviteCheckAction } from "../Actions"
import { Client, msg, Notif } from "../type"

export const addClient = (item: Client) => {
    return (dispatch: Dispatch<clientListAction>) => {
        dispatch({
            type: clientListActionType.ADDCLIENT,
            payload: item
        })
    }
}

export const removeClient = (item: Client) => {
    return (dispatch: Dispatch<clientListAction>) => {
        dispatch({
            type: clientListActionType.REMOVECLIENT,
            payload: item
        })
    }
}

export const addMsg = (item: msg) => {
    return (dispatch: Dispatch<clientListAction>) => {
        dispatch({
            type: clientListActionType.ADDMSG,
            payload: item
        })
    }
}

export const setActivConvers = (item: string) => {
    return (dispatch: Dispatch<clientListAction>) => {
        dispatch({
            type: clientListActionType.SETACTIVECONVERS,
            payload: item
        })
    }
}

export const setUsername = (item: string) => {
    return (dispatch: Dispatch<logAction>) => {
        dispatch({
            type: LogActionType.SETUSERNAME,
            payload: item
        })
    }
}

export const setId = (item: string) => {
    return (dispatch: Dispatch<logAction>) => {
        dispatch({
            type: LogActionType.SETID,
            payload: item
        })
    }
}

export const setUser = (item: {
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
} | null) => {
    return (dispatch: Dispatch<userAction>) => {
        dispatch({
            type: userActionType.SETUSER,
            payload: item
        })
    }
}

export const setNotif = (item: any) => {
    return (dispatch: Dispatch<notifAction>) => {
        dispatch({
            type: notifActionType.SETNOTIF,
            payload: item
        })
    }
}

export const setAllNotifSeen = () => {
    return (dispatch: Dispatch<notifAction>) => {
        dispatch({
            type: notifActionType.SETALLNOTIFSEEN,
        })
    }
}

export const delNotif = (item: Notif) => {
    return (dispatch: Dispatch<notifAction>) => {
        dispatch({
            type: notifActionType.DELNOTIF,
            payload: item
        })
    }
}

export const delAllNotif = () => {
    return (dispatch: Dispatch<notifAction>) => {
        dispatch({
            type: notifActionType.DELALLNOTIF,
        })
    }
}

export const addChatNotif = (item: { name: string, userOrRoom: boolean, nb: number }) => {
    return (dispatch: Dispatch<chatNotifAction>) => {
        dispatch({
            type: chatNotifActionType.ADDCHATNOTIF,
            payload: item
        })
    }
}

export const delChatNotif = (item: { name: string, userOrRoom: boolean }) => {
    return (dispatch: Dispatch<chatNotifAction>) => {
        dispatch({
            type: chatNotifActionType.DELCHATNOTIF,
            payload: item
        })
    }
}

export const initChatNotif = () => {
    return (dispatch: Dispatch<chatNotifAction>) => {
        dispatch({
            type: chatNotifActionType.INITCHATNOTIF
        })
    }
}

export const initOneConversChatNotif = (item: { name: string, userOrRoom: boolean }) => {
    return (dispatch: Dispatch<chatNotifAction>) => {
        dispatch({
            type: chatNotifActionType.INITONECONVERSCHATNOTIF,
            payload: item
        })
    }
}

export const setConversChatNotif = (item: { name: string, userOrRoom: boolean }) => {
    return (dispatch: Dispatch<chatNotifAction>) => {
        dispatch({
            type: chatNotifActionType.SETCONVERS,
            payload: item
        })
    }
}

export const setTwoFactor = (item: boolean) => {
    return (dispatch: Dispatch<twoFactorAction>) => {
        dispatch({
            type: twoFactorActionType.SETTWOFACTOR,
            payload: item
        })
    }
}

export const setInviteCheck = (item: boolean) => {
    return (dispatch: Dispatch<inviteCheckAction>) => {
        dispatch({
            type: inviteCheckActionType.SETINVITECHECK,
            payload: item
        })
    }
}

export const setInviteCheckReload = (item: boolean) => {
    return (dispatch: Dispatch<inviteCheckAction>) => {
        dispatch({
            type: inviteCheckActionType.SETINVITECHECKRELOAD,
            payload: item
        })
    }
}