import { useCallback, useEffect, useRef, useState } from "react";

type TorchMode = "off" | "hardware" | "screen";

function ensureVideoEl(): HTMLVideoElement | null {
  if (typeof document === "undefined") return null;
  let el = document.getElementById("lumos-torch-video") as HTMLVideoElement | null;
  if (!el) {
    el = document.createElement("video");
    el.id = "lumos-torch-video";
    el.setAttribute("playsinline", "true");
    el.setAttribute("muted", "true");
    el.muted = true;
    el.autoplay = true;
    el.playsInline = true;
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      position: "fixed",
      width: "2px",
      height: "2px",
      opacity: "0",
      pointerEvents: "none",
      left: "0",
      bottom: "0",
    });
    document.body.appendChild(el);
  }
  return el;
}

async function openRearCamera(): Promise<MediaStream> {
  const videoOnly = { audio: false as const };
  try {
    return await navigator.mediaDevices.getUserMedia({
      ...videoOnly,
      video: { facingMode: { ideal: "environment" } },
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      ...videoOnly,
      video: true,
    });
  }
}

/**
 * Tries to switch on the real camera flash (Android/Chrome supports the
 * `torch` constraint). Falls back to a full-screen glow when unavailable.
 *
 * Camera only — never request the microphone here, or Lumos steals the mic
 * from speech recognition and Nox cannot be heard.
 */
export function useTorch() {
  const [mode, setMode] = useState<TorchMode>("off");
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        try {
          if (track.kind === "video") {
            void track.applyConstraints({
              advanced: [{ torch: false } as unknown as MediaTrackConstraintSet],
            });
          }
        } catch {
          /* ignore */
        }
        track.stop();
      }
      streamRef.current = null;
    }
    const video = document.getElementById("lumos-torch-video") as HTMLVideoElement | null;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    setMode("off");
  }, []);

  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
      const stream = await openRearCamera();
      // Drop any unexpected audio tracks so the mic stays free for incantations.
      for (const track of stream.getAudioTracks()) track.stop();

      const track = stream.getVideoTracks()[0];
      if (!track) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("no torch");
      }

      const video = ensureVideoEl();
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }

      const caps = track.getCapabilities?.() as
        | (MediaTrackCapabilities & { torch?: boolean })
        | undefined;

      try {
        await track.applyConstraints({
          advanced: [{ torch: true } as unknown as MediaTrackConstraintSet],
        });
      } catch {
        if (!caps?.torch) {
          stream.getTracks().forEach((t) => t.stop());
          if (video) video.srcObject = null;
          throw new Error("no torch");
        }
        throw new Error("no torch");
      }

      streamRef.current = stream;
      setMode("hardware");
      return "hardware" as const;
    } catch {
      setMode("screen");
      return "screen" as const;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { mode, isOn: mode !== "off", start, stop };
}
