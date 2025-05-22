// src/components/FridaChat/FridaChat.tsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import styles from "./FridaChat.module.css";
import { MessageCircle, X, Mic, Check, Send } from "lucide-react";
import apiClient from "@/api/apiClient";

// Azure
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

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
  // Para azure
  const [isRecording, setIsRecording] = useState(false);
  const [recognizer, setRecognizer] =
    useState<SpeechSDK.SpeechRecognizer | null>(null);

  const handleCancelVoice = () => {
    setInput(""); // clear input
    setIsRecording(false); // stop showing confirm/cancel
    if (recognizer) {
      recognizer.close(); // stop recognition
      setRecognizer(null);
    }
  };

  const handleVoiceConfirm = () => {
    setIsRecording(false);
    if (recognizer) {
      recognizer.close(); // optional: cut early if still listening
      setRecognizer(null);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

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

  // Para azure
  const handleVoiceInputAzure = () => {
    const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const region = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (!key || !region) {
      alert("Azure Speech config missing.");
      return;
    }

    if (isRecording && recognizer) {
      recognizer.stopContinuousRecognitionAsync();
      setIsRecording(false);
      setRecognizer(null);
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const newRecognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    setRecognizer(newRecognizer);
    setIsRecording(true);

    newRecognizer.recognizeOnceAsync((result) => {
      if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        setInput(result.text);
        //resizeTextarea();
      } else {
        alert("Speech not recognized.");
      }
      newRecognizer.close();
      setRecognizer(null);
      setIsRecording(false);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !projectId) return;

    const userMessage: Message = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    const textarea = document.querySelector("textarea");
    if (textarea) {
      (textarea as HTMLTextAreaElement).style.height = "auto";
    }
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
            <textarea
              ref={textareaRef}
              className={styles.chatInput}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const textarea = e.target as HTMLTextAreaElement;
                textarea.style.height = "auto";
                textarea.style.height = `${Math.min(
                  textarea.scrollHeight,
                  120
                )}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask something..."
              rows={1}
            />

            {isRecording ? (
              <>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelVoice}
                  aria-label="Cancel voice input"
                >
                  <X size={20} />
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleVoiceConfirm}
                  aria-label="Use voice input"
                >
                  <Check size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.micButton}
                  onClick={handleVoiceInputAzure}
                  aria-label="Start voice input"
                >
                  <Mic size={20} />
                </button>
                <button
                  className={styles.sendButton}
                  onClick={handleSend}
                  disabled={!projectId}
                >
                  <Send size={20} />
                </button>
              </>
            )}
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
