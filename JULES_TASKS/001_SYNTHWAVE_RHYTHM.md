# JULES TASK: Build SynthWave Rhythm Game

## Priority: HIGH
## Estimated Complexity: Medium
## Target: D:\AI_Apps\ArcadeHub\web\src\games\SynthWave\

---

## Objective
Create a premium rhythm game where players tap/click to the beat of synthwave music.

## Requirements

### Core Gameplay
- Notes fall from top of screen in lanes
- Player taps when notes hit the "hit zone"
- Score based on timing accuracy (Perfect, Good, Miss)
- Combo multiplier for consecutive hits
- Health bar that depletes on misses

### Visual Standards (PREMIUM - NO EXCEPTIONS)
- Neon synthwave aesthetic (purple, cyan, pink gradients)
- Glowing note effects with bloom
- Background visualizer that pulses with music
- Particle explosions on Perfect hits
- Screen shake on Miss
- Smooth 60fps animations

### Audio
- Use Web Audio API for precise timing
- Beat detection from audio file
- Sound effects: hit sounds, miss sounds, combo sounds

### Mobile Support
- Touch controls (tap lanes)
- Responsive layout
- Haptic feedback on mobile (navigator.vibrate)

### Integration
- Import wallet store for credits
- Deduct 1 credit to play
- Save high score to localStorage
- Show on ArcadeHub lobby

## File Structure
```
src/games/SynthWave/
├── index.jsx          # Main game component
├── NoteTrack.jsx      # Lane and note rendering
├── ScoreDisplay.jsx   # Score/combo UI
├── AudioEngine.js     # Web Audio API handler
└── styles.css         # Game-specific styles
```

## Acceptance Criteria
- [ ] Game loads without errors
- [ ] Notes sync with audio beat
- [ ] Scoring works correctly
- [ ] Mobile touch controls work
- [ ] Visual effects are premium quality
- [ ] Integrates with wallet system
