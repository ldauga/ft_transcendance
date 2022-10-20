import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsList.css'
import { constWhileSecu } from '../HomePage';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

function RoomsList(props: { setRooms: Function, setRoomsList: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [roomToJoin, setRoomToJoin] = useState({ id: 0, name: "", publicOrPrivate: false });

    const exit = () => {
        props.setRoomsList(false);
        props.setRooms(true);
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
    };

    utilsData.socket.removeAllListeners('newRoomCreated');

    utilsData.socket.on('newRoomCreated', function (newRoomCreated: boolean) {
        console.log('newRoomCreated = ', newRoomCreated);
        if (newRoomCreated == true) {
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < constWhileSecu) {
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('newRoomCreated');
        utilsData.socket.removeListener('newRoomCreated');
    })

    utilsData.socket.removeAllListeners('joinChatRoomAccepted');

    utilsData.socket.on('joinChatRoomAccepted', function (joinChatRoomAccepted: boolean) {
        console.log('joinChatRoomAccepted = ', joinChatRoomAccepted);
        if (joinChatRoomAccepted == true) {
            exit();
        }
        utilsData.socket.off('joinChatRoomAccepted');
        utilsData.socket.removeListener('joinChatRoomAccepted');
    })

    utilsData.socket.removeAllListeners('cantJoinChatRoom');

    utilsData.socket.on('cantJoinChatRoom', function (cantJoinChatRoom: string) {
        console.log("You can't join this group, because: ", cantJoinChatRoom);
        utilsData.socket.off('cantJoinChatRoom');
        utilsData.socket.removeListener('cantJoinChatRoom');
    })

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
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

    const joinWithPassword = () => {
        join(roomToJoin);
        setPassword("");
        setOpenDialog(false);
        setRoomToJoin({ id: 0, name: "", publicOrPrivate: false });
    };

    const getListItem = async () => {
        let myRooms: { name: string, id: number }[];
        await axios.get('http://localhost:5001/participants/userRooms/' + userData.userReducer.user?.login).then(async (res) => {
            console.log('res.data MyRooms = ', res.data);
            myRooms = res.data;
            console.log('nameTmp MyRooms = ', myRooms);
        })
        await axios.get('http://localhost:5001/rooms/').then(async (res) => {
            let itemList: any[] = [];
            console.log('res.data = ', res.data);
            const nameTmp: { id: number, name: string, publicOrPrivate: boolean, passwordOrNot: boolean }[] = res.data;
            nameTmp.forEach(item => {
                console.log("test: ", myRooms.find(obj => obj.id == item.id));
                if (!myRooms.find(obj => obj.id == item.id) && !item.publicOrPrivate) {
                    if (item.passwordOrNot) {
                        itemList.push(<div key={itemList.length.toString()} className='roomsItemList'>
                            <div className="roomsInItem">
                                <div className='roomListInItem1'>
                                    <i className="bi bi-lock-fill"></i>
                                </div>
                                <p className='roomsItemRoomName'>{item.name}</p>
                                <div className='roomListInItem2'>
                                    <button type="button" onClick={() => handleClickOpen(item)}>
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>)
                    }
                    else {
                        console.log("test");
                        itemList.push(<div key={itemList.length.toString()} className='roomsItemList'>
                            <div className="roomsInItem">
                                <div className='roomListInItem1'>
                                </div>
                                <p className='roomsItemRoomName'>{item.name}</p>
                                <div className='roomListInItem2'>
                                    <button type="button" onClick={() => join(item)}>
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>)
                    }
                }
            })
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        getListItem();
    }, [props]);

    return (
        <div id="roomsAff">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={exit} className="bi bi-arrow-left"></button>
                </div>
                <h3>Groups List</h3>
                <div id="roomsHeaderRight" className="mainHeaderRight mainHeaderSide">
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
                        margin="dense"
                        id="name"
                        label="Password"
                        fullWidth
                        variant="standard"
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => { if (e.key == 'Enter') joinWithPassword }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={joinWithPassword}>Enter</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RoomsList;