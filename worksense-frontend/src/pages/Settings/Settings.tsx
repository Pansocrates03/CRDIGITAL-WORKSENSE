import React, { useState } from "react";
import styles from "./Settings.module.css";
import apiClient from "@/api/apiClient";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { FaClipboard } from "react-icons/fa";
import { TextInput } from "@/components/TextInput/TextInput";
import { SelectInput } from "@/components/SelectInput/SelectInput";

// Interface for the user creation form
interface UserCreationForm {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  password: string;
  platformRole: string;
}

// Interface for the created user response
interface CreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  password: string;
  userId?: number;
  platformRole: string;
}

const Settings: React.FC = () => {
  const [newUser, setNewUser] = useState<UserCreationForm>({
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
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
          platformRole: newUser.platformRole,
        });

        // Reset form
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          gender: "",
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
              <p><strong>Email:</strong> {createdUser.email}</p>
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

            <TextInput
              inputName="email"
              inputValue={newUser.email}
              isRequired={true}
              labelText="Email"
              onChange={handleInputChange}
            />

            <TextInput
              inputName="firstName"
              inputValue={newUser.firstName}
              isRequired={true}
              labelText="First Name"
              onChange={handleInputChange}
            />

            <TextInput
              inputName="lastName"
              inputValue={newUser.lastName}
              isRequired={true}
              labelText="Last Name"
              onChange={handleInputChange}
            />

            <SelectInput
              inputName="gender"
              inputValue={newUser.gender}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female"}, { value: "other", label: "Other"}]}
              isRequired={true}
              labelText="Gender"
              onChange={handleInputChange}
              placeholder="Select a gender"
            />

            <TextInput
              inputType="password"
              inputName="password"
              inputValue={newUser.password}
              isRequired={true}
              labelText="Password"
              onChange={handleInputChange}
            />

            <SelectInput
              inputName="platformRole"
              inputValue={newUser.gender}
              options={[{ value: "admin", label: "Admin" }, { value: "user", label: "User"} ]}
              isRequired={true}
              labelText="Platform Role"
              onChange={handleInputChange}
              placeholder="Select platform role"
            />

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
