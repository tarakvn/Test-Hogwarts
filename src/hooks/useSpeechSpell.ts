import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResultLike {
  0?: { transcript?: string };
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
  | ((event: { results: ArrayLike<SpeechResultLike>; resultIndex: number }) => void)
  | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Listens for a spell incantation and reports the raw transcript. */
export function useSpeechSpell(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;

  useEffect(() => {
    setSupported(getCtor() !== null);
  }, []);

  const wantedRef = useRef(false);

  const stop = useCallback(() => {
    wantedRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    const Ctor = getCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setError(null);
    wantedRef.current = true;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += ` ${event.results[i]?.[0]?.transcript ?? ""}`;
      }
      const trimmed = text.trim();
      if (trimmed) callbackRef.current(trimmed);
    };
    recognition.onerror = (event) => {
      setError(event.error ?? "speech-error");
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        wantedRef.current = false;
        setListening(false);
      }
    };
    recognition.onend = () => {
      // keep the ear open so a counter-spell can be heard on the same screen
      if (wantedRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through */
        }
      }
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      recognition.start();
      setListening(true);
    } catch (err) {
      console.log(err);
      setListening(false);
    }
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { listening, supported, error, start, stop };
}
