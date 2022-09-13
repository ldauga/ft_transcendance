import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State";

const TestMsg = (props: any) => {

    const utilsData = useSelector((state: RootState) => state.utils);

    const [text, setText] = useState('');

    let textInput = "";

    function sendMessage() {
        console.log("sendMessage()");
        const messageToSend = {
            id_sender: 0,
            id_receiver: 1,
            login_sender: "A",
            login_receiver: "B",
            text: text
        }
        utilsData.socket.emit('createMsg', messageToSend);
        // if (clientList.active.length > 0)
        // {
        //     if (validateInput(clientList.active) && validateInput(text)) {
        //         const message: msgToSend = {
        //             sender: logData.username,
        //             recipient: clientList.active,
        //             text: text,
        //         }
        //         const msgToList: msg = { 
        //             sender: "Me",
        //             recipient: clientList.active,
        //             text: text
        //         };
        //         utilsData.socket.emit('msgToOtherClient', message);
        //         addMsg(msgToList);
        //         setText('');
        //     }
        //     else
        //         console.log("Msg non valide")
        // }
        // else
        //     console.log("Send: pas de convers active")
    }

    return (
        <>
            <div className="main_container" id="main_AffMsg">
                <div id="sendZone">
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Enter message..."
                    />
                    <button type="button" onClick={() => sendMessage()}>
                        Send
                    </button>
                </div>
            </div>
        </>
    );
};

export default TestMsg;