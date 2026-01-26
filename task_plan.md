# Task Plan: Arcade Factory & Empire Build
<!-- 
  WHAT: This is your roadmap for the entire task. Think of it as your "working memory on disk."
  WHY: After 50+ tool calls, your original goals can get forgotten. This file keeps them fresh.
  WHEN: Create this FIRST, before starting any work. Update after each phase completes.
-->

## Goal
<!-- 
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
  EXAMPLE: "Create a Python CLI todo app with add, list, and delete functionality."
-->
Establish a "Premium" Game Factory pipeline (ArcadeHub) producing 5+ high-quality apps, while managing sub-agents for execution.

## Current Phase
<!-- 
  WHAT: Which phase you're currently working on (e.g., "Phase 1", "Phase 3").
  WHY: Quick reference for where you are in the task. Update this as you progress.
-->
Phase 3: Production & Parallel Execution

## Phases
<!-- 
  WHAT: Break your task into 3-7 logical phases. Each phase should be completable.
  WHY: Breaking work into phases prevents overwhelm and makes progress visible.
  WHEN: Update status after completing each phase: pending → in_progress → complete
-->

### Phase 1: Foundation & Standards
<!-- 
  WHAT: Define what "Premium" means and set up the factory floor.
  WHY: prevents building "shovelware".
-->
- [x] Audit existing games (Neon Drift, CyberBreaker)
- [x] Define "Premium" Standards (PREMIUM_STANDARDS.md)
- [x] Set up OpenCode for delegation
- **Status:** complete

### Phase 2: Pilot Upgrades
<!-- 
  WHAT: Bring initial games up to spec.
  WHY: Validate the standards and agent workflow.
-->
- [ ] Upgrade CyberBreaker (Particles, Juice, Mobile) [Worker 1]
- [ ] Upgrade Neon Drift (3D, Haptics) [Done]
- **Status:** in_progress

### Phase 3: Platform Infrastructure
<!-- 
  WHAT: Shared services for all games.
  WHY: Don't rebuild Auth/Save for every game.
-->
- [ ] Build `usePlatform` layer (Auth, Save, Haptics) [Worker 2]
- [ ] specific implementation for Web (Firebase/Local)
- **Status:** in_progress

### Phase 4: Expansion (Game 3 & 4)
<!-- 
  WHAT: New game development.
  WHY: Reach the 5-game quota.
-->
- [ ] SynthWave Rhythm (Music Game)
- [ ] Binary Blast (Shooter)
- **Status:** pending

### Phase 5: Deployment & Certification
<!-- 
  WHAT: Ship to shops.
-->
- [ ] Web Build (DigiMaster Subdomain)
- [ ] iOS/Android Wrapping (Capacitor?)
- **Status:** pending

## Key Questions
<!-- 
  WHAT: Important questions you need to answer during the task.
  WHY: These guide your research and decision-making. Answer them as you go.
-->
1. Can local agents handle complex "Juice" implementation efficiently?
2. What is the specific URL for "Pomelli" brand analysis?
3. How do we handle "Bot-Fill" for multiplayer without a backend server?

## Decisions Made
<!-- 
  WHAT: Technical and design decisions you've made, with the reasoning behind them.
  WHY: You'll forget why you made choices. This table helps you remember and justify decisions.
  WHEN: Update whenever you make a significant choice (technology, approach, structure).
-->
| Decision | Rationale |
|----------|-----------|
| Use Local Agents (DeepSeek) | Save tokens/cost, utilize local hardware (RTX 3060/4090?) |
| React Three Fiber for 3D | Web-native, declarative, easier state mgmt than raw Three.js |
| Zustand for State | Simple, no boilerplate, easy to persist |
| NotebookLM "Premium" Guide | Used as the "Bible" for quality standards |

## Errors Encountered
<!-- 
  WHAT: Every error you encounter, what attempt number it was, and how you resolved it.
  WHY: Logging errors prevents repeating the same mistakes. This is critical for learning.
  WHEN: Add immediately when an error occurs, even if you fix it quickly.
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
| CyberBreaker Dispatch Fail | 1 | Incorrect command syntax. Fixed with explicit `opencode` flags. |
| Duplicate Worker Launch | 1 | Terminated redundant process to save resources. |

## Notes
<!-- 
  REMINDERS:
  - Update phase status as you progress: pending → in_progress → complete
  - Re-read this plan before major decisions (attention manipulation)
  - Log ALL errors - they help avoid repetition
  - Never repeat a failed action - mutate your approach instead
-->
- Worker 1 is on CyberBreaker.
- Worker 2 is on Platform Layer.
- Keep strict visual standards.
