import React from 'react';
import VoiceInputButton from './VoiceInputButton';

export default function VoiceTextInput({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  type = 'text', 
  isTextArea = false,
  ...props 
}) {
  const handleVoiceInput = (text) => {
    // If it's a textarea or has existing text, we might append or replace.
    // For simplicity, let's just append with a space if there's already text.
    const newText = value ? `${value} ${text}` : text;
    onChange({ target: { value: newText } });
  };

  return (
    <div className="relative flex items-center w-full">
      {isTextArea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pr-10 ${className}`}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pr-10 ${className}`}
          {...props}
        />
      )}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <VoiceInputButton onTranscript={handleVoiceInput} />
      </div>
    </div>
  );
}
