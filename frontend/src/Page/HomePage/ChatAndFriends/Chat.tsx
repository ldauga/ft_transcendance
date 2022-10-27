import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isJSDocTemplateTag } from 'typescript';
import { RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import './CSS/Chat.scss'
import SendChatMsg from './SendChatMsg';

function Chat(props: { setFriendList: Function, setChat: Function, setConvers: Function, setConversCorrespondantData: Function, setRooms: Function, setOldAff: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function, closeChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [isSendChatMsg, setSendChatMsg] = useState(false);

    const closeChat = () => {
        props.closeChat();
        props.setChat(false);
    };

    utilsData.socket.removeListener('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    const openConvers = (item: { id: number, login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
        if (!item.userOrRoom) {
            props.setConversCorrespondantData({ id: item.id, login: item.login });
            props.setChat(false);
            props.setConvers(true);
        }
        else {
            props.setroomsConversData({ name: item.room_name, id: item.room_id });
            props.setChat(false);
            props.setRoomsConvers(true);
        }
    };

    const openSendChatMsg = () => {
        if (isSendChatMsg)
            setSendChatMsg(false);
        else
            setSendChatMsg(true);
    }

    const handleClickRooms = () => {
        props.setChat(false);
        props.setRooms(true);
    };

    const getListItem = async () => {
        let relationList: any[] = [];
        await axiosConfig.get('http://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id).then(async (res) => {
            relationList = res.data;
        });
        console.log("relationList: ", relationList);
        for (let i = 0; i < relationList.length; i++) {
            if (!relationList[i].userOrRoom) {
                const user = await axiosConfig.get('http://localhost:5001/user/id/' + relationList[i].id);
                console.log("user.data: ", user.data, "i: ", i);
                relationList[i].nickname = user.data.nickname;
                relationList[i].profile_pic = user.data.profile_pic;
            }
        }
        let itemList: any[] = [];
        await relationList.forEach(async (item: { id: number, login: string, nickname: string, profile_pic: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
            console.log("test2");
            if (!item.userOrRoom) {
                await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                    <div className="itemConvers" onClick={() => openConvers(item)}>
                        <img src={item.profile_pic}></img>
                        <p>{item.nickname}</p>
                    </div>
                </div>)
            }
            else {
                await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                    <div className="itemConvers" onClick={() => openConvers(item)}>
                        <p>{item.room_name}</p>
                    </div>
                </div>)
            }
        });
        console.log("end");
        setItemListHistory(itemList);
    }

    useEffect(() => {
        getListItem();
        props.setOldAff("Chat");
        props.setOldAffRoomConvers("Chat");
    }, [props]);

    function AffConversChatItem() {
        if (isSendChatMsg)
            return (
                <div id="affConversItemChatSmall">
                    {itemListHistory}
                </div>
            );
        else
            return (
                <div id="affConversItemChatBig">
                    {itemListHistory}
                </div>
            );

    };

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeChat} className="bi bi-x"></button>
                </div>
                <h3>Chat</h3>
                <div className="mainHeaderRight mainHeaderSide">
                    <button onClick={handleClickRooms}><i className="bi bi-people-fill"></i></button>
                    <button onClick={openSendChatMsg} id="openSendChatMsg" className="bi bi-send-fill"></button>
                </div>
            </div>
            {isSendChatMsg && <SendChatMsg />}
            <AffConversChatItem />
        </div>
    );
};

export default Chat;