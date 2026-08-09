import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import { predictASL } from "@/lib/gestureClassifier";

// ============================================================
// TYPES
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

interface MediaPipeWindow {
  Hands?: new (config: {
    locateFile: (file: string) => string;
  }) => MediaPipeHandsInstance;

  HAND_CONNECTIONS?: any;

  drawConnectors?: (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any
  ) => void;

  drawLandmarks?: (
    ctx: CanvasRenderingContext2D,
    landmarks: any[]
  ) => void;
}

// ============================================================
// DETECTED GESTURE
// ============================================================

export interface DetectedGestureResult {
  letter: string;
  confidence: number;
  handCount: number;
  timestamp: number;
}

// ============================================================
// MEDIAPIPE CDN
// ============================================================

const MEDIAPIPE_HANDS_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";

const MEDIAPIPE_DRAWING_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";

const MEDIAPIPE_ASSET_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/";

let mediaPipeLoadingPromise: Promise<void> | null = null;

// ============================================================
// LOAD SCRIPT
// ============================================================

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${src}"]`
    );

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src = src;
    script.async = true;

    script.onload = () => {
      console.log("✅ MediaPipe script loaded:", src);
      resolve();
    };

    script.onerror = () => {
      reject(
        new Error(
          `Failed to load MediaPipe script: ${src}`
        )
      );
    };

    document.head.appendChild(script);
  });
}

// ============================================================
// LOAD MEDIAPIPE
// ============================================================

async function loadMediaPipe(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error(
      "MediaPipe can only run in the browser."
    );
  }

  if (mediaPipeLoadingPromise) {
    return mediaPipeLoadingPromise;
  }

  const win =
    window as unknown as MediaPipeWindow;

  if (
    win.Hands &&
    win.HAND_CONNECTIONS &&
    win.drawConnectors &&
    win.drawLandmarks
  ) {
    console.log(
      "✅ MediaPipe already available"
    );

    return;
  }

  mediaPipeLoadingPromise = (async () => {
    console.log(
      "📦 Loading MediaPipe from CDN..."
    );

    await loadScript(
      MEDIAPIPE_DRAWING_SCRIPT
    );

    await loadScript(
      MEDIAPIPE_HANDS_SCRIPT
    );

    const currentWindow =
      window as unknown as MediaPipeWindow;

    if (!currentWindow.Hands) {
      throw new Error(
        "MediaPipe Hands constructor was not loaded."
      );
    }

    if (!currentWindow.HAND_CONNECTIONS) {
      throw new Error(
        "MediaPipe HAND_CONNECTIONS was not loaded."
      );
    }

    if (!currentWindow.drawConnectors) {
      throw new Error(
        "MediaPipe drawConnectors was not loaded."
      );
    }

    if (!currentWindow.drawLandmarks) {
      throw new Error(
        "MediaPipe drawLandmarks was not loaded."
      );
    }

    console.log(
      "✅ MediaPipe loaded successfully"
    );
  })();

  try {
    await mediaPipeLoadingPromise;
  } catch (error) {
    mediaPipeLoadingPromise = null;
    throw error;
  }
}

// ============================================================
// NORMALIZE LANDMARKS
// MUST MATCH PYTHON TRAINING
// ============================================================

