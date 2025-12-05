
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import time

from game_engine import ConnectFourGame, PLAYER1, PLAYER2, EMPTY, ROWS, COLS
from bot_ai import MinimaxAI

app = FastAPI(
    title="Connect Four AI API",
    description="Production-ready API for Multi-AI Connect Four",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for games
# In production, use Redis or a database
games_db: Dict[str, Dict[str, Any]] = {}

# --- Data Models ---

class NewGameRequest(BaseModel):
    player1_type: str = "human" # "human" or "bot"
    player2_type: str = "bot"   # "human" or "bot"
    difficulty: str = "medium"  # "easy", "medium", "hard"

class NewGameResponse(BaseModel):
    game_id: str
    board: List[List[int]]
    current_player: int
    message: str

class MoveRequest(BaseModel):
    column: int
    player: int

class MoveResponse(BaseModel):
    success: bool
    board: List[List[int]]
    current_player: int
    winner: Optional[Any] # 1, 2, "draw", or None
    game_over: bool
    valid_moves: List[int]
    message: Optional[str] = None

class BotMoveResponse(BaseModel):
    column: int
    reasoning: str
    evaluation_score: float
    thinking_time: float
    board: List[List[int]]
    winner: Optional[Any]
    game_over: bool

class GameStateResponse(BaseModel):
    game_id: str
    board: List[List[int]]
    current_player: int
    winner: Optional[Any]
    game_over: bool
    move_history: List[int]

# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "games_active": len(games_db)}

@app.post("/api/games/new", response_model=NewGameResponse)
def create_new_game(request: NewGameRequest):
    game_id = str(uuid.uuid4())
    game = ConnectFourGame()
    
    # Initialize Bots if needed (stored in memory associated with game)
    bots = {}
    if request.player1_type == "bot":
        bots[PLAYER1] = MinimaxAI(PLAYER1, request.difficulty)
    if request.player2_type == "bot":
        bots[PLAYER2] = MinimaxAI(PLAYER2, request.difficulty)
    
    games_db[game_id] = {
        "game": game,
        "bots": bots,
        "config": request.dict(),
        "created_at": time.time()
    }
    
    return NewGameResponse(
        game_id=game_id,
        board=game.board,
        current_player=game.current_player,
        message="New game started"
    )

def get_game_or_404(game_id: str):
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    return games_db[game_id]

@app.get("/api/games/{game_id}/state", response_model=GameStateResponse)
def get_game_state(game_id: str):
    data = get_game_or_404(game_id)
    game: ConnectFourGame = data["game"]
    
    return GameStateResponse(
        game_id=game_id,
        board=game.board,
        current_player=game.current_player,
        winner=game.winner,
        game_over=game.game_over,
        move_history=game.move_history
    )

@app.post("/api/games/{game_id}/move", response_model=MoveResponse)
def make_move(game_id: str, move: MoveRequest):
    data = get_game_or_404(game_id)
    game: ConnectFourGame = data["game"]
    
    if game.game_over:
        raise HTTPException(status_code=400, detail="Game is already over")
    
    if move.player != game.current_player:
        raise HTTPException(status_code=400, detail="Not your turn")
        
    if not game.is_valid_move(move.column):
        raise HTTPException(status_code=400, detail="Invalid move")
    
    try:
        game.drop_piece(move.column)
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
         
    return MoveResponse(
        success=True,
        board=game.board,
        current_player=game.current_player,
        winner=game.winner,
        game_over=game.game_over,
        valid_moves=game.get_valid_moves()
    )

@app.get("/api/games/{game_id}/bot-move", response_model=BotMoveResponse)
def trigger_bot_move(game_id: str):
    data = get_game_or_404(game_id)
    game: ConnectFourGame = data["game"]
    bots = data["bots"]
    
    if game.game_over:
        raise HTTPException(status_code=400, detail="Game is over")
    
    current_player = game.current_player
    if current_player not in bots:
         raise HTTPException(status_code=400, detail="Current player is not a bot")
         
    bot: MinimaxAI = bots[current_player]
    valid_moves = game.get_valid_moves()
    
    start_time = time.time()
    best_col, score = bot.get_best_move(game.board, valid_moves)
    duration = time.time() - start_time
    
    game.drop_piece(best_col)
    
    reasoning = "Calculated best strategic advantage."
    if score > 50000: reasoning = "Found winning path."
    elif score < -50000: reasoning = "Forced defense to prevent loss."
    elif score == 999999: reasoning = "Opening book optimized move."
    
    return BotMoveResponse(
        column=best_col,
        reasoning=reasoning,
        evaluation_score=score,
        thinking_time=duration,
        board=game.board,
        winner=game.winner,
        game_over=game.game_over
    )

@app.delete("/api/games/{game_id}")
def delete_game(game_id: str):
    if game_id in games_db:
        del games_db[game_id]
        return {"success": True, "message": "Game deleted"}
    raise HTTPException(status_code=404, detail="Game not found")

@app.get("/api/stats")
def get_server_stats():
    return {
        "active_games": len(games_db),
        "uptime": "running"
    }

if __name__ == "__main__":
    import uvicorn
    # In dev mode, run on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8001)
