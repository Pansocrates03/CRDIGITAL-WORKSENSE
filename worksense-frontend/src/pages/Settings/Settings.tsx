import React, { useState } from "react";
import styles from "./Settings.module.css";
import apiClient from "@/api/apiClient";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { FaClipboard } from "react-icons/fa";

// Interface for the user creation form
interface UserCreationForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  platformRole: string;
}

// Interface for the created user response
interface CreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userId?: number;
  platformRole: string;
}

const Settings: React.FC = () => {
  const [newUser, setNewUser] = useState<UserCreationForm>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    platformRole: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any previous messages when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedUser(null);

    try {
      const userData = {
        ...newUser,
      };

      const response = await apiClient.post("users/", userData);

      if (response.status === 201) {
        // Store the created user information including password
        setCreatedUser({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          password: newUser.password,
          userId: response.data.userId || undefined,
          platformRole: newUser.platformRole,
        });

        // Reset form
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          password: "",
          platformRole: "",
        });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const dismissCreatedUser = () => {
    setCreatedUser(null);
  };

  const copyToClipboard = () => {
    if (createdUser) {
      const credentials = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
      navigator.clipboard.writeText(credentials).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Management</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner
              text="Creating user..."
              subtext="Please wait while we process your request"
              size="medium"
            />
          </div>
        ) : createdUser ? (
          <div className={styles.credentialsContainer}>
            <div className={styles.credentialsHeader}>
              <h3 className={styles.credentialsTitle}>
                User Created Successfully
              </h3>
              <button
                className={styles.copyButton}
                onClick={copyToClipboard}
                title="Copy credentials"
              >
                <FaClipboard />
                <span className={styles.copyLabel}>Copy</span>
                {copySuccess && (
                  <span className={styles.copyTooltip}>Copied!</span>
                )}
              </button>
            </div>
            <div className={styles.credentialsContent}>
              <p>
                <strong>Email:</strong> {createdUser.email}
              </p>
              <p>
                <strong>Name:</strong> {createdUser.firstName}{" "}
                {createdUser.lastName}
              </p>
              <p>
                <strong>Password:</strong> {createdUser.password}
              </p>
              <p>
                <strong>Platform Role:</strong> {createdUser.platformRole}
              </p>
              <p className={styles.credentialsNote}>
                Please save these credentials. You will need them to log in.
              </p>
            </div>
            <button
              className={styles.dismissButton}
              onClick={dismissCreatedUser}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                className={styles.input}
                required
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="platformRole">Platform Role</label>
              <select
                id="platformRole"
                name="platformRole"
                value={newUser.platformRole}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="" disabled>
                  Select platform role
                </option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <button type="submit" className={styles.submitButton}>
              Create User
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Settings;
