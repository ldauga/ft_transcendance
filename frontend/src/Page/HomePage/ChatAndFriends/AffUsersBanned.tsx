import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import '../Homepage.scss'
import axiosConfig from '../../../Utils/axiosConfig';
import { Autocomplete, Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, TextField, Tooltip } from "@mui/material";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import './CSS/AffUserBanned.scss';
import { useSnackbar } from 'notistack';
import { ArrowBackIosNew, Close } from '@mui/icons-material';

function AffUsersBanned(props: { setFriendList: Function, setBannedUsers: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>());

    const { enqueueSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');

    const [update, setUpdate] = useState(false);

    const [connectedClient, setConnectedClient] = useState<{ id: number, login: string, nickname: string, profile_pic: string }[]>(new Array());

    const [openDialogBan, setOpenDialogBan] = useState(false);

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [alwaysOrNot, setAlwaysOrNot] = useState(false);

    const handleChangeDays = (event: SelectChangeEvent) => {
        setDays(parseInt(event.target.value, 10));
    };

    const handleChangeHours = (event: SelectChangeEvent) => {
        setHours(parseInt(event.target.value, 10));
    };

    const handleChangeMinutes = (event: SelectChangeEvent) => {
        setMinutes(parseInt(event.target.value, 10));
    };

    const handleChangeSeconds = (event: SelectChangeEvent) => {
        setSeconds(parseInt(event.target.value, 10));
    };

    const handleClickOpenDialogBan = () => {
        setOpenDialogBan(true);
    };

    const handleCloseDialogBan = () => {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogBan(false);
    };

    async function buttonBanUser() {
        const user = connectedClient.find(obj => obj.nickname == inputValue);
        if (inputValue.length <= 0 || (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !alwaysOrNot) || !user) {
            enqueueSnackbar('Wrong input for banUser', { variant: "error", autoHideDuration: 2000 })
            return;
        }
        if (user) {
            await axiosConfig.get('https://localhost:5001/user/login/' + user.login).then(async (res) => {
                setInputValue("");
                let receiver_login_tmp: string = res.data.login;
                if (res.data == "") {
                    return;
                }
                else {
                    let a = 1;
                    let b = 1;
                    await axiosConfig.get('https://localhost:5001/blackList/checkUserBan/' + res.data.login + '/' + userData.userReducer.user?.login).then(async (res) => {
                        if (res.data == true) {
                        }
                        else {
                            a = 2;
                        }
                    })
                    if (a == 2) {
                        const newBan = {
                            id_sender: userData.userReducer.user?.id,
                            id_banned: res.data.id,
                            login_sender: userData.userReducer.user?.login,
                            login_banned: res.data.login,
                            userOrRoom: false,
                            receiver_login: "",
                            room_id: 0,
                            room_name: "",
                            cause: "",
                            date: 0,
                            alwaysOrNot: alwaysOrNot,
                            timer: (seconds + minutes * 60 + hours * 3600 + days * 3600 * 24)
                        }
                        utilsData.socket.emit('createBan', newBan);
                        enqueueSnackbar('User banned', { variant: "success", autoHideDuration: 2000 })
                    }
                }
            });
        }
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogBan(false);
    }

    utilsData.socket.removeAllListeners('userBanned');

    utilsData.socket.on('userBanned', function (userBanned: boolean) {
        utilsData.socket.emit('GET_ALL_USERS_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login });
        utilsData.socket.off('userBanned');
        utilsData.socket.removeListener('userBanned');
    })

    utilsData.socket.removeAllListeners('debanedUser');

    utilsData.socket.on('debanedUser', function (debanedUser: boolean) {
        utilsData.socket.emit('GET_ALL_USERS_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login });
        utilsData.socket.off('debanedUser');
        utilsData.socket.removeListener('debanedUser');
    })

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutBanned');

    utilsData.socket.on('getAllClientConnectedWithoutBanned', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        setConnectedClient(data);
        utilsData.socket.off('getAllClientConnectedWithoutBanned');
        utilsData.socket.removeListener('getAllClientConnectedWithoutBanned');
    })

    const closeAffBanned = () => {
        props.setBannedUsers(false);
        props.setFriendList(true);
    }

    const debanUser = (item: { id: number, login: string, nickname: string, profile_pic: string }) => {
        utilsData.socket.emit('removeUserBan', { id_sender: userData.userReducer.user?.id, login_sender: userData.userReducer.user?.login, login_banned: item.login, id_banned: item.id });
        enqueueSnackbar('User debanned', { variant: "success", autoHideDuration: 2000 })
        closeAffBanned();
        utilsData.socket.emit('GET_ALL_USERS_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login });
    }

    const getListItem = async (data: { id: number, login: string, nickname: string, profile_pic: string }[]) => {
        let itemList: any[] = []
        let i = 0;
        data.forEach((item: { id: number, login: string, nickname: string, profile_pic: string }) => {
            itemList.push(<div key={itemList.length.toString()} className='itemBanUser'>
                <div className="inItemBanUser">
                    <div className="inItemBanUser_left">
                        <img src={item.profile_pic}></img>
                        <p>{item.nickname}</p>
                    </div>
                    <div className="inItemBanUser_right">
                        <Tooltip title='Unban'>
                            <button onClick={() => debanUser(item)}><Close /></button>
                        </Tooltip>
                    </div>
                </div>
            </div>)
        })
        setItemListHistory(itemList);
    }

    utilsData.socket.removeAllListeners('getAllUsersBannedReturn');

    utilsData.socket.on('getAllUsersBannedReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        getListItem(data);
        utilsData.socket.off('getAllUsersBannedReturn');
        utilsData.socket.removeListener('getAllUsersBannedReturn');
    })

    useEffect(() => {
		if (!update) {
			utilsData.socket.emit('GET_ALL_USERS_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login });
			utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login });
			setUpdate(true);
		}
    }, [props, itemListHistory]);

    function AffList() {
        return (
            <div className="ListItemBanUser">
                {itemListHistory}
            </div>
        );
    };

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader header-user-banned">
                <div className="cross">
                    <button onClick={closeAffBanned}><ArrowBackIosNew /></button>
                </div>
                <h3>Blocked Users</h3>
                <div className="icons">
                    <button onClick={handleClickOpenDialogBan}>
                        <PersonOffIcon />
                    </button>
                </div>
            </div>
            <AffList />
            <Dialog open={openDialogBan} onClose={handleCloseDialogBan}>
                <DialogTitle>Block a User</DialogTitle>
                <DialogContent>
                    <Grid container direction={"column"} spacing={5}>
                        <Grid item>
                            <Box sx={{ m: 2 }} />
                            <Autocomplete
                                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_BANNED', { id: userData.userReducer.user?.id, login: userData.userReducer.user?.login }) }}
                                options={connectedClient.map((option) => option.nickname)}
                                renderInput={(params) => <TextField {...params} label="Enter name to ban" />}
                                inputValue={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                onChange={(event: any, newValue: string | null) => {
                                    setInputValue(newValue || "");
                                }}
                                className="AutocompleteInput"
                                sx={{ width: 300 }}
                            />
                        </Grid>
                        <Grid item>
                            <FormControl className="FormControlDialog" fullWidth>
                                <InputLabel id="">Days</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
                                    value={days.toString()}
                                    label="Days"
                                    onChange={handleChangeDays}
                                    disabled={alwaysOrNot}
                                >
                                    <MenuItem value={0}>0</MenuItem>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={12}>10</MenuItem>
                                    <MenuItem value={24}>30 </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Hours</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
                                    value={hours.toString()}
                                    label="Hours"
                                    onChange={handleChangeHours}
                                    disabled={alwaysOrNot}
                                >
                                    <MenuItem value={0}>0</MenuItem>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={12}>12</MenuItem>
                                    <MenuItem value={24}>24</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Minutes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
                                    value={minutes.toString()}
                                    label="Minutes"
                                    onChange={handleChangeMinutes}
                                    disabled={alwaysOrNot}
                                >
                                    <MenuItem value={0}>0</MenuItem>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={40}>40</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Secondes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
                                    value={seconds.toString()}
                                    label="Secondes"
                                    onChange={handleChangeSeconds}
                                    disabled={alwaysOrNot}
                                >
                                    <MenuItem value={0}>0</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={40}>40</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <div className='dialogContainerAlwaysOrNot'>
                        <p>Always</p>
                        <Checkbox
                            value={alwaysOrNot}
                            onChange={e => setAlwaysOrNot(!alwaysOrNot)}
                            id="checkBoxBan"
                        />
                    </div>
                    <Box sx={{ mr: 6 }} />
                    <button onClick={handleCloseDialogBan}>Cancel</button>
                    <button onClick={buttonBanUser}>Enter</button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AffUsersBanned;
