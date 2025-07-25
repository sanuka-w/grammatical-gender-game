import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [words, setWords] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [translation, setTranslation] = useState("-");
  const [showTranslation, setShowTranslation] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [keyLock, setKeyLock] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [hasTranslationField, setHasTranslationField] = useState(false);
  const [hasLevelField, setHasLevelField] = useState(false);
  const [currentlang, setCurrentlang] = useState("de");
  const [impossibleMode, setImpossibleMode] = useState(false);
  const [impossibleAvailable, setImpossibleAvailable] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [remaining, setRemaining] = useState(true);

  const principlearray = [
    {
      lang: "de",
      label: "Deutsch",
      genders: ["M", "F", "N"],
      articles: ["Der", "Die", "Das"],
      levels: ["A1", "A2", "B1", ">B1"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x"],
      femalekeys: ["r", "t", "y", "u", "f", "g", "h", "v", "b", "n"],
      neuterkeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"]
    },
    {
      lang: "fr",
      label: "Française",
      genders: ["M", "F"],
      articles: ["Le", "La"],
      levels: ["A1", "A2", "B1", ">B1"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x", "y", "h", "n"],
      femalekeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"]
    }
  ];

  const currentPrinciple = principlearray.find(p => p.lang === currentlang);

  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    async function checkLanguages() {
      const langs = await Promise.all(
        principlearray.map(async (p) => {
          const simpleFile = `/${p.lang.charAt(0).toUpperCase() + p.lang.slice(1)}_simple.json`;
          try {
            const res = await fetch(simpleFile, { method: "HEAD" });
            return res.ok ? p.lang : null;
          } catch {
            return null;
          }
        })
      );
      setAvailableLanguages(langs.filter(Boolean));
    }
    checkLanguages();
  }, []);

  useEffect(() => {
    async function checkImpossible() {
      const impossibleFile = `/${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_impossible.json`;
      try {
        const res = await fetch(impossibleFile, { method: "HEAD", cache: "no-store" });
        const contentType = res.headers.get("Content-Type") || "";
        const isRealFile = res.ok && !contentType.includes("text/html");
        setImpossibleAvailable(isRealFile);
        if (!isRealFile) setImpossibleMode(false);
      } catch {
        setImpossibleAvailable(false);
        setImpossibleMode(false);
      }
    }
    checkImpossible();
  }, [currentlang]);

  useEffect(() => {
    async function loadWords() {
      const file = impossibleMode
        ? `/${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_impossible.json`
        : `/${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_simple.json`;
      try {
        const res = await fetch(file);
        const data = await res.json();
        setWords(data);
        if (data.length > 0) {
          setHasTranslationField("translation" in data[0]);
          setHasLevelField("level" in data[0]);
        } else {
          setHasTranslationField(false);
          setHasLevelField(false);
        }
      } catch {
        // Impossible and/or Language wordlist not found
        setWords([]);
        setHasTranslationField(false);
        setHasLevelField(false);
      }
    }
    loadWords();
  }, [currentlang, impossibleMode]);

  useEffect(() => {
    if (words.length > 0) pickRandomWord();
  }, [words]);

  function pickRandomWord() {
    let filtered = words;
    if (selectedLevel !== "" && hasLevelField) {
      const levels = selectedLevel === "A1"
        ? ["A1"]
        : selectedLevel === "A2"
        ? ["A1", "A2"]
        : selectedLevel === "B1"
        ? ["A1", "A2", "B1"]
        : ["A1", "A2", "B1", ""];
      filtered = words.filter(w => levels.includes(w.level));
    }

    const remaining = filtered.filter(w => !usedWords.includes(w.Noun));
    if (remaining.length === 0) {
      setUsedWords([]);
      setGameOver(true);
      setShowRetry(true);
      setRemaining(false);
      return;
    }

    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentWord(next);

    if (hasTranslationField) {
      setTranslation(next.translation || "-");
    } else {
      fetchTranslation(next.Noun);
      setTranslation("-");
    }

    setFeedback(null);
    setShowRetry(false);
    setKeyLock(false);
    setShowTranslation(false);
  }

  async function fetchTranslation(word) {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${currentlang}|en`
      );
      const data = await res.json();
      setTranslation(data.responseData.translatedText || "-");
    } catch (err) {
      console.error(err);
      setTranslation("-");
    }
  }

  function handleChoice(gender) {
    if (!currentWord || keyLock) return;
    const correct = gender === currentWord.gender;
    if (correct && (remaining === true)) {
      setFeedback("correct");
      setScore(prev => prev + 5);
      setUsedWords(prev => [...prev, currentWord.Noun]);
      setTimeout(() => pickRandomWord(), 500);
    } else {
      if (remaining === false) {
        setGameOver(true);
        setShowRetry(true);
        return;
      }
      setFeedback("wrong");
      setShowRetry(true);
    }
    setKeyLock(true);
    setTimeout(() => setKeyLock(false), 500);
  }

  function handleRetry() {
    setScore(0);
    pickRandomWord();
    setGameOver(false);
    setUsedWords([]);
    setRemaining(true);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (keyLock || feedback === "wrong") {
        if (e.key.toLowerCase() === "enter" || e.key === " ") handleRetry();
        return;
      }
      const key = e.key.toLowerCase();
      if (showRetry && key === "enter") {
        handleRetry();
        return;
      }
      if (currentPrinciple.malekeys.includes(key)) handleChoice("M");
      else if (currentPrinciple.femalekeys.includes(key)) handleChoice("F");
      else if (currentPrinciple.neuterkeys && currentPrinciple.neuterkeys.includes(key)) handleChoice("N");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord, showRetry, keyLock, currentPrinciple]);

  return (
    <div className="container">
      {showRules && (
        <div className="instructions-overlay" onClick={() => setShowRules(false)}>
          <div className="instructions-box" onClick={e => e.stopPropagation()}>
            <h2>How to Play</h2>
            <p>Guess the gender of the shown noun.</p>
            <ul>
              {currentPrinciple?.malekeys && (
                <li>Left keys: <b>{currentPrinciple.articles[0]}</b></li>
              )}
              {currentPrinciple?.femalekeys && currentPrinciple.articles.length === 3 && (
                <li>Middle keys: <b>{currentPrinciple.articles[1]}</b></li>
              )}
              {currentPrinciple?.neuterkeys && currentPrinciple.articles.length === 3 && (
                <li>Right keys: <b>{currentPrinciple.articles[2]}</b></li>
              )}

              {/* fallback for 2-gender languages */}
              {currentPrinciple?.articles.length === 2 && (
                <li>Right keys: <b>{currentPrinciple.articles[1]}</b></li>
              )}
              <li>Restart: SPACE or ENTER</li>
            </ul>

            {impossibleAvailable && (
              <div className="impossible-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={impossibleMode}
                    onChange={e => setImpossibleMode(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">Impossible mode</span>
              </div>
            )}

            <button onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="top-bar">
        <div className="help-button" onClick={() => setShowRules(true)}>?</div>
        {/* Level selector */}
        {hasLevelField && (
          <select
            className="level-select"
            value={selectedLevel}
            onChange={e => {
              setSelectedLevel(e.target.value);
              setScore(0);
            }}
          >
            {currentPrinciple.levels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}

        {/* Language selector - only show availableLanguages */}
        <select
          className="level-select"
          id="lang-select"
          value={currentlang}
          onChange={e => {
            setCurrentlang(e.target.value);
            setImpossibleMode(false);
            handleRetry();
          }}
        >
          {principlearray
            .filter(p => availableLanguages.includes(p.lang))
            .map(p => (
              <option key={p.lang} value={p.lang}>
                {p.label}
              </option>
            ))}
        </select>
      </div>
      <h1 className="title">Grammatical Gender Game</h1>
      {currentWord && (
        <>
          {!gameOver ? (
            <>
              <h2 className="score">Score: {score}</h2>
              <h1 className={`word ${feedback}`}>{splitLongWord(currentWord.Noun)}</h1>  
            </>
          ) : (
            <>
              < br/>< br/><br />
              <h1 className="game-over">Game Over! Final Score: {score}</h1>
              < br/>< br/><br />
            </>
          )
          }
          {!gameOver && (
            <>
              <div id="translation-container" onClick={() => setShowTranslation(true)}>
              <h3 className="translation">{showTranslation ? translation : "?"}</h3>
            </div>
            <div className="buttons">
              {currentPrinciple.genders.map((gender, i) => (
                <button
                  key={gender}
                  className={`btn ${feedback && currentWord.gender === gender
                    ? "correct"
                    : feedback === "wrong" && currentWord.gender !== gender
                    ? "wrong"
                    : ""}`}
                  onClick={() => handleChoice(gender)}
                  disabled={showRetry}
                >
                  {currentPrinciple.articles[i]}
                </button>
              ))}
            </div>
            </>
          )}
          {showRetry && <button className="retry-btn" onClick={handleRetry}>Restart</button>}
        </>
      )}
    </div>
  );
}

function splitLongWord(word) {
  if (word.length <= 21) return word;
  const mid = Math.floor(word.length / 2);
  return <>{word.slice(0, mid)}<br />-{word.slice(mid)}</>;
}

export default App;