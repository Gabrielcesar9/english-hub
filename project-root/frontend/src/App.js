import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import LessonList from "./components/LessonList";
import PieChart from "./components/PieChart";
import ProfilePictureUpload from "./components/ProfilePictureUpload";
import ResetPassword from "./components/ResetPassword";
import CreateLesson from "./components/CreateLesson";
import "./main.css";

const API_URL = process.env.REACT_APP_API_URL; // <-- Add this line
const AUTO_LOGOUT_MINUTES = 30;

export default function App() {
  const [user, setUser] = useState(() => {
    // For development, always start with no user:
    // return null;

    // For production, use localStorage:
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [lessons, setLessons] = useState([]);
  const [userPanelExpanded, setUserPanelExpanded] = useState(false);
  const logoutTimer = useRef();
  const navigate = useNavigate();

  // Fetch profile picture after login
  useEffect(() => {
    if (user && user.userId) {
      fetch(`${API_URL}/auth/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId })
      })
        .then(res => res.json())
        .then(data => {
          setUser(prev => ({ ...prev, profilePicture: data.profilePicture }));
        })
        .catch(err => console.error(err));
    }
  }, [user && user.userId]);

  // Fetch lessons for the user
  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/lessons?username=${encodeURIComponent(user.username)}`)
        .then(res => res.json())
        .then(data => {
          const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
          setLessons(sorted);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // Auto-logout logic
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = setTimeout(() => {
        handleLogout();
        alert("You have been logged out due to inactivity.");
      }, AUTO_LOGOUT_MINUTES * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer(); // Start timer on login

    return () => {
      clearTimeout(logoutTimer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [user]);

  // On login, save user to localStorage
  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  // On logout, clear user from state and localStorage
  function handleLogout() {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/"); // or your login route
  }

  // Add a function to update user progress after lesson completion
  const handleUserUpdate = updatedUser => {
    setUser(prev => ({
      ...prev,
      completedLessons: updatedUser.completedLessons,
      lessonMistakes: updatedUser.lessonMistakes
    }));
  };

  if (!user) {
    // Render routes for login and reset password
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  // If admin, show create lesson page
  if (user.role === "admin") {
    return (
      <Routes>
        <Route path="/create-lesson" element={<CreateLesson setUser={setUser} user={user} />} />
        <Route path="*" element={<CreateLesson setUser={setUser} user={user} />} />
      </Routes>
    );
  }

  // Calculate completion and accuracy
  const completedCount = user.completedLessons?.length || 0;
  const totalCount = lessons.length;
  let totalQuestions = 0;
  let totalMistakes = 0;
  user.completedLessons?.forEach(lessonId => {
    const lesson = lessons.find(l => String(l._id) === String(lessonId));
    if (lesson) {
      totalQuestions += lesson.slides?.length || 0;
      const mistakeObj = user.lessonMistakes?.find(m => String(m.lessonId) === String(lessonId));
      totalMistakes += mistakeObj ? mistakeObj.mistakes : 0;
    }
  });
  const accuracyPercent = totalQuestions > 0
    ? Math.round(((totalQuestions - totalMistakes) / totalQuestions) * 100)
    : 100;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard-flex">
      <div
        className={`dashboard-user-panel${userPanelExpanded ? " expanded" : ""}`}
        onClick={() => {
          // Only toggle on mobile screens
          if (window.innerWidth <= 900) setUserPanelExpanded(e => !e);
        }}
      >
        <h2>Welcome back, {user.name}!</h2>
        <ProfilePictureUpload
          user={user}
          onUpdate={updatedUser => setUser(updatedUser)}
        />
        {accuracyPercent === 100 && (
          <div className="badge">
            <span role="img" aria-label="star">🏅</span> Perfect Score!
          </div>
        )}
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <PieChart percent={percent} fillColor="#F7B731" /> {/* Lessons Completed */}
        <p className="lessons-completed-label">Lessons Completed</p>
        <PieChart percent={accuracyPercent} stroke={14} size={100} fillColor="#EA5B6F" /> {/* Accuracy */}
        <p className="accuracy-label">Accuracy</p>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="dashboard-lessons-panel">
        <LessonList
          user={user}
          lessons={lessons}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </div>
  );
}
