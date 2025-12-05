# 🎮 PROJECT: GAME FACTORY (The Assembly Line)

## 1. The Vision
To build a "Game Engine Assembly Line" that allows us to mass-produce high-quality strategy games (Connect 4, Checkers, Othello, Chess) using a shared codebase.

## 2. The "Build Once, Clone Many" Architecture
We will not build games from scratch. We will build a **Universal Strategy Engine**.

### Core Components (The Template)
-   `board_engine.py`: The physics of the board (grid, pieces, moves).
-   `ai_minimax.py`: The Brain. A reusable Minimax algorithm with Alpha-Beta pruning.
-   `api_template.py`: FastAPI backend to handle game state and moves.
-   `ui_template/`: A React frontend that accepts a "Theme" (colors, piece assets) but uses the same logic.

### The Variable (What Changes)
-   `evaluation_[game].py`: The only file we change. This tells the AI *how* to win that specific game.

## 3. Monetization Strategy (The Cash Flow)
-   **Free Tier**: Ad-supported, Weak AI.
-   **Pro ($9.99/yr)**: No Ads, "Grandmaster" AI, Game Analysis.
-   **Platform ($19.99/mo)**: Access to the entire Arcade + API Access.

## 4. Tech Stack
-   **Backend**: Python + FastAPI (Fast, easy for AI).
-   **Frontend**: React + Tailwind (Beautiful, responsive).
-   **Database**: PostgreSQL (User stats, game history).
-   **Hosting**: Railway/Render (Scalable).

## 5. EVE'S ROLE
-   **Architect**: Designing the reusable class structure.
-   **Builder**: Writing the code for each new game module.
-   **Manager**: Deploying the API and monitoring server health.
