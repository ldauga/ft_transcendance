import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { VscBellDot } from 'react-icons/vsc'
import { VscBell } from 'react-icons/vsc'
import { RootState } from '../../../State';
import { useSelector } from 'react-redux';

const Bell = () => {
  const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)
  const [oldNbNotif, setOldNbNotif] = useState(0)

  let location = useLocation();

  function bellOnClick() {
    var tmp = document.getElementById('notifModal');
    if (tmp) {
      setOldNbNotif(persistantReduceur.notifReducer.notifArray.length)
      if (tmp.style.display != 'flex')
        tmp.style.display = 'flex';
      else
        tmp.style.display = 'none'
    }
  }

    if (persistantReduceur.notifReducer.notifArray.length != oldNbNotif) {
      if (oldNbNotif < persistantReduceur.notifReducer.notifArray.length) {
        return (<VscBellDot id='bell' onClick={bellOnClick} />);
      }
      else {
        setOldNbNotif(persistantReduceur.notifReducer.notifArray.length)
        return (<VscBell id='bell' onClick={bellOnClick} />);
      }
    } else {
      return (<VscBell id='bell' onClick={bellOnClick} />);
    }
};

export default Bell;
