import HomePage from './Page/HomePage/HomePage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from './Page/NotFound/NotFound';
import Login from './Page/Login/Login';
import Callback from './Page/Login/Callback';
import React, { Dispatch, SetStateAction, useState } from 'react';
import ConnectionChecker from './Module/ConnectionChecker/ConnectionChecker';
import GameSwitch from './Page/Pong/GameSwitch';
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './State/store';
import Settings from './Page/Settings/Settings';
import { StatPlayer } from './Module/UserProfile/StatPlayer';
import LeaderBoard from './Page/LeaderBoard/LeaderBoard';

function App() {

  return (

    <BrowserRouter>

      <PersistGate loading={null} persistor={persistor}>

        <Routes>
          <Route path='/' element={<Navigate to="/HomePage" replace />} />
          export default HomePage;
          <Route path='/Login' element={<Login />} />
          <Route path='/Login/Callback' element={<Callback />} />

          <Route path='/HomePage' element={<ConnectionChecker component={<HomePage />} />} />

          <Route path='/pong' element={<ConnectionChecker component={<GameSwitch />} />} />
          <Route path='/LeaderBoard' element={<ConnectionChecker component={<LeaderBoard />} />} />

          <Route path='/Profile/*' element={<ConnectionChecker component={<StatPlayer />} />} />

          <Route path='/Settings' element={<ConnectionChecker component={<Settings />} />} />

          <Route path='/NotFound' element={<NotFound />} />
          <Route path='/*' element={<Navigate to="/NotFound" replace />} />
        </Routes>
        
      </PersistGate>

    </BrowserRouter>

  );
};

export default App;
