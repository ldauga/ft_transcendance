import React from 'react';
import { Divider, Tab, Tabs, Typography } from '@mui/material';
import { Box } from '@mui/system';
import './Profile.scss';
import unranked from './../../Assets/rank/unranked.png';
import Leaderboard from './Tabs/Leaderboard';
import MatchHistory from './MatchHistory/MatchHistory';
import NavBar from '../../Module/Navbar/Navbar';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    
    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
    }

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function Profile() {
    const [value, setValue] = React.useState(0);
    
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };  

    return (
        <>
        <NavBar/>
        <div className='content'>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', color: 'white' }}>
                <Tabs textColor='inherit' value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Overview" {...a11yProps(0)} />
                    <Tab label="Match History" {...a11yProps(1)} />
                    <Tab label="Leaderboard" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <div className='overview'>
                    <div className='rankView'>
                        <h3>Your rank :</h3>
                        <div className='rankContent'>
                            <img src={unranked}/>
                            <span>Unranked</span>
                        </div>
                    </div>
                    <Divider/>
                    <div className='statView'>
                        <h3>Your statistiques :</h3>
                        <p>Game Played : 10</p>
                        <p>Ratio : 2</p>
                    </div>
                </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <MatchHistory/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Leaderboard/>
            </TabPanel>
        </div>
        </>
    );
}

export default Profile;
