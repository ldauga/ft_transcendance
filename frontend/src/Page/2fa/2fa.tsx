import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';
import { useCookies } from "react-cookie";

const QrCode = (props: any) => {
    const [QrCode, setQrCode] = useState("")
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);

    useEffect(() => {
        console.log(QrCode)
        if (QrCode === "")
            axios.get('http://localhost:5001/auth/2fa/generate/' + cookies['auth-cookie'].refreshToken).then(res => (setQrCode(res.data)))
    })
    return <img src={QrCode} />;
}
export default QrCode;