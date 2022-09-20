import { Dispatch } from "redux"
import { clientListActionType, LogActionType, userActionType, notifActionType, twoFactorActionType } from "../Action-Types"
import { clientListAction, logAction, userAction, notifAction, twoFactorAction } from "../Actions"
import { Client, msg, Notif } from "../type"

//ClientList
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

//LogData
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

//User
export const setUser = (item:{
    id: number,
    login: string,
    nickname: string,
    wins: number,
    looses: number,
    rank: number,
    profile_pic: string,
    is2faEnabled: boolean
} | null) => {
    return (dispatch: Dispatch<userAction>) => {
        dispatch({
            type: userActionType.SETUSER,
            payload: item
        })
    }
}

//Notif
export const setNotif = (item: any) => {
    return (dispatch: Dispatch<notifAction>) => {
        dispatch({
            type: notifActionType.SETNOTIF,
            payload: item
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

export const setTwoFactor = (item: boolean) => {
    return (dispatch: Dispatch<twoFactorAction>) => {
        dispatch({
            type: twoFactorActionType.SETTWOFACTOR,
            payload: item
        })
    }
}