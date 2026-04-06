/**
 * SpaceInvaders.jsx — Fully Playable Space Invaders (Light Mode Background)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE DOES
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements Space Invaders using the browser's HTML5 Canvas API.
 * No external packages or sprite assets — everything drawn with fillRect().
 *
 * REACT CONCEPTS USED
 * ─────────────────────────────────────────────────────────────────────────────
 * useRef  — stores values that persist across renders WITHOUT triggering
 *           re-renders. Critical for game state: if we used useState for the
 *           player's x position, React would try to re-render 60 times/second
 *           (once per animation frame), causing massive slowdown and flicker.
 *
 *           We use useRef for:
 *             canvasRef   — reference to the <canvas> DOM element
 *             stateRef    — ALL mutable game state (player, invaders, score…)
 *             rafRef      — the requestAnimationFrame ID so we can cancel it
 *
 * useEffect — runs side effects after the component mounts.
 *           The game loop starts here. The cleanup function (returned from
 *           useEffect) cancels the animation frame and removes event listeners
 *           when the component unmounts (e.g. user switches to dark mode).
 *
 * GAME LOOP PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * requestAnimationFrame(loop) asks the browser to call loop() before the next
 * screen repaint — typically 60 times per second. Inside loop():
 *   1. update() — advance game state (move player, bullets, check collisions)
 *   2. draw()   — render current state to canvas
 *   3. schedule the next frame with requestAnimationFrame(loop)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect } from 'react';

// ── Colour palette ─────────────────────────────────────────────────────────────
// These are literal hex values matching the light-mode CSS variables.
// Canvas context methods don't read CSS variables — we must use literals.
const C = {
    bg:        '#f8f4ef',    // --bg-primary (light):       warm cream
    player:    '#8b7355',    // --accent-primary (light):   warm brown
    invader:  ['#c4913d', '#8b7355', '#6b4c2a', '#a0845c'],  // rows 0–3, top→bottom
    bullet:    '#c4913d',    // amber
    invBullet: '#5a3e28',    // dark brown
    hud:       '#2d2a24',    // --text-primary (light)
    muted:     '#a0845c',    // --text-muted (light)
    overlay:   'rgba(248, 244, 239, 0.92)',
    dot:       'rgba(139, 115, 85, 0.08)',  // subtle background dot grid
};

// ── Pixel-art sprite bitmaps ───────────────────────────────────────────────────
// Each sprite is two animation frames, each frame is 8 rows of 8 pixels.
// Each row is stored as a number whose bits represent pixel on/off (1/0).
// Bit 7 = leftmost pixel, bit 0 = rightmost pixel.
//
// drawSprite() reads these bits and paints each lit pixel as a SCALE×SCALE rect,
// giving us clean pixel art that scales with no blurring.
const SPRITES = {
    // Top row: classic "squid" invader with antennae
    squid: [
        [0b00100100, 0b00011000, 0b00111100, 0b01101110,
         0b11111111, 0b10111101, 0b10000001, 0b01100110],
        [0b00100100, 0b00011000, 0b00111100, 0b01101110,
         0b11111111, 0b10111101, 0b01000010, 0b10100101],
    ],
    // Middle rows: classic "crab" invader with outstretched claws
    crab: [
        [0b00100100, 0b01000010, 0b11111111, 0b01101110,
         0b00111100, 0b00100100, 0b01000010, 0b10000001],
        [0b00100100, 0b10000001, 0b11111111, 0b01101110,
         0b00111100, 0b00100100, 0b01000010, 0b01000010],
    ],
    // Bottom row: classic "octopus" invader with wide body
    octopus: [
        [0b00011000, 0b00111100, 0b01111110, 0b11011011,
         0b11111111, 0b01111110, 0b00100100, 0b01000010],
        [0b00011000, 0b00111100, 0b01111110, 0b11011011,
         0b11111111, 0b01111110, 0b01000010, 0b00100100],
    ],
};

// Which sprite to use for each row (index = row number, 0 = topmost)
const ROW_SPRITE  = ['squid', 'crab', 'crab', 'octopus'];
// Points awarded per kill, top rows worth more (they're harder to reach)
const ROW_POINTS  = [30, 20, 20, 10];

// ── Layout & physics constants ────────────────────────────────────────────────
const SCALE         = 3;   // each sprite "pixel" = 3×3 canvas pixels → 24×24 sprites
const SPRITE_PX     = 8 * SCALE;    // 24px — width/height of one invader sprite
const INV_COLS      = 11;
const INV_ROWS      = 4;
const INV_GAP_X     = 14;   // horizontal gap between invader sprites
const INV_GAP_Y     = 12;   // vertical gap between rows
const GRID_TOP      = 90;   // y offset for the top row of invaders
const GRID_LEFT     = 80;   // x offset for the left edge of the invader grid
const PLAYER_W      = 48;
const PLAYER_H      = 20;
const PLAYER_SPEED  = 6;    // pixels per frame
const P_BULLET_SPD  = 10;   // player bullet moves up this many px/frame
const I_BULLET_SPD  = 4;    // invader bullet moves down this many px/frame
const BASE_INTERVAL = 55;   // starting frames-per-invader-step (lower = faster)
const STEP_PX       = 10;   // horizontal pixels per invader step
const DROP_PX       = 18;   // pixels invaders drop when they hit an edge
const SHOOT_INTERVAL = 90;  // avg frames between invader shots

// ── Draw a sprite frame ───────────────────────────────────────────────────────
// cx, cy = top-left corner of the sprite on the canvas
function drawSprite(ctx, type, frame, cx, cy, color) {
    const rows = SPRITES[type][frame % 2];
    ctx.fillStyle = color;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            // Check bit c of row r (bit 7 = leftmost)
            if (rows[r] & (1 << (7 - c))) {
                ctx.fillRect(cx + c * SCALE, cy + r * SCALE, SCALE, SCALE);
            }
        }
    }
}

// ── Build the starting invader grid ──────────────────────────────────────────
function buildInvaders() {
    const invaders = [];
    for (let row = 0; row < INV_ROWS; row++) {
        for (let col = 0; col < INV_COLS; col++) {
            invaders.push({
                row,
                col,
                x: GRID_LEFT + col * (SPRITE_PX + INV_GAP_X),
                y: GRID_TOP  + row * (SPRITE_PX + INV_GAP_Y),
                alive: true,
            });
        }
    }
    return invaders;
}

// ── Create a fresh game state ─────────────────────────────────────────────────
// Called once on mount and again when the player restarts after game over/win.
function initState(w, h) {
    return {
        // Player
        player: { x: w / 2 - PLAYER_W / 2, y: h - 60 },

        // Invader grid
        invaders:     buildInvaders(),
        dir:          1,     // 1 = moving right, -1 = moving left
        moveTimer:    0,     // counts frames until next invader step
        moveInterval: BASE_INTERVAL,
        animFrame:    0,     // 0 or 1, toggled each time invaders step

        // Bullets
        playerBullet: null,  // { x, y } or null — only one at a time
        invBullets:   [],    // array of { x, y }
        invShootTimer: 0,

        // Scoring / status
        score:  0,
        lives:  3,
        status: 'playing',  // 'playing' | 'over' | 'win'

        // Input state — set by keydown/keyup listeners
        keys:         {},    // e.g. { ArrowLeft: true, ' ': false }
        spaceWasDown: false, // edge-detect: prevent holding Space = rapid fire

        // Canvas dimensions (needed to re-init after resize)
        canvasW: w,
        canvasH: h,
    };
}

// ── React component ───────────────────────────────────────────────────────────
const SpaceInvadersGame = () => {
    const canvasRef = useRef(null);
    const stateRef  = useRef(null);  // game state — mutated in place, no re-renders
    const rafRef    = useRef(null);  // animation frame id, kept for cleanup

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');

        // ── Resize handler ─────────────────────────────────────────────────────
        // Keeps canvas pixels in sync with its CSS size.
        // ResizeObserver fires whenever the element's size changes.
        const fit = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            stateRef.current = initState(canvas.width, canvas.height);
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(canvas);

        // ── Keyboard listeners ─────────────────────────────────────────────────
        const onDown = (e) => {
            if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            stateRef.current.keys[e.key] = true;
        };
        const onUp = (e) => {
            stateRef.current.keys[e.key] = false;
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup',   onUp);

        // ── Game loop ──────────────────────────────────────────────────────────
        const loop = () => {
            update(stateRef.current);
            draw(ctx, stateRef.current);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // ── Cleanup (runs when component unmounts) ─────────────────────────────
        // Without this, the animation frame would keep running in the background
        // even after the user switches to dark mode (where this component unmounts).
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup',   onUp);
            ro.disconnect();
        };
    }, []); // [] = run once on mount, clean up on unmount

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
};

// ── UPDATE: advance the game by one frame ─────────────────────────────────────
function update(s) {
    // On game-over or win, only listen for Space to restart
    if (s.status !== 'playing') {
        if (s.keys[' '] && !s.spaceWasDown) {
            // Restart: replace state contents in place (keeps same object reference)
            Object.assign(s, initState(s.canvasW, s.canvasH));
        }
        s.spaceWasDown = !!s.keys[' '];
        return;
    }

    const { player, keys } = s;

    // ── Move player ───────────────────────────────────────────────────────────
    if (keys['ArrowLeft']  && player.x > 0)                       player.x -= PLAYER_SPEED;
    if (keys['ArrowRight'] && player.x < s.canvasW - PLAYER_W)    player.x += PLAYER_SPEED;

    // ── Fire (one bullet at a time, fires on Space press not hold) ────────────
    if (keys[' '] && !s.spaceWasDown && !s.playerBullet) {
        s.playerBullet = { x: player.x + PLAYER_W / 2 - 2, y: player.y };
    }
    s.spaceWasDown = !!keys[' '];  // remember for next frame (edge detection)

    // ── Move player bullet upward ─────────────────────────────────────────────
    if (s.playerBullet) {
        s.playerBullet.y -= P_BULLET_SPD;
        if (s.playerBullet.y < 0) s.playerBullet = null;  // off-screen
    }

    // ── Player bullet hits invader ────────────────────────────────────────────
    if (s.playerBullet) {
        const { x: bx, y: by } = s.playerBullet;
        for (const inv of s.invaders) {
            if (!inv.alive) continue;
            if (bx >= inv.x && bx <= inv.x + SPRITE_PX &&
                by >= inv.y && by <= inv.y + SPRITE_PX) {
                inv.alive = false;
                s.score += ROW_POINTS[inv.row];
                s.playerBullet = null;
                break;
            }
        }
    }

    // ── Win condition ─────────────────────────────────────────────────────────
    if (s.invaders.every(i => !i.alive)) { s.status = 'win'; return; }

    // ── Move invaders (step-based, not every frame) ───────────────────────────
    // As invaders die the grid speeds up: fewer alive → shorter moveInterval.
    const alive = s.invaders.filter(i => i.alive).length;
    const total = INV_ROWS * INV_COLS;
    // speedFactor goes from 0 (full grid) to ~0.6 (one invader left)
    const speedFactor = (1 - alive / total) * 0.6;
    s.moveInterval = Math.max(8, Math.round(BASE_INTERVAL * (1 - speedFactor)));

    s.moveTimer++;
    if (s.moveTimer >= s.moveInterval) {
        s.moveTimer = 0;
        s.animFrame ^= 1;  // toggle sprite animation frame (0 ↔ 1, using XOR)

        // Check if the next step would push any invader off-screen
        let hitEdge = false;
        for (const inv of s.invaders) {
            if (!inv.alive) continue;
            const nx = inv.x + STEP_PX * s.dir;
            if (nx < 8 || nx + SPRITE_PX > s.canvasW - 8) { hitEdge = true; break; }
        }

        if (hitEdge) {
            s.dir *= -1;  // reverse direction
            for (const inv of s.invaders) {
                if (!inv.alive) continue;
                inv.y += DROP_PX;
                // If invaders reach the player row — game over
                if (inv.y + SPRITE_PX >= player.y) { s.status = 'over'; return; }
            }
        } else {
            for (const inv of s.invaders) {
                if (inv.alive) inv.x += STEP_PX * s.dir;
            }
        }
    }

    // ── Invader shooting ──────────────────────────────────────────────────────
    // Each trigger: a random front-line invader fires downward.
    s.invShootTimer++;
    if (s.invShootTimer >= SHOOT_INTERVAL + Math.random() * 60) {
        s.invShootTimer = 0;
        // Find bottom-most alive invader in each column (they shoot from the front)
        const frontLine = [];
        for (let col = 0; col < INV_COLS; col++) {
            for (let row = INV_ROWS - 1; row >= 0; row--) {
                const inv = s.invaders.find(i => i.row === row && i.col === col && i.alive);
                if (inv) { frontLine.push(inv); break; }
            }
        }
        if (frontLine.length) {
            const shooter = frontLine[Math.floor(Math.random() * frontLine.length)];
            s.invBullets.push({
                x: shooter.x + SPRITE_PX / 2,
                y: shooter.y + SPRITE_PX,
            });
        }
    }

    // ── Move invader bullets ──────────────────────────────────────────────────
    for (const b of s.invBullets) b.y += I_BULLET_SPD;
    s.invBullets = s.invBullets.filter(b => b.y < s.canvasH);

    // ── Invader bullet hits player ────────────────────────────────────────────
    s.invBullets = s.invBullets.filter(b => {
        const hit = b.x >= player.x && b.x <= player.x + PLAYER_W &&
                    b.y >= player.y && b.y <= player.y + PLAYER_H;
        if (hit) {
            s.lives--;
            if (s.lives <= 0) s.status = 'over';
        }
        return !hit;  // keep bullets that didn't hit
    });
}

// ── DRAW: render the current state ───────────────────────────────────────────
function draw(ctx, s) {
    const { canvasW: w, canvasH: h, player } = s;

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle dot-grid pattern — gives a retro graph-paper feel
    ctx.fillStyle = C.dot;
    for (let x = 20; x < w; x += 40) {
        for (let y = 20; y < h; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ── HUD (score + lives) ───────────────────────────────────────────────────
    ctx.fillStyle = C.hud;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${String(s.score).padStart(4, '0')}`, 24, 44);

    ctx.fillStyle = C.invader[0];  // amber hearts
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('♥ '.repeat(s.lives).trim(), w - 24, 44);

    // Control hint at bottom
    ctx.fillStyle = C.muted;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('← →  MOVE   •   SPACE  SHOOT', w / 2, h - 14);
    ctx.textAlign = 'left';

    // ── Invaders ──────────────────────────────────────────────────────────────
    for (const inv of s.invaders) {
        if (!inv.alive) continue;
        drawSprite(ctx, ROW_SPRITE[inv.row], s.animFrame, inv.x, inv.y, C.invader[inv.row]);
    }

    // ── Player ship ───────────────────────────────────────────────────────────
    ctx.fillStyle = C.player;
    // Cannon (narrow top piece)
    ctx.fillRect(player.x + PLAYER_W / 2 - 3, player.y,     6, 8);
    // Hull (wide bottom piece)
    ctx.fillRect(player.x,                    player.y + 8,  PLAYER_W, PLAYER_H - 8);
    // Accent stripe on the hull
    ctx.fillStyle = C.invader[0];
    ctx.fillRect(player.x + 4, player.y + PLAYER_H - 5, PLAYER_W - 8, 3);

    // ── Player bullet ─────────────────────────────────────────────────────────
    if (s.playerBullet) {
        ctx.fillStyle = C.bullet;
        ctx.fillRect(s.playerBullet.x, s.playerBullet.y, 4, 14);
    }

    // ── Invader bullets (zigzag shape for visual interest) ────────────────────
    ctx.fillStyle = C.invBullet;
    for (const b of s.invBullets) {
        ctx.fillRect(b.x - 2, b.y,      4, 4);
        ctx.fillRect(b.x + 2, b.y + 4,  4, 4);
        ctx.fillRect(b.x - 2, b.y + 8,  4, 4);
        ctx.fillRect(b.x + 2, b.y + 12, 4, 4);
    }

    // ── Ground line ───────────────────────────────────────────────────────────
    ctx.fillStyle = C.muted;
    ctx.fillRect(0, player.y + PLAYER_H + 8, w, 2);

    // ── Game-over / win overlay ───────────────────────────────────────────────
    if (s.status === 'over' || s.status === 'win') {
        ctx.fillStyle = C.overlay;
        ctx.fillRect(0, 0, w, h);

        ctx.textAlign = 'center';

        ctx.fillStyle = C.hud;
        ctx.font = 'bold 48px monospace';
        ctx.fillText(s.status === 'over' ? 'GAME OVER' : 'YOU WIN!', w / 2, h / 2 - 32);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = C.invader[0];
        ctx.fillText(`SCORE: ${String(s.score).padStart(4, '0')}`, w / 2, h / 2 + 16);

        ctx.font = '14px monospace';
        ctx.fillStyle = C.muted;
        ctx.fillText('PRESS SPACE TO PLAY AGAIN', w / 2, h / 2 + 56);

        ctx.textAlign = 'left';
    }
}

export default SpaceInvadersGame;
