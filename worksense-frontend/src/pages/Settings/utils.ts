// components/Settings/utils.ts
import { CreatedUser } from "./interfaces";

export const copyToClipboard = (
  createdUser: CreatedUser,
  setCopySuccess: (success: boolean) => void
) => {
  const credentials = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
  navigator.clipboard.writeText(credentials).then(() => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  });
};

export const dismissCreatedUser = (
  setCreatedUser: (user: CreatedUser | null) => void
) => {
  setCreatedUser(null);
};
