
from game_engine import ConnectFourGame, PLAYER1, PLAYER2, ROWS, COLS
from bot_ai import MinimaxAI
import time
import sys

# Simulation Settings
# Player 1: Minimax AI (Medium)
# Player 2: Minimax AI (Hard)
# This tests if the Hard AI beats the Medium AI (expected behavior).

def run_simulation(matches=10):
    p1_wins = 0
    p2_wins = 0
    draws = 0
    
    # Initialize AIs
    ai1 = MinimaxAI(PLAYER1, difficulty='medium')
    ai2 = MinimaxAI(PLAYER2, difficulty='hard') # Should win more

    print(f"Running {matches} matches...")
    print(f"P1 (Medium) vs P2 (Hard)")
    print("-" * 30)

    start_time = time.time()

    for i in range(1, matches + 1):
        game = ConnectFourGame()
        game_moves = 0
        
        while not game.game_over:
            if game.current_player == PLAYER1:
                col, _ = ai1.get_best_move(game.board, game.get_valid_moves())
            else:
                col, _ = ai2.get_best_move(game.board, game.get_valid_moves())
            
            try:
                game.drop_piece(col)
                game_moves += 1
            except ValueError:
                print("CRITICAL: AI attempted invalid move!") # Should never happen
                break
        
        # Result
        if game.winner == PLAYER1:
            p1_wins += 1
            result = "P1 WIN"
        elif game.winner == PLAYER2:
            p2_wins += 1
            result = "P2 WIN"
        else:
            draws += 1
            result = "DRAW"
            
        print(f"Match {i}: {result} ({game_moves} moves)")

    total_time = time.time() - start_time
    print("-" * 30)
    print(f"RESULTS: P1: {p1_wins} | P2: {p2_wins} | Draws: {draws}")
    print(f"Total Time: {total_time:.2f}s")
    
    if p2_wins >= p1_wins:
        print("SUCCESS: Hard AI outperformed or matched Medium AI.")
    else:
        print("WARNING: Hard AI lost to Medium AI. Tuning needed.")

if __name__ == "__main__":
    run_simulation(5) # Run 5 quick matches for speed
