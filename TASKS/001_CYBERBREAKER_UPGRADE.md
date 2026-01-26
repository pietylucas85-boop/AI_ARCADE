# WORK ORDER: CYBERBREAKER PREMIUM UPGRADE
> **Priority:** HIGH
> **Target:** D:\AI_Apps\ArcadeHub\web\src\games\CyberBreaker\index.jsx
> **Standard:** Hybrid-Casual Premium Guide (Tier 1)

## OBJECTIVE
Upgrade `CyberBreaker` from a basic React component to a high-fidelity "Juice-Heavy" arcade game using the `useWalletStore` for credits.

## REQUIREMENTS (From NotebookLM)
1.  **Visuals:**
    *   Implement **Particle Explosions** on every brick hit (using `framer-motion` or Canvas particles).
    *   Add **Screen Shake** on wall hits and paddle hits (intensity varies by impact).
    *   Use **Neon Glows** (CSS `box-shadow` or Canvas `shadowBlur`) for all elements.
2.  **Audio/Haptics:**
    *   Use `navigator.vibrate` for tactile feedback (Short for paddle hit, Long for death).
    *   (Optional if easy) Add sound triggers using `howler`.
3.  **Gameplay Loop:**
    *   **Cost:** 1 Credit to Start (Check `useWalletStore`).
    *   **Progression:** Speed increases by 5% every 10 seconds.
    *   **Powerups:** "Multi-Ball" and "Wide-Paddle" probability spawns.
4.  **Mobile Controls:**
    *   Ensure the touch area covers the bottom 30% of the screen.
    *   Prevent default touch behaviors (scrolling) during play.

## TECHNICAL INSTRUCTION
Modify the existing `index.jsx` to include these "Juice" functions. Do not rewrite the whole logic if possible, just inject the visual flair and physics tweaks.

**Reference:**
```javascript
const triggerShake = (intensity) => {
    // Add shake logic
    if (navigator.vibrate) navigator.vibrate(intensity * 10);
}
```
