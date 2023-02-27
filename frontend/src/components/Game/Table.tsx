import { useCallback, useEffect } from "react";
import "./index.css";
import { Ball, createBall } from "./Ball";
import { Player } from "./Player";
import Prepare from "./Prepare";
import Update from "./Update";

function Table() {
  useEffect(() => {}, []);

  const ref = useCallback((node: HTMLCanvasElement) => {
    console.log("node", node);
    if (!node) return;
    const FPS = 60;
    const options: string[] = [
      // "https://images.unsplash.com/photo-1677145316529-a6e02cc8c504?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3570&q=80",
      "https://4kwallpapers.com/images/walls/thumbs_3t/4523.jpg",
      // "https://images.unsplash.com/photo-1595923941716-39a9c58a9661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3570&q=80",
      // "http://10.12.9.8:5173/backgrounds/3.png",
    ];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    const canvas = node;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let ball: Ball = createBall(canvas);
    let player1: Player = {
      width: canvas.width - (99 * canvas.width) / 100,
      height: canvas.height - (80 * canvas.height) / 100,
      x: 2,
      y: canvas.height - (60 * canvas.height) / 100,
      color: "WHITE",
      score: 0,
    };
    let player2: Player = {
      width: canvas.width - (99 * canvas.width) / 100,
      height: canvas.height - (80 * canvas.height) / 100,
      x: canvas.width - (1 * canvas.width) / 100 - 2,
      y: canvas.height - (60 * canvas.height) / 100,
      color: "WHITE",
      score: 0,
    };
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      let y = ((event.clientY - canvas.offsetTop) / canvas.offsetHeight) * 100;
      // console.log(y);
      y = (y * canvas.height) / 100;
      player1.y = y - player1.height / 2;
      if (player1.y < 0) player1.y = 2;
      else if (player1.y > canvas.height - player1.height)
        player1.y = canvas.height - player1.height - 2;
      //player2.y = player1.y;
    });
    setInterval(
      () => Prepare(canvas, ctx, ball, player1, player2, randomOption),
      1000 / FPS
    );
    setInterval(
      () => Update(canvas, ctx, ball, player1, player2),
      1000 / FPS / ball.speed
    );
  }, []);

  return (
    <center>
      <div className="game-container shadow-2xl ssd sds">
        <canvas ref={ref} id="pong" width="1280" height="720"></canvas>
      </div>
    </center>
  );
}

export default Table;
