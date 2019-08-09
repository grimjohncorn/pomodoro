import React from 'react';
import {useState, useEffect, useRef} from 'react'
import './App.css';

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
  flipSessionType,
  playSound,
  setCurrentCount,
  currentCount,
  totalCount,
  countType,
  resetDefaults }) =>
{

  let intervalID = null;

  useEffect(() => {
    if (timerActive) {
      intervalID = setInterval(() => setCurrentCount(time => time - 1), 1000);
    } else {
      clearInterval(intervalID);
    }
    return () => clearInterval(intervalID);

  }, [timerActive, intervalID]);

  useEffect(() => {
    if (currentCount === 0) {
      //playSound('start');
      //if (countType == 'Session') {
      //  setCountType('Break');
      //  setCurrentCount(breakTime);
      //} else {
      //  setCountType('Session');
      //  setCurrentCount(sessionTime);
      console.log("zero1")
      }
    },[currentCount])


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
      currentTime: currentCount,
      countType: countType,
      progressBar: currentCount / totalCount * 100 }),


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

  const flipSessionType = () => {
    playSound('start');
    if (countType == 'Session') {
      setCountType('Break');
      setCurrentCount(breakTime);
    } else {
      setCountType('Session');
      setCurrentCount(sessionTime);
    }
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
    const currentSession = sessionTime;
    const currentBreak = breakTime;

    switch (id) {
      case 'session-decrement':
        if (sessionTime > 60) {
          setSessionTime(time => time - 60);
          if (!timerActive && countType == 'Session') {setCurrentCount(currentSession - 60);}
        }
        break;
      case 'session-increment':
        if (sessionTime < 3600) {
          setSessionTime(time => time + 60);
          if (!timerActive && countType == 'Session') {setCurrentCount(currentSession + 60);}
        }
        break;
      case 'break-decrement':
        if (breakTime > 60) {
          setBreakTime(time => time - 60);
          if (!timerActive && countType == 'Break') {setCurrentCount(currentBreak - 60);}
        }
        break;
      case 'break-increment':
        if (breakTime < 3600) {
          setBreakTime(time => time + 60);
          if (!timerActive && countType == 'Break') {setCurrentCount(currentBreak + 60);}
        }
        break;
      default:
        //Should never occur
        throw "Invalid type";}

  };

  return (
    React.createElement("div", { id: "mainPage" },

    React.createElement("header", { id: "heading", title: "Pomodoro Clock" },
    React.createElement("h1", null, "Pomodor"),
    React.createElement("img", { id: "img_tomato", src: tomatoImg, alt: "tomato image" }),
    React.createElement("h1", null, "Clock")),


    React.createElement(SetTimes, {
      sessionTime: sessionTime,
      breakTime: breakTime,
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
      flipSessionType: flipSessionType }),


    React.createElement("audio", { id: "beep", ref: beepSound },
    React.createElement("source", { src: soundFile, type: "audio/mpeg", preload: "auto" }))));




}

export default App;
