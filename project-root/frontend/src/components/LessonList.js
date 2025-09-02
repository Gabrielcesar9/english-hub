import { useEffect, useState } from "react";
import Lesson from "./Lesson";
import '../main.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function LessonList({ user, lessons, onUserUpdate }) {
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [openNotes, setOpenNotes] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(user.completedLessons || []);
  const [lessonMistakes, setLessonMistakes] = useState(user.lessonMistakes || []);

  useEffect(() => {
    fetch(`${API_URL}/lessons?username=${encodeURIComponent(user.username)}`)
      .then(res => res.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setLessons(sorted);
      })
      .catch(err => console.error(err));
  }, [user]);

  const refreshUserData = async () => {
    const res = await fetch(`${API_URL}/auth/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId })
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setCompletedLessons(updatedUser.completedLessons || []);
      setLessonMistakes(updatedUser.lessonMistakes || []);
      if (onUserUpdate) {
        onUserUpdate(updatedUser); // Notify App.js to update pie charts
      }
    }
  };

  const handleLessonComplete = async (lessonId) => {
    await refreshUserData();
    setSelectedLessonId(null);
  };

  const handleOpenNotes = lessonId => setOpenNotes(lessonId);
  const handleCloseNotes = () => setOpenNotes(null);

  const getMistakesForLesson = lessonId => {
    const record = lessonMistakes.find(m => String(m.lessonId) === String(lessonId));
    return record ? record.mistakes : 0;
  };

  const getAccuracyForLesson = lesson => {
    const mistakes = getMistakesForLesson(lesson._id);
    const slidesCount = lesson.slides ? lesson.slides.length : 0;
    if (slidesCount === 0) return "N/A";
    const accuracy = 1 - mistakes / (slidesCount);
    return `${Math.round(accuracy * 100)}%`;
  };

  const handleLessonExit = () => {
    // Example: go back to the main page or dashboard
    setSelectedLessonId(null); // or use your navigation logic
  };

  if (selectedLessonId) {
    return (
      <Lesson
        lessonId={selectedLessonId}
        user={user}
        onComplete={handleLessonComplete}
        onExit={handleLessonExit}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <h1 style={{ textAlign: "left" }}>Select a lesson:</h1>
      <br></br>
      <div className="lesson-list">
        {lessons.length === 0 ? (
          <p>Loading lessons...</p>
        ) : (
          lessons.map(lesson => {
            const isCompleted = completedLessons.includes(lesson._id);
            const accuracy = getAccuracyForLesson(lesson);
            return (
              <div key={lesson._id} className="lesson-item">
                <div className="lesson-thumbnail-title">{lesson.title}</div>
                <button
                  onClick={() => setSelectedLessonId(lesson._id)}
                  className={`lesson-thumbnail-btn${isCompleted ? " completed" : ""}`}
                >
                  <div
                    className="lesson-thumbnail-bg"
                    style={{
                      backgroundImage: lesson.thumb
                        ? `url('${lesson.thumb}')`
                        : `url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80')`
                    }}
                  />
                </button>
                {lesson.description && (
                  <p className="lesson-description">{lesson.description}</p>
                )}
                {lesson.notes && lesson.notes.length > 0 && (
                  <>
                    <button
                      className="lesson-notes-btn"
                      onClick={() => handleOpenNotes(lesson._id)}
                    >
                      Show Notes
                    </button>
                    {openNotes === lesson._id && (
                      <div className="lesson-notes-dialog">
                        <div className="lesson-notes-content">
                          <h3>Lesson Notes</h3>
                          <div>
                            {lesson.notes.map((note, idx) => (
                              <div key={idx} className="lesson-note">
                                <div dangerouslySetInnerHTML={{ __html: note }} />
                              </div>
                            ))}
                          </div>
                          <button
                            className="lesson-notes-close-btn"
                            onClick={handleCloseNotes}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {isCompleted && (
                  <p className="lesson-description" style={{ backgroundColor: "white", color: "#EA5B6F" }}>
                    <strong>Accuracy:</strong> {accuracy}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
