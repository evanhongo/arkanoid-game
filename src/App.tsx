import React, { useRef, useState, useEffect } from 'react'
import useInterval from '@/util/useInterval';
import { useImmer } from "use-immer";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const PADDLE_WIDTH = 120;
const PADDLE_Y = 650;
const BALL_WIDTH = 20;
const BALL_HEIGHT = 20;
const BALL_DX = 10

export default function App() {
  const canvasRef = useRef(null);
  const [state, updateState] = useImmer({
    paddleX: 540,
    ball: { x: 590, y: 630 , dx: BALL_DX, dy: -5 }
  });
  
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const paddleImg: HTMLImageElement = document.querySelector('#paddle')
    paddleImg.onload = function () {
      ctx.drawImage(paddleImg, 540, PADDLE_Y, PADDLE_WIDTH, 30)
    }
    const ballImg: HTMLImageElement = document.querySelector('#ball')
    ballImg.onload = function () {
      ctx.drawImage(ballImg, 590, 630, BALL_WIDTH, BALL_HEIGHT)
    }
  }, [])

  // handle paddle
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          updateState((draft) => {draft.paddleX = draft.paddleX - 15 < 0 ? 0 : draft.paddleX - 15});
          break
        case 'ArrowRight':
          updateState((draft) => {draft.paddleX = draft.paddleX + 15 > 1080 ? 1080 : draft.paddleX + 15});
          break
        default:
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  //handle ball
  const [start, stop] = useInterval(() => { updateState((draft) => {
      const tmpX = draft.ball.x + draft.ball.dx;
      const tmpY = draft.ball.y + draft.ball.dy;
      draft.ball.x = 
        tmpX > CANVAS_WIDTH ? CANVAS_WIDTH - BALL_WIDTH : tmpX < 0 ? 0 :tmpX;
      draft.ball.y = (tmpX >= draft.paddleX && tmpX <= draft.paddleX + PADDLE_WIDTH && tmpY + BALL_HEIGHT >= PADDLE_Y) ? 
        PADDLE_Y - BALL_HEIGHT 
        :  tmpY < 0 ?
        0 :tmpY  
    }); 
  }, 30);

  useEffect(() => {
    start();
    return () => {
      stop();
    }
  }, []);

  //handle rebounding when ball hits the wall or paddel 
  useEffect(() => {
    updateState((draft)=>{
      // hit the paddel
      if(state.ball.y === PADDLE_Y - BALL_HEIGHT) {
        if(state.ball.x >= state.paddleX && state.ball.x <= state.paddleX + PADDLE_WIDTH / 2)
          draft.ball.dx =  -BALL_DX;
        else if(state.ball.x > state.paddleX + PADDLE_WIDTH / 2 && state.ball.x <= state.paddleX + PADDLE_WIDTH)
          draft.ball.dx =  BALL_DX;
      }
      // hit the wall
      else
        draft.ball.dx =      
          state.ball.x + BALL_WIDTH === CANVAS_WIDTH || 
          state.ball.x === 0  ? 
          -state.ball.dx : state.ball.dx;
          
      draft.ball.dy =    
        state.ball.y === 0 ||
        (state.ball.y === PADDLE_Y - BALL_HEIGHT && state.ball.x >= state.paddleX && state.ball.x <= state.paddleX + PADDLE_WIDTH)
        ? -state.ball.dy : state.ball.dy;      
    });    
  }, [state.ball.x, state.ball.y])

  useEffect(()=>{
    if(state.ball.y >= CANVAS_HEIGHT)
      stop();
  },[state.ball.y])

  //draw
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const paddleImg: HTMLImageElement = document.querySelector('#paddle');
    ctx.drawImage(paddleImg, state.paddleX, PADDLE_Y, PADDLE_WIDTH, 30);

    const ballImg: HTMLImageElement = document.querySelector('#ball');
    ctx.drawImage(ballImg, state.ball.x, state.ball.y, BALL_WIDTH, BALL_HEIGHT);
  }, [state.paddleX, state.ball.x, state.ball.y]);

  return (
    <>
      <img
        id="paddle"
        src="./asset/image/paddle.png"
        style={{ display: 'none' }}
      />
      <img 
        id="ball" 
        src="./asset/image/ball.png" 
        style={{ display: 'none' }} 
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block', margin: '0 auto', border: '3px solid gray' }}
      />
    </>
  )
}
