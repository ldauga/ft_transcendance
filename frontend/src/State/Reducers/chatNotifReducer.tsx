import { chatNotifActionType } from "../Action-Types";
import { chatNotifAction } from "../Actions";
import { ChatNotif } from "../type";

export interface ChatNotifArray {
	chatNotifArray: Array<ChatNotif>,
	total: number,
	convers: { name: string, userOrRoom: boolean }
}

export const initialState: ChatNotifArray = {
	chatNotifArray: new Array<ChatNotif>(),
	total: 0,
	convers: { name: "", userOrRoom: false }
}

export const chatNotifReducer = (state: ChatNotifArray = initialState, action: chatNotifAction) => {
	switch (action.type) {
		case chatNotifActionType.ADDCHATNOTIF: {
			if (!action.payload.userOrRoom) {
				let _notif = state.chatNotifArray.find(obj => (obj.name == action.payload.name && !action.payload.userOrRoom));
				if (_notif) {
					_notif.nb += action.payload.nb;
					if (!state.total || state.total == 0)
						state.total = action.payload.nb;
					else
						state.total += action.payload.nb;

				}
				else {
					let newNotif: ChatNotif = {
						name: action.payload.name,
						userOrRoom: false,
						nb: action.payload.nb
					};
					state.chatNotifArray.push(newNotif);
					if (!state.total || state.total == 0)
						state.total = action.payload.nb;
					else
						state.total += action.payload.nb;
				}
			}
			else {
				let _notif = state.chatNotifArray.find(obj => (obj.name == action.payload.name && action.payload.userOrRoom));
				if (_notif) {
					_notif.nb += action.payload.nb;
					if (!state.total || state.total == 0)
						state.total = action.payload.nb;
					else
						state.total += action.payload.nb;
				}
				else {
					let newNotif: ChatNotif = {
						name: action.payload.name,
						userOrRoom: true,
						nb: action.payload.nb
					};
					state.chatNotifArray.push(newNotif);
					if (!state.total || state.total == 0)
						state.total = action.payload.nb;
					else
						state.total += action.payload.nb;
				}
			}
			return {
				...state,
				notifArray: state.chatNotifArray,
				total: state.total
			};
		}
		case chatNotifActionType.DELCHATNOTIF: {
			if (!action.payload)
				return state;
			if (!action.payload.userOrRoom) {
				let _notif = state.chatNotifArray.find(obj => (obj.name == action.payload.name && !action.payload.userOrRoom));
				if (_notif) {
					state.total -= _notif.nb;
					_notif.nb = 0;
				}
			}
			else {
				let _notif = state.chatNotifArray.find(obj => (obj.name == action.payload.name && action.payload.userOrRoom));
				if (_notif) {
					state.total -= _notif.nb;
					_notif.nb = 0;
				}
			}
			return {
				...state,
				notifArray: state.chatNotifArray,
				total: state.total
			};
		}
		case chatNotifActionType.INITCHATNOTIF: {
			state.chatNotifArray = [];
			state.total = 0;
			state.convers = { name: "", userOrRoom: false };
			return {
				...state,
				notifArray: state.chatNotifArray,
				total: state.total
			};
		}
		case chatNotifActionType.INITONECONVERSCHATNOTIF: {
			const _notif = state.chatNotifArray.find(obj => (obj.name == action.payload.name && obj.userOrRoom == action.payload.userOrRoom));
			if (_notif) {
				state.total -= _notif.nb;
				_notif.nb = 0;
			}
			return {
				...state,
				notifArray: state.chatNotifArray,
				total: state.total
			};
		}
		case chatNotifActionType.SETCONVERS: {
			state.convers = { name: action.payload.name, userOrRoom: action.payload.userOrRoom }
			return {
				...state,
				convers: state.convers
			};
		}
		default:
			return state;
	}
}
