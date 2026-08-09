import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import { predictASL } from "@/lib/gestureClassifier";

// ============================================================
// NORMALIZE MEDIAPIPE LANDMARKS
// Must match Python training code exactly
// ============================================================

function normalizeLandmarks(landmarks: any[]): number[] {
  const points = landmarks.map((p) => [
    Number(p.x),
    Number(p.y),
    Number(p.z),
  ]);

  // Safety check
  if (points.length !== 21) {
    console.error(
      "Expected 21 hand landmarks, received:",
      points.length
    );

    return [];
  }

  // ----------------------------------------------------------
  // Wrist = landmark 0
  // ----------------------------------------------------------

  const wrist = [...points[0]];

  // Move wrist to origin
  for (let i = 0; i < points.length; i++) {
    points[i][0] -= wrist[0];
    points[i][1] -= wrist[1];
    points[i][2] -= wrist[2];
  }

  // ----------------------------------------------------------
  // Middle MCP = landmark 9
  // Same as Python training
  // ----------------------------------------------------------

  const middleMCP = points[9];

  const scale = Math.sqrt(
    middleMCP[0] ** 2 +
      middleMCP[1] ** 2 +
      middleMCP[2] ** 2
  );

  const safeScale =
    scale < 0.000001 ? 1.0 : scale;

  // Scale landmarks
  for (let i = 0; i < points.length; i++) {
    points[i][0] /= safeScale;
    points[i][1] /= safeScale;
    points[i][2] /= safeScale;
  }

  // 21 landmarks × 3 coordinates = 63 features
  return points.flat();
}

// ============================================================
// MEDIAPIPE TYPE
// ============================================================

interface MediaPipeHandsInstance {
  setOptions: (options: {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
    selfieMode?: boolean;
  }) => void;

  onResults: (
    callback: (results: {
      multiHandLandmarks?: any[][];
    }) => void
  ) => void;

  send: (config: {
    image: HTMLVideoElement;
  }) => Promise<void>;

  close?: () => void;
}

// ============================================================
// DETECTED GESTURE RESULT
// ============================================================

export interface DetectedGestureResult {
  letter: string;
  confidence: number;
  handCount: number;
  timestamp: number;
}

// ============================================================
// HOOK
// ============================================================

