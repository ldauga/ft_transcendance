import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';
import { useCookies } from "react-cookie";

const QrCode = (props: any) => {
    const [QrCode, setQrCode] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    const [code, setCode] = useState("");
    const [res, setRes] = useState(0);
    const [status, setStatus] = useState("Please enter the code above.");

    async function turnOn2fa(key: string) {
        if (key == "Enter")
            axios.get('http://localhost:5001/auth/2fa/turn-on/' + code, { withCredentials: true }).then(res => setRes(res.status)).catch((e) => setRes(e.response.status));
    }

    useEffect(() => {
        console.log(res);
        if (QrCode === "")
             axios.get('http://localhost:5001/auth/2fa/generate/' + cookies['auth-cookie'].refreshToken).then(res => (setQrCode(res.data)))
        if (res === 401)
            setStatus("Error, wrong code.")
        else if (res == 404)
            setStatus("You must enter the code.")
        else if (res == 200)
            setStatus("2FA activated !")
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
                <p>{status}</p>
            </div>;
}
export default QrCode;