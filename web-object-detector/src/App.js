import React, { useState, useRef, useEffect, useReducer } from "react";
import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';
import "./App.css";

const machine = {
  initial: "initial",
  states: {
    initial: { on: { next: "startWebcam" } },
    startWebcam: {on: { next: "loadModel"}},
    loadModel: { on: { next: "identify" } },
    identify: { on: { next: "complete" }},
    complete: { on: { next: "identify" }, showImage: true, showResults: true }
  }
};





function App() {
  const [results, setResults] = useState([]);
  const [model, setModel] = useState(null);
  const [modelURL, setModelURL] = useState('vww_128_color_bicycle_005_web_model/model.json');
  const [webcam, setWebcam] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [objPred, setObjPred] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const videoRef = useRef();


    //console.log(state);
    //console.log(event);
    //console.log(appState);
  const reducer = (state, event) => 
    machine.states[state].on[event] || machine.initial;
  const [appState, dispatch] = useReducer(reducer, machine.initial);
  const next = () => dispatch("next");

  const loadModel = async () => {
    console.log('Loading ' + modelURL + '...');
  
    // Load the model.
    //const model = await tfjs-converter.loadGraphModel(MODEL_URL);
    const model = await loadGraphModel(modelURL);
    //net = await mobilenet.load();
    console.log('Successfully loaded model');
    setModel(model);
    setModelReady(true);
  };
  const Result = ({percent}) => {
    return(
      <div className="result">
        <div className="result-text">{percent}%</div>
        <div className="result-bar"><div className="bar" style={{width: `${percent}%` }} /></div>
      </div>
    );
  };
  
  const startWebcam = async () => {
    setShowWebcam(true);
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      console.log("Let's get this party started")
    }
    navigator.mediaDevices.getUserMedia({video: true})
  
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    const webcamConfig = { resizeWidth: 128, resizeHeight: 128, centerCrop: false, facingMode: 'environment'}
    const webcam = await tf.data.webcam(videoRef.current,webcamConfig);
    setWebcam(webcam);
    if (!modelReady) {
      loadModel();
    }
  };

  const identify = async () => {
    const img = await webcam.capture();
    let offset = tf.scalar(127.5);
    let new_frame = img.sub(offset)
        .div(offset)
        .expandDims().reshape([-1, 128, 128, 3]);
    const result = await model.execute(new_frame);
    //const results = await model.classify(imageRef.current);
    console.log(result.dataSync());
    const predictions = result.dataSync();
    setObjPred(Math.floor(predictions[1]*100));
    setShowResults(true);
  };

  const reset = async () => {
    setResults([]);
    next();
  };

  const handleChange = (event) => {
    setModelReady(false);
    setModelURL(event.target.value);
    console.log(event.target.value);
  };

  const actionButton = {
    initial: { action: startWebcam, text: "Start" },
    startWebcam: { text: "Starting Webcam..." },
    loadModel: { text: "Loading Model..." },
    identify: { text: "Identifying..." },
    complete: { action: reset, text: "Reset" }
  };

 
  useEffect(() => {
    const timeout = setInterval(() => {
      if (modelReady && webcam) {
        identify();
      }
    }, 1000);
    return () => {
      clearInterval(timeout);  // this guarantees to run right before the next effect
    }
  });

  useEffect(() => {
    loadModel();
  }, [modelURL]); // Only re-run the effect if count changes
  
  return (
    <div>
    <div id="main">
          <h1>Visual Wake Words Explorer</h1>
          <h2>
          <select value={modelURL} onChange={handleChange}>
            <option value="vww_128_color_bicycle_005_web_model/model.json">🚲 Bicycle</option>
            <option value="vww_128_color_dog_005_web_model/model.json">🐕 Dog</option>
            <option value="vww_128_color_apple_005_web_model/model.json">🍎 Apple</option>
            <option value="vww_128_color_car_005_web_model/model.json">🚘 Car</option>
          </select>
          Detector
          </h2>
          {!showWebcam && (
      <button onClick={startWebcam}>
        Start Webcam
      </button>
      )}
      {showWebcam && (
       <div id="video-box">  
      <video autoPlay playsInline muted id="webcam" width="500" height="500" ref={videoRef} />
      {showResults && (<Result percent={objPred}/>)}
      </div> 
      )}
      </div>
      <div id="explainer">
      <div>
        <h2>What is this?</h2>
       <p>An easy way to try different <a href="https://www.tensorflow.org/lite/microcontrollers">TinyML</a> object recognition models so you can explore what angles work best.</p>
        <h2>Why did you build this?</h2>
        <p>We have been exploring ways to build ML 🤖 <a href="https://github.com/tensorflow/tensorflow/tree/master/tensorflow/lite/micro/examples/person_detection">vision models</a> that can run on microcontollers, like the <a>Arduino</a>. 
          Google's <a href="https://blog.tensorflow.org/2019/10/visual-wake-words-with-tensorflow-lite_30.html">Visual Wake Words</a> (VWW) approach makes it easy to build a model focused on detecting a single type of object.
        </p>
        <p>VWW uses the <a href="https://cocodataset.org/#home">COCO dataset</a>, which is made up of photos from Flickr where the objects in each photo have been labeled. When 
          we started trying out models for detecting different types of objects, we found that they worked well for some views of that object,
          but failed horribly when viewed from a different angle. We think this is because photographers take photos of objects from common perspectives,
          but in the real-world you view the object from a wider range of perspectives. 
        </p>
        <p>We built this web app to make it easier for you to explore the blindspots models may have.</p>
        <h3>We think running ML in the real-world is the best way to find out how well it works!</h3>
      </div>
      </div>
      </div>
    
  );
}

export default App;