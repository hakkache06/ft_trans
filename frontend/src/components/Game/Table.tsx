import { useCallback, useContext, useEffect, useState } from "react";
import "./index.css";
import { Ball, createBall } from "./Ball";
import { Player } from "./Player";
import Prepare from "./Prepare";
import { SocketContext } from "../../utils";
import { useAuth } from "../../stores";

const FPS = 30;

function throttle(cb: Function, delay = 1000) {
  let shouldWait = false;
  let waitingArgs: any[] | null = null;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}

function collision(ball: Ball, player: Player): boolean {
  const b_top = ball.y - ball.radius;
  const b_bottom = ball.y + ball.radius;
  const b_left = ball.x - ball.radius;
  const b_right = ball.x + ball.radius;

  const p_top = player.y;
  const p_bottom = player.y + player.height;
  const p_left = player.x;
  const p_right = player.x + player.width;

  return (
    b_right > p_left && b_bottom > p_top && b_left < p_right && b_top < p_bottom
  );
}

function Table({ game }: { game: Game }) {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const socket = useContext(SocketContext);
  const { id } = useAuth();

  useEffect(() => {
    if (!socket) return;
    socket.emit("game:join", game.id);
    return () => {
      socket.emit("game:leave", game.id);
    };
  }, [game]);

  const move = throttle((y: number) => {
    socket?.emit("game:move", { game: game.id, y });
  }, 1000 / FPS);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!ctx) return;
      let y =
        ((event.clientY - ctx.canvas.offsetTop) / ctx.canvas.offsetHeight) *
        100;
      y = (y * ctx.canvas.height) / 100;
      move(y);
    },
    [ctx]
  );

  useEffect(() => {
    if (!ctx || !socket) return;
    const canvas = ctx.canvas;
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
    if (game.player1.id === id || game.player2.id === id)
      canvas.addEventListener("mousemove", onMouseMove);
    socket.on("game:moved", (data: { y: number; player: string }) => {
      if (data.player === "player1") {
        player1.y = data.y - player1.height / 2;
        if (player1.y < 0) player1.y = 2;
        else if (player1.y > canvas.height - player1.height)
          player1.y = canvas.height - player1.height - 2;
      } else {
        player2.y = data.y - player2.height / 2;
        if (player2.y < 0) player2.y = 2;
        else if (player2.y > canvas.height - player2.height)
          player2.y = canvas.height - player2.height - 2;
      }
    });
    const render = setInterval(
      () => Prepare(canvas, ctx, ball, player1, player2, game.background),
      1000 / FPS
    );
    let update: ReturnType<typeof setInterval>;
    if (game.player1.id === id)
      update = setInterval(
        () => Update(canvas, ball, player1, player2),
        1000 / FPS / ball.speed
      );
    else {
      socket.on("game:ball", (data: { x: number; y: number }) => {
        ball.x = data.x;
        ball.y = data.y;
      });
      socket.on("game:score", (data: { player1: number; player2: number }) => {
        player1.score = data.player1;
        player2.score = data.player2;
      });
    }
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      socket.off("game:moved");
      socket.off("game:ball");
      socket.off("game:score");
      clearInterval(render);
      clearInterval(update);
    };
  }, [ctx]);

  function Update(
    canvas: HTMLCanvasElement,
    ball: Ball,
    player1: Player,
    player2: Player
  ) {
    if (ball.stop === false) {
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
    }
    if (ball.x >= canvas.width || ball.x <= 0) {
      if (ball.x <= 0) player2.score++;
      else player1.score++;
      socket?.emit("game:score", {
        game: game.id,
        player1: player1.score,
        player2: player2.score,
      });
      const temp: Ball = createBall(canvas);
      ball.x = temp.x;
      ball.y = temp.y;
      ball.speed = temp.x;
      ball.velocityX = temp.velocityX;
      ball.velocityY = temp.velocityY;
      ball.stop = true;
      setTimeout(() => {
        ball.stop = false;
      }, 2000);
    } else if (collision(ball, player1) || collision(ball, player2)) {
      ball.velocityX *= -1.05;
    }
    if (ball.y >= canvas.height || ball.y <= 0) ball.velocityY *= -1;
    if (ball.velocityX >= 20) ball.velocityX = 20;
    else if (ball.velocityX <= -20) ball.velocityX = -20;
    if (ball.velocityY >= 20) ball.velocityY = 20;
    else if (ball.velocityY <= -20) ball.velocityY = -20;
    socket?.emit("game:ball", { game: game.id, x: ball.x, y: ball.y });
  }

  const ref = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
    setCtx(ctx);
  }, []);

  return (
    <div className="game-container shadow-2xl mx-auto">
      <canvas ref={ref} id="pong" width="1920" height="1080"></canvas>
    </div>
  );
}

export default Table;
