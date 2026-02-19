import { useEffect, useRef, useState } from 'react';

// Provider-agnostic, Web Speech API implementation.
// onResult(field, transcript) will be called when recognition returns results.
export default function useSpeechRecognition({ lang = 'en-US', onResult, onError } = {}) {
  const recognitionRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);
  const recognitionSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    setListeningField(null);
  };

  const startListening = (field) => {
    if (!recognitionSupported) return;

    // stop any existing
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false; // keep behavior simple for form inputs
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = (event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript) || '';
      try {
        onResult && onResult(field, transcript.trim());
      } catch (err) {
        console.error('useSpeechRecognition onResult handler error', err);
      }
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error', err);
      setListeningField(null);
      recognitionRef.current = null;
      onError && onError(err);
    };

    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListeningField(field);
    try { recognition.start(); } catch (err) { console.error('recognition.start() failed', err); setListeningField(null); }
  };

  const toggleListening = (field) => {
    if (!recognitionSupported) return;
    if (listeningField === field) {
      stopListening();
      return;
    }
    startListening(field);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  return { recognitionSupported, listeningField, toggleListening, startListening, stopListening };
}
