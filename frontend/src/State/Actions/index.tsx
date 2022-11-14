import { clientListActionType, LogActionType, userActionType, notifActionType, twoFactorActionType, chatNotifActionType, inviteCheckActionType } from "../Action-Types"
import { ChatNotif, Client, msg, msgList, Notif } from "../type"



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
        losses: number,
        rank: number,
        profile_pic: string,
        isTwoFactorAuthenticationEnabled: boolean,
        isFirstConnection: boolean,
        errorNickname: boolean
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

type SetAllNotifSeen = {
    type: notifActionType.SETALLNOTIFSEEN
}

export type notifAction = SetNotifAction | DelNotifAction | DelAllNotifAction | SetAllNotifSeen

type AddChatNotifAction = {
    type: chatNotifActionType.ADDCHATNOTIF
    payload: { name: string, userOrRoom: boolean, nb: number };
}

type DelChatNotifAction = {
    type: chatNotifActionType.DELCHATNOTIF
    payload: { name: string, userOrRoom: boolean };
}

type InitChatNotifAction = {
    type: chatNotifActionType.INITCHATNOTIF
}

type InitOneChatChatNotifAction = {
    type: chatNotifActionType.INITONECONVERSCHATNOTIF
    payload: { name: string, userOrRoom: boolean };
}

type SetConversChatChatNotifAction = {
    type: chatNotifActionType.SETCONVERS
    payload: { name: string, userOrRoom: boolean };
}

export type chatNotifAction = AddChatNotifAction | DelChatNotifAction | InitChatNotifAction | InitOneChatChatNotifAction | SetConversChatChatNotifAction


type SetTwoFactor = {
    type: twoFactorActionType.SETTWOFACTOR
    payload: boolean
}

export type twoFactorAction = SetTwoFactor

type SetInviteCheckAction = {
    type: inviteCheckActionType.SETINVITECHECK
    payload: boolean
}

type SetInviteCheckReloadAction = {
    type: inviteCheckActionType.SETINVITECHECKRELOAD
    payload: boolean
}

export type inviteCheckAction = SetInviteCheckAction | SetInviteCheckReloadAction