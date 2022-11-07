import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { CircularProgress, Box, MobileStepper, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import NavBar from '../../Module/Navbar/Navbar';
import './PongHome.scss';
import map1 from './../assets/map1.png'
import map2 from './../assets/map2.png'
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../State';
import Background from '../../Module/Background/Background';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import MapCarousel from './MapCarousel/MapCarousel';
import { bindActionCreators } from 'redux';

const steps = [
	{
		label: 'map1',
		description: map1,
	},
	{
		label: 'map2',
		description: map2,
	},
	{
		label: 'map3',
		description: map1,
	},
	{
		label: 'map4',
		description: map2,
	},
];

function PongHome(props: any) {

	const dispatch = useDispatch();
	const { delNotif } = bindActionCreators(actionCreators, dispatch);

	const theme = useTheme();
	const [activeStep, setActiveStep] = React.useState(0);
	const nbMap = 4;
	const maxSteps = steps.length;

	const utilsData = useSelector((state: RootState) => state.utils);
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

	const [inQueue, setInQueue] = React.useState(false);

	function joinQueue() {
		utilsData.socket.emit('JOIN_QUEUE', { user: persistantReducer.userReducer.user, gameMap: props.gameMap });
	}

	utilsData.socket.on('joined', function () {
		setInQueue(true);
	});

	utilsData.socket.on('leave_queue', function () {
		setInQueue(false);
	});

	utilsData.socket.on('start', function (roomID: string) {
		let tmp = -1;
		while ((tmp = persistantReducer.notifReducer.notifArray.findIndex(item => item.data.roomId == roomID)) != -1)
			delNotif(persistantReducer.notifReducer.notifArray[tmp])

		props.setRoomID(roomID);
		props.setGameStart(true);
	});

	const handleNext = () => {
		if (props.gameMap == 'map1')
			props.setGameMap('map2')
		else if (props.gameMap == 'map2')
			props.setGameMap('map3')
		else if (props.gameMap == 'map3')
			props.setGameMap('createMap')
		else if (props.gameMap == 'createMap')
			props.setGameMap('map1')

		setActiveStep((prevActiveStep) => (prevActiveStep + 1) % nbMap);
	};

	const handleBack = () => {
		if (props.gameMap == 'createMap')
			props.setGameMap('map3')
		if (props.gameMap == 'map3')
			props.setGameMap('map2')
		else if (props.gameMap == 'map2')
			props.setGameMap('map1')
		if (props.gameMap == 'map1')
			props.setGameMap('createMap')

		setActiveStep((prevActiveStep) => (prevActiveStep + (nbMap - 1)) % nbMap);
	};

	async function chooseMap(map: string) {
		props.setGameMap(map)
	}

	return (
		<>
			<NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "" }} setOpenFriendConversFromProfile={() => { }} />
			<Background />
			{!inQueue ?
				<>
					<div className='pong'>
						<h1>Select Map</h1> 
						<div className='select-map'>
							<button onClick={handleBack}><ArrowBackIosNew /></button>
							<MapCarousel activeStep={activeStep} />
							<button onClick={handleNext}> <ArrowForwardIos /> </button>
						</div>
						{
							props.gameMap != 'createMap' ?
								<button className='join-queue' type='button' onClick={joinQueue}>Join queue</button> :
								<button className='join-queue' onClick={() => props.setCreateMap(true)}>Create map</button>
						}
					</div></> :
				<div className='loading-screen'>
					<div className="pong-loader"></div>
					<h3>Searching</h3>
					{/* <button className='join-queue' type='button' onClick={joinQueue}>Join queue</button> */}
					<button className='leave-queue' type='button' onClick={() => { utilsData.socket.emit('LEAVE_QUEUE', { user: persistantReducer.userReducer.user }) }}>Cancel</button>
				</div>}
		</>
	)
}

export default PongHome;
