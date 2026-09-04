import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

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
type ListenerHandle = { remove: () => Promise<void> };

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
  const nativeListenerRef = useRef<ListenerHandle | null>(null);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setSupported(getCtor() !== null);
      return;
    }

    void SpeechRecognition.available()
      .then(({ available }) => setSupported(available))
      .catch(() => setSupported(false));
  }, []);

  const wantedRef = useRef(false);

  const stop = useCallback(() => {
    wantedRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    void nativeListenerRef.current?.remove();
    nativeListenerRef.current = null;
    if (Capacitor.isNativePlatform()) void SpeechRecognition.stop();
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      setError(null);
      wantedRef.current = true;

      try {
        const permission = await SpeechRecognition.requestPermissions();
        if (permission.speechRecognition !== "granted") {
          throw new Error("not-allowed");
        }

        const { available } = await SpeechRecognition.available();
        if (!available) throw new Error("not-supported");

        nativeListenerRef.current = await SpeechRecognition.addListener(
          "partialResults",
          ({ matches }) => {
            const transcript = matches.join(" ").trim();
            if (transcript) callbackRef.current(transcript);
          },
        );

        await SpeechRecognition.start({
          language: "en-US",
          partialResults: true,
          popup: false,
        });
        setListening(true);
      } catch (err) {
        wantedRef.current = false;
        setListening(false);
        void nativeListenerRef.current?.remove();
        nativeListenerRef.current = null;
        setError(
          err instanceof Error && err.message === "not-supported"
            ? "not-supported"
            : "not-allowed",
        );
      }
      return;
    }

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
      recognition.start();
      setListening(true);
    } catch (err) {
      console.log("recognition start error:", err);
      setError("speech-error");
      setListening(false);
      wantedRef.current = false;
    }
  }, []);

  useEffect(
    () => () => {
      wantedRef.current = false;
      recognitionRef.current?.stop();
      void nativeListenerRef.current?.remove();
      if (Capacitor.isNativePlatform()) void SpeechRecognition.stop();
    },
    [],
  );

  return { listening, supported, error, start, stop };
}
