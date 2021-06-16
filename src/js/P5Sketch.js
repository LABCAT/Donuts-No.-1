import React, { useRef, useEffect } from "react";
import "./globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import audio from '../audio/donuts-no-2.ogg'
import cueSet1 from "./cueSet1.js";


const P5Sketch = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.canvas = null;
        
        p.song = null;

        p.tempo = 106;

        p.hueRanges = {
            1: [-30, 30, 0],
            2: [31, 90, 60],
            3: [91, 150, 120],
            4: [151, 210, 180],
            5: [211, 270, 240],
            6: [271, 330, 300]
        }

        p.rotationOptions = [3, 4, 6, 8, 12];

        p.iterationOptions = [16, 32, 48, 64];

        p.cueSet1Completed = [];

        p.cueSet2Completed = [];

        p.preload = () => {
            p.song = p.loadSound(audio);
        }

        p.setup = () => {
            p.colorMode(p.HSB);
            p.loadDonutGroupsArray();
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.noFill();
            p.strokeWeight(0.5);
            p.frameRate(30);

            for (let i = 0; i < cueSet1.length; i++) {
              let vars = {
                currentCue: i + 1,
                duration: cueSet1[i].duration,
                time: cueSet1[i].time,
                midi: cueSet1[i].midi,
              };
              p.song.addCue(cueSet1[i].time, p.executeCueSet1, vars);
            }
        };

        p.currentDonutGroupIndex = 0;

        p.donutsArray = [];

        p.executeCueSet1 = (vars) => {
            const currentCue = vars.currentCue;
            if (!p.cueSet1Completed.includes(currentCue)) {
                p.cueSet1Completed.push(currentCue);
                const currentDonutGroup = p.donutGroupsArray[p.currentDonutGroupIndex];
                //const iterations = currentDonutGroup.numOfIterations;
                const iterations = 16;
                const framesToAdd = currentDonutGroup.frames.length / iterations;
                const delayAmount = parseInt(vars.duration * 1000) / iterations;
                for (let i = 0; i < iterations; i++) {
                    setTimeout(
                        function () {
                            p.donutsArray = p.donutsArray.concat(currentDonutGroup.frames.slice(i * framesToAdd, (i * framesToAdd) + framesToAdd ));
                        },
                        (delayAmount * i)
                    );
                }
                p.currentDonutGroupIndex++;
                p.donutsArray = [];
                if(currentCue > 24){
                    p.currentDonutGroupIndex = 24;
                    p.canvas.removeClass('fade-in');
                }
            }
        };

        p.draw = () => {
            p.background(0, 0, 0, 0.9);
            if (p.song._lastPos > 0 && p.currentDonutGroupIndex >= 0){
                const currentDonutGroup = p.donutGroupsArray[p.currentDonutGroupIndex];
                
                if (Object.keys(currentDonutGroup.translate).length){
                    p.translate(currentDonutGroup.translate.x, currentDonutGroup.translate.y);    
                }
                p.drawDonuts(p.currentDonutGroupIndex);
            }
        };

        p.drawDonuts = (currentDonutIndex) => {
            for (var i = 0; i < p.donutsArray.length; i++) {
                let p5Action = p.donutsArray[i];
                if (p5Action.hasOwnProperty('stroke')) {
                    p['stroke'](p5Action.stroke.colour, p5Action.stroke.alpha);
                }

                if (p5Action.hasOwnProperty('ellipse')) {
                    p['ellipse'](p5Action.ellipse.x, p5Action.ellipse.y, p5Action.ellipse.width, p5Action.ellipse.hegith);
                }

                if (p5Action.hasOwnProperty('rotate')) {
                    p['rotate'](p5Action.rotate.angle);
                }

            }
        }

        p.donutGroupsArray = [];

        p.loadDonutGroupsArray = () => {
            let i = 0, translateX = p.canvasWidth / 2, translateY = p.canvasHeight / 2;
            while (i < 25) {
                let randomPointer1 = p.floor(p.random(1, 7));
                let randomPointer2 = randomPointer1 + 3;
                if (randomPointer2 > 6) {
                    randomPointer2 = randomPointer2 - 6;
                }
                let fromColour = p.color(p.random(p.hueRanges[randomPointer1][0], p.hueRanges[randomPointer1][1]), 100, 100);
                let toColour = p.color(p.random(p.hueRanges[randomPointer2][0], p.hueRanges[randomPointer2][1]), 100, 100);
                
                let frames = [];
                let x = 0;
                let width = p.canvasWidth;
                let lerpAmount = 0;
                let colour = p.lerpColor(fromColour, toColour, lerpAmount);
                let numOfRotations =  p.random(p.rotationOptions);
                let numOfIterations = p.random(p.iterationOptions);
                let shapeSize = p.random(30, 80);
                
                while (x < width) {
                    for (var j = 0; j < (numOfRotations * 2); j++) {
                        for (var k = -2; k <= 2; k++) {
                            frames.push(
                                {
                                    'stroke': {
                                        'colour': colour,
                                        'alpha': (181 - (k * 16))
                                    }
                                }
                            );
                            frames.push(
                                {
                                    'ellipse': {
                                        'x': x,
                                        'y': 20,
                                        'width': (shapeSize + (k * 3)),
                                        'height': (shapeSize + (k * 3))
                                    }
                                }
                            );
                        }
                        frames.push(
                            {
                                'rotate': {
                                    'angle': (p.PI / numOfRotations)
                                }
                            }
                        );
                    }
                    x = x + width / numOfIterations;
                    lerpAmount = lerpAmount + (1 / numOfIterations / 2);
                    colour = p.lerpColor(fromColour, toColour, lerpAmount);
                }

                p.donutGroupsArray.push(
                    {
                        'x': translateX, 
                        'y': translateY,
                        'translate': {
                            'x': translateX,
                            'y': translateY
                         },
                        'frames': frames,
                        'numOfRotations': p.random(p.rotationOptions),
                        'numOfIterations': p.random(p.iterationOptions),
                        'shapeSize': p.random(10, 80),
                        'fromColour': fromColour,
                        'toColour': toColour
                    }
                ); 
                i++;
                translateX = p.random(0, p.canvasWidth);
                translateY = p.random(0, p.canvasHeight);
            }
        }

        p.mousePressed = () => {
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    p.reset();
                }
                p.canvas.addClass('fade-in');
                p.song.play();
            }
        };

        p.creditsLogged = false;

        p.logCredits = () => {
            if (!p.creditsLogged && parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                p.creditsLogged = true;
                console.log(
                    'Music By: http://labcat.nz/',
                    '\n',
                    'Animation By: https://github.com/LABCAT/donuts-no-2',
                );
                p.song.stop();
            }
        }

        p.reset = () => {
            p.clear();
            p.cueSet1Completed = [];
            p.donutGroupsArray = [];
            p.currentDonutGroupIndex = 0
            p.loadDonutGroupsArray();
        };

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.redraw();
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <></>
    );
};

export default P5Sketch;
