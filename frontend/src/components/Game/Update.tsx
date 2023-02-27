import { Ball, createBall } from "./Ball";
import { Player } from "./Player";

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

export default function Update(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  player1: Player,
  player2: Player
) {
  if (ball.stop === false) {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
  }
  // Enable disable AI
  player2.y = ball.y - player2.height / 2;
  if (player2.y < 0) player2.y = 2;
  else if (player2.y > canvas.height - player2.height)
    player2.y = canvas.height - player2.height - 2;
  if (ball.x >= canvas.width || ball.x <= 0) {
    if (ball.x <= 0) player2.score++;
    else player1.score++;
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
}
