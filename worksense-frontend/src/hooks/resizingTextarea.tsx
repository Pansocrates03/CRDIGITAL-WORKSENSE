import { useRef, useState, useEffect } from "react";

// Custom hook for handling the text area resizing
const useAutoResizeTextarea = (initialValue = "") => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialValue);

  const adjustHeight = () => {
    const element = textareaRef.current;
    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight + 2}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && initialValue) {
      adjustHeight();
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const clear = () => {
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  return { value, setValue, handleChange, clear, textareaRef };
};

export default useAutoResizeTextarea;
