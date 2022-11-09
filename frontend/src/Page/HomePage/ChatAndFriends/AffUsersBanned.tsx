import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import '../Homepage.scss'
import { constWhileSecu } from '../HomePage';
import BanUser from '../../../Trash/BanUser';
import axiosConfig from '../../../Utils/axiosConfig';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, ListItemIcon, Menu, TextField } from "@mui/material";
import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import './CSS/AffUserBanned.scss';
import { SnackbarKey, withSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';

function AffUsersBanned(props: { setFriendList: Function, setBannedUsers: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string, nickname: string }[]>(new Array());

    const [update, setUpdate] = useState(false);

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
        let test = false;
        console.log("text.length = ", inputValue.length, ", days = ", days, ", minutes = ", minutes, ", seconds = ", seconds, ", alwaysOrNot = ", alwaysOrNot);
        if (inputValue.length <= 0 || (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !alwaysOrNot)) {
            console.log("Wrong input for banUser");
            enqueueSnackbar('Wrong input for banUser', { variant: "error", autoHideDuration: 2000 })
            return;
        }
        await axiosConfig.get('https://localhost:5001/user/login/' + inputValue).then(async (res) => {
            setInputValue("");
            console.log("axios.get");
            console.log(res.data);
            console.log(res);
            let receiver_login_tmp: string = res.data.login;
            if (res.data == "") {
                console.log("login not found");
                return;
            }
            else {
                let a = 1;
                let b = 1;
                await axiosConfig.get('https://localhost:5001/blackList/checkUserBan/' + res.data.login + '/' + userData.userReducer.user?.login).then(async (res) => {
                    console.log('check invit');
                    console.log(res.data);
                    console.log(res);
                    if (res.data == true) {
                        console.log("ban already exist");
                    }
                    else {
                        a = 2;
                        console.log('ban not exist');
                    }
                })
                if (a == 2) {
                    console.log('test == true');
                    console.log(receiver_login_tmp);
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
                }
            }
        });
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogBan(false);
    }

    utilsData.socket.removeAllListeners('userBanned');

    utilsData.socket.on('userBanned', function (userBanned: boolean) {
        console.log('userBanned = ', userBanned);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('userBanned');
        utilsData.socket.removeListener('userBanned');
    })

    utilsData.socket.removeAllListeners('debanedUser');

    utilsData.socket.on('debanedUser', function (debanedUser: boolean) {
        console.log('debanedUser = ', debanedUser);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('debanedUser');
        utilsData.socket.removeListener('debanedUser');
    })

    const closeAffBanned = () => {
        props.setBannedUsers(false);
        props.setFriendList(true);
    }

    const debanUser = (item: { id_banned: number, login_banned: string }) => {
        console.log("button debanUser");
        utilsData.socket.emit('removeUserBan', { id_sender: userData.userReducer.user?.id, login_banned: item.login_banned });
    }

    const getListItem = async () => {
        let itemList: any[] = [];
        await axiosConfig.get('https://localhost:5001/blackList/getAllUserBan/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.login).then(async (res) => {
            res.data.forEach((item: { id_banned: number, login_banned: string }) => {
                const profile_pic = `https://cdn.intra.42.fr/users/${item.login_banned}.jpg`;
                itemList.push(<div key={itemList.length.toString()} className='itemBanUser'>
                    <div className="inItemBanUser">
                        <div className="inItemBanUser_left">
                            <img src={profile_pic}></img>
                            <p>{item.login_banned}</p>
                        </div>
                        <div className="inItemBanUser_right">
                            <button onClick={() => debanUser(item)} className="bi bi-x-lg"></button>
                        </div>
                    </div>
                </div>)
            })
        });
        setItemListHistory(itemList);
    }

    utilsData.socket.removeAllListeners('getAllClientConnected');

    utilsData.socket.on('getAllClientConnected', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        console.log('getAllClientConnected = ', data);
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, username: client.login, nickname: client.nickname };
                tmp.push(a);
            }
        })
        setConnectedClient(tmp);
        utilsData.socket.off('getAllClientConnected');
        utilsData.socket.removeListener('getAllClientConnected');
    })

    useEffect(() => {
        if (!update) {
            utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED');
            getListItem();
            setUpdate(true);
        }
    });

    function AffList() {
        return (
            <div className="ListItemBanUser">
                {itemListHistory}
            </div>
        );
    };

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeAffBanned} className="bi bi-arrow-left"></button>
                </div>
                <h3>Blocked Users</h3>
                <div className="mainHeaderRight mainHeaderSide">
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
                                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED') }}
                                options={connectedClient.map((option) => option.nickname)}
                                renderInput={(params) => <TextField {...params} label="Enter name to ban" />}
                                // onChange={(event: any, newValue: string | null) => {
                                //   setValue(newValue);
                                // }}
                                inputValue={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}

                                // value={value}
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
