import { clientListActionType, LogActionType, userActionType, notifActionType, twoFactorActionType } from "../Action-Types"
import { Client, msg, msgList, Notif } from "../type"



type ClientAddAction = {
    type: clientListActionType.ADDCLIENT
    payload: Client
}

type ClientRemoveAction = {
    type: clientListActionType.REMOVECLIENT
    payload: Client
}

type MsgAddAction = {
    type: clientListActionType.ADDMSG
    payload: msg
}

type SetActivConversAction = {
    type: clientListActionType.SETACTIVECONVERS
    payload: string
}

export type clientListAction = ClientAddAction | ClientRemoveAction | MsgAddAction | SetActivConversAction




type SetUsernameAction = {
    type: LogActionType.SETUSERNAME
    payload: string
}

type SetIdAction = {
    type: LogActionType.SETID
    payload: string
}


export type logAction = SetUsernameAction | SetIdAction

type SetUserAction = {
    type: userActionType.SETUSER
    payload: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        looses: number,
        rank: number,
        profile_pic: string,
        is2faEnabled: boolean
    } | null
}

export type userAction = SetUserAction


type SetNotifAction = {
    type: notifActionType.SETNOTIF
    payload: Notif;
}

type DelNotifAction = {
    type: notifActionType.DELNOTIF
    payload: Notif;
}

type DelAllNotifAction = {
    type: notifActionType.DELALLNOTIF
}

export type notifAction = SetNotifAction | DelNotifAction | DelAllNotifAction


type SetTwoFactor = {
    type: twoFactorActionType.SETTWOFACTOR
    payload: boolean
}

export type twoFactorAction = SetTwoFactor
