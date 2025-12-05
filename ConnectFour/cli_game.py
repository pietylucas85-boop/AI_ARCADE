
import os
import sys
import time
from rich.console import Console
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.table import Table
from rich.live import Live

from game_engine import ConnectFourGame, ROWS, COLS, EMPTY, PLAYER1, PLAYER2
from bot_ai import MinimaxAI

console = Console()

class ConnectFourCLI:
    def __init__(self):
        self.game = ConnectFourGame()
        self.ai = None # Will be set in menu
        self.player_symbol = "●"
        self.ai_symbol = "○"
        self.player_color = "red"
        self.ai_color = "yellow"

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_header(self):
        title = Text("CONNECT FOUR - AI ARENA", style="bold cyan")
        console.print(Panel(title, expand=False))

    def get_board_grid(self):
        table = Table(show_header=False, show_edge=True, box=None, padding=0)
        
        # Add column numbers
        header_row = []
        for c in range(COLS):
            header_row.append(Text(f" {c+1} ", style="bold white"))
        table.add_row(*header_row)

        for r in range(ROWS):
            row_cells = []
            for c in range(COLS):
                cell = self.game.board[r][c]
                if cell == EMPTY:
                    symbol = " · "
                    style = "dim white"
                elif cell == PLAYER1:
                    symbol = f" {self.player_symbol} "
                    style = self.player_color
                elif cell == PLAYER2:
                    symbol = f" {self.ai_symbol} "
                    style = self.ai_color
                row_cells.append(Text(symbol, style=style))
            table.add_row(*row_cells)
        
        return Panel(table, title="Game Board", border_style="blue")

    def main_menu(self):
        self.clear_screen()
        self.print_header()
        console.print("\n[1] Human vs AI (Easy)")
        console.print("[2] Human vs AI (Medium)")
        console.print("[3] Human vs AI (Hard)")
        console.print("[4] Human vs Human")
        console.print("[q] Quit\n")

        choice = console.input("[bold green]Select mode > [/]")
        
        if choice == '1':
            self.ai = MinimaxAI(PLAYER2, difficulty='easy')
            self.game_loop(vs_ai=True)
        elif choice == '2':
            self.ai = MinimaxAI(PLAYER2, difficulty='medium')
            self.game_loop(vs_ai=True)
        elif choice == '3':
            self.ai = MinimaxAI(PLAYER2, difficulty='hard')
            self.game_loop(vs_ai=True)
        elif choice == '4':
            self.game_loop(vs_ai=False)
        elif choice.lower() == 'q':
            sys.exit()
        else:
            self.main_menu()

    def game_loop(self, vs_ai=True):
        self.game = ConnectFourGame()
        
        while not self.game.game_over:
            self.clear_screen()
            self.print_header()
            console.print(self.get_board_grid())
            
            # Status line
            current_p = self.game.current_player
            p_name = "Player 1 (You)" if current_p == PLAYER1 else ("AI" if vs_ai else "Player 2")
            color = self.player_color if current_p == PLAYER1 else self.ai_color
            
            console.print(f"\nTurn: [{color}]{p_name}[/]")

            if vs_ai and current_p == PLAYER2:
                # AI Turn
                with console.status("[bold yellow]Thinking...[/]", spinner="dots"):
                    best_col, score = self.ai.get_best_move(self.game.board, self.game.get_valid_moves())
                    # Simulate thinking time for effect if too fast
                    time.sleep(0.5) 
                
                try:
                    self.game.drop_piece(best_col)
                    last_col = best_col
                except Exception as e:
                    console.print(f"[red]AI Error: {e}[/]")
                    break
            else:
                # Human Turn
                while True:
                    try:
                        col_str = console.input("Enter column (1-7): ")
                        if col_str.lower() in ['q', 'exit']:
                            sys.exit()
                        
                        col = int(col_str) - 1
                        if self.game.is_valid_move(col):
                            self.game.drop_piece(col)
                            break
                        else:
                            console.print("[red]Invalid move or column full![/]")
                    except ValueError:
                        console.print("[red]Please enter a number 1-7[/]")

        # Game Over
        self.clear_screen()
        self.print_header()
        console.print(self.get_board_grid())
        
        if self.game.winner == 'draw':
            console.print("\n[bold white]GAME OVER: DRAW![/]", justify="center")
        else:
            winner_name = "Player 1" if self.game.winner == PLAYER1 else ("AI" if vs_ai else "Player 2")
            w_color = self.player_color if self.game.winner == PLAYER1 else self.ai_color
            console.print(Panel(Text(f"WINNER: {winner_name}!", style=f"bold {w_color}", justify="center"), style=f"{w_color}"))

        console.input("\nPress Enter to return to menu...")
        self.main_menu()

if __name__ == "__main__":
    try:
        cli = ConnectFourCLI()
        cli.main_menu()
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
        sys.exit()
