 /* Grammatical Gender Game - A web app to help language learners practice grammatical genders interactively.
 Copyright (C) 2025  Sanuka Weerabaddana 

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>. */

import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [words, setWords] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [selectedGender, setSelectedGender] = useState(null);
  const [translation, setTranslation] = useState("-");
  const [showTranslation, setShowTranslation] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [keyLock, setKeyLock] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [hasLevelField, setHasLevelField] = useState(false);
  const [currentlang, setCurrentlang] = useState("de");
  const [impossibleMode, setImpossibleMode] = useState(false);
  const [impossibleAvailable, setImpossibleAvailable] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState("survival");
  const timeLimit = 60;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lives, setLives] = useState(3);


  const principlearray = [
    {
      lang: "de",
      label: "Deutsch",
      genders: ["M", "F", "N"],
      articles: ["Der", "Die", "Das"],
      levels: ["A1", "A2", "B1", ">B1"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x"],
      femalekeys: ["r", "t", "y", "u", "f", "g", "h", "v", "b", "n"],
      neuterkeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"],
      wordlists: "Dictionary from <a href='https://freedict.org/downloads/' target='_blank'>FreeDict</a> and genders from <a href='https://vocabeo.com/browse' target='_blank'>Vocabeo</a>"
    },
    {
      lang: "el",
      label: "Ελληνικά",
      genders: ["M", "F", "N"],
      articles: ["ὁ/οἱ", "ἡ/αἱ", "τό/τά"],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x"],
      femalekeys: ["r", "t", "y", "u", "f", "g", "h", "v", "b", "n"],
      neuterkeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"],
      wordlists: "Dictionary from <a href='https://freedict.org/downloads/' target='_blank'>FreeDict</a> and genders from <a href='https://en.wiktionary.org/wiki/Category:Greek_nouns_by_gender' target='_blank'>Wikitionary</a>"
    },
    {
      lang: "fr",
      label: "Française",
      genders: ["M", "F"],
      articles: ["Le", "La"],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x", "y", "h", "n"],
      femalekeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"],
      wordlists: "Dictionary from <a href='https://freedict.org/downloads/' target='_blank'>FreeDict</a>, <a href='https://cental.uclouvain.be/flelex/' target='_blank'>FLELex</a> and <a href='https://www.lexique.org/' target='_blank'>Lexique</a>"
    },
    {
      lang: "ru",
      label: "Русский",
      genders: ["M", "F", "N"],
      articles: ["мужской", "женский", "средний"],
      levels: ["A1", "A2", "B1", "B2", ">B2"],
      malekeys: ["q", "w", "e", "a", "s", "d", "z", "x"],
      femalekeys: ["r", "t", "y", "u", "f", "g", "h", "v", "b", "n"],
      neuterkeys: ["u", "i", "o", "p", "[", "]", "j", "k", "l", ";", "'", ",", ".", "m"],
      wordlists: "Dictionary from <a href='https://freedict.org/downloads/' target='_blank'>FreeDict</a> and <a href='https://github.com/Digital-Pushkin-Lab/RuAdapt_Word_Lists' target='_blank'>RuAdapt - GitHub</a>"
    }
  ];

  const currentPrinciple = principlearray.find(p => p.lang === currentlang);

  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    async function checkLanguages() {
      const langs = await Promise.all(
        principlearray.map(async (p) => {
          const simpleFile = `${import.meta.env.BASE_URL}${p.lang.charAt(0).toUpperCase() + p.lang.slice(1)}_simple.json`;
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
      const impossibleFile = `${import.meta.env.BASE_URL}${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_impossible.json`;
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
        ? `${import.meta.env.BASE_URL}${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_impossible.json`
        : `${import.meta.env.BASE_URL}${currentlang.charAt(0).toUpperCase() + currentlang.slice(1)}_simple.json`;
      try {
        const res = await fetch(file);
        const data = await res.json();
        setWords(data);
        if (data.length > 0 && "level" in data[0]) {
          setHasLevelField(true);
        } else {
          setHasLevelField(false);
        }
      } catch {
        setWords([]);
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
        : selectedLevel === "B2"
        ? ["A1", "A2", "B1", "B2"]
        : selectedLevel === "C1"
        ? ["A1", "A2", "B1", "B2", "C1"]
        : ["A1", "A2", "B1", "B2", "C1", "C2", ""];
      filtered = words.filter(w => levels.includes(w.level));
    }

    const remainingWords = filtered.filter(w => !usedWords.includes(w.Noun));

    if (remainingWords.length === 0) {
      setUsedWords([]);
      setGameOver(true);
      setShowRetry(true);
      setSelectedGender(null);
      return;
    }

    const next = remainingWords[Math.floor(Math.random() * remainingWords.length)];

    setCurrentWord(next);
    if (!next.translation) {
      fetchTranslation(next.Noun);
    } else {
      setTranslation(next.translation);
    }

    setFeedback(null);
    setSelectedGender(null);
    setKeyLock(false);
    setShowTranslation(false);
  }

  async function fetchTranslation(word) {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${currentlang}|en`
      );
      const data = await res.json();

      let translation = data.responseData?.translatedText || "-";

      if (
        translation.toLowerCase().includes(word.toLowerCase())
      ) {
        const betterMatch = data.matches?.find(
          m => !m.translation.toLowerCase().includes(word.toLowerCase())
        );
        if (betterMatch) {
          translation = betterMatch.translation;
        }
      }

      setTranslation(translation);
    } catch (err) {
      console.log("No translation found, please research")
      setTranslation("-");
    }
  }

  function handleChoice(gender) {
  if (!currentWord || keyLock || gameOver) return;
  const correct = gender === currentWord.gender;

  if (gameMode === "survival") {
    if (correct) {
      setFeedback("correct");
      setScore(prev => prev + 5);
      setUsedWords(prev => [...prev, currentWord.Noun]);
      setTranslation("-");
      setKeyLock(true);
      setTimeout(() => {
        pickRandomWord();
      }, 500);
    } else {
      setFeedback("wrong");
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives == 0) {
          setGameOver(true);
          setShowRetry(true);
        } else {
          setUsedWords(prev => [...prev, currentWord.Noun]);
          setTranslation("-");
          setKeyLock(true);
          setTimeout(() => {
            pickRandomWord();
          }, 1000);
        }
        return newLives;
      });
      setTimeout(() => {
        if (gameOver) return;
      }, 1000);
    }
  } else if (gameMode === "timed") {
    if (correct) {
      setFeedback("correct");
      setScore(prev => prev + 5);
      setUsedWords(prev => [...prev, currentWord.Noun]);
      setTranslation("-");
      setKeyLock(true);
      setTimeout(() => {
        pickRandomWord();
      }, 500);
    } else {
      setFeedback("wrong");
      setUsedWords(prev => [...prev, currentWord.Noun]);
      setTranslation("-");
      setKeyLock(true);
      setTimeout(() => {
        if (gameOver){
          setShowRetry(true)
        }else{
          pickRandomWord();
        }
      }, 1000);
    }
  }
}

  useEffect(() => {
    if (gameMode !== "timed" || gameOver) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      setShowRetry(true);
    }

    const timerId = setTimeout(() => {
      if (gameOver) {
        setTimeLeft(0);
      } else {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, gameMode, gameOver]);


  function handleRetry() {
    setScore(0);
    setUsedWords([]);
    setGameOver(false);
    setShowRetry(false);
    setFeedback(null);
    setKeyLock(false);

    if (gameMode === "timed") {
      setTimeLeft(timeLimit);
    } else {
      setLives(3);
    }
    pickRandomWord();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key.toLowerCase();

      if (!keyLock) {
        if (showRetry && key === "enter") {
          handleRetry();
        } else  if (key === " " && showRetry) {
          handleRetry();
        } else if (currentPrinciple.malekeys.includes(key)) {
            handleChoice("M");
            setSelectedGender("M");
        } else if (currentPrinciple.femalekeys.includes(key)) {
           handleChoice("F");
           setSelectedGender("F");
        } else if (currentPrinciple.neuterkeys.includes(key)) {
           handleChoice("N");
           setSelectedGender("N");
        } else {
          return;
        }
      } else {
        return;
      }
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
                    onChange={e => {setImpossibleMode(e.target.checked); handleRetry(); setShowRules(false);}}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">Impossible mode</span>
              </div>
            )}

            <p dangerouslySetInnerHTML={{ __html: currentPrinciple ? currentPrinciple.wordlists : "" }} />
            <p>Grateful towards <a href="https://mymemory.translated.net/">MyMemory API</a></p>

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
              handleRetry();
            }}
          >
            {currentPrinciple.levels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}
        <div className="mode-select">
          <input
              type="radio"
              name="gameMode"
              value="survival"
              id="survival"
              checked={gameMode === "survival"}
              onChange={() => {
                setGameMode("survival");
                setGameOver(false);
                setShowRetry(false);
                setLives(3);
                setTimeLeft(timeLimit);
                pickRandomWord();
              }}
            />
          <label htmlFor="survival">
            Survival Mode (3 lives)
          </label>
          <input
            type="radio"
            name="gameMode"
            value="timed"
            id="timedmode"
            checked={gameMode === "timed"}
            onChange={() => {
              setGameMode("timed");
              setGameOver(false);
              setShowRetry(false);
              setTimeLeft(timeLimit);
              pickRandomWord();
              setScore(0);
            }}
          />
          <label htmlFor="timedmode">
            Timed Mode ({timeLimit} seconds)
          </label>
        </div>
        <select
          className="level-select"
          id="lang-select"
          value={currentlang}
          onChange={e => {
            setCurrentlang(e.target.value);
            setImpossibleMode(false);
            setSelectedLevel("A1");
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
              {gameMode === "timed" ? (
                <h2 className="score">
                  Accuracy: {usedWords.length === 0 ? 0 : Math.round((score / (usedWords.length * 5)) * 100)}%
                </h2>
              ) : (
                <h2 className="score">Score: {score}</h2>
              )}
              {gameMode === "survival" && (
                <div className="hearts">
                  {[...Array(3)].map((_, i) => (
                    <span key={i}>
                      {i < lives ? "❤️" : "🖤"}
                    </span>
                  ))}
                </div>
              )}

              {gameMode === "timed" && (
                <div className="timer">⏱️ Time left: {timeLeft}s</div>
              )}

              <h1 className={`word ${feedback}`}>{splitLongWord(currentWord.Noun)}</h1>
            </>
          ) : (
            <>
              < br/>< br/><br />
              {gameMode === "timed" && (
                <h1 className="game-over">
                  Game Over!<br></br><br></br>
                  Accuracy: {usedWords.length === 0 ? 0 : Math.round((score / (usedWords.length * 5)) * 100)}%<br></br>
                  Number of words: {usedWords.length}
                 </h1>
              )}
              {gameMode === "survival" && (
                <h1 className="game-over">Game Over! Score: {score}</h1>
              )}
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
                    : selectedGender === gender ?
                    "wrong"
                    : ""}`}
                  onClick={() => {
                    handleChoice(gender);
                    setSelectedGender(i === 0 ? "M" : i === 1 ? "F" : "N")
                  }}
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
  if (!word || typeof word !== 'string') return '';
  const mid = Math.floor(word.length / 2);
  if (window.innerWidth < 768 && word.length >= 15) {
    return <>{word.slice(0, mid)}<br />-{word.slice(mid)}</>;
  } else {
    if (word.length <= 21) return word;
    return <>{word.slice(0, mid)}<br />-{word.slice(mid)}</>;
  }
}

export default App;