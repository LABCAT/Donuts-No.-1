/**
 * Created by zhaonan on 2018/3/2.
 */
import React, { Component } from 'react';
import "p5/lib/addons/p5.sound";
import p5 from "p5";
//import sketch from './sketch';

class Test extends Component {
    constructor(props) {
        super(props);
        this.mic = new p5.AudioIn();
        this.recorder = new p5.SoundRecorder();
        this.recorder.setInput(this.mic);
        this.fft = null;
        this.soundFile = new p5.SoundFile();
        this.specArr = [];
        this.state = {
            //stateSketch: sketch,
            listenState: 0,

            isListening: false,
            hasSound: false,
            isAnalysis: false,

        };

        this.stateChange = this.stateChange.bind(this);
        this.getFFT = this.getFFT.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.stopAnalysis = this.stopAnalysis.bind(this);

        this.runAnalysis = this.runAnalysis.bind(this);
        this.reqID = 0;
    }

    mouseDown() {
        //start Listening
        this.setState({
            listenState: 1,
            isListening: true
        });
        console.log("is listening!");
        this.mic.start();
        this.recorder.record(this.soundFile);
    }
    mouseUp() {
        //stop listening
        console.log("stop listening!");
        this.setState({
            listenState: 2,
            isListening: false
        });
        this.mic.stop();
        this.recorder.stop();
    }

    stateChange() {
        console.log("doing analysis!");
        this.setState({
            listenState: 3,
            hasSound: true,
            isAnalysis: true

        });
        this.soundFile.play();
        this.fft = new p5.FFT();
        this.fft.setInput(this.soundFile);
        // let spectrum = this.fft.analyze();
        // this.specArr.push(spectrum);

        this.soundFile.onended(this.stopAnalysis);
    }

    runAnalysis() {
        console.log("yo!, doing analysis");
        let spectrum = this.fft.analyze();
        this.specArr.push(spectrum);
        this.reqID = window.requestAnimationFrame(this.runAnalysis);
    }

    stopAnalysis() {
        this.setState({
            isAnalysis: false,
            hasAnalyzed: true,
        });

        console.log('done playing & analysis!');
        console.log(this.specArr.length);
        window.cancelAnimationFrame(this.reqID);
    }

    getFFT() {
        console.log("get the array of array!");
        console.log(this.specArr.length);
    };



    render() {
        if (this.state.isAnalysis === true && this.state.hasSound === true) {
            this.runAnalysis();
        }

        return (
            <div className="P5Component">
                {/*<P5Wrapper sketch={this.state.stateSketch}   listenState = {this.state.listenState} specArr = {this.state.specArr}/>*/}
                <button onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}>hold me hand record</button>
                <button onClick={this.stateChange}>fft analysis</button>
                <button onClick={this.getFFT}>getFFTarray</button>
            </div>
        );
    }
}

export default Test;