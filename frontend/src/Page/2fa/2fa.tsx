import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';
import { useCookies } from "react-cookie";

const QrCode = (props: any) => {
    const [QrCode, setQrCode] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    const [code, setCode] = useState("");

    async function turnOn2fa(key: string) {
        if (key == "Enter") axios.get('http://localhost:5001/auth/2fa/turn-on/' + code, { withCredentials: true }).then(res => console.log(res));
    }
    
    useEffect(() => {
        console.log(QrCode)
        if (QrCode === "")
            axios.get('http://localhost:5001/auth/2fa/generate/' + cookies['auth-cookie'].refreshToken).then(res => (setQrCode(res.data)))
    })

    return  <div className='2fa'>
                <p>Scan the following QR Code using Google Authenticator</p>
                <img src={QrCode} />
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {turnOn2fa(e.key)}}
                />
            </div>;
}
export default QrCode;