export const useMediaPipeHands = (
  onGestureDetected?: (
    gesture: DetectedGestureResult
  ) => void
) => {
  // ==========================================================
  // REFS
  // ==========================================================

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const handsRef =
    useRef<MediaPipeHandsInstance | null>(null);

  const frameRequestRef =
    useRef<number | null>(null);

  // Keep latest callback
  const onGestureDetectedRef =
    useRef(onGestureDetected);

  onGestureDetectedRef.current =
    onGestureDetected;

  // Prevent duplicate camera starts
  const startingCameraRef =
    useRef(false);

  // Used to invalidate old camera operations
  const cameraOperationRef =
    useRef(0);

  // Prevent overlapping MediaPipe frames
  const processingFrameRef =
    useRef(false);

  // Gesture stability
  const lastGestureRef =
    useRef<string | null>(null);

  const stableFramesRef =
    useRef(0);

  const confirmedGestureRef =
    useRef<string | null>(null);

  // ==========================================================
  // STATE
  // ==========================================================

  const [isRunning, setIsRunning] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [handDetected, setHandDetected] =
    useState(false);

  const [detectedGesture, setDetectedGesture] =
    useState<DetectedGestureResult | null>(null);

  const [confidence, setConfidence] =
    useState(0);

  const [gestureCount, setGestureCount] =
    useState(0);

  // ==========================================================
  // START CAMERA
  // ==========================================================

  const startCamera = useCallback(async () => {
    // Prevent two starts
    if (startingCameraRef.current) {
      console.log(
        "⚠️ Camera start already in progress"
      );
      return;
    }

    // Already running
    if (
      handsRef.current &&
      videoRef.current?.srcObject
    ) {
      console.log(
        "⚠️ Camera already running"
      );
      return;
    }

    startingCameraRef.current = true;

    const operationId =
      ++cameraOperationRef.current;

    try {
      setError(null);
      setIsLoading(true);

      console.log(
        "📸 Starting camera..."
      );

      const video = videoRef.current;

      if (!video) {
        throw new Error(
          "Video element not available"
        );
      }

      // ======================================================
      // CLEAN OLD FRAME LOOP
      // ======================================================

      if (
        frameRequestRef.current !== null
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );

        frameRequestRef.current = null;
      }

      processingFrameRef.current = false;

      // ======================================================
      // CLOSE OLD MEDIAPIPE
      // ======================================================

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch (err) {
          console.warn(
            "Old MediaPipe close warning:",
            err
          );
        }
      }

      handsRef.current = null;

      // ======================================================
      // CHECK CAMERA
      // ======================================================

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera is not supported by this browser"
        );
      }

      console.log(
        "📷 Requesting camera permission..."
      );

      // ======================================================
      // GET CAMERA
      // ======================================================

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },

            frameRate: {
              ideal: 30,
              max: 30,
            },
          },

          audio: false,
        });

      // Ignore old request
      if (
        operationId !==
        cameraOperationRef.current
      ) {
        console.log(
          "⚠️ Old camera request ignored"
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        return;
      }

      // ======================================================
      // STOP OLD VIDEO STREAM
      // ======================================================

      const oldStream =
        video.srcObject;

      if (
        oldStream instanceof MediaStream
      ) {
        oldStream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      // ======================================================
      // ATTACH NEW STREAM
      // ======================================================

      video.srcObject = stream;

      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;

      // Wait for metadata
      if (
        video.readyState <
        HTMLMediaElement.HAVE_METADATA
      ) {
        await new Promise<void>(
          (resolve) => {
            const handleMetadata =
              () => {
                video.removeEventListener(
                  "loadedmetadata",
                  handleMetadata
                );

                resolve();
              };

            video.addEventListener(
              "loadedmetadata",
              handleMetadata
            );
          }
        );
      }

      // Check operation again
      if (
        operationId !==
        cameraOperationRef.current
      ) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        return;
      }

      // ======================================================
      // PLAY VIDEO
      // ======================================================

      try {
        await video.play();

        console.log(
          "▶️ Video playing"
        );
      } catch (playError) {
        console.warn(
          "Video play warning:",
          playError
        );

        try {
          await video.play();
        } catch (secondPlayError) {
          console.error(
            "❌ Video play failed:",
            secondPlayError
          );

          throw secondPlayError;
        }
      }

      // ======================================================
      // LOAD MEDIAPIPE
      // ======================================================

      const {
        Hands,
        HAND_CONNECTIONS,
      } = await import(
        "@mediapipe/hands"
      );

      const {
        drawConnectors,
        drawLandmarks,
      } = await import(
        "@mediapipe/drawing_utils"
      );

      // Check operation
      if (
        operationId !==
        cameraOperationRef.current
      ) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        return;
      }

      console.log(
        "✅ MediaPipe modules loaded"
      );

      // ======================================================
      // MEDIAPIPE FILE PATH
      // ======================================================

      const baseUrl =
        import.meta.env.BASE_URL || "/";

      const normalizedBase =
        baseUrl.endsWith("/")
          ? baseUrl.slice(0, -1)
          : baseUrl;

      // ======================================================
      // CREATE MEDIAPIPE
      // ======================================================

      const hands =
        new Hands({
          locateFile: (
            file: string
          ) => {
            const path =
              `${normalizedBase}/mediapipe-hands/${file}`;

            console.log(
              "📦 MediaPipe file:",
              path
            );

            return path;
          },
        }) as unknown as MediaPipeHandsInstance;

      handsRef.current = hands;

      // ======================================================
      // MEDIAPIPE SETTINGS
      // ======================================================

      hands.setOptions({
        selfieMode: false,

        // ASL uses one hand
        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.70,

        minTrackingConfidence: 0.70,
      });

      console.log(
        "✅ MediaPipe configured"
      );

      // ======================================================
      // MEDIAPIPE RESULTS
      // ======================================================

      hands.onResults(
        async (results) => {
          // Ignore old camera operation
          if (
            operationId !==
            cameraOperationRef.current
          ) {
            return;
          }

          const canvas =
            canvasRef.current;

          const videoElement =
            videoRef.current;

          if (
            !canvas ||
            !videoElement
          ) {
            return;
          }

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            return;
          }

          // ==================================================
          // CANVAS SIZE
          // ==================================================

          if (
            videoElement.videoWidth > 0 &&
            videoElement.videoHeight > 0
          ) {
            canvas.width =
              videoElement.videoWidth;

            canvas.height =
              videoElement.videoHeight;
          }

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          // ==================================================
          // HANDS
          // ==================================================

          const handsDetected =
            results.multiHandLandmarks;

          // ==================================================
          // NO HAND
          // ==================================================

          if (
            !handsDetected ||
            handsDetected.length === 0
          ) {
            setHandDetected(false);

            setDetectedGesture(null);

            setConfidence(0);

            stableFramesRef.current = 0;

            lastGestureRef.current =
              null;

            confirmedGestureRef.current =
              null;

            return;
          }

          // ==================================================
          // HAND FOUND
          // ==================================================

          setHandDetected(true);

          // ==================================================
          // DRAW LANDMARKS
          // ==================================================

          for (
            const landmarks of handsDetected
          ) {
            drawConnectors(
              ctx,
              landmarks,
              HAND_CONNECTIONS
            );

            drawLandmarks(
              ctx,
              landmarks
            );
          }

          // ==================================================
          // GET FIRST HAND
          // ==================================================

          const handLandmarks =
            handsDetected[0];

          // ==================================================
          // NORMALIZE 21 LANDMARKS
          // ==================================================

          const normalizedLandmarks =
            normalizeLandmarks(
              handLandmarks
            );

          console.log(
            "Normalized landmarks:",
            normalizedLandmarks.length
          );

          // Must be exactly 63
          if (
            normalizedLandmarks.length !==
            63
          ) {
            console.error(
              "❌ Expected 63 normalized landmarks, received:",
              normalizedLandmarks.length
            );

            return;
          }

          // ==================================================
          // ONNX CLASSIFICATION
          // ==================================================

          try {
            const prediction =
              await predictASL(
                normalizedLandmarks
              );

            // IMPORTANT:
            // predictASL returns:
            //
            // {
            //   letter: string,
            //   confidence: number
            // }

            const letter =
              prediction.letter;

            const gestureConfidence =
              prediction.confidence;

            console.log(
              `🤖 ASL Prediction: ${letter}`
            );

            console.log(
              `🎯 Confidence: ${(gestureConfidence * 100).toFixed(2)}%`
            );

            // ==================================================
            // UPDATE CONFIDENCE
            // ==================================================

            setConfidence(
              gestureConfidence
            );

            // ==================================================
            // CONFIDENCE THRESHOLD
            // ==================================================

            const CONFIDENCE_THRESHOLD =
              0.20;

            if (
              !letter ||
              letter === "?" ||
              letter === "UNKNOWN" ||
              !Number.isFinite(
                gestureConfidence
              ) ||
              gestureConfidence <
                CONFIDENCE_THRESHOLD
            ) {
              console.log(
                "⚠️ Gesture rejected because confidence is too low"
              );

              setDetectedGesture(null);

              stableFramesRef.current =
                0;

              lastGestureRef.current =
                null;

              confirmedGestureRef.current =
                null;

              return;
            }

            // ==================================================
            // CREATE RESULT
            // ==================================================

            const result: DetectedGestureResult =
              {
                letter,

                confidence:
                  gestureConfidence,

                handCount:
                  handsDetected.length,

                timestamp:
                  Date.now(),
              };

            setDetectedGesture(
              result
            );

            // ==================================================
            // STABILITY FILTER
            // ==================================================

            if (
              lastGestureRef.current !==
              letter
            ) {
              // New letter
              lastGestureRef.current =
                letter;

              stableFramesRef.current =
                1;

              confirmedGestureRef.current =
                null;
            } else {
              // Same letter
              stableFramesRef.current++;
            }

            console.log(
              `Stable: ${stableFramesRef.current}/6`
            );

            // ==================================================
            // CONFIRM AFTER 6 STABLE FRAMES
            // ==================================================

            if (
              stableFramesRef.current >=
                6 &&
              confirmedGestureRef.current !==
                letter
            ) {
              console.log(
                `🎉 CONFIRMED ASL: ${letter}`
              );

              confirmedGestureRef.current =
                letter;

              setGestureCount(
                (previous) =>
                  previous + 1
              );

              // Send result to UI
              if (
                onGestureDetectedRef.current
              ) {
                onGestureDetectedRef.current(
                  result
                );
              }
            }
          } catch (predictionError) {
            console.error(
              "❌ ASL prediction error:",
              predictionError
            );

            setDetectedGesture(null);

            setConfidence(0);

            stableFramesRef.current =
              0;

            lastGestureRef.current =
              null;

            confirmedGestureRef.current =
              null;
          }
        }
      );

      // ======================================================
      // FRAME LOOP
      // ======================================================

      const processFrame =
        async () => {
          // Stop if old operation
          if (
            operationId !==
            cameraOperationRef.current
          ) {
            return;
          }

          if (
            !handsRef.current ||
            !videoRef.current
          ) {
            return;
          }

          // Prevent overlapping MediaPipe calls
          if (
            processingFrameRef.current
          ) {
            frameRequestRef.current =
              requestAnimationFrame(
                processFrame
              );

            return;
          }

          // Video needs data
          if (
            videoRef.current.readyState <
            HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            frameRequestRef.current =
              requestAnimationFrame(
                processFrame
              );

            return;
          }

          processingFrameRef.current =
            true;

          try {
            await handsRef.current.send({
              image:
                videoRef.current,
            });
          } catch (err) {
            if (
              operationId ===
              cameraOperationRef.current
            ) {
              console.error(
                "MediaPipe frame error:",
                err
              );
            }
          } finally {
            processingFrameRef.current =
              false;
          }

          // Continue
          if (
            operationId ===
              cameraOperationRef.current &&
            handsRef.current
          ) {
            frameRequestRef.current =
              requestAnimationFrame(
                processFrame
              );
          }
        };

      // Start frame processing
      frameRequestRef.current =
        requestAnimationFrame(
          processFrame
        );

      // ======================================================
      // CAMERA READY
      // ======================================================

      setIsRunning(true);

      setIsLoading(false);

      console.log(
        "✅ MediaPipe running"
      );
    } catch (err) {
      console.error(
        "❌ Camera error:",
        err
      );

      // Ignore old operation errors
      if (
        operationId !==
        cameraOperationRef.current
      ) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Failed to start camera";

      setError(message);

      setIsRunning(false);

      setIsLoading(false);

      // ======================================================
      // CLEAN FRAME
      // ======================================================

      if (
        frameRequestRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );

        frameRequestRef.current = null;
      }

      processingFrameRef.current =
        false;

      // ======================================================
      // CLOSE MEDIAPIPE
      // ======================================================

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch {
          // Ignore cleanup error
        }
      }

      handsRef.current = null;

      // ======================================================
      // STOP CAMERA
      // ======================================================

      if (videoRef.current) {
        const stream =
          videoRef.current.srcObject;

        if (
          stream instanceof MediaStream
        ) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        videoRef.current.srcObject =
          null;
      }
    } finally {
      startingCameraRef.current =
        false;
    }
  }, []);

  // ==========================================================
  // STOP CAMERA
  // ==========================================================

  const stopCamera =
    useCallback(() => {
      console.log(
        "🛑 Stopping camera..."
      );

      // Invalidate async operations
      ++cameraOperationRef.current;

      // ========================================================
      // STOP ANIMATION
      // ========================================================

      if (
        frameRequestRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );

        frameRequestRef.current = null;
      }

      processingFrameRef.current =
        false;

      // ========================================================
      // CLOSE MEDIAPIPE
      // ========================================================

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch (err) {
          console.warn(
            "MediaPipe close warning:",
            err
          );
        }
      }

      handsRef.current = null;

      // ========================================================
      // STOP CAMERA
      // ========================================================

      if (videoRef.current) {
        const stream =
          videoRef.current.srcObject;

        if (
          stream instanceof MediaStream
        ) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        videoRef.current.srcObject =
          null;

        try {
          videoRef.current.pause();
        } catch {
          // Ignore pause error
        }
      }

      // ========================================================
      // CLEAR CANVAS
      // ========================================================

      if (canvasRef.current) {
        const ctx =
          canvasRef.current.getContext(
            "2d"
          );

        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }

      // ========================================================
      // RESET STATE
      // ========================================================

      setIsRunning(false);

      setIsLoading(false);

      setHandDetected(false);

      setDetectedGesture(null);

      setConfidence(0);

      stableFramesRef.current = 0;

      lastGestureRef.current = null;

      confirmedGestureRef.current =
        null;

      startingCameraRef.current =
        false;

      console.log(
        "✅ Camera stopped"
      );
    }, []);

  // ==========================================================
  // RESET GESTURE COUNT
  // ==========================================================

  const resetGestureCount =
    useCallback(() => {
      setGestureCount(0);

      setDetectedGesture(null);

      setConfidence(0);

      stableFramesRef.current = 0;

      lastGestureRef.current = null;

      confirmedGestureRef.current =
        null;
    }, []);

  // ==========================================================
  // CLEANUP WHEN COMPONENT UNMOUNTS
  // ==========================================================

  useEffect(() => {
    return () => {
      ++cameraOperationRef.current;

      if (
        frameRequestRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );

        frameRequestRef.current = null;
      }

      processingFrameRef.current =
        false;

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch {
          // Ignore cleanup error
        }
      }

      handsRef.current = null;

      if (videoRef.current) {
        const stream =
          videoRef.current.srcObject;

        if (
          stream instanceof MediaStream
        ) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        videoRef.current.srcObject =
          null;
      }
    };
  }, []);

  // ==========================================================
  // RETURN
  // ==========================================================

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