import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isJSDocTemplateTag } from 'typescript';
import { RootState } from '../../../State';
import './CSS/Chat.css'

function ChatMsg(props: { setFriendList: Function, setChat: Function, setConvers: Function, setConversCorrespondantData: Function, setOldAff: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    props.setOldAff("Chat");
    props.setOldAffRoomConvers("Chat");

    const closeChat = () => {
        props.setChat(false);
        props.setFriendList(true);
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
        if (!item.userOrRoom)
        {
            props.setConversCorrespondantData({ id: item.id, login: item.login });
            props.setChat(false);
            props.setConvers(true);
        }
        else
        {
            props.setroomsConversData({name: item.room_name, id: item.room_id});
            props.setChat(false);
            props.setRoomsConvers(true);
        }
    };

    const getListItem = async () => {
        await axios.get('http://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id).then(async (res) => {
            let itemList: any[] = [];
            console.log('res.data = ', res.data);
            res.data.forEach((item: { id: number, login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
                if (!item.userOrRoom)
                {
                    itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                        <div className="itemConvers" onClick={() => openConvers(item)}>
                            <p>{item.login}</p>
                        </div>
                    </div>)
                }
                else
                {
                    itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                        <div className="itemConvers" onClick={() => openConvers(item)}>
                            <p>{item.room_name}</p>
                        </div>
                    </div>)
                }
            });
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        getListItem();
    }, [props]);

    return (
        <div id="chat">
            <div id='chatHeader'>
                <p>Messages</p>
                <button onClick={closeChat} className="bi bi-x-lg"></button>
            </div>
            <div>
                {itemListHistory}
            </div>
        </div>
    );
};

export default ChatMsg;