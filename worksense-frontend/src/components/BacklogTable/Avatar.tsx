// src/components/ui/avatar.tsx
import React from "react";
import styles from "./avatar.module.css";

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

interface AvatarImageProps {
  src?: string;
  alt: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={`${styles.avatar} ${className || ""}`}>
      {children}
    </div>
  );
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ 
  src, 
  alt,
  className
}) => {
  return src ? (
    <img 
      src={src} 
      alt={alt} 
      className={`${styles.avatarImage} ${className || ""}`} 
    />
  ) : null;
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ 
  children,
  className
}) => {
  return (
    <div className={`${styles.avatarFallback} ${className || ""}`}>
      {children}
    </div>
  );
};