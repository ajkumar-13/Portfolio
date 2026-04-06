/**
 * games/index.js — Retro Game Registry
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE DOES
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the single source of truth for which retro game appears as the
 * light-mode background on the Home page.
 *
 * Home.jsx imports GAMES and ACTIVE_LIGHT_GAME from here and never needs to
 * change when you add or switch games — only this file changes.
 *
 * HOW TO ADD A NEW GAME:
 *   1. Create:  frontend/src/games/MyGame.jsx
 *      Contract: must be a React component that takes no props, fills its
 *      container (width/height: 100%), and manages its own game loop.
 *   2. Import:  import MyGame from './MyGame';
 *   3. Register: add  'my-game': MyGame  to the GAMES object
 *   4. Activate: set  ACTIVE_LIGHT_GAME = 'my-game'
 *
 * HOW TO SWITCH GAMES:
 *   Change ACTIVE_LIGHT_GAME to any key that exists in GAMES.
 *   That's the only line you need to touch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import SpaceInvadersGame from './SpaceInvaders';
// import SnakeGame        from './Snake';      // ← uncomment when ready
// import AsteroidsGame    from './Asteroids';  // ← uncomment when ready

/**
 * GAMES — registry of all available retro game components.
 *
 * Key:   a unique slug string (e.g. 'space-invaders')
 * Value: a React component that renders the game inside a full-screen canvas
 */
export const GAMES = {
    'space-invaders': SpaceInvadersGame,
    // 'snake':       SnakeGame,
    // 'asteroids':   AsteroidsGame,
};

/**
 * ACTIVE_LIGHT_GAME — which game is currently shown in light mode.
 *
 * ← Change this ONE line to switch the active game.
 * Must be a key that exists in GAMES above.
 */
export const ACTIVE_LIGHT_GAME = 'space-invaders';
