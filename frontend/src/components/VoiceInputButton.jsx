import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function VoiceInputButton({ onTranscript, className = "" }) {
  const { i18n, t } = useTranslation();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === "te" ? "te-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.stop();
    };
  }, [i18n.language, onTranscript]);

  const handleClick = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.lang = i18n.language === "te" ? "te-IN" : "en-IN";
    recognitionRef.current.start();
  };

  if (!supported) {
    return null;
  }

  return (
    <button
      type="button"
      className={`voice-button ${className}`.trim()}
      onClick={handleClick}
      aria-label={t("voice.buttonLabel")}
      title={t("voice.buttonLabel")}
    >
      {listening ? t("voice.listening") : t("voice.start")}
    </button>
  );
}

export default VoiceInputButton;
