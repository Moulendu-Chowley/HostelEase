import { useEffect, useMemo, useState } from "react";

type FaceDetectionResult = {
  boundingBox: {
    width: number;
    height: number;
  };
};

type FaceDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<FaceDetectionResult[]>;
};

type FaceDetectorConstructor = new (_?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => FaceDetectorLike;

function getFaceDetector(): FaceDetectorConstructor | null {
  const detector = (
    window as Window & { FaceDetector?: FaceDetectorConstructor }
  ).FaceDetector;

  return detector || null;
}

export function useFaceRecognition(
  videoEl: HTMLVideoElement | null,
  isActive: boolean,
) {
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!videoEl || !isActive) {
      setFaceDetected(false);
      setConfidence(0);
      return;
    }

    const FaceDetectorCtor = getFaceDetector();
    setIsSupported(Boolean(FaceDetectorCtor));

    let timer: number | undefined;
    let mounted = true;

    const detect = async () => {
      if (!mounted || !videoEl) {
        return;
      }

      if (videoEl.readyState < 2) {
        setFaceDetected(false);
        setConfidence(0);
        return;
      }

      if (!FaceDetectorCtor) {
        // Fallback: stream is alive, but no native detector available.
        setFaceDetected(true);
        setConfidence(0.75);
        return;
      }

      try {
        const detector = new FaceDetectorCtor({
          fastMode: true,
          maxDetectedFaces: 1,
        });

        const detections = await detector.detect(videoEl);

        if (!mounted) return;

        if (detections.length === 0) {
          setFaceDetected(false);
          setConfidence(0);
          return;
        }

        const detection = detections[0];
        const frameArea = Math.max(videoEl.videoWidth * videoEl.videoHeight, 1);
        const faceArea =
          detection.boundingBox.width * detection.boundingBox.height;
        const coverage = Math.min(faceArea / frameArea, 1);

        setFaceDetected(true);
        setConfidence(Math.min(0.7 + coverage * 2, 0.99));
      } catch {
        if (!mounted) return;
        setFaceDetected(false);
        setConfidence(0);
      }
    };

    timer = window.setInterval(() => {
      void detect();
    }, 900);

    void detect();

    return () => {
      mounted = false;
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [videoEl, isActive]);

  return useMemo(
    () => ({
      faceDetected,
      confidence,
      isSupported,
    }),
    [confidence, faceDetected, isSupported],
  );
}
