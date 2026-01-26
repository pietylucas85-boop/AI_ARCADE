# WORK ORDER: PLATFORM SERVICES LAYER
> **Priority:** HIGH (Blocker for Store Certification)
> **Component:** `src/store/usePlatformStore.js` & `src/hooks/usePlatform.js`

## OBJECTIVE
Create a centralized abstraction layer for "Premium" platform features (Auth, Save, Achievements, Haptics). This decouples the game logic from the implementation (Web vs. Native).

## REQUIREMENTS
1.  **Auth Store (`useAuthStore`):**
    *   State: `user` (null/object), `isAuthenticated` (bool).
    *   Mock Action: `signInWithGoogle()` (Returns mock success for now).
    *   Mock Action: `signOut()`.

2.  **Platform Hook (`usePlatform`):**
    *   **Haptics:** Wrapper around `navigator.vibrate` with presets (`bump`, `explosion`, `success`).
    *   **Cloud Save:** `saveGameData(key, data)` / `loadGameData(key)`. (Use `localStorage` as fallback for now).
    *   **Achievements:** `unlockAchievement(id)` -> Triggers a UI Toast and authenticates with store.

3.  **Achievement System:**
    *   Define a constant `ACHIEVEMENTS_LIST` in `src/config/achievements.js`.
    *   Example: `{ id: 'FIRST_WIN', title: 'Rookie Driver', xp: 100 }`.

## TECHNICAL SPEC
Create a robust Zustand store or React Context that all games (`NeonDrift`, `CyberBreaker`) can consume.

```javascript
// Example usage in game:
const { unlockAchievement, vibrate } = usePlatform();

function onWin() {
  vibrate('success');
  unlockAchievement('FIRST_WIN');
}
```
