import { notifActionType } from "../Action-Types";
import { notifAction } from "../Actions";
import { Notif } from "../type";

export interface NotifArray {
	notifArray: Array<Notif>
}

export const initialState: NotifArray = {
	notifArray: new Array<Notif>
}

export const notifReducer = (state: NotifArray = initialState, action: notifAction) => {
	console.log('lolilol', 'action', action)
	switch (action.type) {
		case notifActionType.SETNOTIF: {
			console.log('bool')
			state.notifArray.push(action.payload)
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.DELNOTIF: {
			console.log('bool2')
			state.notifArray.forEach((item, index) => {
				if (item == action.payload)
					state.notifArray.splice(index, 1)
			})
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		default:
			return state;
	}
}