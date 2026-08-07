import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { VictoryModal } from './components/VictoryModal';
import { TouchControls } from './components/TouchControls';
import type {
  AIDifficulty,
  BallState,
  GameMode,
  MatchStats,
  PaddleState,
  Particle,
  PeerMessage,
  PlayerProfile,
  PowerUpItem,
  PowerUpType,
} from './types/game';
import { soundFx } from './utils/audio';
import { getStoredUser, PRESET_AVATARS } from './utils/playerProfile';
import { updateAIPaddleY } from './utils/ai';
import { multiplayerManager } from './utils/multiplayer';
import { Play, RotateCcw, Bot, Zap, Sparkles } from 'lucide-react';

const FIELD_WIDTH = 960;
const FIELD_HEIGHT = 560;
const PADDLE_WIDTH = 18;
const BASE_PADDLE_HEIGHT = 120;
const BALL_RADIUS = 10;
const WIN_SCORE = 5;
const BASE_PADDLE_SPEED = 8.5;
const INITIAL_BALL_SPEED = 6.8;
const HIT_SPEED_BOOST = 0.6;
const MAX_BALL_SPEED = 16.0;
const MAX_BOUNCE_ANGLE = Math.PI / 3;

const POWERUP_TYPES: PowerUpType[] = ['fireball', 'speed', 'freeze', 'shield', 'mega'];

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

