import { clientListActionType, LogActionType, userActionType } from "../Action-Types"
import { Client, msg, msgList } from "../type"



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
        profile_pic: string
    } | null
}

export type userAction = SetUserAction
