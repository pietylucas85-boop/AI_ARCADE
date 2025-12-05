
import unittest
from game_engine import ConnectFourGame, PLAYER1, PLAYER2, ROWS, COLS, EMPTY
from bot_ai import MinimaxAI
import time

class TestConnectFourAI(unittest.TestCase):
    def setUp(self):
        # AI plays as Player 2
        self.ai = MinimaxAI(PLAYER2, difficulty='medium')
        self.game = ConnectFourGame()

    def test_block_opponent_win_vertical(self):
        """AI should block Player 1 from getting 4 vertically."""
        # P1: (5,0), (4,0), (3,0). P2 needs to play 0.
        # Setup board state
        # P1 plays 0, P2 plays 1, P1 plays 0, P2 plays 1, P1 plays 0.
        moves = [0, 1, 0, 1, 0]
        for m in moves:
            self.game.drop_piece(m)
        
        # Now P1 has 3 in col 0. Next move by P1 in 0 wins.
        # Current player is P2 (AI).
        valid_moves = self.game.get_valid_moves()
        best_col, score = self.ai.get_best_move(self.game.board, valid_moves)
        
        self.assertEqual(best_col, 0, "AI failed to block vertical win")

    def test_take_winning_move_horizontal(self):
        """AI should take the winning move if available."""
        # P2 has 3 horizontal.
        # Setup: P1 plays various, P2 builds row 0, 1, 2.
        # P1: 0, 1, 2 (as tops? no, P1 is bottom usually)
        # Let's manually set the board to force scenario
        # Row 5 (bottom): P2 P2 P2 Empty
        self.game.board[ROWS-1][0] = PLAYER2
        self.game.board[ROWS-1][1] = PLAYER2
        self.game.board[ROWS-1][2] = PLAYER2
        # Ensure row above is empty or handled so it's a valid drop
        
        # P1 turn? No, test AI (P2). To call get_best_move, prompt with board.
        # But `get_best_move` assumes it's AI's turn?
        # The AI class is initialized with `player_piece`.
        # We just pass the board.
        
        valid_moves = self.game.get_valid_moves() # 0, 1, 2, 3...
        # Col 3 is winning move.
        best_col, score = self.ai.get_best_move(self.game.board, valid_moves)
        self.assertEqual(best_col, 3, "AI failed to take horizontal win")

    def test_performance_medium(self):
        """Ensure depth 4 takes less than 1 second (generous)."""
        start = time.time()
        self.ai.get_best_move(self.game.board, self.game.get_valid_moves())
        duration = time.time() - start
        print(f"\nTime for Depth 4 Empty Board: {duration:.4f}s")
        self.assertLess(duration, 1.0)
    
    def test_preference_for_center(self):
        """On empty board, AI should prefer center (col 3)."""
        best_col, score = self.ai.get_best_move(self.game.board, self.game.get_valid_moves())
        self.assertEqual(best_col, 3)

if __name__ == '__main__':
    unittest.main()
