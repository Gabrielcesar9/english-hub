import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";

const API_URL = process.env.REACT_APP_API_URL;

export default function Lesson({ lessonId, user, onComplete, onExit }) {
  const [lesson, setLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const audioRef = useRef(null);
  const successAudioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => setLesson(data))
      .catch(err => console.error(err));
  }, [lessonId]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showConfetti && successAudioRef.current && !muted) {
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.volume = 1;
      successAudioRef.current.play();
    }
  }, [showConfetti, muted]);

  if (!lesson) return <p>Loading lesson...</p>;

  const slide = lesson.slides[currentSlide];
  const options = slide.options;
  const correctIdx = options.indexOf(slide.correctAnswer);

  const playSound = () => {
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioRef.current.play();
    }
  };

  const checkAnswer = () => {
    if (userAnswer === slide.correctAnswer) {
      playSound();
      setShowResult(true);
      setTimeout(() => {
        if (currentSlide < lesson.slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
          setUserAnswer("");
          setSelected(null);
          setShowResult(false);
        } else {
          setShowConfetti(true);
          markLessonCompleted();
        }
      }, 600);
    } else {
      setShowResult(true);
      setTimeout(() => setShowResult(false), 500);
      setMistakes(mistakes + 1);
    }
  };

  const markLessonCompleted = async () => {
    await fetch(`${API_URL}/lessons/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId, lessonId, mistakes })
    });
  };

  return (
    <div className="lesson-view">
      <audio ref={audioRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={successAudioRef} src="/sounds/success.mp3" preload="auto" />
      {showConfetti ? (
        <>
          <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={350} recycle={false} />
          <div className="congrats-message">
            <h2>🎉 Parabéns! Você concluiu a lição! 🎉</h2>
            <button
              className="back-to-main-btn"
              onClick={onComplete}
            >
              Voltar para a página principal
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="exit-btn" onClick={onExit}>Exit Lesson</button>
          <button
            className="mute-btn"
            onClick={() => setMuted(m => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <h1>{lesson.title}</h1>
          <div className="quiz-question">
            <span>{slide.question}</span>
          </div>
          <p>{slide.content}</p>
          <div className="quiz-options">
            {options.map((option, idx) => (
              <div
                key={idx}
                className={`quiz-option${selected === idx ? ' selected' : ''}${showResult && userAnswer === slide.correctAnswer && idx === selected ? ' correct' : ''}${showResult && userAnswer !== slide.correctAnswer && idx === selected ? ' incorrect' : ''}`}
                onClick={() => {
                  if (!showResult) {
                    setSelected(idx);
                    setUserAnswer(option);
                  }
                }}
              >
                {option}
              </div>
            ))}
          </div>
          <button className="quiz-submit-btn" onClick={checkAnswer}>Submit</button>
        </>
      )}
    </div>
  );
}
