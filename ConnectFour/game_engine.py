
import json

# Constants
EMPTY = 0
PLAYER1 = 1
PLAYER2 = 2
ROWS = 6
COLS = 7

class ConnectFourGame:
    def __init__(self):
        self.board = [[EMPTY for _ in range(COLS)] for _ in range(ROWS)]
        self.current_player = PLAYER1
        self.move_history = []
        self.game_over = False
        self.winner = None

    def is_valid_move(self, column):
        """Check if dropping a piece in the column is valid."""
        if column < 0 or column >= COLS:
            return False
        if self.board[0][column] != EMPTY:
            return False
        return True

    def get_valid_moves(self):
        """Return a list of valid column indices."""
        return [col for col in range(COLS) if self.is_valid_move(col)]

    def drop_piece(self, column):
        """Drop a piece into the specified column."""
        if self.game_over:
            raise ValueError("Game is over")
        if not self.is_valid_move(column):
            raise ValueError(f"Invalid move: column {column}")

        # Find the lowest empty row
        for row in range(ROWS - 1, -1, -1):
            if self.board[row][column] == EMPTY:
                self.board[row][column] = self.current_player
                self.move_history.append(column)
                
                if self.check_winner(row, column):
                    self.game_over = True
                    self.winner = self.current_player
                elif self.is_draw():
                    self.game_over = True
                    self.winner = 'draw'
                else:
                    self.switch_player()
                return

    def switch_player(self):
        self.current_player = PLAYER2 if self.current_player == PLAYER1 else PLAYER1

    def check_winner(self, last_row, last_col):
        """Check for a win starting from the last placed piece."""
        piece = self.board[last_row][last_col]

        # Directions: (row_delta, col_delta)
        directions = [
            (0, 1),   # Horizontal
            (1, 0),   # Vertical
            (1, 1),   # Diagonal Positive Slope (down-right)
            (1, -1)   # Diagonal Negative Slope (down-left)
        ]

        for dr, dc in directions:
            count = 1  # Count the piece itself
            
            # Check forward direction
            r, c = last_row + dr, last_col + dc
            while 0 <= r < ROWS and 0 <= c < COLS and self.board[r][c] == piece:
                count += 1
                r += dr
                c += dc
            
            # Check backward direction
            r, c = last_row - dr, last_col - dc
            while 0 <= r < ROWS and 0 <= c < COLS and self.board[r][c] == piece:
                count += 1
                r -= dr
                c -= dc
            
            if count >= 4:
                return True
        return False

    def is_draw(self):
        """Check if the board is full with no winner."""
        # Top row full implies board full
        return all(cell != EMPTY for cell in self.board[0])

    def to_json(self):
        """Serialize game state to JSON string."""
        state = {
            "board": self.board,
            "current_player": self.current_player,
            "move_history": self.move_history,
            "game_over": self.game_over,
            "winner": self.winner
        }
        return json.dumps(state)

    @classmethod
    def from_json(cls, json_str):
        """Restore game state from JSON string."""
        state = json.loads(json_str)
        game = cls()
        game.board = state["board"]
        game.current_player = state["current_player"]
        game.move_history = state["move_history"]
        game.game_over = state["game_over"]
        game.winner = state["winner"]
        return game

    def display(self):
        """Return ASCII art representation of the board."""
        lines = []
        lines.append(" 0 1 2 3 4 5 6")
        for row in self.board:
            line = "|"
            for cell in row:
                if cell == EMPTY:
                    line += " |"
                elif cell == PLAYER1:
                    line += "X|"
                elif cell == PLAYER2:
                    line += "O|"
            lines.append(line)
        lines.append("---------------")
        return "\n".join(lines)

if __name__ == "__main__":
    # Simple test
    game = ConnectFourGame()
    game.display()
    print("Game initialized.")
