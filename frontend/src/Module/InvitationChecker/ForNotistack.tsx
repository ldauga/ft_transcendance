import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif, NotifType } from "../../State/type";
import axiosConfig from "../../Utils/axiosConfig";
import { SnackbarKey, withSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';

import './InvitationChecker.css'

function ForNotistack() {

    const utilsData = useSelector((state: RootState) => state.utils);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    utilsData.socket.removeAllListeners('returnAffNotistack');

    utilsData.socket.on('returnAffNotistack', function (data: { text: string, type: string }) {
        console.log('returnAffNotistack = ', data);
        if (data.type == "default")
            enqueueSnackbar(data.text, { variant: "default", autoHideDuration: 2000 })
        else if (data.type == "success")
            enqueueSnackbar(data.text, { variant: "success", autoHideDuration: 2000 })
        else if (data.type == "error")
            enqueueSnackbar(data.text, { variant: "error", autoHideDuration: 2000 })
        else if (data.type == "warning")
            enqueueSnackbar(data.text, { variant: "warning", autoHideDuration: 2000 })
        else
            enqueueSnackbar(data.text, { variant: "info", autoHideDuration: 2000 })
        utilsData.socket.off('returnAffNotistack');
        utilsData.socket.removeListener('returnAffNotistack');
    })

    return (
        <div id="ForNotisstack"></div>
    );

}

export default withSnackbar(ForNotistack);