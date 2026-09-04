import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResultLike {
  0?: { transcript?: string };
  isFinal?: boolean;
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<SpeechResultLike>; resultIndex: number }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
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
  const wantedRef = useRef(false);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;

  useEffect(() => {
    setSupported(getCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    wantedRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onend = null;
        rec.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    const Ctor = getCtor();
    if (!Ctor) {
      setSupported(false);
      setError("not-supported");
      return;
    }

    stop();

    setError(null);
    wantedRef.current = true;

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        text += ` ${result?.[0]?.transcript ?? ""}`;
      }
      const trimmed = text.trim();
      if (trimmed) {
        callbackRef.current(trimmed);
      }
    };

    recognition.onerror = (event) => {
      const err = event.error ?? "speech-error";
      console.warn("SpeechRecognition error:", err);

      if (
        err === "not-allowed" ||
        err === "service-not-allowed" ||
        err === "audio-capture"
      ) {
        wantedRef.current = false;
        setListening(false);
        setError(err);
        return;
      }

      if (err === "no-speech" || err === "aborted") {
        return;
      }

      setError(err);
    };

    recognition.onend = () => {
      if (wantedRef.current && recognitionRef.current === recognition) {
        setTimeout(() => {
          if (wantedRef.current && recognitionRef.current === recognition) {
            try {
              recognition.start();
            } catch (e) {
              console.warn("restart failed:", e);
              setListening(false);
            }
          }
        }, 150);
        return;
      }
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err) {
      console.warn("getUserMedia failed:", err);
      wantedRef.current = false;
      setListening(false);
      setError("not-allowed");
      return;
    }

    try {
      recognition.start();
      setListening(true);
    } catch (err) {
      console.warn("recognition.start() failed:", err);
      wantedRef.current = false;
      setListening(false);
      setError("start-failed");
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      wantedRef.current = false;
      try {
        recognitionRef.current?.abort?.();
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  return { listening, supported, error, start, stop };
}