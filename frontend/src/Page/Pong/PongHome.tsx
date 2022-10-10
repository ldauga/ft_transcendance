import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import NavBar from '../../Module/Navbar/Navbar';
import './PongHome.scss';
import map1 from './../PongPage/map1.png'
import map2 from './../PongPage/map2.png'


const images = [
  {
    label: 'map1',
    imgPath:
      {map1},
  },
  {
    label: 'map2',
    imgPath:
	{map1},
  },
  {
    label: 'map3',
    imgPath:
	{map1},
  },
  {
    label: 'map4',
    imgPath:
	{map1},
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
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = images.length;


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
	  <NavBar/>
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
			<SwipeableViews
			axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
			index={activeStep}
			onChangeIndex={handleStepChange}
			enableMouseEvents
			>
				<img src={map1} />
				<img src={map2} />
				<img src={map1} />
				<img src={map2} />
			</SwipeableViews>
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
		<button className='join-queue' type='button'>Join queue</button>
		<span>or</span>
		<a href="/CreateMap">Create map</a>
		</div>
	</>
  );
}

export default PongHome;
