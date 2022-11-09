import { notifActionType } from "../Action-Types";
import { notifAction } from "../Actions";
import { Notif } from "../type";

export interface NotifArray {
	notifArray: Array<Notif>
}

export const initialState: NotifArray = {
	notifArray: new Array<Notif>(),
}

export const notifReducer = (state: NotifArray = initialState, action: notifAction) => {
	switch (action.type) {
		case notifActionType.SETNOTIF: {
			state.notifArray.push(action.payload)
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.SETALLNOTIFSEEN: {
			state.notifArray.forEach(notif => notif.seen = true)
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.DELNOTIF: {
			state.notifArray.forEach((item, index) => {
				if (item == action.payload)
					state.notifArray.splice(index, 1)
			})
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.DELALLNOTIF: {
			state.notifArray.splice(0, state.notifArray.length)
			return {
				...state,
				notifArray: state.notifArray
			}
		}
		default:
			return state;
	}
}