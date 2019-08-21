import React from 'react';
import {useEffect, useRef, useReducer} from 'react'
import './App.css';

const initialState = {
  currentCount: 1500,
  countType: 'session',
  breakTime: 300,
  sessionTime: 1500,
  timerActive: false
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'decrement':
      //reduce the count by 1 or change session type if it reaches zero
      if (state.currentCount === 0) {
        return {
          ...state, 
          countType: state.countType==='session' ? 'break' : 'session',
          currentCount: state.countType==='session' ? state.breakTime : state.sessionTime
        }
      } else {
        return {...state, currentCount: state.currentCount - 1}
      }
    case 'startStop':
      //start and stop the timer
      return {...state, timerActive: !state.timerActive}
    case 'changeTime':
      //change the value of the break or session times
      const [type, incDec] = action.data.split("-")
      const time = type === 'session' ? state.sessionTime : state.breakTime
      const value = incDec === 'increment' ? 60 : -60
      
      if ((time > 60 && incDec === 'decrement') || (time < 3600 && incDec==='increment')) {
        return {
          ...state, 
          sessionTime: type === 'session' ? state.sessionTime + value : state.sessionTime,
          breakTime: type === 'break' ? state.breakTime + value : state.breakTime,
          currentCount: (!state.timerActive && state.countType === type && state.currentCount === time) ? 
            state.currentCount + value : 
            state.currentCount 
        }
      } else {
        return state
      }
    case 'reset':
      //reset the value of the timer and session/break times
      return {...initialState}
    default:
      return state
  }
}

const CountDown = ({ currentTime, countType, progressBar }) => {

  const minutes = Number.parseInt(currentTime / 60);
  const seconds = currentTime % 60;
  const progress = countType === 'Session' ? progressBar + '%' : 100 - progressBar + '%';

  let addZeroSec = '';
  let addZeroMin = '';
  addZeroSec = seconds < 10 ? addZeroSec = '0' : addZeroSec = '';
  minutes < 10 ? addZeroMin = '0' : addZeroMin = '';

  return (
    <div id="sessionTime">
      <div id="progressBox" style={{height: progress}}></div>
      <h3 id="timer-label">{countType}</h3>
      <h1 id="time-left">{addZeroMin + minutes + ':' + addZeroSec + seconds}</h1>
    </div>
  )

}

const StartStopButtons = ({ timerActive, startStopTimer, resetTimer }) => {
  return (
    <div id="startStop">
      <button
        id="start_stop"
        onClick={startStopTimer}
        style={timerActive ? { backgroundColor: '#d4332a' } : {} } >
          {timerActive ? "Stop" : "Start"}
      </button>

      <button id="reset" onClick={resetTimer}>Reset</button>
    </div>
    )
}

const SetTimes = ({ handleIncDec, sessionTime, breakTime }) => {
      
  return (
    <div id='setTimes'>
        
      <div className='setTimesControl'>
        <h2 id='session-label'>Session Time</h2>
        <div className='setTimesButtons'>
            <button id='session-decrement' onClick={handleIncDec}>-</button>
            <h2 id='session-length'>{sessionTime/60}</h2>
            <button id='session-increment' onClick={handleIncDec}>+</button>
        </div>
      </div>
        
      <div className='setTimesControl'>
        <h2 id='break-label'>Break Time</h2>
        <div className='setTimesButtons'>
          <button id='break-decrement' onClick={handleIncDec}>-</button>
          <h2 id='break-length'>{breakTime/60}</h2>
          <button id='break-increment' onClick={handleIncDec}>+</button>
        </div>
      </div>
        
    </div>
  )
}


const TimerDisplay = ({playSound, dispatch, state }) => {

  const totalCount = state.countType === 'session' ? state.sessionTime : state.breakTime
  let intervalID = null

  useEffect(() => {
    if (state.timerActive) {
      intervalID = setInterval(() => dispatch({type: 'decrement'}), 1000);
    } else {
      clearInterval(intervalID);
    }
    return () => clearInterval(intervalID);

  }, [state.timerActive, intervalID]);


  useEffect(() => {
    if(state.currentCount === 0) {
      playSound('start')
    }
  },[state.currentCount, playSound])
  

  const startStopTimer = () => {
    dispatch({type: 'startStop'})
  };

  const resetTimer = () => {
    playSound('stop')
    dispatch({type: 'reset'})
  };

  return (
    <div id="countDownButtons">

      <CountDown
        currentTime={state.currentCount}
        countType={state.countType}
        progressBar={state.currentCount / totalCount * 100 }>
      </CountDown>

      <StartStopButtons
        startStopTimer={startStopTimer}
        resetTimer={resetTimer}
        timerActive={state.timerActive}>
      </StartStopButtons>
    </div>
  )
}


const App = () => {

  const [state, dispatch] = useReducer(reducer, initialState)

  const soundFile = 'https://grimjohncorn.github.io/FCC-Pomodora/beep-sound.mp3';
  const tomatoImg = 'https://grimjohncorn.github.io/FCC-Pomodora/img_tomato.png';
  const beepSound = useRef(null);

  const playSound = type => {
    switch (type) {
      case 'start':
        beepSound.current.currentTime = 0;
        beepSound.current.play();
        break;
      case 'stop':
        beepSound.current.pause();
        beepSound.current.currentTime = 0;
        break;
      default:
        throw new Error("unexpected type")
    }
  }

  const handleIncDec = event => {
    const { id } = event.target;
    dispatch({type: 'changeTime', data: id})
  };

  return (
    <div id="mainPage">

      <header id="heading" title="Pomodoro Clock">
        <h1>Pomodor</h1>
        <img id="img_tomato" src={tomatoImg} alt="tomato logo"></img>
        <h1>Clock</h1>
      </header>

      <SetTimes 
        sessionTime={state.sessionTime}
        breakTime={state.breakTime}
        handleIncDec={handleIncDec}
        state={state}>
      </SetTimes>


      <TimerDisplay
        playSound={playSound}
        dispatch={dispatch}
        state={state}>
      </TimerDisplay>

      <audio id='beep' ref={beepSound}>
          <source src={soundFile} type='audio/mpeg' preload='auto' />
      </audio>

    </div>
  )
}

export default App;