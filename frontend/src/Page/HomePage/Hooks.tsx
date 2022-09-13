import React, { useState } from "react";

export function FriendListHook(val: boolean) {
	const [isFriendList, setFriendList] = useState(val);
	
	return [isFriendList, setFriendList] as const;
}

export function AddFriendHook(val: boolean) {
	const [isAddFriend, setAddFriend] = useState(val);

	return [isAddFriend, setAddFriend] as const;
}
