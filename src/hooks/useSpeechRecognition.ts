import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = ({
  lang = "en-US",
  interimResults = true,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldContinueRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech Recognition not supported in this browser");
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = interimResults;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript;
        } else {
          interimText += res[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => (prev ? `${prev} ${finalText}` : finalText));
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e.error);
      setError(e.error);
      setIsListening(false);
      shouldContinueRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldContinueRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.warn("Speech recognition restart failed:", err);
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldContinueRef.current = false;
      recognition.stop();
    };
  }, [lang, interimResults]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      shouldContinueRef.current = true;
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      setError("Microphone permission denied");
      shouldContinueRef.current = false;
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldContinueRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

