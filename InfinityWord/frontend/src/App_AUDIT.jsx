
import { useState, useEffect } from 'react';

const API_URL = "http://localhost:8002/api";

function App() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill(""));
  const [results, setResults] = useState(Array(6).fill(null)); // Array of result arrays ['correct', 'absent'...]
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [animateRow, setAnimateRow] = useState(-1);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    const res = await fetch(`${API_URL}/word`);
    const data = await res.json();
    setTargetWord(data.word);

    // Reset State
    setGuesses(Array(6).fill(""));
    setResults(Array(6).fill(null));
    setCurrentGuessIndex(0);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("");
  };

  const handleKey = (key) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const submitGuess = async () => {
    if (currentGuess.length !== 5) {
      showMessage("Not enough letters");
      shakeRow();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: currentGuess, target: targetWord })
      });
      const data = await res.json();

      if (data.invalid_word) {
        showMessage("Not in word list");
        shakeRow();
        return;
      }

      // Valid Guess - Update State
      const newResults = [...results];
      newResults[currentGuessIndex] = data.results;
      setResults(newResults);

      const newGuesses = [...guesses];
      newGuesses[currentGuessIndex] = currentGuess;
      setGuesses(newGuesses);

      // Check Win/Loss
      if (currentGuess === targetWord) {
        setGameOver(true);
        showMessage("Splendid!");
      } else if (currentGuessIndex === 5) {
        setGameOver(true);
        showMessage(`Word was: ${targetWord}`);
      } else {
        setCurrentGuessIndex(prev => prev + 1);
        setCurrentGuess("");
      }

    } catch (err) {
      console.error("API Error");
    }
  };

  const shakeRow = () => {
    setAnimateRow(currentGuessIndex);
    setTimeout(() => setAnimateRow(-1), 500);
  }

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => { if (!gameOver) setMessage("") }, 2000);
  }

  // Keyboard Listener
  useEffect(() => {
    const listener = (e) => {
      if (e.key === 'Enter') handleKey('ENTER');
      else if (e.key === 'Backspace') handleKey('BACKSPACE');
      else {
        const char = e.key.toUpperCase();
        if (char.length === 1 && char >= 'A' && char <= 'Z') handleKey(char);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [currentGuess, gameOver]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.menuIcon}>☰</div>
        <h1 style={styles.title}>INFINITY WORD</h1>
        <div style={styles.icons}>⚙️ 📊</div>
      </header>

      <div style={styles.gameArea}>
        {guesses.map((g, i) => {
          const isCurrent = i === currentGuessIndex;
          const displayWord = isCurrent ? currentGuess : g;
          const rowResult = results[i];

          return (
            <div
              key={i}
              style={styles.row}
              className={animateRow === i ? 'row-shake' : ''}
            >
              {[0, 1, 2, 3, 4].map(j => {
                const char = displayWord[j] || "";
                let cellStyle = styles.cell;
                let className = "";

                if (rowResult) {
                  className = "cell-reveal";
                  if (rowResult[j] === 'correct') cellStyle = { ...styles.cell, ...styles.correct };
                  else if (rowResult[j] === 'present') cellStyle = { ...styles.cell, ...styles.present };
                  else cellStyle = { ...styles.cell, ...styles.absent };
                } else if (char) {
                  cellStyle = { ...styles.cell, ...styles.filled };
                  className = "cell-fill";
                }

                return (
                  <div key={j} style={cellStyle} className={className}>
                    {char}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {message && <div style={styles.toast}>{message}</div>}

      {gameOver && (
        <button onClick={startNewGame} style={styles.playAgainBtn}>
          PLAY AGAIN
        </button>
      )}

      <Keyboard onKey={handleKey} usedKeys={{}} />
    </div>
  );
}

// Simple On-Screen Keyboard Component
function Keyboard({ onKey }) {
  const rows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "BACKSPACE"]
  ];

  return (
    <div style={styles.keyboard}>
      {rows.map((row, i) => (
        <div key={i} style={styles.keyRow}>
          {row.map(key => (
            <button
              key={key}
              style={key.length > 1 ? styles.keyBig : styles.key}
              onClick={() => onKey(key)}
            >
              {key === "BACKSPACE" ? "⌫" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh',
    maxWidth: '500px', margin: '0 auto', position: 'relative'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '0 20px', borderBottom: '1px solid #3a3a3c',
    height: '50px'
  },
  title: {
    fontSize: '2rem', fontWeight: 'bold', fontFamily: 'serif', margin: 0
  },
  gameArea: {
    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    gap: '5px', padding: '10px'
  },
  row: {
    display: 'flex', gap: '5px'
  },
  cell: {
    width: '52px', height: '52px', border: '2px solid #3a3a3c',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase',
    userSelect: 'none'
  },
  filled: { borderColor: '#565758' },
  correct: { backgroundColor: '#538d4e', borderColor: '#538d4e' }, // NYT Green
  present: { backgroundColor: '#b59f3b', borderColor: '#b59f3b' }, // NYT Yellow
  absent: { backgroundColor: '#3a3a3c', borderColor: '#3a3a3c' },

  keyboard: { width: '100%', padding: '0 8px 20px' },
  keyRow: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px' },
  key: {
    height: '58px', flex: 1, borderRadius: '4px', border: 'none',
    backgroundColor: '#818384', color: 'white', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '1.2rem'
  },
  keyBig: {
    height: '58px', flex: 1.5, borderRadius: '4px', border: 'none',
    backgroundColor: '#818384', color: 'white', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '0.8rem'
  },
  toast: {
    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: 'white', color: 'black', padding: '15px 20px',
    borderRadius: '5px', fontWeight: 'bold', zIndex: 100
  },
  playAgainBtn: {
    marginBottom: 20, padding: '15px 30px', fontSize: '1.2rem', fontWeight: 'bold',
    backgroundColor: '#538d4e', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer'
  }
};

export default App;
