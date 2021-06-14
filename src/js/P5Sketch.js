import React, { useEffect } from "react";
import "./globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import audio from '../audio/donuts-no-1.mp3'
import cueSet1 from "./cueSet1.js";
import cueSet2 from "./cueSet2.js";


const P5Sketch = () => {

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

        p.iterationOptions = [16, 32, 64, 128];

        p.cueSet1Completed = [];

        p.cueSet2Completed = [];

        p.setup = () => {
            p.song = p.loadSound(audio);
            p.colorMode(p.HSB);
            p.loadDonutGroupsArray();
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.noFill();
            p.strokeWeight(0.5);
            p.frameRate(5);

            for (let i = 0; i < cueSet1.length; i++) {
              let vars = {
                currentCue: i + 1,
                duration: cueSet1[i].duration,
                time: cueSet1[i].time,
                midi: cueSet1[i].midi,
              };
              p.song.addCue(cueSet1[i].time, p.executeCueSet1, vars);
            }

            for (let i = 0; i < cueSet2.length; i++) {
              let vars = {
                currentCue: i + 1,
                time: cueSet2[i].time,
                midi: cueSet2[i].midi,
              };
              p.song.addCue(cueSet2[i].time, p.executeCueSet2, vars);
            }
        };

        p.currentDonutGroupIndex = 0;

        p.donutsArray = [];

        p.executeCueSet1 = (vars) => {
            const currentCue = vars.currentCue;
            if (!p.cueSet1Completed.includes(currentCue)) {
                p.cueSet1Completed.push(currentCue);
                //const currentDonutGroup = p.donutGroupsArray[p.currentDonutGroupIndex];
                //const framesToAdd = currentDonutGroup.frames.length / 8;
                //p.donutsArray = p.donutsArray.concat(currentDonutGroup.frames.slice(modulo * framesToAdd, (modulo * framesToAdd) + framesToAdd ));
                console.log(vars);
                // for (let i = 0; i < triangles.length; i++) {
                //     setTimeout(
                //         function () {
                //             p.drawTriangleGroup(triangles[i])
                //         },
                //         (delayAmount * i)
                //     );
                // }
            }
        };

        p.executeCueSet2 = (vars) => {
            const currentCue = vars.currentCue;
            if (!p.cueSet2Completed.includes(currentCue)) {
                p.cueSet2Completed.push(currentCue);
                const modulo = (currentCue - 1) % 8;
                if(modulo === 0 && currentCue > 1){
                    p.currentDonutGroupIndex++;
                    p.donutsArray = [];
                }
                const currentDonutGroup = p.donutGroupsArray[p.currentDonutGroupIndex];
                const framesToAdd = currentDonutGroup.frames.length / 8;
                p.donutsArray = p.donutsArray.concat(currentDonutGroup.frames.slice(modulo * framesToAdd, (modulo * framesToAdd) + framesToAdd ));
                console.log();
                // for (let i = 0; i < triangles.length; i++) {
                //     setTimeout(
                //         function () {
                //             p.drawTriangleGroup(triangles[i])
                //         },
                //         (delayAmount * i)
                //     );
                // }
            }
        };

        p.draw = () => {
            p.background(0);
            if (p.song._lastPos > 0 && p.currentDonutGroupIndex >= 0){
                if (p.currentDonutGroupIndex > 23){
                    p.currentDonutGroupIndex = 23;
                    p.canvas.removeClass('fade-in');
                }
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
            while (i < 24) {
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
                let shapeSize = p.random(10, 80);
                
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
                console.log(p.donutGroupsArray[0]);
            } else {
                p.canvas.addClass('fade-in');
                p.song.play();
            }
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
