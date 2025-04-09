import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, Sun as Running } from 'lucide-react';

type GameState = 'ready' | 'playing' | 'gameOver';

function App() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [path, setPath] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const visibleLettersBeforeCurrent = 0;

  // Generate random letters
  const generateLetters = useCallback((count: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: count }, () => letters[Math.floor(Math.random() * letters.length)]);
  }, []);

  // Extend the path when needed
  const extendPath = useCallback(() => {
    setPath(currentPath => [...currentPath, ...generateLetters(20)]);
  }, [generateLetters]);

  // Start new game
  const startGame = useCallback(() => {
    const initialPath = generateLetters(30);
    setPath(initialPath);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(3);
    setGameState('playing');
    window.focus();
  }, [generateLetters]);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const pressedKey = e.key.toUpperCase();
    if (pressedKey === path[currentIndex]) {
      setCurrentIndex(prev => {
        if (prev >= path.length - 20) {
          extendPath();
        }
        return prev + 1;
      });
      setScore(prev => prev + 100);
      setTimeLeft(3);
    }
  }, [gameState, path, currentIndex, extendPath]);

  // Set up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setGameState('gameOver');
          setHighScore(current => Math.max(current, score));
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, score]);

  // Clean up old letters
  useEffect(() => {
    if (currentIndex > visibleLettersBeforeCurrent * 2) {
      setPath(current => current.slice(currentIndex - visibleLettersBeforeCurrent));
      setCurrentIndex(visibleLettersBeforeCurrent);
    }
  }, [currentIndex, visibleLettersBeforeCurrent]);

  // Calculate visible path
  const visiblePath = path.slice(
    Math.max(0, currentIndex - visibleLettersBeforeCurrent),
    currentIndex + 15
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Keyboard className="w-8 h-8" />
        <h1 className="text-4xl font-bold">Infinite Type Runner</h1>
      </div>

      {gameState === 'ready' && (
        <div className="text-center">
          <p className="mb-4 text-xl">Type the letters to run forever!</p>
          {highScore > 0 && (
            <p className="mb-4 text-lg text-green-400">High Score: {highScore}</p>
          )}
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-lg font-semibold transition"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-3xl">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-xl">Score: {score}</div>
            <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${(timeLeft / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative">
            {/* Green highlight block */}
            <div 
              className="absolute top-8 z-0 transition-all duration-150 w-12 h-12 bg-green-500/20 rounded-lg"
              style={{ 
                transform: `translateX(${currentIndex * 48}px)`,
              }}
            />

            {/* Runner character */}
            <div 
              className="absolute -top-12 z-10 transition-transform duration-150"
              style={{ 
                transform: `translateX(${currentIndex * 48}px)`,
              }}
            >
              <div className={`
                animate-bounce
                bg-yellow-400 rounded-full p-2
                shadow-lg shadow-yellow-400/50
              `}>
                <Running className="w-8 h-8 text-gray-900" />
              </div>
            </div>

            {/* Letters */}
            <div className="flex gap-2 overflow-x-auto pb-4 w-full pt-8">
              {visiblePath.map((letter, index) => {
                const isPastLetter = index < currentIndex;
                const delay = index * 0.1;
                
                return (
                  <div
                    key={index}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-lg text-2xl font-bold
                      ${isPastLetter ? 'bg-gray-700 text-gray-400' : 'bg-gray-800'}
                      transition-all duration-200
                      animate-fall
                    `}
                    style={{
                      animation: `fall 1s ease-in-out infinite`,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Final Score: {score}</p>
          {score > highScore && (
            <p className="text-lg text-green-400 mb-4">New High Score!</p>
          )}
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-lg font-semibold transition"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;