import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import './CSS/Convers.css'

function Convers(props: { setFriendList: Function, setChat: Function, setConvers: Function, conversCorrespondantData: { id: number, login: string }, oldAff: string }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [messageText, setMessageText] = useState('');

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const closeConvers = () => {
        props.setConvers(false);
        if (props.oldAff == "Chat")
            props.setChat(true);
        else
            props.setFriendList(true);
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    };

    function sendMessage() {
        const newMsg = {
            id_sender: userData.userReducer.user?.id,
            id_receiver: props.conversCorrespondantData.id,
            login_sender: userData.userReducer.user?.login,
            login_receiver: props.conversCorrespondantData.login,
            userOrRoom: false,
            room_id: 0,
            room_name: "",
            text: messageText
        }
        utilsData.socket.emit('createMsg', newMsg);
        setMessageText("");
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
    };

    utilsData.socket.removeListener('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        for (let i = 0; i < 4; i++) {
            getListItem();
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    const getListItem = async () => {
        await axiosConfig.get('http://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + props.conversCorrespondantData.id).then(async (res) => {
            console.log("get List Item Conversation");
            let itemList: any[] = []
            // console.log('res.data = ', res.data);
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string }) => {
                itemList.push(<div key={itemList.length.toString()} className={(item.id_sender == userData.userReducer.user?.id ? 'itemListConversContainerMe' : 'itemListConversContainerCorrespondant')}>
                    <div className={(item.id_sender == userData.userReducer.user?.id ? 'converItemList converItemListMe' : 'converItemList converItemListCorrespondant')}>
                        <p>{item.text}</p>
                    </div>
                </div>)
            });
            console.log('itemList : ', itemList);
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [itemListHistory])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
        getListItem();
    }, [props]);

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeConvers} className="bi bi-arrow-left-short"></button>
                </div>
                <h3>{props.conversCorrespondantData.login}</h3>
                <div className="mainHeaderRight mainHeaderSide">
                </div>
            </div>
            <div id="affConvers">
                {itemListHistory}
                <div ref={messagesEndRef} />
            </div>
            <div className="sendZoneConvers">
                <input
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                    placeholder="Your message..."
                />
                <button type="button" onClick={() => sendMessage()}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Convers;