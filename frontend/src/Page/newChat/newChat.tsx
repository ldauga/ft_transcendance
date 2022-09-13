import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { addClient } from "../../State/Action-Creators";
import { Client } from "../../State/type";


function NewChatPage() {

    const utilsData = useSelector((state: RootState) => state.utils)
    const clientList = useSelector((state: RootState) => state.clientList)
    const userData = useSelector((state: RootState) => state.user)

    const dispatch = useDispatch();

    const { addClient, removeClient, addMsg } = bindActionCreators(actionCreators, dispatch);

    return (
        <div>
            <p>{clientList.count}</p>
        </div>
    );
}

export default NewChatPage;