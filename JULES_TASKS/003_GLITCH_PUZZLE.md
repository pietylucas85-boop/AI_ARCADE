# JULES TASK: Build Glitch Puzzle Game

## Priority: MEDIUM
## Estimated Complexity: Medium
## Target: D:\AI_Apps\ArcadeHub\web\src\games\GlitchPuzzle\

---

## Objective
Create a premium pattern-matching puzzle game with a "glitchy" digital aesthetic.

## Requirements

### Core Gameplay
- Grid of colored/patterned tiles (6x6 or 8x8)
- Match 3+ tiles by swapping adjacent tiles
- Tiles disappear and new ones fall from top
- Cascade combos for bonus points
- Timer or move-limited modes
- Increasing difficulty per level

### Visual Standards (PREMIUM - NO EXCEPTIONS)
- "Glitch" digital aesthetic (scan lines, RGB shift effects)
- Tiles have holographic/iridescent appearance
- Match animations with glitch distortion
- Particle effects on clears
- Smooth tile movement (easing functions)
- Dark cyber background

### Game Modes
1. **Timed**: Clear as many as possible in 60 seconds
2. **Moves**: Clear target score in X moves
3. **Endless**: Play until no moves left

### Special Tiles (Unlocked via combos)
- **Line Clear**: Clears entire row/column
- **Bomb**: Clears 3x3 area
- **Color Bomb**: Clears all of one color

### Integration
- Wallet credits to play
- Level progression saved
- High scores per mode

## File Structure
```
src/games/GlitchPuzzle/
├── index.jsx          # Main game component
├── Grid.jsx           # Tile grid logic
├── Tile.jsx           # Individual tile
├── MatchLogic.js      # Match detection
├── Animations.js      # Glitch effects
└── styles.css         # Game styles
```

## Acceptance Criteria
- [ ] Match-3 logic works correctly
- [ ] Cascades calculate properly
- [ ] All game modes functional
- [ ] Special tiles work
- [ ] Glitch visual effects applied
- [ ] Mobile swipe controls work
