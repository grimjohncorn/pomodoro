import React from 'react';
import {useEffect, useRef, useReducer} from 'react'
import './App.css';

const initialState = {
  currentCount: 1500,
  currentTotal: 1500,
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
        const newCount = state.countType==='session' ? state.breakTime : state.sessionTime
        return {
          ...state, 
          countType: state.countType==='session' ? 'break' : 'session',
          currentCount: newCount,
          currentTotal: newCount
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
        const timeMatches = (!state.timerActive && state.countType === type && state.currentCount === time)
        return {
          ...state, 
          sessionTime: type === 'session' ? state.sessionTime + value : state.sessionTime,
          breakTime: type === 'break' ? state.breakTime + value : state.breakTime,
          currentCount: timeMatches ? state.currentCount + value : state.currentCount,
          currentTotal: timeMatches ? state.currentTotal + value : state.currentTotal
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

const ConvertMinSec = ({ time }) => {
  const minutes = Number.parseInt(time / 60)
  const seconds = time % 60

  let addZeroSec = ''
  let addZeroMin = ''
  addZeroSec = seconds < 10 ? addZeroSec = '0' : addZeroSec = ''
  addZeroMin = minutes < 10 ? '0' : ''

  return (
    addZeroMin + minutes + ':' + addZeroSec + seconds
  )
}

const CountDown = ({ state }) => {

  const {currentCount, currentTotal, countType, sessionTime, breakTime} = state
  
  const progressBar = currentCount / currentTotal * 100
  const progress = countType === 'session' ? progressBar + '%' : 100 - progressBar + '%';

  return (
    <div id="sessionTime">
      <div id="progressBox" style={{height: progress}}></div>
      <h3 id="timer-label">{countType}</h3>
      <h1 id="time-left"><ConvertMinSec time={currentCount} /></h1>
    </div>
  )

}

const StartStopButtons = ({ state, startStopTimer, resetTimer }) => {
  
  const {timerActive} = state

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

const SetTimes = ({ handleIncDec, state}) => {
  
  const {sessionTime, breakTime} = state
  
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

      <CountDown state={state} />

      <StartStopButtons
        startStopTimer={startStopTimer}
        resetTimer={resetTimer}
        state={state}>
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
