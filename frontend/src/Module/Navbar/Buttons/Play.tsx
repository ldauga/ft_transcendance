import React from 'react';
import { useLocation } from 'react-router-dom';

const Play=() => {

    let location = useLocation();

    if (location.pathname === "/HomePage")
      return (<a href="pong"><i className="bi bi-play"></i></a>);
    return <></>;
  };

export default Play;
