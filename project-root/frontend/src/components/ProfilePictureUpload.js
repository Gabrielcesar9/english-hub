import { useRef, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function ProfilePictureUpload({ user, onUpdate }) {
  const [preview, setPreview] = useState(user.profilePicture || null);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("userId", user.userId);

    const res = await fetch(`${API_URL}/auth/upload-profile-picture`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPreview(data.profilePicture);
    onUpdate({ ...user, profilePicture: data.profilePicture }); // <-- update full user object
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "18px", position: "relative" }}>
      <button
        type="button"
        onClick={handleImageClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          position: "relative",
          outline: "none"
        }}
        title="Click to change profile picture"
      >
        <img
          src={preview || "/default-profile.png"}
          alt="Profile"
          style={{
            width: 128,
            height: 128,
            borderRadius: "50%",
            objectFit: "cover",
            border: hovered ? "3px solid #43e97b" : "2px solid #1976d2",
            marginBottom: "8px",
            transition: "border 0.2s, box-shadow 0.2s",
            boxShadow: hovered
              ? "0 4px 16px rgba(67,233,123,0.18)"
              : "0 2px 8px rgba(25,118,210,0.15)"
          }}
        />
        {hovered && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(67,233,123,0.85)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "24px",
              fontWeight: 600,
              fontSize: "1rem",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(67,233,123,0.18)"
            }}
          >
            Change Profile Picture
          </div>
        )}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ProfilePictureUpload;