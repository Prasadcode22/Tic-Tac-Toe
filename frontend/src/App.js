import React, { useState } from "react";

const EMPTY = " ";
const HUMAN = "X";
const AI = "O";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [message, setMessage] = useState("Your turn!");
  const [gameOver, setGameOver] = useState(false);
  const [winningLine, setWinningLine] = useState([]);
  const [difficulty, setDifficulty] = useState("hard");
  const [bgColor, setBgColor] = useState(
    "bg-gradient-to-br from-teal-400 via-red-400 to-orange-400"
  );

  const checkWinner = (board, player) => {
    for (const line of winningLines) {
      if (line.every((i) => board[i] === player)) {
        setWinningLine(line);
        return true;
      }
    }
    return false;
  };

  const isBoardFull = (board) => board.every((cell) => cell !== EMPTY);

  const handleClick = async (index) => {
    if (board[index] !== EMPTY || gameOver) return;

    let newBoard = [...board];
    newBoard[index] = HUMAN;
    setBoard(newBoard);

    if (checkWinner(newBoard, HUMAN)) {
      setMessage("You win! 🎉");
      setGameOver(true);
      setBgColor("bg-green-200");
      return;
    }
    if (isBoardFull(newBoard)) {
      setMessage("Draw!");
      setGameOver(true);
      setBgColor("bg-yellow-200");
      return;
    }

    setMessage("AI thinking...");

    try {
      const res = await fetch("http://localhost:5000/ai-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: newBoard, difficulty }),
      });
      const data = await res.json();

      if (data.move === null || data.move === undefined) {
        setMessage("Draw!");
        setGameOver(true);
        setBgColor("bg-yellow-200");
        return;
      }

      newBoard[data.move] = AI;
      setBoard(newBoard);

      if (checkWinner(newBoard, AI)) {
        setMessage("AI wins! 😢");
        setGameOver(true);
        setBgColor("bg-red-200");
      } else if (isBoardFull(newBoard)) {
        setMessage("Draw!");
        setGameOver(true);
        setBgColor("bg-yellow-200");
      } else {
        setMessage("Your turn!");
        setBgColor("bg-gradient-to-br from-teal-400 via-red-400 to-orange-400");
      }
    } catch (err) {
      setMessage("Error communicating with AI");
      console.error(err);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(EMPTY));
    setMessage("Your turn!");
    setGameOver(false);
    setWinningLine([]);
    setBgColor("bg-gradient-to-br from-teal-400 via-red-400 to-orange-400");
  };

  const difficultyOpacity = {
    low: 0.4,
    medium: 0.7,
    hard: 1,
  };

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center p-4 ${bgColor} transition-colors duration-700`}
    >
      {/* Soft cloud background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-teal-300 via-red-300 to-orange-300 opacity-30 blur-3xl"></div>

      {/* Main container with smooth gradient background */}
      <div className="max-w-md w-full p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-3xl shadow-2xl select-none font-sans text-center border border-gray-200">
        <h1
          className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text
          bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
          drop-shadow-lg"
        >
          Tikki Tacca
        </h1>

        <div className="mb-6 w-full max-w-xs mx-auto select-none">
          <label
            htmlFor="difficultySlider"
            className="block text-lg font-semibold text-gray-800 mb-2 text-center
            underline decoration-pink-400 decoration-2 underline-offset-4"
          >
            Difficulty:{" "}
            <span className="font-bold text-purple-700">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </label>

          <input
            id="difficultySlider"
            type="range"
            min={0}
            max={2}
            step={1}
            value={["low", "medium", "hard"].indexOf(difficulty)}
            onChange={(e) =>
              setDifficulty(["low", "medium", "hard"][e.target.value])
            }
            disabled={gameOver === false && board.some((c) => c !== EMPTY)}
            className="w-full h-3 rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition"
            style={{
              background: `linear-gradient(
                to right,
                rgba(139, 92, 246, ${difficultyOpacity[difficulty]}),
                rgba(139, 92, 246, ${difficultyOpacity[difficulty]})
              )`,
            }}
          />

          <div className="flex justify-between mt-2 text-sm font-semibold text-gray-600 px-1 select-none">
            <span className={difficulty === "low" ? "text-purple-700" : ""}>
              Low
            </span>
            <span
              className={difficulty === "medium" ? "text-purple-700" : ""}
            >
              Medium
            </span>
            <span className={difficulty === "hard" ? "text-purple-700" : ""}>
              Hard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 grid-rows-3 gap-5 bg-gray-100 p-6 rounded-2xl shadow-inner">
          {board.map((cell, i) => {
            const isWinningCell = winningLine.includes(i);

            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={gameOver || cell !== EMPTY}
                className={`aspect-square w-full rounded-3xl border-2 transition
                  ${
                    isWinningCell
                      ? "bg-green-200 border-green-400 shadow-[0_0_15px_4px_rgba(34,197,94,0.5)]"
                      : "bg-white border-gray-300 hover:bg-blue-50"
                  }
                  flex items-center justify-center
                  text-6xl font-bold
                  ${
                    cell === HUMAN
                      ? "text-blue-600"
                      : cell === AI
                      ? "text-red-500"
                      : "text-transparent"
                  }
                  disabled:cursor-not-allowed disabled:hover:bg-white
                `}
              >
                {cell}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-xl text-gray-700 min-h-[1.5rem]">{message}</p>

        <button
          onClick={resetGame}
          className="mt-6 px-10 py-3 rounded-3xl
          bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700
          text-white font-extrabold shadow-lg
          hover:shadow-[0_0_15px_3px_rgba(139,92,246,0.7)]
          active:scale-95 transition-transform duration-200"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