const freshBall = (direction: number = 1): BallState => ({
  x: FIELD_WIDTH / 2,
  y: FIELD_HEIGHT / 2,
  vx: INITIAL_BALL_SPEED * direction,
  vy: (Math.random() * 4 - 2) || 1.5,
  radius: BALL_RADIUS,
  speed: INITIAL_BALL_SPEED,
  isFireball: false,
});

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pausedRef = useRef(true);
  const winnerRef = useRef<string | null>(null);
  const activePointersRef = useRef<Record<number, 'left' | 'right'>>({});

  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(getStoredUser());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Avatars
  const [leftAvatar, setLeftAvatar] = useState<string>(
    currentUser ? currentUser.avatar : PRESET_AVATARS[0].url
  );
  const [rightAvatar, setRightAvatar] = useState<string>(PRESET_AVATARS[1].url);
  const [leftName, setLeftName] = useState<string>(
    currentUser ? currentUser.name : 'Pemain Kiri'
  );
  const [rightName, setRightName] = useState<string>('Pemain Kanan');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);
  const [selectedCharacterTarget, setSelectedCharacterTarget] = useState<'left' | 'right'>('left');

  // Multiplayer online state
  const [onlineStatusText, setOnlineStatusText] = useState('');
  const [isOnlineConnected, setIsOnlineConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  // Physics refs
  const ballRef = useRef<BallState>(freshBall(1));
  const leftRef = useRef<PaddleState>({
    y: FIELD_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2,
    score: 0,
    height: BASE_PADDLE_HEIGHT,
    speed: BASE_PADDLE_SPEED,
  });
  const rightRef = useRef<PaddleState>({
    y: FIELD_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2,
    score: 0,
    height: BASE_PADDLE_HEIGHT,
    speed: BASE_PADDLE_SPEED,
  });

  // Powerups & FX state
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastPowerUpSpawnRef = useRef<number>(Date.now());
  const cameraShakeRef = useRef<number>(0);

  // Match statistics
  const [stats, setStats] = useState<MatchStats>({
    totalRallies: 0,
    maxBallSpeed: INITIAL_BALL_SPEED,
    powerupsCollected: 0,
    leftHitCount: 0,
    rightHitCount: 0,
  });

  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [matchWinnerAvatar, setMatchWinnerAvatar] = useState<string>('');
  const [isPaused, setIsPaused] = useState(true);

  // Touch control state
  const touchDirectionsRef = useRef<{
    left?: 'up' | 'down';
    right?: 'up' | 'down';
  }>({});

  // Image elements cache
  const leftImgElemRef = useRef<HTMLImageElement | null>(null);
  const rightImgElemRef = useRef<HTMLImageElement | null>(null);

  // Keep soundFx updated
  useEffect(() => {
    soundFx.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  // Sync user profile changes to left player
  useEffect(() => {
    if (currentUser) {
      setLeftAvatar(currentUser.avatar);
      setLeftName(currentUser.name);
    }
  }, [currentUser]);

  // Auto detect room URL param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setGameMode('online');
      setRoomCode(roomParam);
      setIsLobbyModalOpen(true);
      handleJoinOnlineRoom(roomParam);
    }
  }, []);

  // Update image elements whenever avatars change
  useEffect(() => {
    const imgL = new Image();
    imgL.crossOrigin = 'anonymous';
    imgL.src = leftAvatar;
    leftImgElemRef.current = imgL;

    const imgR = new Image();
    imgR.crossOrigin = 'anonymous';
    imgR.src = rightAvatar;
    rightImgElemRef.current = imgR;
  }, [leftAvatar, rightAvatar]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    winnerRef.current = matchWinner;
  }, [matchWinner]);

  const triggerCameraShake = (intensity: number = 8) => {
    cameraShakeRef.current = intensity;
  };

  const spawnParticles = (x: number, y: number, color: string, count: number = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  const spawnRandomPowerUp = () => {
    if (powerUpsRef.current.length >= 2) return;
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    const x = FIELD_WIDTH / 2 + (Math.random() * 280 - 140);
    const y = 80 + Math.random() * (FIELD_HEIGHT - 160);

    powerUpsRef.current.push({
      id: `pw-${Date.now()}`,
      x,
      y,
      radius: 16,
      type,
      duration: 8000,
    });
  };

  const resetRound = (direction: number = 1) => {
    ballRef.current = freshBall(direction);
    powerUpsRef.current = [];
    leftRef.current.height = BASE_PADDLE_HEIGHT;
    leftRef.current.speed = BASE_PADDLE_SPEED;
    leftRef.current.isFrozen = false;

    rightRef.current.height = BASE_PADDLE_HEIGHT;
    rightRef.current.speed = BASE_PADDLE_SPEED;
    rightRef.current.isFrozen = false;

    setIsPaused(true);
  };

  const resetMatch = () => {
    leftRef.current = {
      y: FIELD_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2,
      score: 0,
      height: BASE_PADDLE_HEIGHT,
      speed: BASE_PADDLE_SPEED,
    };
    rightRef.current = {
      y: FIELD_HEIGHT / 2 - BASE_PADDLE_HEIGHT / 2,
      score: 0,
      height: BASE_PADDLE_HEIGHT,
      speed: BASE_PADDLE_SPEED,
    };
    particlesRef.current = [];
    powerUpsRef.current = [];
    setScores({ left: 0, right: 0 });
    setMatchWinner(null);
    setStats({
      totalRallies: 0,
      maxBallSpeed: INITIAL_BALL_SPEED,
      powerupsCollected: 0,
      leftHitCount: 0,
      rightHitCount: 0,
    });
    resetRound(Math.random() > 0.5 ? 1 : -1);
  };

  const serveBall = () => {
    if (winnerRef.current) {
      resetMatch();
      return;
    }

    if (pausedRef.current) {
      const direction = ballRef.current.vx >= 0 ? 1 : -1;
      ballRef.current.vx = INITIAL_BALL_SPEED * direction;
      ballRef.current.vy = (Math.random() * 4 - 2) || 1.2;
      setIsPaused(false);
      soundFx.playHit();
      return;
    }

    setIsPaused(true);
  };

  // Online Multiplayer handlers
  const handleHostOnlineRoom = (code: string) => {
    multiplayerManager.initHost(
      code,
      (status, connected) => {
        setOnlineStatusText(status);
        setIsOnlineConnected(connected);
      },
      (msg) => handlePeerMessage(msg)
    );
    setRoomCode(multiplayerManager.roomCode);
  };

  const handleJoinOnlineRoom = (code: string) => {
    multiplayerManager.joinRoom(
      code,
      (status, connected) => {
        setOnlineStatusText(status);
        setIsOnlineConnected(connected);
      },
      (msg) => handlePeerMessage(msg)
    );
    setRoomCode(code);
  };

  const handlePeerMessage = (msg: PeerMessage) => {
    if (msg.type === 'PADDLE_MOVE') {
      if (multiplayerManager.isHost) {
        rightRef.current.y = msg.payload.y;
      } else {
        leftRef.current.y = msg.payload.y;
      }
    } else if (msg.type === 'STATE_UPDATE' && !multiplayerManager.isHost) {
      // Guest syncs state from Host
      ballRef.current = msg.payload.ball;
      leftRef.current = msg.payload.left;
      rightRef.current = msg.payload.right;
      setScores(msg.payload.scores);
      powerUpsRef.current = msg.payload.powerups || [];
      if (msg.payload.matchWinner) {
        setMatchWinner(msg.payload.matchWinner);
        setMatchWinnerAvatar(msg.payload.matchWinnerAvatar);
      }
      setIsPaused(msg.payload.isPaused);
    }
  };

  // Pointer controls
  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const scaleX = FIELD_WIDTH / rect.width;
    const scaleY = FIELD_HEIGHT / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const movePaddleTo = (side: 'left' | 'right', y: number) => {
    const targetPaddle = side === 'left' ? leftRef.current : rightRef.current;
    const nextY = clamp(
      y - targetPaddle.height / 2,
      24,
      FIELD_HEIGHT - 24 - targetPaddle.height
    );

    if (side === 'left') {
      leftRef.current.y = nextY;
    } else {
      rightRef.current.y = nextY;
    }

    if (gameMode === 'online') {
      const isMySide =
        (multiplayerManager.isHost && side === 'left') ||
        (!multiplayerManager.isHost && side === 'right');
      if (isMySide) {
        multiplayerManager.sendMessage({
          type: 'PADDLE_MOVE',
          payload: { y: nextY },
        });
      }
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    const side = point.x < FIELD_WIDTH / 2 ? 'left' : 'right';
    activePointersRef.current[event.pointerId] = side;
    movePaddleTo(side, point.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const side = activePointersRef.current[event.pointerId];
    if (!side) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    movePaddleTo(side, point.y);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    delete activePointersRef.current[event.pointerId];
  };

  // Keyboard controls listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        serveBall();
      }

      if (e.key.toLowerCase() === 'r') {
        resetMatch();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Canvas & Game Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth ?? FIELD_WIDTH;
      const scale = Math.min(1, parentWidth / FIELD_WIDTH);
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = FIELD_WIDTH * pixelRatio;
      canvas.height = FIELD_HEIGHT * pixelRatio;
      canvas.style.width = `${FIELD_WIDTH * scale}px`;
      canvas.style.height = `${FIELD_HEIGHT * scale}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawArena = () => {
      context.save();

      // Camera Shake translate
      if (cameraShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShakeRef.current;
        const shakeY = (Math.random() - 0.5) * cameraShakeRef.current;
        context.translate(shakeX, shakeY);
        cameraShakeRef.current *= 0.88;
        if (cameraShakeRef.current < 0.1) cameraShakeRef.current = 0;
      }

      context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

      // Cyber Court Background
      const bgGrad = context.createLinearGradient(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
      bgGrad.addColorStop(0, '#060d19');
      bgGrad.addColorStop(0.5, '#0c1a2e');
      bgGrad.addColorStop(1, '#081222');
      context.fillStyle = bgGrad;
      context.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

      // Cyber Grid Lines
      context.strokeStyle = 'rgba(123, 227, 255, 0.04)';
      context.lineWidth = 1;
      for (let x = 0; x < FIELD_WIDTH; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, FIELD_HEIGHT);
        context.stroke();
      }

      // Court Borders & Glow Line
      context.strokeStyle = 'rgba(123, 227, 255, 0.3)';
      context.lineWidth = 4;
      context.strokeRect(20, 20, FIELD_WIDTH - 40, FIELD_HEIGHT - 40);

      // Center Net Line
      context.setLineDash([14, 12]);
      context.beginPath();
      context.moveTo(FIELD_WIDTH / 2, 24);
      context.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT - 24);
      context.strokeStyle = 'rgba(246, 211, 101, 0.4)';
      context.stroke();
      context.setLineDash([]);

      const left = leftRef.current;
      const right = rightRef.current;
      const ball = ballRef.current;

      // Draw Power-ups
      powerUpsRef.current.forEach((pw) => {
        context.save();
        context.beginPath();
        context.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);

        let pwColor = '#f6d365';
        let pwIcon = '⚡';
        if (pw.type === 'fireball') { pwColor = '#ff5533'; pwIcon = '🔥'; }
        if (pw.type === 'freeze') { pwColor = '#33ccff'; pwIcon = '❄️'; }
        if (pw.type === 'shield') { pwColor = '#33ff99'; pwIcon = '🛡️'; }
        if (pw.type === 'mega') { pwColor = '#ff33cc'; pwIcon = '🏓'; }

        context.fillStyle = pwColor;
        context.shadowColor = pwColor;
        context.shadowBlur = 15;
        context.fill();

        context.fillStyle = '#ffffff';
        context.font = '14px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(pwIcon, pw.x, pw.y);
        context.restore();
      });

      // Draw Shields if active
      if (left.shieldActive) {
        context.strokeStyle = '#33ff99';
        context.lineWidth = 6;
        context.beginPath();
        context.moveTo(10, 20);
        context.lineTo(10, FIELD_HEIGHT - 20);
        context.stroke();
      }
      if (right.shieldActive) {
        context.strokeStyle = '#33ff99';
        context.lineWidth = 6;
        context.beginPath();
        context.moveTo(FIELD_WIDTH - 10, 20);
        context.lineTo(FIELD_WIDTH - 10, FIELD_HEIGHT - 20);
        context.stroke();
      }

      // Draw Paddle Avatar Function
      const drawPaddleAvatar = (
        img: HTMLImageElement | null,
        x: number,
        paddle: PaddleState,
        isLeft: boolean
      ) => {
        const cx = x + PADDLE_WIDTH / 2;
        const cy = paddle.y + paddle.height / 2;
        const targetHeight = paddle.height;
        const targetWidth = PADDLE_WIDTH + 14;

        context.save();

        // Frozen paddle aura
        if (paddle.isFrozen) {
          context.shadowColor = '#33ccff';
          context.shadowBlur = 20;
        }

        context.beginPath();
        context.roundRect(
          cx - targetWidth / 2,
          cy - targetHeight / 2,
          targetWidth,
          targetHeight,
          10
        );
        context.fillStyle = 'rgba(255, 255, 255, 0.12)';
        context.fill();

        if (img && img.complete && img.naturalWidth > 0) {
          context.clip();
          context.drawImage(
            img,
            cx - targetWidth / 2,
            cy - targetHeight / 2,
            targetWidth,
            targetHeight
          );
        }

        context.restore();

        // Neon paddle border
        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = isLeft ? '#7be3ff' : '#f6d365';
        context.roundRect(
          cx - targetWidth / 2,
          cy - targetHeight / 2,
          targetWidth,
          targetHeight,
          10
        );
        context.stroke();
      };

      drawPaddleAvatar(leftImgElemRef.current, 40, left, true);
      drawPaddleAvatar(
        rightImgElemRef.current,
        FIELD_WIDTH - 40 - PADDLE_WIDTH,
        right,
        false
      );

      // Draw Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }

        context.save();
        context.globalAlpha = p.alpha;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      // Draw Ball
      context.save();
      if (ball.isFireball) {
        context.shadowColor = '#ff5533';
        context.shadowBlur = 25;
        context.fillStyle = '#ff7733';

        // Fire trail
        spawnParticles(ball.x, ball.y, '#ff4400', 1);
      } else {
        context.shadowColor = '#7be3ff';
        context.shadowBlur = 12;
        context.fillStyle = '#ffffff';
      }

      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.fill();
      context.restore();

      if (winnerRef.current) {
        context.fillStyle = 'rgba(6, 10, 18, 0.65)';
        context.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
      }

      context.restore();
    };

    const step = (timestamp: number) => {
      const lastTime = lastTimeRef.current || timestamp;
      const delta = Math.min(2, (timestamp - lastTime) / 16.6667);
      lastTimeRef.current = timestamp;

      const left = leftRef.current;
      const right = rightRef.current;
      const ball = ballRef.current;
      const keys = keysRef.current;

      // Handle Paddle Movements
      if (!winnerRef.current) {
        // Touch controls
        if (touchDirectionsRef.current.left === 'up') left.y -= left.speed * delta;
        if (touchDirectionsRef.current.left === 'down') left.y += left.speed * delta;
        if (touchDirectionsRef.current.right === 'up') right.y -= right.speed * delta;
        if (touchDirectionsRef.current.right === 'down') right.y += right.speed * delta;

        // Keyboard left player
        if (!left.isFrozen) {
          if (keys['w']) left.y -= left.speed * delta;
          if (keys['s']) left.y += left.speed * delta;
        }

        // Right Player logic according to GameMode
        if (gameMode === 'vs-ai' && !pausedRef.current) {
          right.y = updateAIPaddleY(
            right.y,
            ball,
            right.height,
            aiDifficulty,
            delta
          );
        } else if (gameMode === 'local' && !right.isFrozen) {
          if (keys['arrowup']) right.y -= right.speed * delta;
          if (keys['arrowdown']) right.y += right.speed * delta;
        }
      }

      left.y = clamp(left.y, 24, FIELD_HEIGHT - 24 - left.height);
      right.y = clamp(right.y, 24, FIELD_HEIGHT - 24 - right.height);

      // Physics & Game loop (Only Host or Local drives physics)
      const isPhysicsHost = gameMode !== 'online' || multiplayerManager.isHost;

      if (isPhysicsHost && !pausedRef.current && !winnerRef.current) {
        // Spawn Powerups periodically
        if (Date.now() - lastPowerUpSpawnRef.current > 12000) {
          spawnRandomPowerUp();
          lastPowerUpSpawnRef.current = Date.now();
        }

        ball.x += ball.vx * delta;
        ball.y += ball.vy * delta;

        // Wall Bounce
        if (
          ball.y - ball.radius <= 24 ||
          ball.y + ball.radius >= FIELD_HEIGHT - 24
        ) {
          ball.vy *= -1;
          ball.y = clamp(
            ball.y,
            24 + ball.radius,
            FIELD_HEIGHT - 24 - ball.radius
          );
          soundFx.playWall();
          spawnParticles(
            ball.x,
            ball.y <= 24 ? 24 : FIELD_HEIGHT - 24,
            '#7be3ff',
            6
          );
        }

        // Power-up Collision Check
        powerUpsRef.current.forEach((pw, idx) => {
          const dist = Math.hypot(ball.x - pw.x, ball.y - pw.y);
          if (dist <= ball.radius + pw.radius) {
            soundFx.playPowerup();
            spawnParticles(pw.x, pw.y, '#f6d365', 18);

            const lastHitterSide = ball.vx > 0 ? left : right;
            const opponentSide = ball.vx > 0 ? right : left;

            if (pw.type === 'fireball') {
              ball.isFireball = true;
              ball.vx *= 1.35;
              triggerCameraShake(10);
            } else if (pw.type === 'speed') {
              lastHitterSide.speed = BASE_PADDLE_SPEED * 1.6;
            } else if (pw.type === 'freeze') {
              opponentSide.isFrozen = true;
              setTimeout(() => { opponentSide.isFrozen = false; }, 2500);
            } else if (pw.type === 'shield') {
              lastHitterSide.shieldActive = true;
            } else if (pw.type === 'mega') {
              lastHitterSide.height = BASE_PADDLE_HEIGHT * 1.6;
            }

            powerUpsRef.current.splice(idx, 1);
            setStats((s) => ({ ...s, powerupsCollected: s.powerupsCollected + 1 }));
          }
        });

        // Paddle Collision
        const leftPaddleX = 40 + PADDLE_WIDTH;
        const rightPaddleX = FIELD_WIDTH - 40 - PADDLE_WIDTH;

        const leftHit =
          ball.x - ball.radius <= leftPaddleX &&
          ball.x - ball.radius >= leftPaddleX - 18 &&
          ball.y >= left.y &&
          ball.y <= left.y + left.height;

        const rightHit =
          ball.x + ball.radius >= rightPaddleX &&
          ball.x + ball.radius <= rightPaddleX + 18 &&
          ball.y >= right.y &&
          ball.y <= right.y + right.height;

        if (leftHit && ball.vx < 0) {
          const impact = (ball.y - (left.y + left.height / 2)) / (left.height / 2);
          const angle = impact * MAX_BOUNCE_ANGLE;
          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          const newSpeed = Math.min(MAX_BALL_SPEED, currentSpeed + HIT_SPEED_BOOST);

          ball.vx = Math.cos(angle) * newSpeed;
          ball.vy = Math.sin(angle) * newSpeed;
          ball.x = leftPaddleX + ball.radius + 2;

          soundFx.playHit(ball.isFireball);
          spawnParticles(ball.x, ball.y, '#7be3ff', 10);
          triggerCameraShake(ball.isFireball ? 9 : 4);

          setStats((s) => ({
            ...s,
            leftHitCount: s.leftHitCount + 1,
            maxBallSpeed: Math.max(s.maxBallSpeed, newSpeed),
          }));
        }

        if (rightHit && ball.vx > 0) {
          const impact = (ball.y - (right.y + right.height / 2)) / (right.height / 2);
          const angle = impact * MAX_BOUNCE_ANGLE;
          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          const newSpeed = Math.min(MAX_BALL_SPEED, currentSpeed + HIT_SPEED_BOOST);

          ball.vx = -Math.cos(angle) * newSpeed;
          ball.vy = Math.sin(angle) * newSpeed;
          ball.x = rightPaddleX - ball.radius - 2;

          soundFx.playHit(ball.isFireball);
          spawnParticles(ball.x, ball.y, '#f6d365', 10);
          triggerCameraShake(ball.isFireball ? 9 : 4);

          setStats((s) => ({
            ...s,
            rightHitCount: s.rightHitCount + 1,
            maxBallSpeed: Math.max(s.maxBallSpeed, newSpeed),
          }));
        }

        // Shield hit or Goal check
        if (ball.x < -20) {
          if (left.shieldActive) {
            left.shieldActive = false;
            ball.vx *= -1;
            ball.x = 20;
            soundFx.playWall();
            spawnParticles(20, ball.y, '#33ff99', 15);
          } else {
            right.score += 1;
            setScores({ left: left.score, right: right.score });
            soundFx.playScore();
            triggerCameraShake(14);
            spawnParticles(ball.x, ball.y, '#f6d365', 30);

            if (right.score >= WIN_SCORE) {
              setMatchWinner(rightName);
              setMatchWinnerAvatar(rightAvatar);
              soundFx.playWin();
            }
            resetRound(-1);
          }
        }

        if (ball.x > FIELD_WIDTH + 20) {
          if (right.shieldActive) {
            right.shieldActive = false;
            ball.vx *= -1;
            ball.x = FIELD_WIDTH - 20;
            soundFx.playWall();
            spawnParticles(FIELD_WIDTH - 20, ball.y, '#33ff99', 15);
          } else {
            left.score += 1;
            setScores({ left: left.score, right: right.score });
            soundFx.playScore();
            triggerCameraShake(14);
            spawnParticles(ball.x, ball.y, '#7be3ff', 30);

            if (left.score >= WIN_SCORE) {
              setMatchWinner(leftName);
              setMatchWinnerAvatar(leftAvatar);
              soundFx.playWin();
            }
            resetRound(1);
          }
        }

        // Host sends online state update to Client
        if (gameMode === 'online' && multiplayerManager.isHost && multiplayerManager.isConnected) {
          multiplayerManager.sendMessage({
            type: 'STATE_UPDATE',
            payload: {
              ball: ballRef.current,
              left: leftRef.current,
              right: rightRef.current,
              scores: { left: left.score, right: right.score },
              powerups: powerUpsRef.current,
              matchWinner: winnerRef.current ? (left.score >= WIN_SCORE ? leftName : rightName) : null,
              matchWinnerAvatar: winnerRef.current ? (left.score >= WIN_SCORE ? leftAvatar : rightAvatar) : '',
              isPaused: pausedRef.current,
            },
          });
        }
      }

      drawArena();
      requestRef.current = window.requestAnimationFrame(step);
    };

    resizeCanvas();
    drawArena();
    requestRef.current = window.requestAnimationFrame(step);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameMode, aiDifficulty, leftName, rightName, leftAvatar, rightAvatar]);

  return (
    <main className="app-shell">
      {/* Top Navigation */}
      <Navbar
        mode={gameMode}
        onSelectMode={(m) => {
          setGameMode(m);
          if (m === 'online') {
            setIsLobbyModalOpen(true);
          }
        }}
        user={currentUser}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenCharacterModal={() => {
          setSelectedCharacterTarget('left');
          setIsCharacterModalOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Scoreboard Header */}
      <section className="hero-card">
        <div className="hero-copy">
          <div className="game-mode-banner">
            {gameMode === 'vs-ai' && (
              <span className="mode-badge ai">
                <Bot size={14} /> Mode Vs AI ({aiDifficulty.toUpperCase()})
              </span>
            )}
            {gameMode === 'local' && (
              <span className="mode-badge local">👥 Local 2 Player</span>
            )}
            {gameMode === 'online' && (
              <span className="mode-badge online">
                🌐 Online Live {isOnlineConnected ? '(Terhubung)' : '(Menunggu)'}
              </span>
            )}
          </div>

          <p className="intro">
            {gameMode === 'vs-ai'
              ? 'Lawan AI Bot canggih! Gunakan W / S untuk menggerakkan raket.'
              : gameMode === 'local'
              ? 'Pemain Kiri: W / S. Pemain Kanan: Up / Down. Raih 5 poin duluan untuk Menang!'
              : 'Main online P2P real-time! Bagikan link room ke lawanmu.'}
          </p>
        </div>

        {/* Scoreboard Cards */}
        <div className="scoreboard">
          <div className="score-card left-card">
            <div className="player-info">
              <div
                className="avatar-wrapper clickable"
                onClick={() => {
                  setSelectedCharacterTarget('left');
                  setIsCharacterModalOpen(true);
                }}
                title="Ganti Karakter Kiri"
              >
                <img src={leftAvatar} alt={leftName} className="player-avatar" />
                <span className="edit-badge">✏️</span>
              </div>
              <div className="player-meta">
                <span className="player-name">{leftName}</span>
              </div>
            </div>
            <strong className="score-num">{scores.left}</strong>
          </div>

          <div className="score-divider">VS</div>

          <div className="score-card right-card">
            <div className="player-info">
              <div
                className="avatar-wrapper clickable"
                onClick={() => {
                  setSelectedCharacterTarget('right');
                  setIsCharacterModalOpen(true);
                }}
                title="Ganti Karakter Kanan"
              >
                <img src={rightAvatar} alt={rightName} className="player-avatar" />
                <span className="edit-badge">✏️</span>
              </div>
              <div className="player-meta">
                <span className="player-name">{rightName}</span>
                {gameMode === 'vs-ai' && <span className="ai-tag">Bot AI</span>}
              </div>
            </div>
            <strong className="score-num">{scores.right}</strong>
          </div>
        </div>

        {/* AI Selector if vs-ai mode */}
        {gameMode === 'vs-ai' && (
          <div className="ai-difficulty-bar">
            <span>Tingkat Kesulitan AI:</span>
            <button
              className={`diff-btn ${aiDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setAIDifficulty('easy')}
            >
              Mudah
            </button>
            <button
              className={`diff-btn ${aiDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setAIDifficulty('medium')}
            >
              Sedang
            </button>
            <button
              className={`diff-btn ${aiDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setAIDifficulty('hard')}
            >
              🔥 Cyber Ace
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="controls">
          <button type="button" className="primary-btn glow-btn" onClick={serveBall}>
            {matchWinner ? (
              <>
                <RotateCcw size={18} /> Main Lagi
              </>
            ) : isPaused ? (
              <>
                <Play size={18} /> Serve / Start (Space)
              </>
            ) : (
              'Pause'
            )}
          </button>
          <button type="button" className="secondary-btn" onClick={resetMatch}>
            Reset Skor
          </button>
        </div>
      </section>

      {/* Main Field Arena */}
      <section className="arena-wrap">
        <div className="arena-frame">
          <canvas
            ref={canvasRef}
            className="arena"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        {/* On-screen Touch Controls for mobile */}
        <TouchControls
          onMoveStart={(side, dir) => {
            touchDirectionsRef.current[side] = dir;
          }}
          onMoveEnd={(side) => {
            touchDirectionsRef.current[side] = undefined;
          }}
          showLeft={gameMode !== 'online' || multiplayerManager.isHost}
          showRight={gameMode === 'local' || (gameMode === 'online' && !multiplayerManager.isHost)}
        />
      </section>

      {/* Powerups Legend / Instructions */}
      <section className="guide-grid">
        <div className="guide-card">
          <h2><Zap size={18} className="icon-yellow" /> Power-Ups Unik</h2>
          <p>
            Orb mystery muncul di lapangan: 🔥 Fireball, ⚡ Speed Boost, ❄️ Ice Freeze, 🛡️ Shield, 🏓 Mega Paddle!
          </p>
        </div>
        <div className="guide-card">
          <h2><Sparkles size={18} className="icon-blue" /> Profil Pemain Instant & Online</h2>
          <p>
            Buat nickname & pilih avatar secara instant tanpa perlu login/OAuth. Main online dengan teman cukup bagikan link Vercel!
          </p>
        </div>
      </section>

      {/* Modals */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileSave={(usr) => {
          setCurrentUser(usr);
          setLeftName(usr.name);
          setLeftAvatar(usr.avatar);
        }}
      />

      <CharacterSelectModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        selectedAvatar={selectedCharacterTarget === 'left' ? leftAvatar : rightAvatar}
        onSelectAvatar={(url, name) => {
          if (selectedCharacterTarget === 'left') {
            setLeftAvatar(url);
            if (!currentUser) setLeftName(name);
          } else {
            setRightAvatar(url);
            setRightName(name);
          }
          setIsCharacterModalOpen(false);
        }}
        currentUser={currentUser}
      />

      <OnlineLobbyModal
        isOpen={isLobbyModalOpen}
        onClose={() => setIsLobbyModalOpen(false)}
        user={currentUser}
        onHostRoom={handleHostOnlineRoom}
        onJoinRoom={handleJoinOnlineRoom}
        statusText={onlineStatusText}
        isConnected={isOnlineConnected}
        roomCode={roomCode}
      />

      {matchWinner && (
        <VictoryModal
          winnerName={matchWinner}
          winnerAvatar={matchWinnerAvatar}
          stats={stats}
          onRematch={resetMatch}
          onClose={() => setMatchWinner(null)}
        />
      )}
    </main>
  );
}

export default App;
