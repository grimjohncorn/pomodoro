import React from 'react';
import {useState, useEffect, useRef, useReducer} from 'react'
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
        //playSound('start');
        return {
          ...state, 
          countType: state.countType==='session' ? 'break' : 'session',
          currentCount: state.countType==='session' ? state.breakTime : state.sessionTime
        }
      } else {
        return {...state, currentCount: state.currentCount - 1}
      }
    case 'changeTime':
      //change the value of the break or session times
      const [type, incDec] = action.data.split("-")
      const time = type==='session' ? state.sessionTime : state.breakTime
      const value = incDec==='increment' ? 60 : -60
      
      if ((time > 60 && incDec==='decrement') || (time < 3600 && incDec==='increment')) {
        return {
          ...state, 
          sessionTime: type === 'session' ? state.sessionTime + value : state.sessionTime,
          breakTime: type === 'break' ? state.breakTime + value : state.breakTime,
          currentCount: (!state.timerActive && state.countType === type) ? state.currentCount + value : state.currentCount 
        }
      } else {
        return state
      }
    default:
      return state
  }
}

const CountDown = ({ currentTime, countType, progressBar }) => {

  const minutes = Number.parseInt(currentTime / 60);
  const seconds = currentTime % 60;
  const progress = countType == 'Session' ? progressBar + '%' : 100 - progressBar + '%';

  let addZeroSec = '';
  let addZeroMin = '';
  addZeroSec = seconds < 10 ? addZeroSec = '0' : addZeroSec = '';
  minutes < 10 ? addZeroMin = '0' : addZeroMin = '';

  return (
    React.createElement("div", { id: "sessionTime" },
    React.createElement("div", { id: "progressBox", style: { height: progress } }),
    React.createElement("h3", { id: "timer-label" }, countType),
    React.createElement("h1", { id: "time-left" }, addZeroMin + minutes + ':' + addZeroSec + seconds)));


};

const StartStopButtons = ({ timerActive, startStopTimer, resetTimer }) => {
  return (
    React.createElement("div", { id: "startStop" },
    React.createElement("button", {
      id: "start_stop",
      onClick: startStopTimer,
      style: timerActive ? { backgroundColor: '#d4332a' } : {} },
    timerActive ? "Stop" : "Start"),

    React.createElement("button", { id: "reset", onClick: resetTimer }, "Reset")));


};

const SetTimes = ({ handleIncDec, sessionTime, breakTime }) => {
  return (
    React.createElement("div", { id: "setTimes" },

    React.createElement("div", { class: "setTimesControl" },
    React.createElement("h2", { id: "session-label" }, "Session Time"),
    React.createElement("div", { class: "setTimesButtons" },
    React.createElement("button", { id: "session-decrement", onClick: handleIncDec }, "-"),
    React.createElement("h2", { id: "session-length" }, sessionTime / 60),
    React.createElement("button", { id: "session-increment", onClick: handleIncDec }, "+"))),



    React.createElement("div", { class: "setTimesControl" },
    React.createElement("h2", { id: "break-label" }, "Break Time"),
    React.createElement("div", { class: "setTimesButtons" },
    React.createElement("button", { id: "break-decrement", onClick: handleIncDec }, "-"),
    React.createElement("h2", { id: "break-length" }, breakTime / 60),
    React.createElement("button", { id: "break-increment", onClick: handleIncDec }, "+")))));

};


const TimerDisplay = ({
  timerActive,
  setTimerActive,
  playSound,
  setCurrentCount,
  currentCount,
  totalCount,
  countType,
  resetDefaults,
  dispatch,
  state }) =>
{

  let intervalID = null;

  useEffect(() => {
    if (timerActive) {
      intervalID = setInterval(() => dispatch({type: 'decrement'}), 1000);
    } else {
      clearInterval(intervalID);
    }
    return () => clearInterval(intervalID);

  }, [timerActive, intervalID]);

  

  const startStopTimer = () => {
    setTimerActive(prevState => !prevState);
  };

  const resetTimer = () => {
    setTimerActive(false);
    resetDefaults();
  };

  return (
    React.createElement("div", { id: "countDownButtons" },

    React.createElement(CountDown, {
      currentTime: state.currentCount,
      countType: state.countType,
      progressBar: state.currentCount / totalCount * 100 }),


    React.createElement(StartStopButtons, {
      startStopTimer: startStopTimer,
      resetTimer: resetTimer,
      timerActive: timerActive })));




};

const App = () => {

  const [sessionTime, setSessionTime] = useState(1500);
  const [breakTime, setBreakTime] = useState(300);
  const [currentCount, setCurrentCount] = useState(1500);
  const [timerActive, setTimerActive] = useState(false);
  const [countType, setCountType] = useState("Session");

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
        break;}

  };

  const resetDefaults = () => {
    playSound('stop');
    setSessionTime(1500);
    setBreakTime(300);
    setCurrentCount(1500);
    setCountType("Session");
    setTimerActive(false);
  };

  const handleIncDec = event => {
    const { id } = event.target;
    dispatch({type: 'changeTime', data: id})
  };

  return (
    React.createElement("div", { id: "mainPage" },

    React.createElement("header", { id: "heading", title: "Pomodoro Clock" },
    React.createElement("h1", null, "Pomodor"),
    React.createElement("img", { id: "img_tomato", src: tomatoImg, alt: "tomato image" }),
    React.createElement("h1", null, "Clock")),


    React.createElement(SetTimes, {
      sessionTime: state.sessionTime,
      breakTime: state.breakTime,
      handleIncDec: handleIncDec }),


    React.createElement(TimerDisplay, {
      currentCount: currentCount,
      totalCount: countType == 'Session' ? sessionTime : breakTime,
      setCurrentCount: setCurrentCount,
      playSound: playSound,
      countType: countType,
      timerActive: timerActive,
      setTimerActive: setTimerActive,
      resetDefaults: resetDefaults,
      dispatch: dispatch,
      state: state}),


    React.createElement("audio", { id: "beep", ref: beepSound },
    React.createElement("source", { src: soundFile, type: "audio/mpeg", preload: "auto" }))));




}

export default App;
