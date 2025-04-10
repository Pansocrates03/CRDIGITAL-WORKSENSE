import React, { useState } from "react";
import styles from "./Settings.module.css";
import apiClient from "@/api/apiClient";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

// Interface for the user creation form
interface UserCreationForm {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  password: string;
}

// Interface for the created user response
interface CreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  password: string;
  userId?: number;
}

const Settings: React.FC = () => {
  const [newUser, setNewUser] = useState<UserCreationForm>({
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

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
      // Convert gender string to number as expected by the backend
      const userData = {
        ...newUser,
        gender:
          newUser.gender === "male" ? 1 : newUser.gender === "female" ? 2 : 3,
      };

      const response = await apiClient.post("users/", userData);

      if (response.status === 201) {
        // Store the created user information including password
        setCreatedUser({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          gender: newUser.gender,
          password: newUser.password,
          userId: response.data.userId || undefined,
        });

        // Reset form
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          gender: "",
          password: "",
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
            <h3 className={styles.credentialsTitle}>
              User Created Successfully
            </h3>
            <div className={styles.credentialsContent}>
              <p>
                <strong>Email:</strong> {createdUser.email}
              </p>
              <p>
                <strong>Name:</strong> {createdUser.firstName}{" "}
                {createdUser.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {createdUser.gender}
              </p>
              <p>
                <strong>Password:</strong> {createdUser.password}
              </p>
              {createdUser.userId && (
                <p>
                  <strong>User ID:</strong> {createdUser.userId}
                </p>
              )}
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
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={newUser.gender}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
