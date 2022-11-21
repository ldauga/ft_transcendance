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

function EditNickname(props: {profile: any, setProfile: Function}) {
    const [open, setOpen] = useState(false);
    const [newNickname, setNewNickname] = useState("");

	const utilsData = useSelector((state: RootState) => state.utils);
    const persistantReduceur = useSelector((state: RootState) => state.persistantReducer);

	const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const changeNickname = async () => {
        utilsData.socket.emit('CHANGE_NICKNAME', { newNickname: newNickname, user: persistantReduceur.userReducer.user })
    }

    utilsData.socket.off('changeNicknameSuccess')

    utilsData.socket.on('changeNicknameSuccess', function (param: any) {
        setUser(param)
        enqueueSnackbar('Nickname changed !', { variant: "success", autoHideDuration: 2000 })
        props.setProfile({ ...props.profile, nickname: newNickname })
        setOpen(false)
    })

    return (
        <>
            <button onClick={() => { setOpen(true) }}>Edit Nickname</button>
                <Dialog open={open} onClose={() => { setOpen(false) }}>
                    <DialogTitle>Your New Nickname</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="New Nickname"
                            type="text"
                            onChange={e => setNewNickname(e.target.value)}
                            fullWidth
                            variant="standard"
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    changeNickname()
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <button onClick={changeNickname}>Edit</button>
                    </DialogActions>
                </Dialog>
        </>
    );
}

export default EditNickname;