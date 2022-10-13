import HomePage from './Page/HomePage/HomePage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from './Page/NotFound/NotFound';
import ChatPage from './Page/Chat/ChatPage';
import Login from './Page/Login/Login';
import Callback from './Page/Login/Callback';
import React, { Dispatch, SetStateAction, useState } from 'react';
import ConnectionChecker from './Module/ConnectionChecker/ConnectionChecker';
import GameSwitch from './Page/Pong/GameSwitch';
import axios from 'axios';
import useFindUser from './findUser';
import { useSelector } from 'react-redux';
import { RootState } from './State';
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './State/store';
import TestMsg from './Page/Tests/test';
import Chat from './Components/Chat/Chat';
import NewChatPage from './Page/newChat/newChat';
import QrCode from './Page/2fa/2fa';
import Profile from './Page/Profile/Profile';
import Settings from './Page/Settings/Settings';
import NavBar from './Module/Navbar/Navbar';
import PongHome from './Page/Pong/PongHome';
import CreateMapTemp from './Page/Pong/CreateMapTemp';
import { StatPlayer } from './Module/UserProfile/StatPlayer';

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

          <Route path='/Chat' element={<ConnectionChecker component={<NewChatPage />} />} />

          <Route path='/Profile' element={<ConnectionChecker component={<Profile />} />} />
          <Route path='/Profile/*' element={<ConnectionChecker component={<StatPlayer />} />} />

          <Route path='/Settings' element={<ConnectionChecker component={<Settings />} />} />

          <Route path='/QrCode' element={<QrCode />} />

          <Route path='/NotFound' element={<NotFound />} />
          <Route path='/*' element={<Navigate to="/NotFound" replace />} />
        </Routes>
      </PersistGate>

    </BrowserRouter>

  );
};

export default App;
