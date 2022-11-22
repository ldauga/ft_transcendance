import axios from 'axios'
import { useEffect, useState } from 'react'
import { ExitStatus, isPropertyAccessOrQualifiedName } from 'typescript'
import './StatPlayer.scss'

import { AiOutlineClose } from 'react-icons/ai'

import unranked from '../../Assets/rank/unranked.png'
import bronze_rank_img from '../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../Assets/rank/diamond_rank.png'
import silver_rank_img from '../../Assets/rank/silver_rank.png'
import platinium_rank_img from '../../Assets/rank/platinium_rank.png'

import { RiFileWarningLine } from 'react-icons/ri'
import NavBar from '../Navbar/Navbar'
import { bindActionCreators, Dictionary } from '@reduxjs/toolkit'
import axiosConfig from '../../Utils/axiosConfig'
import { useDispatch, useSelector } from 'react-redux'
import { actionCreators, RootState } from '../../State'
import { setUser } from '../../State/Action-Creators'
import { red } from '@mui/material/colors'
import Background from '../Background/Background'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Snackbar, TextField } from '@mui/material'
import PinInput from 'react-pin-input'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { sassFalse } from 'sass'
import { SnackbarKey, withSnackbar } from 'notistack'
import { useSnackbar } from 'notistack';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'
import MapCarousel from '../../Page/Pong/MapCarousel/MapCarousel'
import { gameRoomClass } from '../../Page/Pong/gameRoomClass'
import { Navigate } from 'react-router-dom'

function TWOFA() {
    const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
    const [openEditZone2fa, setOpenEditZone2fa] = useState(false);
    const [userParameter2FACode, setUserParameter2FACode] = useState("");
    const [userParameter2FARes, setUserParameter2FARes] = useState(0);
    const [fullPinCode, setFullPinCode] = useState(0);
	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer);

	const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const sendGetRequest = async (value: string) => {
        const res = await axiosConfig.get('https://localhost:5001/auth/2fa/turn-on/' + value)
        if (res.request.status === 200) {
            setTwoFactor(true);
            setUserParameter2FACode('');
            setUser(res.data);
            setUserParameter2FARes(res.status);
            enqueueSnackbar('2FA enabled.', { variant: 'success', autoHideDuration: 2000 })
        } else {
            enqueueSnackbar('Wrong code.', { variant: 'warning', autoHideDuration: 2000 })
        };
    }

    return (
        <>
            {!persistantReduceur.userReducer.user?.isTwoFactorAuthenticationEnabled ?
                <>
                    <button onClick={() => { setOpenEditZone2fa(true); axiosConfig.get('https://localhost:5001/auth/2fa/generate/').then(res => (setUserParameter2FAQrCode(res.data))) }}>Set 2FA</button>
                    <Dialog open={openEditZone2fa} onClose={() => { setOpenEditZone2fa(false) }}>
                        <DialogTitle>Scan the folowing QR code with Google authenticator</DialogTitle>
                        <DialogContent className='two-fa'>
                            <img src={userParameter2FAQrCode} />
                            <PinInput
                                length={6}
                                focus
                                onChange={(value, index) => { setUserParameter2FACode(value); setUserParameter2FARes(0); setFullPinCode(0) }}
                                type="numeric"
                                inputMode="number"
                                style={{ padding: '10px' }}
                                onComplete={(value, index) => { sendGetRequest(value); setFullPinCode(1); setUserParameter2FACode('') }}
                                autoSelect={true}
                            />
                        </DialogContent>
                    </Dialog></> : <button onClick={() => { axiosConfig.get('https://localhost:5001/auth/2fa/turn-off/').then(res => { setUser(res.data) }) }}>Desactivate 2FA</button>}
        </>
    );
}

export default TWOFA;
