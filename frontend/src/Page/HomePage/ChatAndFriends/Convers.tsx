import { Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import './CSS/Convers.scss'

function Convers(props: { setFriendList: Function, setChat: Function, setConvers: Function, conversCorrespondantData: { id: number, login: string }, oldAff: string, openFriendConversFromProfile: boolean, setOpenFriendConversFromProfile: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [messageText, setMessageText] = useState('');

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const closeConvers = () => {
        if (props.openFriendConversFromProfile)
            props.setOpenFriendConversFromProfile(false);
        props.setConvers(false);
        console.log("oldAff: ", props.oldAff);
        if (props.oldAff == "Chat")
            props.setChat(true);
        else
            props.setFriendList(true);
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    };

    function sendMessage() {
        if (messageText.length <= 0)
            return;
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

    function getYear() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[3])
            return ("");
        return (tmp[3]);
    }

    function getMonth() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[1])
            return ("");
        return (tmp[1]);
    }

    function getDay() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[2])
            return ("");
        return (tmp[2]);
    }

    function getHour() {
        const date = Date();
        let tmp = date.split(' ');
        let tmp2 = tmp[4].split(':');
        return (tmp2[0]);
    }

    function getMinute() {
        const date = Date();
        let tmp = date.split(' ');
        let tmp2 = tmp[4].split(':');
        return (tmp2[1]);
    }

    //onMouseOut={e => { e.currentTarget.children[1].toggleAttribute('className') }}

    function Item(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        return (
            <div className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                <p>{props.item.text}</p>
            </div>
        );
    };

    function AffDate(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        console.log("Date: ", Date());
        if (getYear() != props.item.year)
            return (
                <div className='dateDisplayNone'>
                    <p>{props.item.month} {props.item.day} {props.item.year} at {props.item.hour}:{props.item.minute}</p>
                </div>
            );
        else if (getMonth() != props.item.month)
            return (
                <div className='dateDisplayNone'>
                    <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                </div>
            );
        else if (getDay() != props.item.day)
            return (
                <div className='dateDisplayNone'>
                    <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                </div>
            );
        else
            return (
                <div className='dateDisplayNone'>
                    <p>{props.item.hour}:{props.item.minute}</p>
                </div>
            );
    };

    const getListItem = async () => {
        await axiosConfig.get('http://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + props.conversCorrespondantData.id).then(async (res) => {
            console.log("get List Item Conversation");
            let itemList: any[] = []
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string }) => {
                itemList.push(<div key={itemList.length.toString()} onMouseOver={e => { e.currentTarget.children[1].className = 'date' }} onMouseOut={e => { e.currentTarget.children[1].className = 'dateDisplayNone' }} className={(item.id_sender == userData.userReducer.user?.id ? 'content-sender' : 'content-receiver')}>
                    <Item item={item} />
                    <AffDate item={item} />
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

    function SendButton() {
        if (messageText.length <= 0) {
            return (
                <button className="sendButtonDisabled" onClick={sendMessage} disabled={messageText.length <= 0}>
                    send
                </button>
            );
        }
        else {
            return (
                <button onClick={sendMessage} disabled={messageText.length <= 0}>
                    send
                </button>
            );
        }
    };

    // return (
    //     <div className="mainAffGene">
    //         <div id="header" className="mainHeader">
    //             <div className="mainHeaderLeft mainHeaderSide">
    //                 <button onClick={closeConvers} className="bi bi-arrow-left-short"></button>
    //             </div>
    //             <h3>{props.conversCorrespondantData.login}</h3>
    //             <div className="mainHeaderRight mainHeaderSide">
    //             </div>
    //         </div>
    //         <div className="conv">
    //             <div className="messages">
    //                 {itemListHistory}
    //                 <div ref={messagesEndRef} />
    //             </div>
    //             <div className="send-message">
    //                 <textarea
    //                     value={messageText}
    //                     onChange={e => setMessageText(e.target.value)}
    //                     onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
    //                     placeholder="Your message..."
    //                 />
                    // <SendButton />
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
        <div className="chat">
            <div className="header">
                <button onClick={closeConvers} className="bi bi-arrow-left-short"></button>
                <div className="profile">
                    <img src='https://cdn.intra.42.fr/users/2e1946910199ba1fb50a70b7ab192fe0/cgangaro.jpg' onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + props.conversCorrespondantData.login) }} />
                    <div className="name">
                        <p onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + props.conversCorrespondantData.login) }}>{props.conversCorrespondantData.login}</p>
                        <p><div className='status'></div>online</p>
                    </div>
                </div>
            </div>
            <div className="messages">
                {itemListHistory}
                <div ref={messagesEndRef} />
            </div>
            <div className="send-message">
                <TextField value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder='Your message...'
                    multiline maxRows={5}
                    onKeyDown={(e) => {if (e.keyCode == 13) {
                        e.preventDefault();
                        sendMessage();
                    }}}
                />
                <SendButton />
            </div>
        </div>
    )
};

export default Convers;