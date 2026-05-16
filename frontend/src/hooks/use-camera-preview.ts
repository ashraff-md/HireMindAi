"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Front camera preview into `videoRef` when `enabled` (video only, no second mic).
 */
export function useCameraPreview(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    void navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Camera unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    void el.play().catch(() => undefined);
  }, [stream]);

  useEffect(() => {
    return () => {
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, []);

  return { videoRef, error } as const;
}
