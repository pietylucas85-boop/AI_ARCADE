
## Strategic Enhancement Analysis (Grok Persona)

### 1. Evaluation Function Analysis
The original evaluation was solid but linear.
**Improvements in v2:**
- **Drastically increased Win/Block scores**: Ensures the AI never prioritizes a "good position" over a "winning move" or "saving move".
- **Center Column weighting**: Increased value for Col 3. In Connect 4, whoever controls the center dictates the game flow.
- **Opponent Penalty**: The v2 `evaluate_window` proactively subtracts points for opponent setups, making the AI more defensive/aggressive in hybrid measure.

### 2. Opening Book Strategy
Created `opening_book.json`.
- **The "God Move"**: In solved Connect 4, the first player starting in Column 3 (Center) can theoretically force a win.
- **AI Rule**: Always start Col 3 if Player 1.
- **Response Rule**: If Opponent starts Col 3, stack on top (Col 3) or flank immediately (Col 2/4).

### 3. Tactical Patterns (The "Fork")
A "Fork" is creating two winning threats simultaneously (e.g., a "7" shape).
- **Detection**: The v2 evaluation function rewards overlapping lines. If a single piece contributes to a horizontal set of 2 AND a vertical set of 2, it gets double-counted, naturally encouraging fork creation.

### 4. Endgame Optimization
- **Suggestion**: When empty slots < 12, switch from `Depth=X` to `Depth=X+2`. The branching factor decreases as columns fill up, allowing deeper search in the same time.

### Next Steps for Implementation
1. Load `opening_book.json` in `bot_ai.py` `__init__`.
2. Check for book moves before running Minimax.
3. Use `evaluation_v2` instead of `evaluation`.
