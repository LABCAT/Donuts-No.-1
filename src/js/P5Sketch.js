import React, { useEffect } from "react";
import './globals';
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import audio from '../audio/donuts-no-1.mp3'


const P5Sketch = () => {

    const Sketch = p5 => {

        p5.canvasWidth = window.innerWidth;

        p5.canvasHeight = window.innerHeight;

        p5.canvas = null;
        
        p5.song = null;

        p5.tempo = 106;

        p5.hueRanges = {
            1: [-30, 30, 0],
            2: [31, 90, 60],
            3: [91, 150, 120],
            4: [151, 210, 180],
            5: [211, 270, 240],
            6: [271, 330, 300]
        }

        p5.rotationOptions = [3, 4, 6, 8, 12];

        p5.iterationOptions = [8, 16, 32, 64];

        p5.donutsArray = [];

        p5.setup = () => {
            p5.song = p5.loadSound(audio);
            p5.colorMode(p5.HSB);
            p5.loadDountsArray();
            p5.canvas = p5.createCanvas(p5.canvasWidth, p5.canvasHeight);
            p5.noFill();
            p5.strokeWeight(0.5);
            p5.frameRate(5);
        };

        p5.loadDountsArray = () => {
            let i = 0, translateX = p5.canvasWidth / 2, translateY = p5.canvasHeight / 2;
            while (i < 24) {
                let randomPointer1 = p5.floor(p5.random(1, 7));
                let randomPointer2 = randomPointer1 + 3;
                if (randomPointer2 > 6) {
                    randomPointer2 = randomPointer2 - 6;
                }
                let fromColour = p5.color(p5.random(p5.hueRanges[randomPointer1][0], p5.hueRanges[randomPointer1][1]), 100, 100);
                let toColour = p5.color(p5.random(p5.hueRanges[randomPointer2][0], p5.hueRanges[randomPointer2][1]), 100, 100);
                
                let frames = [];
                let x = 0;
                let width = p5.canvasWidth;
                let lerpAmount = 0;
                let colour = p5.lerpColor(fromColour, toColour, lerpAmount);
                let numOfRotations =  p5.random(p5.rotationOptions);
                let numOfIterations = p5.random(p5.iterationOptions);
                let shapeSize = p5.random(10, 80);
                
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
                                    'angle': (p5.PI / numOfRotations)
                                }
                            }
                        );
                    }
                    x = x + width / numOfIterations;
                    lerpAmount = lerpAmount + (1 / numOfIterations / 2);
                    colour = p5.lerpColor(fromColour, toColour, lerpAmount);
                }

                p5.donutsArray.push(
                    {
                        'x': translateX, 
                        'y': translateY,
                        'translate': {
                            'x': translateX,
                            'y': translateY
                         },
                        'frames': frames,
                        'numOfRotations': p5.random(p5.rotationOptions),
                        'numOfIterations': p5.random(p5.iterationOptions),
                        'shapeSize': p5.random(10, 80),
                        'fromColour': fromColour,
                        'toColour': toColour
                    }
                ); 
                i++;
                translateX = p5.random(0, p5.canvasWidth);
                translateY = p5.random(0, p5.canvasHeight);
            }
        }

        p5.draw = () => {
            p5.background(0);
            let currentDonutIndex = p5.getSongBar();
            if (p5.song._lastPos > 0 && currentDonutIndex >= 0){
                if (currentDonutIndex > 23){
                    currentDonutIndex = 23;
                    p5.canvas.removeClass('fade-in');
                }
                p5.drawDonuts(currentDonutIndex);
                let i = 0;
                while (i <= currentDonutIndex) {
                    i++;
                }
            }
        };

        p5.drawDonuts = (currentDonutIndex) => {
            const currentDonut = p5.donutsArray[currentDonutIndex];
            
            if (Object.keys(currentDonut.translate).length){
                p5['translate'](currentDonut.translate.x, currentDonut.translate.y);    
            }
            for (var i = 0; i < currentDonut.frames.length; i++) {
                let p5Action = currentDonut.frames[i];
                if (p5Action.hasOwnProperty('stroke')) {
                    p5['stroke'](p5Action.stroke.colour, p5Action.stroke.alpha);
                }

                if (currentDonut.frames[i].hasOwnProperty('ellipse')) {
                    p5['ellipse'](p5Action.ellipse.x, p5Action.ellipse.y, p5Action.ellipse.width, p5Action.ellipse.hegith);
                }

                if (currentDonut.frames[i].hasOwnProperty('rotate')) {
                    p5['rotate'](p5Action.rotate.angle);
                }

            }
        }

        p5.getSongBar = () => {
            if (p5.song.buffer){
                const beatsPerBar = 4
                const barAsBufferLength = (p5.song.buffer.sampleRate * 60 / p5.tempo) * beatsPerBar;
                return Math.floor(p5.song._lastPos / barAsBufferLength);
            }
            return -1;
        }

        p5.donutDelay = (index, x) => {
            setTimeout(
                function () {
                    
                }, 
                1000 * index
            ); 
        }

        p5.mousePressed = () => {
            if (p5.song.isPlaying()) {
                p5.song.pause();
                console.log(p5.donutsArray[0]);
            } else {
                p5.canvas.addClass('fade-in');
                p5.song.play();
            }
        };

        p5.updateCanvasDimensions = () => {
            p5.canvasWidth = window.innerWidth;
            p5.canvasHeight = window.innerHeight;
            p5.createCanvas(p5.canvasWidth, p5.canvasHeight);
            p5.redraw();
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p5.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p5.updateCanvasDimensions();
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
