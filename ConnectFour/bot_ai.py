
import random
import math
import time
import json
import os
from game_engine import ConnectFourGame, ROWS, COLS, EMPTY, PLAYER1, PLAYER2
from evaluation_v2 import score_position_v2, SCORE_WIN

# Constants
DIFFICULTY_EASY = 2
DIFFICULTY_MEDIUM = 4
DIFFICULTY_HARD = 6 # Can push to 7 or 8 with optimization

class MinimaxAI:
    def __init__(self, player_piece, difficulty='medium'):
        self.player_piece = player_piece
        self.opponent_piece = PLAYER1 if player_piece == PLAYER2 else PLAYER2
        
        if difficulty == 'easy':
            self.depth = DIFFICULTY_EASY
        elif difficulty == 'hard':
            self.depth = DIFFICULTY_HARD
        else:
            self.depth = DIFFICULTY_MEDIUM

        # Load Opening Book
        self.opening_book = {}
        try:
            with open('opening_book.json', 'r') as f:
                data = json.load(f)
                self.opening_book = data.get("opening_moves", {})
        except:
            pass # Fail gracefully if book missing

    def get_best_move(self, board, valid_moves):
        """
        Determines the best column to drop a piece in using Minimax with Alpha-Beta Pruning.
        Returns: (column, score)
        """
        # Check Opening Book First
        board_key = self.get_board_key(board)
        if board_key in self.opening_book:
             move = self.opening_book[board_key]["best_move"]
             if move in valid_moves:
                 return move, 999999

        start_time = time.time()
        
        # Move Ordering: Evaluate center columns first to maximize pruning
        # Order: 3, 2, 4, 1, 5, 0, 6
        center = COLS // 2
        ordered_moves = sorted(valid_moves, key=lambda x: abs(x - center))

        best_score = -math.inf
        best_col = random.choice(valid_moves) # Fallback

        alpha = -math.inf
        beta = math.inf

        for col in ordered_moves:
            # Simulate move
            temp_board = [row[:] for row in board]
            self.drop_piece_simulation(temp_board, col, self.player_piece)
            
            # Call Minimax
            score = self.minimax(temp_board, self.depth - 1, alpha, beta, False)
            
            if score > best_score:
                best_score = score
                best_col = col
            
            alpha = max(alpha, best_score)
            if alpha >= beta:
                break

        end_time = time.time()
        # print(f"AI Search Depth: {self.depth} | Time: {end_time - start_time:.4f}s | Best Move: {best_col} (Score: {best_score})")
        return best_col, best_score

    def minimax(self, board, depth, alpha, beta, maximizingPlayer):
        valid_moves = self.get_valid_locations(board)
        is_terminal = self.is_terminal_node(board, valid_moves)
        
        if depth == 0 or is_terminal:
            if is_terminal:
                if self.winning_move(board, self.player_piece):
                    return 10000000 # Almost infinite preference to win
                elif self.winning_move(board, self.opponent_piece):
                    return -10000000 # Almost infinite avoidance of loss
                else:
                    return 0 # Game over, no winner (Draw)
            else:
                return score_position_v2(board, self.player_piece)

        if maximizingPlayer:
            value = -math.inf
            # Move ordering for child nodes as well? (Optional optimization)
            center = COLS // 2
            sorted_moves = sorted(valid_moves, key=lambda x: abs(x - center))
            
            for col in sorted_moves:
                temp_board = [row[:] for row in board]
                self.drop_piece_simulation(temp_board, col, self.player_piece)
                new_score = self.minimax(temp_board, depth - 1, alpha, beta, False)
                value = max(value, new_score)
                alpha = max(alpha, value)
                if alpha >= beta:
                    break
            return value
        else: # Minimizing Player
            value = math.inf
            center = COLS // 2
            sorted_moves = sorted(valid_moves, key=lambda x: abs(x - center))
            
            for col in sorted_moves:
                temp_board = [row[:] for row in board]
                self.drop_piece_simulation(temp_board, col, self.opponent_piece)
                new_score = self.minimax(temp_board, depth - 1, alpha, beta, True)
                value = min(value, new_score)
                beta = min(beta, value)
                if alpha >= beta:
                    break
            return value

    def drop_piece_simulation(self, board, col, piece):
        """Simulate dropping a piece without using the full Game Engine overhead."""
        for r in range(ROWS - 1, -1, -1):
            if board[r][col] == EMPTY:
                board[r][col] = piece
                return

    def get_valid_locations(self, board):
        return [c for c in range(COLS) if board[0][c] == EMPTY]

    def is_terminal_node(self, board, valid_moves):
        return self.winning_move(board, self.player_piece) or \
               self.winning_move(board, self.opponent_piece) or \
               len(valid_moves) == 0

    def winning_move(self, board, piece):
        # Check horizontal locations for win
        for c in range(COLS - 3):
            for r in range(ROWS):
                if board[r][c] == piece and board[r][c+1] == piece and board[r][c+2] == piece and board[r][c+3] == piece:
                    return True

        # Check vertical locations for win
        for c in range(COLS):
            for r in range(ROWS - 3):
                if board[r][c] == piece and board[r+1][c] == piece and board[r+2][c] == piece and board[r+3][c] == piece:
                    return True

        # Check positively sloped diaganols
        for c in range(COLS - 3):
            for r in range(ROWS - 3):
                if board[r][c] == piece and board[r+1][c+1] == piece and board[r+2][c+2] == piece and board[r+3][c+3] == piece:
                    return True

        # Check negatively sloped diaganols
        for c in range(COLS - 3):
            for r in range(3, ROWS):
                if board[r][c] == piece and board[r-1][c+1] == piece and board[r-2][c+2] == piece and board[r-3][c+3] == piece:
                    return True
        return False

    def get_board_key(self, board):
        """Generate simple key for opening book lookup (e.g. flat string of top plays)"""
        # Very simple version: just check empty board state
        # In real impl, would hash the board.
        # Here we just implement the "Empty Board" check for the first move.
        is_empty = all(cell == EMPTY for row in board for cell in row)
        if is_empty:
            return "______"
        return "unknown"
