import React, { useEffect } from 'react';
import './Homepage.scss';
import NavBar from '../../Module/Navbar/Navbar';
import Background from '../../Module/Background/Background';
import { Tooltip } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../State';
import { bindActionCreators } from 'redux';
import axiosConfig from '../../Utils/axiosConfig';

export const constWhileSecu = 10;

function HomePage() {

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

    const dispatch = useDispatch();

	const { setUser } = bindActionCreators(actionCreators, dispatch);

    const { setIsOpen } = useTour()

    useEffect(() => {

        if (persistantReducer.userReducer.user?.isFirstConnection) {
			axiosConfig.post('https://localhost:5001/user/firstConnection').then(res => setUser(res.data))
            setIsOpen(true)
		}
    })

    return (
        <>
            <NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
            <Background />
            <div className="homepage">
                <div className="field">
                    <div className="net"></div>
                    <div className="ping-racket"></div>
                    <div className="pong-racket"></div>
                    <div className="ball"></div>
                </div>
                <Tooltip title='Play for the gloire'>
                <button className='reactour-play' onClick={() => location.href = '/pong'}>Play !</button>
                </Tooltip>
            </div>
        </>
    )
};

export default HomePage;
