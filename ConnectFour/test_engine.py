
import unittest
import json
from game_engine import ConnectFourGame, EMPTY, PLAYER1, PLAYER2, ROWS, COLS

class TestConnectFourEngine(unittest.TestCase):
    def setUp(self):
        self.game = ConnectFourGame()

    def test_initial_state(self):
        self.assertEqual(len(self.game.move_history), 0)
        self.assertEqual(self.game.current_player, PLAYER1)
        self.assertFalse(self.game.game_over)
        self.assertIsNone(self.game.winner)
        # Check board is empty
        for r in range(ROWS):
            for c in range(COLS):
                self.assertEqual(self.game.board[r][c], EMPTY)

    def test_valid_drop(self):
        self.game.drop_piece(0)
        self.assertEqual(self.game.board[ROWS-1][0], PLAYER1)
        self.assertEqual(len(self.game.move_history), 1)
        self.assertEqual(self.game.current_player, PLAYER2)

    def test_stacking_pieces(self):
        self.game.drop_piece(0) # P1
        self.game.drop_piece(0) # P2
        self.assertEqual(self.game.board[ROWS-1][0], PLAYER1)
        self.assertEqual(self.game.board[ROWS-2][0], PLAYER2)

    def test_invalid_move_bounds_negative(self):
        self.assertFalse(self.game.is_valid_move(-1))
        with self.assertRaises(ValueError):
            self.game.drop_piece(-1)

    def test_invalid_move_bounds_positive(self):
        self.assertFalse(self.game.is_valid_move(7))
        with self.assertRaises(ValueError):
            self.game.drop_piece(7)

    def test_invalid_move_full_column(self):
        # Fill column 0
        for _ in range(ROWS):
            self.game.drop_piece(0)
        
        self.assertFalse(self.game.is_valid_move(0))
        with self.assertRaises(ValueError):
            self.game.drop_piece(0)

    def test_win_horizontal(self):
        # P1: 0, 1, 2, 3 -> Win
        moves = [0, 0, 1, 1, 2, 2, 3] 
        # P1(0), P2(0), P1(1), P2(1), P1(2), P2(2), P1(3)
        # NOTE: This sequence puts P2 on top of P1 in cols 0,1,2.
        # P1 is at bottom of 0,1,2.
        # Sequence:
        # P1 -> 0 (5,0)
        # P2 -> 0 (4,0)
        # P1 -> 1 (5,1)
        # P2 -> 1 (4,1)
        # P1 -> 2 (5,2)
        # P2 -> 2 (4,2)
        # P1 -> 3 (5,3) -> Win!
        
        for m in moves:
            self.game.drop_piece(m)
        
        self.assertTrue(self.game.game_over)
        self.assertEqual(self.game.winner, PLAYER1)

    def test_win_vertical(self):
        # P1 drops 4 times in col 0. P2 drops in col 1.
        moves = [0, 1, 0, 1, 0, 1, 0]
        for m in moves:
            self.game.drop_piece(m)
        
        self.assertTrue(self.game.game_over)
        self.assertEqual(self.game.winner, PLAYER1)

    def test_win_diagonal_positive(self):
        # Shape /
        # P1 at (5,0), (4,1), (3,2), (2,3)
        # Helper moves to build support
        moves = [
            0, # P1 (5,0)
            1, # P2 (5,1) - support
            1, # P1 (4,1)
            2, # P2 (5,2) - support
            2, # P1 (4,2) - support
            3, # P2 (5,3) - support
            2, # P1 (3,2)
            3, # P2 (4,3) - support
            3, # P1 (3,3) - support
            5, # P2 dump
            3  # P1 (2,3) -> Win
        ]
        for m in moves:
            self.game.drop_piece(m)
            if self.game.game_over:
                break
        
        self.assertTrue(self.game.game_over)
        self.assertEqual(self.game.winner, PLAYER1)

    def test_win_diagonal_negative(self):
        # Shape \
        # P1 at (2,0), (3,1), (4,2), (5,3)
        moves = [
            3, # P1 (5,3)
            2, # P2 (5,2) -> support
            2, # P1 (4,2)
            1, # P2 (5,1) -> support
            1, # P1 (4,1) -> support
            0, # P2 (5,0) -> support
            1, # P1 (3,1)
            0, # P2 (4,0) -> support
            0, # P1 (3,0) -> support
            5, # P2 dump
            0  # P1 (2,0) -> Win
        ]
        for m in moves:
            self.game.drop_piece(m)
            if self.game.game_over:
                break
        self.assertTrue(self.game.game_over)
        self.assertEqual(self.game.winner, PLAYER1)

    def test_draw(self):
        # Fill board. 42 moves.
        # Pattern to avoid win:
        # Col 0: X O X O X O
        # Col 1: X O X O X O
        # ...
        # But need to offset to avoid horizontal wins
        # 0, 2, 4, 6 (X starts)
        # 1, 3, 5 (O starts) - wait, current player naturally toggles.
        # Just filling needs care.
        # Simple pattern: Fill columns 0, 2, 4, 6 fully. Then 1, 3, 5.
        # Needs to ensure no horizontals.
        # 0: X O X O X O
        # 1: O X O X O X
        # 2: X O X O X O
        # 3: O X O X O X
        # 4: X O X O X O
        # 5: O X O X O X
        # 6: X O X O X O
        
        # Cols 0, 2, 4, 6 -> Start P1 (X). Bottom is X.
        # Cols 1, 3, 5 -> Need P2 (O) to be bottom?
        # Let's just play out a known draw sequence or semi-random
        # Actually, let's construct it manually to save simulation logic complexity in test
        
        # Hardcoding a full board is tedious properly.
        # Let's skip complex draw construction and just test is_draw logic by mocking board?
        # Or filling top row?
        
        # Mocking board for test simplicity
        for c in range(COLS):
            self.game.board[0][c] = PLAYER1 # Top row full
        
        # Determine if is_draw returns true (assuming no winner found by check_winner, which we aren't calling here directly)
        self.assertTrue(self.game.is_draw())
        
        # Reset and check empty
        self.game = ConnectFourGame()
        self.assertFalse(self.game.is_draw())

    def test_json_serialization(self):
        self.game.drop_piece(3)
        json_str = self.game.to_json()
        self.assertIn('"current_player": 2', json_str)
        self.assertIn('"move_history": [3]', json_str)
        
        game2 = ConnectFourGame.from_json(json_str)
        self.assertEqual(game2.board[ROWS-1][3], PLAYER1)
        self.assertEqual(game2.current_player, PLAYER2)
        self.assertEqual(game2.move_history, [3])

    def test_move_history_integrity(self):
        moves = [3, 3, 4, 4]
        for m in moves:
            self.game.drop_piece(m)
        self.assertEqual(self.game.move_history, moves)

    def test_get_valid_moves(self):
        self.assertEqual(len(self.game.get_valid_moves()), 7)
        # Fill col 0
        for _ in range(ROWS):
            self.game.drop_piece(0)
        self.assertEqual(len(self.game.get_valid_moves()), 6)
        self.assertNotIn(0, self.game.get_valid_moves())

    def test_game_over_state_persistence(self):
        moves = [0, 1, 0, 1, 0, 1, 0] # P1 wins vertical
        for m in moves:
            self.game.drop_piece(m)
        
        with self.assertRaisesRegex(ValueError, "Game is over"):
             self.game.drop_piece(2)

    def test_display_output(self):
        output = self.game.display()
        self.assertIn("0 1 2 3 4 5 6", output)
        self.assertIn("| | | | | | | |", output)

if __name__ == '__main__':
    unittest.main()
