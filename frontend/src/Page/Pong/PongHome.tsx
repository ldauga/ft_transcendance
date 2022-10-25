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
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import Background from '../../Module/Background/Background';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import MapCarousel from './MapCarousel/MapCarousel';

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

		setActiveStep((prevActiveStep) => (prevActiveStep + 1) % nbMap);
	};

	const handleBack = () => {
		if (props.gameMap == 'createMap')
			props.setGameMap('map3')
		if (props.gameMap == 'map3')
			props.setGameMap('map2')
		else if (props.gameMap == 'map2')
			props.setGameMap('map1')

		setActiveStep((prevActiveStep) => (prevActiveStep + (nbMap - 1)) % nbMap);
	};

	async function chooseMap(map: string) {
		props.setGameMap(map)
	}

	return (
		<>
			<NavBar />
			<Background />
			<div className='pong'>
				<div className='select-map'>
					<button onClick={handleBack}><ArrowBackIosNew /></button>
					<MapCarousel activeStep={activeStep}/>
					<button onClick={handleNext}> <ArrowForwardIos /> </button>
				</div>
                <button className='join-queue' onClick={ () => joinQueue()}>Join Queue</button>
			</div>
		</>
	)
	
	// return (
	// 	<>
	// 		<NavBar />
	// 		<Background />
	// 		{!inQueue ?
	// 			<>
	// 				<div className='pong'>
	// 					<Box sx={{ maxWidth: 400, flexGrow: 1 }}>
	// 						<Paper
	// 							square
	// 							elevation={0}
	// 							sx={{
	// 								display: 'flex',
	// 								alignItems: 'center',
	// 								height: 50,
	// 								pl: 2,
	// 								bgcolor: 'background.default',
	// 							}}
	// 						>
	// 							<Typography>{steps[activeStep].label}</Typography>
	// 						</Paper>
	// 						<Box
	// 							component="img"
	// 							sx={{
	// 								height: 255,
	// 								display: 'block',
	// 								maxWidth: 400,
	// 								overflow: 'hidden',
	// 								width: '100%',
	// 							}}
	// 							src={steps[activeStep].description}
	// 							alt={steps[activeStep].label}
	// 						/>
	// 						<MobileStepper
	// 							variant="dots"
	// 							steps={maxSteps}
	// 							position="static"
	// 							activeStep={activeStep}
	// 							nextButton={
	// 								<Button
	// 									size="small"
	// 									onClick={handleNext}
	// 									disabled={activeStep === maxSteps - 1}
	// 								>
	// 									Next
	// 									{theme.direction === 'rtl' ? (
	// 										<KeyboardArrowLeft />
	// 									) : (
	// 										<KeyboardArrowRight />
	// 									)}
	// 								</Button>
	// 							}
	// 							backButton={
	// 								<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
	// 									{theme.direction === 'rtl' ? (
	// 										<KeyboardArrowRight />
	// 									) : (
	// 										<KeyboardArrowLeft />
	// 									)}
	// 									Back
	// 								</Button>
	// 							}
	// 						/>
	// 					</Box>
	// 					{
	// 						props.gameMap != 'createMap' ?
	// 							<button className='join-queue' type='button' onClick={joinQueue}>Join queue</button> :
	// 							<button className='create-map' onClick={() => props.setCreateMap(true)}>Create map</button>
	// 					}
	// 				</div>
	// 			</> :
	// 			<div className='loadingScreen'>
	// 				<CircularProgress className='circularProgress' />
	// 				<span>Waiting for opponent...</span>
	// 							{/* <button className='join-queue' type='button' onClick={joinQueue}>Join queue</button> : */}
	// 				<button className='leave-queue' type='button' onClick={() => { utilsData.socket.emit('LEAVE_QUEUE', { user: persistantReducer.userReducer.user }) }}>Leave queue</button>
	// 			</div>}
	// 	</>
	// );
}

export default PongHome;
