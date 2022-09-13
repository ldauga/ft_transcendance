import React, { useEffect, useState } from "react";
import AddFriend from "./AddFriend";
import HomePage from "./HomePage";
import { AddFriendHook, FriendListHook } from "./Hooks";

function FriendList() {

	const [isAddFriend, setAddFriend] = AddFriendHook(false);
	const [isFriendList, setFriendList] = FriendListHook(true);

	const handleClick = () => {
		setFriendList(false);
        setAddFriend(true);
    };

	return (
		<div>
			{isFriendList && (
			<div className="friends-info-typo" id='friendsInfo'>
				<div className="left"></div>
				<h3>Friends</h3>
				<div className="button">
					<button onClick={handleClick}><i className="bi bi-person-plus"></i></button>
					<button onClick={handleClick}><i className="bi bi-search"></i></button>
				</div>
				{isAddFriend && <AddFriend />}
			</div>
			)}
			{isAddFriend && <AddFriend />}
		</div>
	)
}

export default FriendList;