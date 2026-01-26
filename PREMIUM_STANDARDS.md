# 🏆 ARCADE FACTORY: PREMIUM STANDARDS (TIER 1)
> **Source:** "Building Profitable Hybrid-Casual Mobile Games" (NotebookLM)
> **Enforcement:** MANDATORY for all "Ready to Ship" titles.

## 1. TECHNICAL & PLATFORM (The Foundation)
*   **Auth:** Google Play Games Services (GPGS) compatible. (Web fallback: Firebase/Local).
*   **Save:** Cloud Save integration (Player progress must survive uninstall).
*   **Achievements:** Minimum **10 Visible Achievements** per game.
*   **Performance:** Locked **60 FPS**. Crash-free session > 30 mins.
*   **Input:** Touch (Mobile First) + Gamepad Support (Xbox/PS).

## 2. IMMERSION & JUICE (The Feel)
*   **Visuals:**
    *   No static 2D Canvas without effects.
    *   **Post-Processing:** Bloom, Chromatic Aberration, or Vignette required.
    *   **Particles:** Minimum 1 user-feedback particle system (e.g., dust, sparks, score popups) on every interactable action.
*   **Haptics:** `navigator.vibrate` usage patterns:
    *   *Light (10ms):* UI Clicks, Text Scrolling.
    *   *Medium (30ms):* Impacts, Collectibles.
    *   *Heavy (50ms+):* Damage, Game Over, Nitro.
*   **Audio:**
    *   Adaptive BGM (Menu vs. Gameplay).
    *   Spatial SFX for 3D games.
    *   Sound toggles mandatory in Pause Menu.

## 3. ENGAGEMENT LOOP (The Hook)
*   **Meta-Game:** Credits/Coins earned must purchase permanent upgrades (Skins, Powerups, Multipliers).
*   **Social:**
    *   Global Leaderboard (Top 100).
    *   "Challenge a Friend" (Async score sharing).
*   **Bot-Fill:** If multiplayer, bots must auto-fill < 5s wait time.

---

## 🛠️ IMPLEMENTATION STRATEGY
### `usePlatform` Hook (Abstraction Layer)
All games must use a standardized hook for platform features to ensure cross-compatibility (Web vs. Native Wrapper).

```javascript
const { 
  signIn, 
  saveProgress, 
  unlockAchievement, 
  vibrate,
  leaderboard 
} = usePlatform();
```

### "The Juice" Standard library
Games should import from `@arcade/juice` (To be created) for unified haptics/sound.
