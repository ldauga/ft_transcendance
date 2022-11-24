import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsList.scss'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axiosConfig from '../../../Utils/axiosConfig';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';
import LockIcon from '@mui/icons-material/Lock';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

function RoomsList(props: { setRooms: Function, setRoomsList: Function, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>());
    const [update, setUpdate] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [roomToJoin, setRoomToJoin] = useState({ id: 0, name: "", publicOrPrivate: false });

    const { enqueueSnackbar } = useSnackbar();

    const exit = () => {
        props.setRoomsList(false);
        props.setChat(true);
    };

    const join = (item: { id: number, name: string, publicOrPrivate: boolean }) => {
        const checkIfCanJoinRoom = {
            user_id: userData.userReducer.user?.id,
            user_login: userData.userReducer.user?.login,
            room_id: item.id,
            room_name: item.name,
            password: password,
            publicOrPrivate: item.publicOrPrivate
        }
        utilsData.socket.emit('joinChatRoom', checkIfCanJoinRoom);
        props.setRoomsList(false);
    };

    utilsData.socket.removeAllListeners('getAllRoomsCanIJoin');

    utilsData.socket.on('getAllRoomsCanIJoin', function (getAllRoomsCanIJoin: { id: number, name: string, publicOrPrivate: boolean, passwordOrNot: boolean }[]) {
        if (getAllRoomsCanIJoin != null)
            getListItem(getAllRoomsCanIJoin);
        utilsData.socket.off('getAllRoomsCanIJoin');
        utilsData.socket.removeListener('getAllRoomsCanIJoin');
    })

    utilsData.socket.removeAllListeners('newRoomCreated');

    utilsData.socket.on('newRoomCreated', function (newRoomCreated: boolean) {
        if (newRoomCreated == true) {
            utilsData.socket.emit('GET_ALL_ROOMS_CAN_I_JOIN');
        }
        utilsData.socket.off('newRoomCreated');
        utilsData.socket.removeListener('newRoomCreated');
    })

    utilsData.socket.removeAllListeners('joinChatRoomAccepted');

    utilsData.socket.on('joinChatRoomAccepted', function (joinChatRoomAccepted: boolean) {
        if (joinChatRoomAccepted == true) {
            exit();
        }
        utilsData.socket.off('joinChatRoomAccepted');
        utilsData.socket.removeListener('joinChatRoomAccepted');
    })

    utilsData.socket.removeAllListeners('cantJoinChatRoom');

    utilsData.socket.on('cantJoinChatRoom', function (cantJoinChatRoom: string) {
        enqueueSnackbar('You can\'t join this room', { variant: "error", autoHideDuration: 2000 })
        utilsData.socket.off('cantJoinChatRoom');
        utilsData.socket.removeListener('cantJoinChatRoom');
    })

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        utilsData.socket.emit('GET_ALL_ROOMS_CAN_I_JOIN');
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    const handleClickOpen = (item: { id: number, name: string, publicOrPrivate: boolean }) => {
        setRoomToJoin(item);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setPassword("");
        setOpenDialog(false);
        setRoomToJoin({ id: 0, name: "", publicOrPrivate: false });
    };

    const joinWithPassword = async () => {
        if (password.length <= 0 || password.length > 10) {
            setPassword("");
            enqueueSnackbar('Wrong password', { variant: "error", autoHideDuration: 2000 })
        }
        else {
            await axiosConfig.get('https://localhost:5001/rooms/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.login + '/' + roomToJoin.id + '/' + roomToJoin.name + '/' + password).then(async (res) => {
                if (res.data == "ok") {
                    join(roomToJoin);
                    setPassword("");
                    setOpenDialog(false);
                    setRoomToJoin({ id: 0, name: "", publicOrPrivate: false });
                }
                else {
                    setPassword("");
                    enqueueSnackbar('Wrong password', { variant: "error", autoHideDuration: 2000 })
                }
            });
        }
    };

    const getListItem = async (data: { id: number, name: string, publicOrPrivate: boolean, passwordOrNot: boolean }[]) => {
        let itemList: any[] = [];
        data.forEach(item => {
            if (item.passwordOrNot) {
                itemList.push(<div key={itemList.length.toString()} className='roomsItemList'>
                    <div className="roomsInItem">
                        <div className='roomListInItem1'>
                            <LockIcon className='lockIcons' />
                        </div>
                        <p className='roomsItemRoomName'>{item.name}</p>
                        <div className='roomListInItem2'>
                            <Button className="joinButton" variant="contained" onClick={() => handleClickOpen(item)} >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>)
            }
            else {
                itemList.push(<div key={itemList.length.toString()} className='roomsItemList'>
                    <div className="roomsInItem">
                        <div className='roomListInItem1'>
                            <NoEncryptionIcon className='lockIcons' />
                        </div>
                        <p className='roomsItemRoomName'>{item.name}</p>
                        <div className='roomListInItem2'>
                            <Button className="joinButton" variant="contained" onClick={() => join(item)} >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>)
            }
        })
        setItemListHistory(itemList);
    }

    useEffect(() => {
        utilsData.socket.emit('GET_ALL_ROOMS_CAN_I_JOIN');
    }, [props]);

    return (
        <div id="roomsAff">
            <div className="mainHeader header-group-list">
                <div className="cross">
                    <button onClick={exit}><ArrowBackIosNew /></button>
                </div>
                <h3>Groups List</h3>
                <div className="icons">
                </div>
            </div>
            <div id="mainAffRoomsLIst">
                {itemListHistory}
            </div>
            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>Enter password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        type='password'
                        margin="dense"
                        id="name"
                        label="Password"
                        fullWidth
                        variant="standard"
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => { if (e.key == 'Enter') joinWithPassword() }}
                    />
                </DialogContent>
                <DialogActions>
                    <button onClick={handleClose}>Cancel</button>
                    <button onClick={joinWithPassword}>Enter</button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RoomsList;
