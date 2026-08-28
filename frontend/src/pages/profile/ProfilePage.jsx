import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppDispatch } from "../../app/hooks";
import { setCurrentUser } from "../../features/auth/authSlice";
import "./ProfilePage.css";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/profile");
        const profile = response.data?.data?.user;

        if (profile) {
          setUser(profile);
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
          });
          dispatch(setCurrentUser(profile));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setProfileError(
          error.response?.data?.message ||
            "Failed to load profile information."
        );
      }
    };

    loadUser();
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await api.put("/profile", {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        dispatch(setCurrentUser(updatedUser));
      }

      setIsEditing(false);
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setProfileError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setIsEditing(false);
  };

  const handlePasswordSubmit = async (event) => {
  event.preventDefault();

  setPasswordError("");
  setPasswordSuccess("");

  if (!passwordData.currentPassword) {
    setPasswordError("Current password is required.");
    return;
  }

  if (!passwordData.newPassword) {
    setPasswordError("New password is required.");
    return;
  }

  if (passwordData.newPassword.length < 8) {
    setPasswordError(
      "New password must be at least 8 characters."
    );
    return;
  }

  if (passwordData.newPassword.length > 16) {
    setPasswordError(
      "New password cannot exceed 16 characters."
    );
    return;
  }

  if (!passwordData.confirmPassword) {
    setPasswordError(
      "Please confirm your new password."
    );
    return;
  }

  if (
    passwordData.newPassword !==
    passwordData.confirmPassword
  ) {
    setPasswordError(
      "New password and confirm password do not match."
    );
    return;
  }

  if (
    passwordData.currentPassword ===
    passwordData.newPassword
  ) {
    setPasswordError(
      "New password must be different from your current password."
    );
    return;
  }

  try {
    await api.put("/profile/password", {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    setPasswordSuccess("Password updated successfully.");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("Change password error:", error);
    setPasswordError(
      error.response?.data?.message ||
        "Failed to update password. Please try again."
    );
  }
};

  const handleClosePasswordForm = () => {
    setShowPasswordForm(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <h2>Profile</h2>
          <p>
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Page Header */}

      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>
            Manage your account information and
            profile details.
          </p>
        </div>

        {!isEditing && (
          <button
            className="profile-edit-button"
            onClick={() =>
              setIsEditing(true)
            }
          >
            Edit Profile
          </button>
        )}
      </div>


      {profileError && (
        <div className="profile-message error">{profileError}</div>
      )}

      {profileSuccess && (
        <div className="profile-message success">{profileSuccess}</div>
      )}

      {/* Profile Grid */}

      <div className="profile-grid">

        {/* Profile Overview */}

        <div className="profile-card profile-overview-card">

          <div className="profile-avatar">
            {getInitials(user.name)}
          </div>

          <h2>
            {user.name || "User"}
          </h2>

          <p className="profile-email">
            {user.email}
          </p>

          <span className="profile-role">
            {formatRole(user.role)}
          </span>

          <div className="profile-status">
            <span
              className={`status-dot ${
                user.isActive
                  ? "active"
                  : "inactive"
              }`}
            />

            {user.isActive
              ? "Active Account"
              : "Inactive Account"}
          </div>

        </div>


        {/* Account Information */}

        <div className="profile-card">

          <div className="profile-card-header">
            <div>
              <h2>Account Information</h2>

              <p>
                Your basic account details
              </p>
            </div>
          </div>


          {isEditing ? (
            <div className="profile-form">

              <div className="profile-form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>


              <div className="profile-form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>


              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="profile-save-button"
                  onClick={handleSave}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </div>
          ) : (
            <div className="profile-details">

              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  Full Name
                </span>

                <span className="profile-detail-value">
                  {user.name || "Not available"}
                </span>
              </div>


              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  Email Address
                </span>

                <span className="profile-detail-value">
                  {user.email || "Not available"}
                </span>
              </div>


              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  Role
                </span>

                <span className="profile-detail-value">
                  {formatRole(user.role)}
                </span>
              </div>


              <div className="profile-detail-item">
                <span className="profile-detail-label">
                  Account Status
                </span>

                <span className="profile-detail-value">
                  {user.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

            </div>
          )}

        </div>

      </div>


      {/* Security */}

      <div className="profile-card profile-security-card">

        <div>
          <h2>Security</h2>

          <p>
            Keep your account secure by regularly
            updating your password.
          </p>
        </div>

        <button
          type="button"
          className="profile-password-button"
          onClick={() => {
            setPasswordError("");
            setPasswordSuccess("");
            setShowPasswordForm(true);
          }}
        >
          Change Password
        </button>

      </div>


      {/* Change Password Modal */}

      {showPasswordForm && (
        <div
          className="password-modal-overlay"
          onClick={handleClosePasswordForm}
        >

          <div
            className="password-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="password-modal-header">

              <div>
                <h2>Change Password</h2>

                <p>
                  Update your account password.
                </p>
              </div>

              <button
                type="button"
                className="password-close-button"
                onClick={handleClosePasswordForm}
              >
                ×
              </button>

            </div>


            <form
              className="password-form"
              onSubmit={handlePasswordSubmit}
            >

              <div className="profile-form-group">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                />

              </div>


              <div className="profile-form-group">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter new password"
                />

                <span className="password-hint">
                  Password must be 8–16 characters.
                </span>

              </div>


              <div className="profile-form-group">

                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                />

              </div>


              {passwordError && (
                <div className="password-message error">
                  {passwordError}
                </div>
              )}


              {passwordSuccess && (
                <div className="password-message success">
                  {passwordSuccess}
                </div>
              )}


              <div className="password-modal-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={
                    handleClosePasswordForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  Update Password
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default ProfilePage;