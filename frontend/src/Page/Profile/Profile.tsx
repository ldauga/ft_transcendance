import React from 'react';
import { Divider, Tab, Tabs, Typography } from '@mui/material';
import { Box } from '@mui/system';
import './Profile.scss';
import Leaderboard from './Tabs/Leaderboard';
import MatchHistory from './MatchHistory/MatchHistory';
import NavBar from '../../Module/Navbar/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';

import unranked from './../../Assets/rank/unranked.png'
import bronze_rank_img from '../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../Assets/rank/diamond_rank.png'
import silver_rank_img from '../../Assets/rank/silver_rank.png'
import platinium_rank_img from '../../Assets/rank/platinium_rank.png'

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
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
    
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <NavBar />
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
                                <img src={
                                    persistantReducer.userReducer.user?.login == 'ldauga' ? diamond_rank_img :
                                        !persistantReducer.userReducer.user?.wins ? unranked :
                                            persistantReducer.userReducer.user?.wins < 5 ? bronze_rank_img :
                                                persistantReducer.userReducer.user?.wins < 10 ? silver_rank_img :
                                                    persistantReducer.userReducer.user?.wins < 20 ? gold_rank_img :
                                                        persistantReducer.userReducer.user?.wins < 50 ? platinium_rank_img :
                                                            diamond_rank_img} />
                                <span>
									{persistantReducer.userReducer.user?.login == 'ldauga' ? 'Master Rank' :
										!persistantReducer.userReducer.user?.wins ? 'unranked' :
											persistantReducer.userReducer.user?.wins < 5 ? 'Iron Rank' :
												persistantReducer.userReducer.user?.wins < 10 ? 'Bronze Rank' :
													persistantReducer.userReducer.user?.wins < 20 ? 'Gold Rank' :
														persistantReducer.userReducer.user?.wins < 50 ? 'Diamond Rank' :
															'Master Rank'}</span>
                            </div>
                        </div>
                        <Divider />
                        <div className='statView'>
                            <h3>Your statistiques :</h3>
                            <p>{'Game Played : ' + (persistantReducer.userReducer.user!.wins + persistantReducer.userReducer.user!.losses).toString()}</p>
                            <p>{'Wins : ' + (persistantReducer.userReducer.user!.wins)}</p>
                            <p>{'Losses : ' + (persistantReducer.userReducer.user!.losses)}</p>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <MatchHistory />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <Leaderboard />
                </TabPanel>
            </div>
        </>
    );
}

export default Profile;
