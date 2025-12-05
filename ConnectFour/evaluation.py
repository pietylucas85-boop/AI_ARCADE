
from game_engine import ROWS, COLS, EMPTY, PLAYER1, PLAYER2

# Scoring Weights
SCORE_WIN = 100000
SCORE_BLOCK = 10000  # Note: Minimax usually handles blocking naturally by seeing the loss, but high static score helps.
SCORE_THREE = 100
SCORE_TWO = 10
SCORE_CENTER = 3

def evaluate_window(window, piece):
    """
    Evaluate a window of 4 cells for a specific player (piece).
    """
    score = 0
    opp_piece = PLAYER1 if piece == PLAYER2 else PLAYER2

    if window.count(piece) == 4:
        score += SCORE_WIN
    elif window.count(piece) == 3 and window.count(EMPTY) == 1:
        score += SCORE_THREE
    elif window.count(piece) == 2 and window.count(EMPTY) == 2:
        score += SCORE_TWO
    
    # Negative scoring for opponent threats (optional, but often minimax handles this via min-node)
    # However, blocking moves are explicitly requested to be valued highly in static eval
    if window.count(opp_piece) == 3 and window.count(EMPTY) == 1:
        score -= SCORE_BLOCK # Penalize board states where opponent has 3-in-a-row

    return score

def score_position(board, piece):
    """
    Calculate the static score of the board for the given piece.
    """
    score = 0

    # 1. Center Column Preference
    center_array = [row[COLS // 2] for row in board]
    center_count = center_array.count(piece)
    score += center_count * SCORE_CENTER

    # 2. Horizontal Scoring
    for r in range(ROWS):
        row_array = board[r]
        for c in range(COLS - 3):
            window = row_array[c:c+4]
            score += evaluate_window(window, piece)

    # 3. Vertical Scoring
    for c in range(COLS):
        col_array = [board[r][c] for r in range(ROWS)]
        for r in range(ROWS - 3):
            window = col_array[r:r+4]
            score += evaluate_window(window, piece)

    # 4. Positive Diagonal Scoring (/)
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            window = [board[r+i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)

    # 5. Negative Diagonal Scoring (\)
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            window = [board[r+3-i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)

    return score
