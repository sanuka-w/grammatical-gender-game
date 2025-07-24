import { useEffect, useState } from "react";
import "./App.css";

// Helper function: splits long words
function splitLongWord(word) {
  if (word.length <= 21) return word;
  const wordlength = word.length;
  const firstPart = word.slice(0, wordlength/2);
  const secondPart = "-" + word.slice(wordlength/2);
  return (
    <>
      {firstPart}
      <br />
      {secondPart}
    </>
  );
}

function App() {
  const [words, setWords] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [translation, setTranslation] = useState("");
  const [translationold, setTranslationOld] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [keyLock, setKeyLock] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [originalwordlist, setOriginalwordlist] = useState(false);

  useEffect(() => {
    if (originalwordlist) {
      fetch("/german_nouns_output.json")
      .then(res => res.json())
      .then(setWords);
    } else {
    fetch("/words.json")
      .then(res => res.json())
      .then(setWords);
    }
  }, [originalwordlist]);

  useEffect(() => {
    if (words.length > 0) pickRandomWord();
  }, [words]);

  function pickRandomWord() {
  let filtered = words;

  if (selectedLevel !== "" && originalwordlist === false) {
    const levels = selectedLevel === "A1"
      ? ["A1"]
      : selectedLevel === "A2"
      ? ["A1", "A2"]
      : selectedLevel === "B1"
      ? ["A1", "A2", "B1"]
      : ["A1", "A2", "B1", ""];

    filtered = words.filter(w => levels.includes(w.level));
  }

  const remaining = filtered.filter(w => !usedWords.includes(w.germanNoun));

  if (remaining.length === 0) {
    setUsedWords([]);
    return pickRandomWord();
  }

  const next = remaining[Math.floor(Math.random() * remaining.length)];
  setCurrentWord(next);
  if (originalwordlist) {
    fetchTranslation(next.germanNoun);
    setTranslation("-"); // show dash until fetch finishes
  } else {
    setTranslation(next.translation || "-");
  }
  setFeedback(null);
  setShowRetry(false);
  setKeyLock(false);
  setShowTranslation(false);
}

async function fetchTranslation(word) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=de|en`
    );
    const data = await res.json();
    setTranslationOld(data.responseData.translatedText || "-");
  } catch (err) {
    console.error(err);
    setTranslationOld("-");
  }
}

  function handleChoice(article) {
    if (!currentWord || keyLock) return;

    const correct = article === currentWord.gender;
    if (correct) {
      setFeedback("correct");
      setTranslation("");
      setTranslationOld("");
      setScore(prev => prev + 5);
      setUsedWords(prev => [...prev, currentWord.germanNoun]);
      setKeyLock(true);
      setTimeout(() => {
        pickRandomWord();
      }, 500);
    } else {
      setFeedback("wrong");
      setShowRetry(true);
      setKeyLock(false);
    }

    setKeyLock(true);
    setTimeout(() => setKeyLock(false), 100);
  }

  function handleRetry() {
    setScore(0);
    pickRandomWord();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (keyLock || feedback=="wrong") {
        if (e.key.toLowerCase() === "enter" || e.key.toLowerCase() === " ") {
          handleRetry();
        } else {
          return;
        }
      };
      const key = e.key.toLowerCase();

      if (showRetry && key === "enter") {
        handleRetry();
        return;
      }

      if (["q", "w", "e", "a", "s", "d", "z", "x"].includes(key)) {
        handleChoice("der");
      } else if (["r", "t", "y", "u", "f", "g", "h", "v", "b", "n"].includes(key)) {
        handleChoice("die");
      } else if (["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"].includes(key)) {
        handleChoice("das");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord, showRetry, keyLock]);

  return (
    <div className="container">
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-box" onClick={e => e.stopPropagation()}>
            <h2>How to Play</h2>
            <p>Guess the gender (Der, Die, Das) of the shown German noun.</p>
            <p>You can click the buttons or use the keyboard:</p>
            <ul>
              <li>Left keys (q, w, e, a, s, d, z, x, c): <b>Der</b></li>
              <li>Middle keys (r, t, y, u, f, g, h, v, b, n): <b>Die</b></li>
              <li>Right keys (u, i, o, p, j, k, l, m, etc.): <b>Das</b></li>
              <br />
              <li>Restart after losing (SPACE or ENTER)</li>
            </ul>
            <p>Wordlists by <a href="https://vocabeo.com/">Vocabeo</a> and <a href="https://github.com/Hanttone/der-die-das-game/blob/master/data/german_nouns_output.json">Hantonne@github</a></p>

            <p>Made to solve a real world frustration by Sanuka W.</p>
            <div className="impossible-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={originalwordlist}
                  onChange={e => setOriginalwordlist(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">Impossible mode</span>
            </div>
            <button onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="top-bar">
      <div className="help-button" onClick={() => setShowRules(true)}>?</div>
      <select
        className="level-select"
        value={selectedLevel}
        onChange={e => ( setSelectedLevel(e.target.value), setScore(0) )}
      >
        <option value=">B1">&gt;B1</option>
        <option value="B1">B1</option>
        <option value="A2">A2</option>
        <option value="A1">A1</option>
      </select>
    </div>
      <h1 className="title">German Gender Game</h1>
      <h2 className="score">Score: {score}</h2>
      {currentWord && (
        <>
          <h1 className={`word ${feedback}`}>
            {splitLongWord(currentWord.germanNoun)}
          </h1>
          <div id="translation-container" onClick={() => setShowTranslation(true)}>
            <h3 className="translation">
              {showTranslation ? (originalwordlist ? translationold : translation) : "?"}
            </h3>
          </div>
          <div className="buttons">
            {["der", "die", "das"].map(article => (
              <button
                key={article}
                className={`btn ${
                  feedback && currentWord.gender === article
                    ? "correct"
                    : feedback === "wrong" && article !== currentWord.gender
                    ? "wrong"
                    : ""
                }`}
                onClick={() => handleChoice(article)}
                disabled={showRetry}
              >
                {article.charAt(0).toUpperCase() + article.slice(1)}
              </button>
            ))}
          </div>
          {showRetry && (
            <button className="retry-btn" onClick={handleRetry}>
              Restart
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;