// src/components/FridaChat/FridaChat.tsx
import React, { useState, useEffect } from "react";
import styles from "./FridaChat.module.css";
import { MessageCircle, X } from "lucide-react";
import apiClient from "@/api/apiClient";

interface Message {
  sender: "user" | "assistant";
  text: string;
}

interface FridaChatProps {
  projectId?: string;
}

const FridaChat: React.FC<FridaChatProps> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const localStorageKey = `frida-chat-${projectId}`;

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    if (projectId) {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        try {
          const parsed: Message[] = JSON.parse(stored);
          setMessages(parsed);
        } catch {
          setMessages([
            { sender: "assistant", text: "Hi! How can I help you today?" },
          ]);
        }
      } else {
        setMessages([
          { sender: "assistant", text: "Hi! How can I help you today?" },
        ]);
      }
    }
  }, [projectId]);

  // Guardar en localStorage cada vez que los mensajes cambian
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(localStorageKey, JSON.stringify(messages));
    }
  }, [messages, projectId]);

  const handleSend = async () => {
    if (!input.trim() || !projectId) return;

    const userMessage: Message = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await apiClient.post("/gemini/ask", {
        prompt: input,
        projectId,
      });

      const reply = response.data.reply || "No response from Gemini";
      const assistantMessage: Message = {
        sender: "assistant",
        text: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        sender: "assistant",
        text: "Error contacting Gemini.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.floatingWrapper}>
      {isOpen ? (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <span>Frida</span>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  msg.sender === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                Typing...
              </div>
            )}
          </div>

          <div className={styles.chatInputArea}>
            <input
              className={styles.chatInput}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!projectId}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open Frida Chat"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default FridaChat;
