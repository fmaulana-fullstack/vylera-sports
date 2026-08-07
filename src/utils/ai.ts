import type { AIDifficulty, BallState } from '../types/game';

const FIELD_HEIGHT = 560;
const FIELD_WIDTH = 960;

export function updateAIPaddleY(
  currentY: number,
  ball: BallState,
  paddleHeight: number,
  difficulty: AIDifficulty,
  delta: number
): number {
  const paddleCenter = currentY + paddleHeight / 2;

  // Target Y calculation
  let targetY = FIELD_HEIGHT / 2;

  if (difficulty === 'easy') {
    // Only react when ball moves towards AI (right side)
    if (ball.vx > 0) {
      targetY = ball.y + (Math.sin(Date.now() / 200) * 35);
    } else {
      targetY = FIELD_HEIGHT / 2;
    }
    const speed = 4.5 * delta;
    const diff = targetY - paddleCenter;
    return currentY + Math.sign(diff) * Math.min(Math.abs(diff), speed);
  } else if (difficulty === 'medium') {
    if (ball.vx > 0) {
      targetY = ball.y + (Math.sin(Date.now() / 150) * 15);
    } else {
      targetY = FIELD_HEIGHT / 2;
    }
    const speed = 7.2 * delta;
    const diff = targetY - paddleCenter;
    return currentY + Math.sign(diff) * Math.min(Math.abs(diff), speed);
  } else {
    // Hard / Cyber Ace: Trajectory prediction with bounce calculation
    if (ball.vx > 0) {
      let tempX = ball.x;
      let tempY = ball.y;
      let tempVx = ball.vx;
      let tempVy = ball.vy;

      // Predict ball Y when reaching right paddle X (approx 880)
      const targetX = FIELD_WIDTH - 58;
      while (tempX < targetX) {
        tempX += tempVx;
        tempY += tempVy;
        if (tempY <= 24 || tempY >= FIELD_HEIGHT - 24) {
          tempVy *= -1;
        }
      }
      targetY = tempY;
    } else {
      targetY = FIELD_HEIGHT / 2;
    }

    const speed = 9.5 * delta;
    const diff = targetY - paddleCenter;
    return currentY + Math.sign(diff) * Math.min(Math.abs(diff), speed);
  }
}
