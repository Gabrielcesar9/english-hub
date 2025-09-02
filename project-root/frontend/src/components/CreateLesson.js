import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

function LessonPreview({ lesson, onLogout }) {
  if (!lesson) return null;

  return (
    <div className="lesson-preview-panel">
      <button
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          padding: "8px 18px",
          borderRadius: "8px",
          background: "#ea5b6f",
          color: "#fff",
          border: "none",
          fontWeight: "700",
          cursor: "pointer"
        }}
        onClick={onLogout}
      >
        Logout
      </button>
      <h2>{lesson.title}</h2>
      <p><strong>Description:</strong> {lesson.description}</p>
      {/* Thumbnail preview */}
      {lesson?.thumb && (
        <div style={{ margin: "16px 0", textAlign: "center" }}>
          <img
            src={lesson.thumb}
            alt="Lesson thumbnail preview"
            style={{
              maxWidth: "320px",
              maxHeight: "180px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(59,59,152,0.10)"
            }}
          />
          <div style={{ fontSize: "0.95rem", color: "#3B3B98", marginTop: "6px" }}>
            Thumbnail Preview
          </div>
        </div>
      )}
      <div>
        <strong>Date:</strong> {lesson.date?.$date || lesson.date}
      </div>
      <div>
        <strong>Assigned to:</strong> {lesson.for?.join(", ")}
      </div>
      <div>
        <h3>Slides / Questions</h3>
        <ol>
          {lesson.slides?.map((slide, idx) => (
            <li key={slide.id || idx} style={{ marginBottom: "18px" }}>
              <div><strong>Question:</strong> {slide.content}</div>
              <div><strong>Type:</strong> {slide.questionType}</div>
              <div>
                <strong>Options:</strong>
                <ul>
                  {slide.options?.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
              </div>
              <div><strong>Correct Answer:</strong> {slide.correctAnswer}</div>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3>Notes</h3>
        <ul>
          {lesson.notes?.map((note, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: note }} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CreateLesson({ setUser, user }) {
  const [jsonText, setJsonText] = useState("");
  const [lesson, setLesson] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch students list (for dropdown)
  useEffect(() => {
    fetch(`${API_URL}/auth/users?role=user`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => setStudents([]));
  }, []);

  // Parse JSON and update preview
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setLesson(parsed);
      setMessage("");
    } catch {
      setLesson(null);
      if (jsonText.trim()) setMessage("Invalid JSON format.");
    }
  }, [jsonText]);

  // Assign selected student and submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lesson || !selectedStudent) {
      setMessage("Paste a valid lesson and select a student.");
      return;
    }
    const lessonToSave = { ...lesson, for: [selectedStudent] };
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(lessonToSave)
    });

    window.alert("Lesson saved successfully!");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // <-- Add this line!
    navigate("/");
  };

  return (
    <div className="create-lesson-page">
      <div className="create-lesson-paste-panel">
        <button
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "8px 18px",
            borderRadius: "8px",
            background: "#ea5b6f",
            color: "#fff",
            border: "none",
            fontWeight: "700",
            cursor: "pointer"
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
        <h2>Paste Lesson JSON</h2>
        <textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          rows={10}
          cols={60}
          placeholder="Paste MongoDB lesson document here..."
          style={{ fontFamily: "monospace", fontSize: "1rem", marginBottom: "16px" }}
        />
        {lesson && (
          <LessonPreview lesson={lesson} onLogout={handleLogout} />
        )}
      </div>
      <div style={{ margin: "16px 0" }}>
        <label>
          Assign to student:&nbsp;
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
            <option value="">Select student</option>
            {students.map(s => (
              <option key={s._id} value={s.username}>{s.name || s.username}</option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleSubmit} disabled={!lesson || !selectedStudent}>
        Save & Assign Lesson
      </button>
      {message && <div style={{ marginTop: "12px", color: "#ea5b6f" }}>{message}</div>}
    </div>
  );
}