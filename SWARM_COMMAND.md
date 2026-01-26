# 🏭 ARCADE FACTORY SWARM COMMAND
> **Agent:** JULES (Gemini CLI - Cloud Swarm)
> **Mode:** FULL PARALLEL (15 Sub-Agents)
> **Project:** D:\AI_Apps\ArcadeHub

## 🎯 MISSION
You are the **Factory Foreman**. Your job is to BUILD games, not discuss them.
Use ALL 15 of your parallel sub-agents to construct the ArcadeHub platform.

## 📜 RULES
1. **WRITE FILES.** Do not explain. Do not ask. CREATE.
2. **USE write_to_file TOOL.** Every component must be saved to disk.
3. **PARALLEL BUILD.** Assign each sub-agent a component simultaneously.
4. **PREMIUM STANDARDS.** See PREMIUM_STANDARDS.md for quality requirements.

## 🏗️ BUILD ORDER (Parallel Execution)

### SUB-AGENT 1-3: PLATFORM LAYER
- `web/src/hooks/usePlatform.js` (Auth, Haptics, Cloud Save)
- `web/src/store/useAuthStore.js` (User state)
- `web/src/config/achievements.js` (Achievement definitions)

### SUB-AGENT 4-7: CYBERBREAKER UPGRADE
- `web/src/games/CyberBreaker/index.jsx` (Full rewrite with particles, shake, juice)
- `web/src/games/CyberBreaker/Particles.jsx` (Explosion system)
- `web/src/games/CyberBreaker/PowerUps.jsx` (Multi-ball, laser, etc.)
- `web/src/games/CyberBreaker/sounds.js` (SFX integration)

### SUB-AGENT 8-12: SYNTHWAVE RHYTHM (NEW GAME)
- `web/src/games/SynthWave/index.jsx` (Main game scene)
- `web/src/games/SynthWave/NoteTrack.jsx` (Falling notes, 4 columns)
- `web/src/games/SynthWave/RetroHighway.jsx` (3D neon background with R3F)
- `web/src/games/SynthWave/ScoreHUD.jsx` (Combo, health, score)
- `web/src/games/SynthWave/songs/demo.json` (Sample beatmap)

### SUB-AGENT 13-15: INTEGRATION
- `web/src/App.jsx` (Add routes for new games)
- `web/src/components/Lobby.jsx` (Game selection cards)
- `web/src/styles/premium.css` (Neon glow, gradients, animations)

## ⚡ EXECUTION
Start NOW. Write all files simultaneously using your parallel capabilities.
Do NOT wait for user confirmation. The factory runs until complete.

**DIRECTORY ROOT:** D:\AI_Apps\ArcadeHub
**GO!**
