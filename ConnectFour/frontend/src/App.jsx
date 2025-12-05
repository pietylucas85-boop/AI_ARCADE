
import { useState, useEffect } from 'react';

const API_URL = "http://localhost:8001/api";

function App() {
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [message, setMessage] = useState("Welcome to AI Connect Four");
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");

  const startNewGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/games/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1_type: "human",
          player2_type: "bot",
          difficulty: difficulty
        }),
      });
      const data = await res.json();
      setGameId(data.game_id);
      setGameState(data);
      setMessage("Game Started! You are Red (Player 1).");
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleColumnClick = async (colIndex) => {
    if (!gameId || loading || gameState?.game_over) return;

    // Optimistic UI update could go here, but let's sync with server for safety
    try {
      // Human Move
      const res = await fetch(`${API_URL}/games/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column: colIndex, player: 1 }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail); // Simple error feedback
        return;
      }

      const data = await res.json();
      setGameState(data);

      if (data.game_over) {
        setMessage(data.winner === 1 ? "YOU WIN!" : "GAME OVER");
        return;
      }

      setMessage("AI is thinking...");
      setLoading(true);

      // Bot Move
      // Small delay for visual pacing
      setTimeout(async () => {
        const botRes = await fetch(`${API_URL}/games/${gameId}/bot-move`);
        const botData = await botRes.json();
        setGameState(prev => ({
          ...prev,
          board: botData.board,
          current_player: 1, // Back to human
          game_over: botData.game_over,
          winner: botData.winner
        }));

        if (botData.game_over) {
          setMessage(botData.winner === 2 ? "AI WINS! " + botData.reasoning : "DRAW");
        } else {
          setMessage(`AI played Col ${botData.column + 1}: "${botData.reasoning}"`);
        }
        setLoading(false);
      }, 500);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!gameState && !gameId) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>SPACE <span style={{ color: '#00d4ff' }}>CONNECT</span></h1>
        <div style={styles.menu}>
          <p>Select Difficulty:</p>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={styles.select}
          >
            <option value="easy">Easy (Pushover)</option>
            <option value="medium">Medium (Casual)</option>
            <option value="hard">Hard (Grok Mode)</option>
          </select>
          <button onClick={startNewGame} style={styles.button}>START GAME</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{message}</h2>
        <div style={styles.controls}>
          <button onClick={startNewGame} style={styles.smallBtn}>Reset</button>
          <span style={{ marginLeft: 20 }}>Difficulty: {difficulty.toUpperCase()}</span>
        </div>
      </div>

      <div style={styles.board}>
        {gameState.board.map((row, rIndex) => (
          <div key={rIndex} style={styles.row}>
            {row.map((cell, cIndex) => (
              <div
                key={cIndex}
                style={{
                  ...styles.cell,
                  cursor: gameState.game_over ? 'default' : 'pointer'
                }}
                onClick={() => handleColumnClick(cIndex)}
              >
                {/* Empty circle slot mask */}
                <div style={styles.slot}></div>

                {/* The Piece */}
                {cell !== 0 && (
                  <div
                    className="piece-drop"
                    style={{
                      ...styles.piece,
                      backgroundColor: cell === 1 ? '#ff4136' : '#ffdc00', // Red vs Yellow
                      boxShadow: cell === 1 ? '0 0 10px #ff4136' : '0 0 10px #ffdc00'
                    }}></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {loading && !gameState.game_over && <div style={styles.loading}>Thinking...</div>}

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: '"SF Pro Display", sans-serif',
  },
  title: {
    fontSize: '4rem',
    marginBottom: '2rem',
    letterSpacing: '5px'
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    padding: '40px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)'
  },
  select: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555'
  },
  button: {
    padding: '15px 40px',
    fontSize: '1.5rem',
    background: 'linear-gradient(45deg, #00d4ff, #005bea)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: 20,
    transition: 'transform 0.2s',
  },
  board: {
    backgroundColor: '#005bea', // Classic Blue Board
    padding: '15px',
    borderRadius: '15px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    border: '4px solid #0044aa'
  },
  row: {
    display: 'flex',
    gap: 10
  },
  cell: {
    width: 60,
    height: 60,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  slot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#005bea',
    borderRadius: '50%',
    zIndex: 2,
    // Using a mask to punch a hole would be better, but z-ordering works simpler here
    // Actually, physically in Connect 4 the board is in front. 
    // Simplified: Just draw blue rounded square with hole?
    // Let's stick to simple CSS: Blue background with circles.
    // The cell is the hole.
    background: 'radial-gradient(transparent 60%, #0044aa 61%)',
    pointerEvents: 'none'
  },
  piece: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    zIndex: 1 // Behind the slot mask? No, mask covers corners.
  },
  header: {
    marginBottom: 30,
    textAlign: 'center'
  },
  smallBtn: {
    padding: '5px 15px',
    background: '#444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  loading: {
    marginTop: 20,
    color: '#00d4ff',
    animation: 'pulse 1s infinite'
  }
};

export default App;
