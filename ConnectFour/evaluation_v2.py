
from game_engine import ROWS, COLS, EMPTY, PLAYER1, PLAYER2

# GROK ENHANCED WEIGHTS
SCORE_WIN = 1000000
SCORE_FORCED_WIN = 50000  # Threat that guarantees a win
SCORE_BLOCK_WIN = 20000   # Prevent immediate loss
SCORE_BLOCK_FORCED = 10000 # Prevent forced loss sequence (7 threats)
SCORE_FORK = 5000         # Creating two winning lines
SCORE_THREE = 200
SCORE_TWO = 20
SCORE_CENTER = 5          # Increased center importance

def evaluate_window_v2(window, piece, opp_piece):
    """
    Enhanced window evaluation with penalty for opponent threats.
    """
    score = 0
    
    # Offense
    if window.count(piece) == 4:
        score += SCORE_WIN
    elif window.count(piece) == 3 and window.count(EMPTY) == 1:
        score += SCORE_THREE
    elif window.count(piece) == 2 and window.count(EMPTY) == 2:
        score += SCORE_TWO

    # Defense (Block opponent)
    # Penalize heavily if opponent has 3 in a row in this window
    if window.count(opp_piece) == 3 and window.count(EMPTY) == 1:
        score -= SCORE_BLOCK_WIN / 2  # Subtract half block score per window (overlaps count)

    return score

def score_position_v2(board, piece):
    """
    Grok's Advanced Scoring:
    - Higher center weight
    - Fork detection (conceptual hooks)
    - Defensive awareness
    """
    score = 0
    opp_piece = PLAYER1 if piece == PLAYER2 else PLAYER2

    # 1. Center Control (Crucial in Connect 4)
    # Weighted center: Middle col is kings, adjacent are queens
    center_col = [row[COLS // 2] for row in board]
    score += center_col.count(piece) * (SCORE_CENTER * 2)
    
    left_center = [row[COLS // 2 - 1] for row in board]
    score += left_center.count(piece) * SCORE_CENTER

    right_center = [row[COLS // 2 + 1] for row in board]
    score += right_center.count(piece) * SCORE_CENTER

    # 2. Pattern Scoring (Horizontal, Vertical, Diagonals)
    # Horizontal
    for r in range(ROWS):
        row_array = board[r]
        for c in range(COLS - 3):
            window = row_array[c:c+4]
            score += evaluate_window_v2(window, piece, opp_piece)

    # Vertical
    for c in range(COLS):
        col_array = [board[r][c] for r in range(ROWS)]
        for r in range(ROWS - 3):
            window = col_array[r:r+4]
            score += evaluate_window_v2(window, piece, opp_piece)

    # Diagonal /
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            window = [board[r+i][c+i] for i in range(4)]
            score += evaluate_window_v2(window, piece, opp_piece)

    # Diagonal \
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            window = [board[r+3-i][c+i] for i in range(4)]
            score += evaluate_window_v2(window, piece, opp_piece)

    return score
