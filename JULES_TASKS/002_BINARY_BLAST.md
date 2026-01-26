# JULES TASK: Build Binary Blast Space Shooter

## Priority: HIGH
## Estimated Complexity: Medium
## Target: D:\AI_Apps\ArcadeHub\web\src\games\BinaryBlast\

---

## Objective
Create a premium vertical scrolling space shooter with power-ups and boss battles.

## Requirements

### Core Gameplay
- Player ship at bottom, enemies spawn from top
- Shoot with spacebar/tap
- Collect power-ups (spread shot, shield, bombs)
- Wave-based progression
- Boss every 5 waves
- Lives system (3 lives)

### Visual Standards (PREMIUM - NO EXCEPTIONS)
- Neon/cyber aesthetic matching ArcadeHub theme
- Particle trails on bullets
- Explosion effects with screen shake
- Starfield parallax background
- Glowing ship and enemy designs
- Smooth 60fps performance

### Controls
- Keyboard: Arrow keys + Space
- Mobile: Touch to move, auto-fire or tap-to-shoot toggle
- Gamepad support (bonus)

### Power-up System
- Double Shot: 2 bullets
- Triple Spread: 3-way shot
- Shield: Block 1 hit
- Bomb: Screen clear
- Speed Boost: Faster movement

### Integration
- Wallet system for credits
- High score leaderboard (localStorage)
- Lobby card in main App

## File Structure
```
src/games/BinaryBlast/
├── index.jsx          # Main game component
├── Player.jsx         # Player ship
├── Enemy.jsx          # Enemy types
├── Bullet.jsx         # Projectiles
├── PowerUp.jsx        # Power-up items
├── Boss.jsx           # Boss enemies
└── styles.css         # Game styles
```

## Acceptance Criteria
- [ ] Smooth gameplay at 60fps
- [ ] All power-ups functional
- [ ] Boss battles work
- [ ] Mobile controls responsive
- [ ] Premium visual effects
- [ ] Wallet integration works
