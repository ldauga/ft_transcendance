import HomePage from './Page/HomePage/HomePage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from './Page/NotFound/NotFound';
import Login from './Page/Login/Login';
import Callback from './Page/Login/Callback';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ConnectionChecker from './Module/ConnectionChecker/ConnectionChecker';
import GameSwitch from './Page/Pong/GameSwitch';
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './State/store';
import Settings from './Page/Settings/Settings';
import LeaderBoard from './Page/LeaderBoard/LeaderBoard';
import { SnackbarProvider } from 'notistack';
import StatPlayer from './Module/UserProfile/StatPlayer';
import Spectate from './Page/Pong/Spectate';
import { TourProvider } from '@reactour/tour';
import { useLocation } from 'react-router-dom'

const steps = [
  {
    selector: '.reactour-play',
    content: 'Here, you can play against random players or invite your friends.',
  },
  {
    selector: '.reactour-search-box',
    content: 'Here, you can find a user\'s profile by their login or their nickname.',
  },
  {
    selector: '.reactour-friend-list',
    content: 'Here, you can manage your friend list.',
  },
  {
    selector: '.reactour-notif',
    content: 'Here, you can check your current notifications.',
  },
  {
    selector: '.reactour-chat',
    content: 'Here, you can chat with your friends, create groups, and much more...',
  },
  {
    selector: '.reactour-profile',
    content: 'Here, you can change your nickname, your avatar, toggle your two factor authentication and much more...',
  }
]

function App() {

  return (
    <SnackbarProvider maxSnack={5}>

      <TourProvider steps={steps} onClickMask={({ setCurrentStep, currentStep, steps, setIsOpen }) => { if (currentStep === steps!.length - 1) { setIsOpen(false) } setCurrentStep((s) => (s === steps!.length - 1 ? 0 : s + 1)) }} disableKeyboardNavigation={['esc']}
      prevButton={({ currentStep, setCurrentStep, steps }) => {
        const first = currentStep === 0
        return (
          <button
          className='button-reactour'
            onClick={() => {
              setCurrentStep((s) => s - 1)
            }}
            disabled={first ? true : false}
            >
            Back
          </button>
        )
      }}
      nextButton={({
        Button,
        currentStep,
        stepsLength,
        setIsOpen,
        setCurrentStep,
        steps,
      }) => {
        const last = currentStep === stepsLength - 1
        return (
          <button
          className='button-reactour'
          onClick={() => {
              if (last) {
                setIsOpen(false)
              } else {
                setCurrentStep((s) => (s === steps!.length - 1 ? 0 : s + 1))
              }
            }}
          >
            {last ? 'Close !' : 'Next'}
          </button>
        )
      }}
      showBadge={false}
      showCloseButton={false}
      disableDotsNavigation={true}
      disableInteraction={true}

      >

        <BrowserRouter >

          <PersistGate loading={null} persistor={persistor}>

            <Routes >
              <Route path='/' element={<Navigate to="/HomePage" replace />} />

              <Route path='/Login' element={<Login />} />
              <Route path='/Login/Callback' element={<Callback />} />

              <Route path='/HomePage' element={<ConnectionChecker component={<HomePage />} />} />

              <Route path='/pong' element={<ConnectionChecker component={<GameSwitch />} />} />
              <Route path='/LeaderBoard' element={<ConnectionChecker component={<LeaderBoard />} />} />

              <Route path='/Profile/*' element={<ConnectionChecker component={<StatPlayer />} />} />

              <Route path='/Settings' element={<ConnectionChecker component={<Settings />} />} />

              <Route path='/Spectate/*' element={<ConnectionChecker component={<Spectate />} />} />


              <Route path='/NotFound' element={<ConnectionChecker component={<NotFound />} />} />
              <Route path='/*' element={<ConnectionChecker component={<NotFound />} />} />
            </Routes>

          </PersistGate>

        </BrowserRouter>

      </TourProvider>

    </SnackbarProvider>
  );
};

export default App;
