import React from 'react';
import Bell from './Buttons/Bell';
import Play from './Buttons/Play';
import Home from './Buttons/Home';
import './Navbar.css';
import Logout from './Buttons/Logout';

const Navbar=(props: {notif?: boolean}) => {
    return (
  		<nav className="nav">
        <div className="littleDiv">
          <Logout/>
        </div>
        <div className="bigDiv">
            <Home/>
            <Play/>
        </div>
        <div className="littleDiv">
          <Bell notif={props.notif} />
        </div>
      </nav>
    );
  };
  
export default Navbar;
  