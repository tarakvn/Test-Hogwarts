import { useCallback, useEffect, useRef, useState } from "react";

type TorchMode = "off" | "hardware" | "screen";

/**
 * Tries to switch on the real camera flash (Android/Chrome supports the
 * `torch` constraint). Falls back to a full-screen glow when unavailable.
 */
export function useTorch() {
  const [mode, setMode] = useState<TorchMode>("off");
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getVideoTracks()) {
        try {
          void track.applyConstraints({
            advanced: [{ torch: false } as unknown as MediaTrackConstraintSet],
          });
        } catch {
          /* ignore */
        }
        track.stop();
      }
      streamRef.current = null;
    }
    setMode("off");
  }, []);

  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as
        | (MediaTrackCapabilities & { torch?: boolean })
        | undefined;
      if (!track || !caps?.torch) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("no torch");
      }
      await track.applyConstraints({
        advanced: [{ torch: true } as unknown as MediaTrackConstraintSet],
      });
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
