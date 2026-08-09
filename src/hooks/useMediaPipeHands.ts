import { useRef, useState, useCallback } from "react";
import { detectGestureFromHands, HandLandmark } from "@/lib/gestureClassifier";
import type { NormalizedLandmarkList, NormalizedLandmarkListList } from "@mediapipe/hands";

interface MediaPipeHandsInstance {
  setOptions: (options: {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
    selfieMode?: boolean;
  }) => void;
  onResults: (callback: (results: { multiHandLandmarks?: NormalizedLandmarkListList }) => void) => void;
  send: (config: { image: HTMLVideoElement }) => Promise<void>;
}

export interface DetectedGestureResult {
  letter: string;
  confidence: number;
  handCount: number;
  timestamp: number;
}

export const useMediaPipeHands = (onGestureDetected?: (gesture: DetectedGestureResult) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handsRef = useRef<MediaPipeHandsInstance | null>(null);
  const frameRequestRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<DetectedGestureResult | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [gestureCount, setGestureCount] = useState(0);

  const lastGestureRef = useRef<string | null>(null);
  const gestureFrameCountRef = useRef(0);
  const lastFrameTimeRef = useRef<number>(0);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log("📸 Starting camera...");

      if (!videoRef.current) {
        throw new Error("Video element not available");
      }

      // stop any existing MediaPipe instances before starting a new session
      handsRef.current = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const videoEl = videoRef.current;
      const currentStream = videoEl.srcObject as MediaStream | null;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      videoEl.srcObject = stream;
      videoEl.playsInline = true;
      videoEl.muted = true;

      await new Promise<void>((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
          videoEl.removeEventListener("loadeddata", onLoaded);
          videoEl.removeEventListener("error", onError);
        };

        const onLoaded = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve();
        };

        const onError = (event: Event | any) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(event?.error || new Error("Video playback failed"));
        };

        videoEl.addEventListener("loadeddata", onLoaded);
        videoEl.addEventListener("error", onError);
        videoEl.play().catch(onError);
      });

      console.log("✅ Video stream ready");

      // IMPORT MEDIAPIPE
      const { Hands, HAND_CONNECTIONS } = await import("@mediapipe/hands");
      const { Camera } = await import("@mediapipe/camera_utils");
      const { drawConnectors, drawLandmarks } = await import(
        "@mediapipe/drawing_utils"
      );

      console.log("✅ MediaPipe modules imported");

      const baseUrl = import.meta.env.BASE_URL || "/";
      handsRef.current = new Hands({
        locateFile: (file: string) => {
          const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
          const localPath = `${normalizedBase}/mediapipe-hands/${file}`;
          console.log(`📦 Loading MediaPipe asset locally: ${localPath}`);
          return localPath;
        },
      }) as unknown as MediaPipeHandsInstance;

      console.log("✅ Hands instance created");

      handsRef.current.setOptions({
        selfieMode: true,
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.25,
        minTrackingConfidence: 0.25,
      });

      console.log("✅ Hands instance created and configured for fast detection");

      handsRef.current.onResults((results: { multiHandLandmarks?: NormalizedLandmarkListList }) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          console.log(`🎯 HAND DETECTED: ${results.multiHandLandmarks.length} hand(s) found`);
          setHandDetected(true);

          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
            drawLandmarks(ctx, landmarks);
          }

          const gestureResult = detectGestureFromHands(results.multiHandLandmarks as unknown as HandLandmark[][]);

          if (gestureResult) {
            console.log(`✏️ Gesture detected: ${gestureResult.letter}, confidence: ${gestureResult.confidence}`);
          }

          if (gestureResult && gestureResult.letter !== '?' && gestureResult.confidence >= 0.80) {
            console.log(`✅ Valid ASL gesture: ${gestureResult.letter} (${(gestureResult.confidence * 100).toFixed(1)}%)`);
            setConfidence(gestureResult.confidence);

            const detectedResult: DetectedGestureResult = {
              letter: gestureResult.letter,
              confidence: gestureResult.confidence,
              handCount: results.multiHandLandmarks.length,
              timestamp: Date.now(),
            };

            setDetectedGesture(detectedResult);

            if (lastGestureRef.current !== gestureResult.letter) {
              gestureFrameCountRef.current = 0;
              lastGestureRef.current = gestureResult.letter;
            } else {
              gestureFrameCountRef.current++;
              if (gestureFrameCountRef.current >= 4) {
                console.log(`🎉 Confirmed ASL gesture: ${gestureResult.letter}`);
                setGestureCount((prev) => prev + 1);

                if (onGestureDetected) {
                  onGestureDetected(detectedResult);
                }
              }
            }

            if (onGestureDetected && gestureFrameCountRef.current === 0) {
              onGestureDetected(detectedResult);
            }
          } else if (gestureResult) {
            console.log(`⚠️ Low confidence gesture: ${gestureResult.letter} (${gestureResult.confidence})`);
          }
        } else {
          console.log("❌ No hand detected in frame");
          setHandDetected(false);
          setDetectedGesture(null);
          setConfidence(0);
          gestureFrameCountRef.current = 0;
          lastGestureRef.current = null;
        }
      });

      const processFrame = async () => {
        if (!handsRef.current || !videoEl) return;

        const startTime = performance.now();
        try {
          await handsRef.current.send({ image: videoEl });
        } catch (err) {
          console.error("❌ Error processing frame:", err);
        }
        lastFrameTimeRef.current = performance.now() - startTime;
        frameRequestRef.current = requestAnimationFrame(processFrame);
      };

      frameRequestRef.current = requestAnimationFrame(processFrame);
      console.log("✅ Frame loop started for fast hand inference");
      setIsRunning(true);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ MediaPipe initialization failed:", err);
      setError(err instanceof Error ? err.message : "MediaPipe failed");
      setIsRunning(false);
      setIsLoading(false);
    }
  }, [onGestureDetected]);

  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera...");
    if (frameRequestRef.current) {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      videoRef.current.pause();
      videoRef.current.onloadeddata = null;
      videoRef.current.onerror = null;
    }

    console.log("✅ Camera stopped");
    setIsRunning(false);
    setHandDetected(false);
  }, []);

  const resetGestureCount = useCallback(() => {
    setGestureCount(0);
    setHandDetected(false);
    setDetectedGesture(null);
    setConfidence(0);
    gestureFrameCountRef.current = 0;
    lastGestureRef.current = null;
  }, []);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    isRunning,
    isLoading,
    error,
    handDetected,
    detectedGesture,
    confidence,
    gestureCount,
    resetGestureCount,
  };
};