import React from 'react';

// Small presentational mic button with idle/active SVGs and accessible props.
export default function VoiceInputButton({ listening = false, onClick, ariaLabel = 'Voice input', disabled = false, style = {} }) {
  const baseStyle = {
    background: '#fff',
    border: '1px solid #cbd5e0',
    borderRadius: '50%',
    width: 34,
    height: 34,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0
  };
  const activeStyle = listening ? { background: '#e6f7ff', borderColor: '#60a5fa' } : {};

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...activeStyle, ...style }}
    >
      {listening ? (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="none" stroke="#e11d48" strokeOpacity="0.18" strokeWidth="2">
            <animate attributeName="r" values="9;13;9" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="#e11d48"/>
          <rect x="11" y="18" width="2" height="4" rx="1" fill="#e11d48" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 11v1a7 7 0 0 1-14 0v-1" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="19" x2="12" y2="23" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}
