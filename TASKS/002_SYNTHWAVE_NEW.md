# WORK ORDER: NEW GAME - SYNTHWAVE RHYTHM
> **Priority:** MEDIUM
> **Target:** D:\AI_Apps\ArcadeHub\web\src\games\SynthWave\index.jsx

## OBJECTIVE
Create a new Rhythm Game where notes fall down 4 columns (Standard "Guitar Hero" style mechanics) but with a "Neon/Synthwave" aesthetic.

## REQUIREMENTS
1.  **Core Component:** Create `SynthWave/index.jsx`.
2.  **Visuals:**
    *   3D Perspective using CSS Transforms (Trapezoid highway).
    *   Neon colors (Pink/Cyan) matching the ArcadeHub theme.
3.  **Mechanics:**
    *   **Input:** Keys `A` `S` `K` `L` (or `D` `F` `J` `K`).
    *   **Timing Window:** "Perfect", "Good", "Miss".
    *   **Combo System:** Multiplier increases with streak.
4.  **Monetization:**
    *   Cost: 2 Credits per song.
5.  **Tech Stack:**
    *   React State for "Note" positions (tick loop).
    *   `requestAnimationFrame` for smooth scrolling.

## FILE STRUCTURE
```
src/games/SynthWave/
  - index.jsx (Main Game)
  - Note.jsx (Visual Component)
  - Track.jsx (The Highway)
```