function normalizeLandmarks(
  landmarks: any[]
): number[] {
  const points = landmarks.map((p) => [
    Number(p.x),
    Number(p.y),
    Number(p.z),
  ]);

  // ----------------------------------------------------------
  // SAFETY CHECK
  // ----------------------------------------------------------

  if (points.length !== 21) {
    console.error(
      "❌ Expected 21 hand landmarks, received:",
      points.length
    );

    return [];
  }

  // ----------------------------------------------------------
  // WRIST = LANDMARK 0
  // ----------------------------------------------------------

  const wrist = [
    points[0][0],
    points[0][1],
    points[0][2],
  ];

  // ----------------------------------------------------------
  // MOVE WRIST TO ORIGIN
  // ----------------------------------------------------------

  for (let i = 0; i < points.length; i++) {
    points[i][0] -= wrist[0];
    points[i][1] -= wrist[1];
    points[i][2] -= wrist[2];
  }

  // ----------------------------------------------------------
  // MIDDLE MCP = LANDMARK 9
  // SAME AS PYTHON
  // ----------------------------------------------------------

  const middleMCP = points[9];

  const scale = Math.sqrt(
    middleMCP[0] ** 2 +
      middleMCP[1] ** 2 +
      middleMCP[2] ** 2
  );

  const safeScale =
    scale < 0.000001 ? 1.0 : scale;

  // ----------------------------------------------------------
  // SCALE
  // ----------------------------------------------------------

  for (let i = 0; i < points.length; i++) {
    points[i][0] /= safeScale;
    points[i][1] /= safeScale;
    points[i][2] /= safeScale;
  }

  // ----------------------------------------------------------
  // 21 × 3 = 63
  // ----------------------------------------------------------

  return points.flat();
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
    useRef<MediaPipeHandsInstance | null>(
      null
    );

  const frameRequestRef =
    useRef<number | null>(null);

  const startingCameraRef =
    useRef(false);

  const cameraOperationRef =
    useRef(0);

  const processingFrameRef =
    useRef(false);

  // ==========================================================
  // CALLBACK REF
  // ==========================================================

  const onGestureDetectedRef =
    useRef(onGestureDetected);

  onGestureDetectedRef.current =
    onGestureDetected;

  // ==========================================================
  // STABILITY
  // ==========================================================

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
    useState<DetectedGestureResult | null>(
      null
    );

  const [confidence, setConfidence] =
    useState(0);

  const [gestureCount, setGestureCount] =
    useState(0);

  // ==========================================================
  // START CAMERA
  // ==========================================================

  const startCamera = useCallback(
    async () => {
      if (startingCameraRef.current) {
        console.log(
          "⚠️ Camera start already in progress"
        );

        return;
      }

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

        const video =
          videoRef.current;

        if (!video) {
          throw new Error(
            "Video element not available"
          );
        }

        // ====================================================
        // STOP OLD FRAME LOOP
        // ====================================================

        if (
          frameRequestRef.current !== null
        ) {
          cancelAnimationFrame(
            frameRequestRef.current
          );

          frameRequestRef.current = null;
        }

        processingFrameRef.current =
          false;

        // ====================================================
        // CLOSE OLD MEDIAPIPE
        // ====================================================

        if (handsRef.current?.close) {
          try {
            handsRef.current.close();
          } catch (error) {
            console.warn(
              "Old MediaPipe close warning:",
              error
            );
          }
        }

        handsRef.current = null;

        // ====================================================
        // CHECK CAMERA SUPPORT
        // ====================================================

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "Camera is not supported by this browser."
          );
        }

        // ====================================================
        // CAMERA PERMISSION
        // ====================================================

        console.log(
          "📷 Requesting camera permission..."
        );

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
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
            }
          );

        // ====================================================
        // IGNORE OLD CAMERA REQUEST
        // ====================================================

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

        // ====================================================
        // STOP OLD STREAM
        // ====================================================

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

        // ====================================================
        // ATTACH CAMERA
        // ====================================================

        video.srcObject = stream;

        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        // ====================================================
        // WAIT FOR VIDEO
        // ====================================================

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

        // ====================================================
        // PLAY
        // ====================================================

        await video.play();

        console.log(
          "▶️ Video playing"
        );

        // ====================================================
        // LOAD MEDIAPIPE FROM CDN
        // ====================================================

        await loadMediaPipe();

        // ====================================================
        // CHECK OPERATION
        // ====================================================

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

        const win =
          window as unknown as MediaPipeWindow;

        if (!win.Hands) {
          throw new Error(
            "MediaPipe Hands is unavailable."
          );
        }

        if (!win.HAND_CONNECTIONS) {
          throw new Error(
            "MediaPipe HAND_CONNECTIONS is unavailable."
          );
        }

        if (!win.drawConnectors) {
          throw new Error(
            "MediaPipe drawing utilities unavailable."
          );
        }

        if (!win.drawLandmarks) {
          throw new Error(
            "MediaPipe drawing utilities unavailable."
          );
        }

        console.log(
          "✅ MediaPipe modules loaded"
        );

        // ====================================================
        // CREATE HANDS
        // ====================================================

        const hands =
          new win.Hands({
            locateFile: (
              file: string
            ) => {
              const url =
                `${MEDIAPIPE_ASSET_URL}${file}`;

              console.log(
                "📦 MediaPipe file:",
                url
              );

              return url;
            },
          });

        handsRef.current =
          hands;

        // ====================================================
        // MEDIAPIPE SETTINGS
        // ====================================================

        hands.setOptions({
          selfieMode: false,

          maxNumHands: 1,

          modelComplexity: 1,

          minDetectionConfidence: 0.70,

          minTrackingConfidence: 0.70,
        });

        console.log(
          "✅ MediaPipe configured"
        );

        // ====================================================
        // RESULTS
        // ====================================================

        hands.onResults(
          async (results) => {
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
              videoElement.videoWidth >
                0 &&
              videoElement.videoHeight >
                0
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

              stableFramesRef.current =
                0;

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
            // DRAW
            // ==================================================

            for (
              const landmarks of
                handsDetected
            ) {
              win.drawConnectors!(
                ctx,
                landmarks,
                win.HAND_CONNECTIONS
              );

              win.drawLandmarks!(
                ctx,
                landmarks
              );
            }

            // ==================================================
            // FIRST HAND
            // ==================================================

            const handLandmarks =
              handsDetected[0];

            // ==================================================
            // NORMALIZE
            // ==================================================

            const normalizedLandmarks =
              normalizeLandmarks(
                handLandmarks
              );

            console.log(
              "Normalized landmarks:",
              normalizedLandmarks.length
            );

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
              // CONFIDENCE
              // ==================================================

              setConfidence(
                gestureConfidence
              );

              // ==================================================
              // CONFIDENCE THRESHOLD
              //
              // Your current model outputs many
              // predictions around 20-50%.
              //
              // Keep this at 0.20 for now.
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

                setDetectedGesture(
                  null
                );

                stableFramesRef.current =
                  0;

                lastGestureRef.current =
                  null;

                confirmedGestureRef.current =
                  null;

                return;
              }

              // ==================================================
              // RESULT
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
              // STABILITY
              // ==================================================

              if (
                lastGestureRef.current !==
                letter
              ) {
                lastGestureRef.current =
                  letter;

                stableFramesRef.current =
                  1;

                confirmedGestureRef.current =
                  null;
              } else {
                stableFramesRef.current++;
              }

              console.log(
                `Stable: ${stableFramesRef.current}/6`
              );

              // ==================================================
              // CONFIRM
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

              setDetectedGesture(
                null
              );

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

        // ====================================================
        // FRAME LOOP
        // ====================================================

        const processFrame =
          async () => {
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

            // ==================================================
            // PREVENT OVERLAPPING FRAMES
            // ==================================================

            if (
              processingFrameRef.current
            ) {
              frameRequestRef.current =
                requestAnimationFrame(
                  processFrame
                );

              return;
            }

            // ==================================================
            // VIDEO READY
            // ==================================================

            if (
              videoRef.current
                .readyState <
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
              await handsRef.current.send(
                {
                  image:
                    videoRef.current,
                }
              );
            } catch (frameError) {
              if (
                operationId ===
                cameraOperationRef.current
              ) {
                console.error(
                  "MediaPipe frame error:",
                  frameError
                );
              }
            } finally {
              processingFrameRef.current =
                false;
            }

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

        // ====================================================
        // START FRAME LOOP
        // ====================================================

        frameRequestRef.current =
          requestAnimationFrame(
            processFrame
          );

        // ====================================================
        // CAMERA READY
        // ====================================================

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

        // ====================================================
        // CLEAN FRAME
        // ====================================================

        if (
          frameRequestRef.current !==
          null
        ) {
          cancelAnimationFrame(
            frameRequestRef.current
          );

          frameRequestRef.current =
            null;
        }

        processingFrameRef.current =
          false;

        // ====================================================
        // CLOSE MEDIAPIPE
        // ====================================================

        if (handsRef.current?.close) {
          try {
            handsRef.current.close();
          } catch {
            // Ignore cleanup
          }
        }

        handsRef.current = null;

        // ====================================================
        // STOP CAMERA
        // ====================================================

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
    },
    []
  );

  // ==========================================================
  // STOP CAMERA
  // ==========================================================

  const stopCamera =
    useCallback(() => {
      console.log(
        "🛑 Stopping camera..."
      );

      // Invalidate old operations
      ++cameraOperationRef.current;

      // ========================================================
      // STOP FRAME LOOP
      // ========================================================

      if (
        frameRequestRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRequestRef.current
        );

        frameRequestRef.current =
          null;
      }

      processingFrameRef.current =
        false;

      // ========================================================
      // CLOSE MEDIAPIPE
      // ========================================================

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch (error) {
          console.warn(
            "MediaPipe close warning:",
            error
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
          // Ignore
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
      // RESET
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
  // CLEANUP
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

        frameRequestRef.current =
          null;
      }

      processingFrameRef.current =
        false;

      if (handsRef.current?.close) {
        try {
          handsRef.current.close();
        } catch {
          // Ignore
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