import React from 'react';
import { useLocation } from 'react-router-dom';

const Bell=() => {

    let location = useLocation();

    if (location.pathname !== "/NotFound")
      return (<a href="notif"><i className="bi bi-bell"></i></a>);
    return <></>;
  };
  
export default Bell;
  