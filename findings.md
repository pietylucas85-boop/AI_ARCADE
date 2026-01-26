# Findings & Decisions
<!-- 
  WHAT: Your knowledge base for the task. Stores everything you discover and decide.
  WHY: Context windows are limited. This file is your "external memory" - persistent and unlimited.
  WHEN: Update after ANY discovery, especially after 2 view/browser/search operations (2-Action Rule).
-->

## Requirements
<!-- 
  WHAT: What the user asked for, broken down into specific requirements.
-->
<!-- Captured from user request -->
- "Premium" Native-feeling mobile games (Deployment target: Play Store / App Store)
- "Arcade Factory" pipeline to produce 5+ games
- "Iron Box V2" protocol: Strategy -> Depts -> Atomic Agents
- Use local agents for execution

## Research Findings
<!-- 
  WHAT: Key discoveries from web searches, documentation reading, or exploration.
-->
<!-- Key discoveries during exploration -->
- **NotebookLM Guide:** "Premium" = 60FPS, Haptics, Cloud Save, 10+ Achievements, "Juice" (Particles/Shake).
- **Tech Stack:** React + Vite + Zustand + Eraser (Physics) + React Three Fiber (3D).
- **Skill:** `planning-with-files` is now installed to manage state.

## Technical Decisions
<!-- 
  WHAT: Architecture and implementation choices you've made, with reasoning.
-->
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
| **Framework:** React | Component-based, vast ecosystem, easy state management. |
| **Engine:** Custom/Canvas | For 2D Arcade. R3F for 3D. Phaser as backup. |
| **Delegation:** OpenCode | Allows local LLMs (DeepSeek) to write code autonomously. |
| **State:** Zustand | Lightweight, handles "Wallet" and "Platform" stores easily. |

## Issues Encountered
<!-- 
  WHAT: Problems you ran into and how you solved them.
-->
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
| | |

## Resources
<!-- 
  WHAT: URLs, file paths, API references, documentation links you've found useful.
-->
<!-- URLs, file paths, API references -->
- Guide: `PREMIUM_STANDARDS.md`
- Plan: `EMPIRE_BUILD_PLAN.md`

## Visual/Browser Findings
<!-- 
  WHAT: Information you learned from viewing images, PDFs, or browser results.
  WHY: CRITICAL - Visual/multimodal content doesn't persist in context. Must be captured as text.
-->
<!-- CRITICAL: Update after every 2 view/browser operations -->
- None yet.

---
*Update this file after every 2 view/browser/search operations*
