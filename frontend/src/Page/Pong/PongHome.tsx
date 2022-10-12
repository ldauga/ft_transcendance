import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import NavBar from '../../Module/Navbar/Navbar';
import './PongHome.scss';
import map1 from './../PongPage/map1.png'
import map2 from './../PongPage/map2.png'
import { useSelector } from 'react-redux';
import { RootState } from '../../State';


const images = [
	{
		label: 'map1',
		imgPath:
			{ map1 },
	},
	{
		label: 'map2',
		imgPath:
			{ map1 },
	},
	{
		label: 'map3',
		imgPath:
			{ map1 },
	},
	{
		label: 'map4',
		imgPath:
			{ map1 },
	},
];

const styles = {
	slide: {
		padding: 15,
		minHeight: 100,
		color: '#fff',
	},
	slide1: {
		backgroundColor: '#FEA900',
	},
	slide2: {
		backgroundColor: '#B3DC4A',
	},
	slide3: {
		backgroundColor: '#6AC0FF',
	},
};

function PongHome(props: any) {
	const utilsData = useSelector((state: RootState) => state.utils);
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

	const [inQueue, setInQueue] = React.useState(false);
	const [notFound, setNotFound] = React.useState(false);

	const theme = useTheme();
	const [activeStep, setActiveStep] = React.useState(0);
	const maxSteps = images.length;

	function joinQueue() {
		utilsData.socket.emit('JOIN_QUEUE', { user: persistantReducer.userReducer.user, gameMap: 'map1' });
	}

	utilsData.socket.on('joined', function () {
		setInQueue(true);
	});

	utilsData.socket.on('start', function (roomID: string) {
		props.setRoomID(roomID);
		props.setGameStart(true);
	});

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleStepChange = (step: number) => {
		setActiveStep(step);
	};

	async function chooseMap(map: string) {
		props.setGameMap(map)
	}

	return (
		<>
			<NavBar />
			<div className='pong'>
				<Box sx={{ maxWidth: 400, flexGrow: 1 }}>
					<Paper
						square
						elevation={0}
						sx={{
							display: 'flex',
							alignItems: 'center',
							height: 50,
							pl: 2,
							bgcolor: 'background.default',
						}}
					>
						<Typography>{images[activeStep].label}</Typography>
					</Paper>
					<MobileStepper
						steps={maxSteps}
						position="static"
						activeStep={activeStep}
						nextButton={
							<Button
								size="small"
								onClick={handleNext}
								disabled={activeStep === maxSteps - 1}
							>
								Next
								{theme.direction === 'rtl' ? (
									<KeyboardArrowLeft />
								) : (
									<KeyboardArrowRight />
								)}
							</Button>
						}
						backButton={
							<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
								{theme.direction === 'rtl' ? (
									<KeyboardArrowRight />
								) : (
									<KeyboardArrowLeft />
								)}
								Back
							</Button>
						}
					/>
				</Box>
				<button className='join-queue' type='button' onClick={joinQueue}>{!inQueue ? 'Join queue' : 'Loading...'}</button>
				<span>or</span>
				<button onClick={() => props.setCreateMap(true)}>Create map</button>
			</div>
		</>
	);
}

export default PongHome;
