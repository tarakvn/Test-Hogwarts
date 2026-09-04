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

/** Unlock the mic on web without holding the track (which would block recognition). */
async function primeWebMicrophone(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  stream.getTracks().forEach((track) => track.stop());
}

/** Listens for a spell incantation and reports the raw transcript. */
export function useSpeechSpell(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const nativeListenersRef = useRef<ListenerHandle[]>([]);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;
  const wantedRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setSupported(getCtor() !== null);
      return;
    }

    void SpeechRecognition.available()
      .then(({ available }) => setSupported(available))
      .catch(() => setSupported(false));
  }, []);

  const clearNativeListeners = useCallback(async () => {
    const handles = nativeListenersRef.current;
    nativeListenersRef.current = [];
    await Promise.all(handles.map((handle) => handle.remove().catch(() => undefined)));
  }, []);

  const stop = useCallback(() => {
    wantedRef.current = false;
    if (restartTimerRef.current != null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    void clearNativeListeners();
    if (Capacitor.isNativePlatform()) void SpeechRecognition.stop();
    setListening(false);
  }, [clearNativeListeners]);

  const startNative = useCallback(async () => {
    const permission = await SpeechRecognition.requestPermissions();
    if (permission.speechRecognition !== "granted") {
      throw new Error("not-allowed");
    }

    const { available } = await SpeechRecognition.available();
    if (!available) throw new Error("not-supported");

    await clearNativeListeners();

    const partialHandle = await SpeechRecognition.addListener("partialResults", ({ matches }) => {
      const transcript = matches.join(" ").trim();
      if (transcript) callbackRef.current(transcript);
    });

    const stateHandle = await SpeechRecognition.addListener("listeningState", ({ status }) => {
      if (status === "started") {
        setListening(true);
        return;
      }
      setListening(false);
      if (!wantedRef.current) return;
      if (restartTimerRef.current != null) window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!wantedRef.current) return;
        void SpeechRecognition.start({
          language: "en-US",
          maxResults: 5,
          partialResults: true,
          popup: false,
        }).catch(() => {
          /* recognizer often errors on no-match; keep trying while armed */
        });
      }, 350);
    });

    nativeListenersRef.current = [partialHandle, stateHandle];

    await SpeechRecognition.start({
      language: "en-US",
      maxResults: 5,
      partialResults: true,
      popup: false,
    });
    setListening(true);
  }, [clearNativeListeners]);

  const start = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      setError(null);
      wantedRef.current = true;

      try {
        await startNative();
      } catch (err) {
        wantedRef.current = false;
        setListening(false);
        void clearNativeListeners();
        setError(
          err instanceof Error && err.message === "not-supported" ? "not-supported" : "not-allowed",
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

    try {
      await primeWebMicrophone();
    } catch {
      wantedRef.current = false;
      setError("not-allowed");
      setListening(false);
      return;
    }

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
    } catch {
      setError("speech-error");
      setListening(false);
      wantedRef.current = false;
    }
  }, [clearNativeListeners, startNative]);

  useEffect(
    () => () => {
      wantedRef.current = false;
      if (restartTimerRef.current != null) window.clearTimeout(restartTimerRef.current);
      recognitionRef.current?.stop();
      void clearNativeListeners();
      if (Capacitor.isNativePlatform()) void SpeechRecognition.stop();
    },
    [clearNativeListeners],
  );

  return { listening, supported, error, start, stop };
}
