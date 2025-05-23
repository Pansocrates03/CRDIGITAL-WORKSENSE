// components/Settings/CreateUserModal.tsx
import React, { useState } from "react";
import { TextInput } from "@/components/TextInput/TextInput";
import { SelectInput } from "@/components/SelectInput/SelectInput";
import { CreatedUser, UserCreationForm } from "./interfaces";
import { copyToClipboard } from "./utils";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { FaClipboard } from "react-icons/fa";
import styles from "./Settings.module.css";
import {Button} from "@/components/ui/button.tsx";
import {generateRandomPassword} from "@/utils/randomPassword.ts";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserCreationForm) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [newUser, setNewUser] = useState<UserCreationForm>({
    email: "      @worksense.com",
    firstName: "",
    lastName: "",
    password: generateRandomPassword(),
    platformRole: "",
  });

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'email') {
      // Ensure @worksense.com is always at the end
      let emailValue = value;
      if (!emailValue.includes('@worksense.com')) {
        // Remove any other @ symbols and domains, then add @worksense.com
        emailValue = emailValue.split('@')[0] + '@worksense.com';
      }
      setNewUser((prev) => ({
        ...prev,
        [name]: emailValue,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(newUser);
      setCreatedUser({
        ...newUser,
        password: newUser.password, // In a real app, this would come from the backend
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const dismissCreatedUser = () => {
    setCreatedUser(null);
    setNewUser({
      email: "@worksense.com",
      firstName: "",
      lastName: "",
      password: "",
      platformRole: "",
    });
  };

  const handleCopyToClipboard = () => {
    if (createdUser) {
      copyToClipboard(createdUser, setCopySuccess);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Create New User</h3>
          <Button
              variant={"outline"}            onClick={() => {
              onClose();
              setNewUser({
                email: "@worksense.com",
                firstName: "",
                lastName: "",
                password: "",
                platformRole: "",
              });
              setError(null);
            }}
          >
            ×
          </Button>
        </div>

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
              <Button
variant={"ghost"}                onClick={handleCopyToClipboard}
                title="Copy credentials"
              >
                <FaClipboard />
                <span className={styles.copyLabel}>Copy</span>
                {copySuccess && (
                  <span className={styles.copyTooltip}>Copied!</span>
                )}
              </Button>
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
              inputName="platformRole"
              inputValue={newUser.platformRole}
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
              isRequired={true}
              labelText="Platform Role"
              onChange={handleInputChange}
              placeholder="Select platform role"
            />

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  onClose();
                  setNewUser({
                    email: "",
                    firstName: "",
                    lastName: "",
                    password: "",
                    platformRole: "",
                  });
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.createButton}>
                Create User
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
