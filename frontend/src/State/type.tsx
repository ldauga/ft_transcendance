import { Socket } from 'socket.io-client';

export interface msg {
    text: string,
    sender: string,
    recipient: string
}

export interface msgList {
    count: number;
    msg: msg[];
}

export interface Client {
    username: string;
    id: string;
    convers: msgList;
}

export interface ClientList {
    count: number;
    active: string;
    list: Client[];
}

export interface contextType {
    socket: Socket;
}

export interface User {
    user: {} | null;
}

export interface User2 {
    id: number;
    login: string;
    nickname: string;
    wins: number;
    looses: number;
    rank: number;
    profile_pic: string;
}

export interface Notif {
    type: NotifType,
    data: any,
    seen: boolean
}

export enum NotifType {
    GAMEINVITE = "GAMEINVITE",
    DISCONNECTGAME = "DISCONNECTGAME",
    LOOSEGAMEDISCONECT = "LOOSEGAMEDISCONECT",
    PENDINGINVITATION = "PENDINGINVITATION",
    YOUWEREKICKEDOUTTHEGROUP = "YOUWEREKICKEDOUTTHEGROUP",
    YOUWEREBANFROMTHEGROUP = "YOUWEREBANFROMTHEGROUP"
}

export interface ChatNotif {
    name: string;
    userOrRoom: boolean;
    nb: number;
}