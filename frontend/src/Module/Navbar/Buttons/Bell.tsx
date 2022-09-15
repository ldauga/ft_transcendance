import React from 'react';
import { useLocation } from 'react-router-dom';

import { VscBellDot } from 'react-icons/vsc'
import { VscBell } from 'react-icons/vsc'

const Bell = (props: { notif?: boolean }) => {

  let location = useLocation();

  if (location.pathname !== "/NotFound" && location.pathname !== '/pong')
    if (props.notif === undefined || props.notif === false)
      return (<VscBell onClick={() => { var tmp = document.getElementById('notifModal'); if (tmp) tmp.style.display = 'block' }} />);
    else
      return (<VscBellDot onClick={() => { var tmp = document.getElementById('notifModal'); if (tmp) tmp.style.display = 'block' }} />);
  return <></>;
};

export default Bell;
