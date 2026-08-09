import { useEffect, useState } from "react";
import {
  useMediaPipeHands,
  DetectedGestureResult,
} from "@/hooks/useMediaPipeHands";
import { Zap, Eye } from "lucide-react";

interface Props {
  isActive: boolean;
  onToggle: () => void;
  onGestureDetected?: (gesture: DetectedGestureResult) => void;
  onHandDetected?: (detected: boolean) => void;
}

const CameraView = ({
  isActive,
  onToggle,
  onGestureDetected,
  onHandDetected,
}: Props) => {
  const {
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
  } = useMediaPipeHands(onGestureDetected);

  const [showDetails, setShowDetails] = useState(true);

  /*
   * Keep camera synchronized with parent state.
   */
  useEffect(() => {
    let mounted = true;

    const runCamera = async () => {
      if (!mounted) return;

      if (isActive) {
        await startCamera();
      } else {
        stopCamera();
      }
    };

    runCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  /*
   * Tell parent whether a hand is currently detected.
   */
  useEffect(() => {
    onHandDetected?.(handDetected);
  }, [handDetected, onHandDetected]);

  /*
   * Stop camera button.
   */
  const handleStop = () => {
    stopCamera();
    resetGestureCount();

    if (isActive) {
      onToggle();
    }
  };

  /*
   * Start camera button.
   */
  const handleStart = () => {
    if (!isActive) {
      onToggle();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* CAMERA CONTAINER */}
      <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl bg-black">
        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block w-full h-[500px] object-cover"
          style={{
            transform: "scaleX(-1)",
          }}
        />

        {/* MEDIAPIPE LANDMARK CANVAS */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: "scaleX(-1)",
          }}
        />

        {/* GESTURE RESULT */}
        {detectedGesture && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
              <Zap className="w-5 h-5 text-white animate-pulse" />

              <div>
                <div className="text-white font-bold text-2xl leading-none">
                  {detectedGesture.letter}
                </div>

                <div className="text-xs text-cyan-100 mt-1">
                  {(detectedGesture.confidence * 100).toFixed(0)}% confident
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GESTURE COUNT */}
        <div className="absolute top-4 right-4 z-20 bg-purple-600/90 backdrop-blur rounded-xl px-4 py-2">
          <div className="text-white text-sm font-medium">
            Gestures:
            <span className="text-2xl font-bold ml-2">
              {gestureCount}
            </span>
          </div>
        </div>

        {/* TIPS */}
        <div className="absolute top-20 right-4 z-20 text-white text-xs bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
          <div className="font-semibold mb-1">
            Tips:
          </div>

          <div className="space-y-1 text-gray-200">
            <div>• Show full hand in frame</div>
            <div>• Good lighting required</div>
            <div>• Keep hand steady</div>
          </div>
        </div>

        {/* HAND DETECTION STATUS */}
        <div className="absolute bottom-4 right-4 z-20">
          <div
            className={`text-sm px-3 py-2 rounded-lg backdrop-blur ${
              handDetected
                ? "bg-green-600/80 text-white"
                : "bg-black/60 text-gray-300"
            }`}
          >
            {handDetected
              ? "✓ Hand Detected"
              : "No Hand Detected"}
          </div>
        </div>

        {/* WAITING MESSAGE */}
        {!detectedGesture &&
          !isLoading &&
          isRunning && (
            <div className="absolute bottom-4 left-4 z-20 text-gray-200 text-sm flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg">
              <Eye className="w-4 h-4" />
              Waiting for hand detection...
            </div>
          )}

        {/* CONFIDENCE BAR */}
        {detectedGesture && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-20">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-100"
              style={{
                width: `${Math.min(confidence * 100, 100)}%`,
              }}
            />
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center text-white bg-black/60 backdrop-blur">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

              <p className="font-medium">
                Starting camera...
              </p>

              <p className="text-sm text-gray-300 mt-1">
                Loading hand detection model
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="absolute inset-0 z-40 flex items-center justify-center text-white bg-black/70 backdrop-blur">
            <div className="text-center max-w-md px-6">
              <div className="text-red-400 text-xl font-bold mb-2">
                Camera Error
              </div>

              <p className="text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CAMERA CONTROLS */}
      <div className="flex justify-center gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={handleStop}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Stop Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading
              ? "Starting..."
              : "Start Camera"}
          </button>
        )}

        {gestureCount > 0 && (
          <button
            type="button"
            onClick={resetGestureCount}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Reset Count
          </button>
        )}
      </div>

      {/* GESTURE DETAILS */}
      {showDetails && detectedGesture && (
        <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border border-teal-500/30">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" />
              Detected Gesture
            </h3>

            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* LETTER */}
            <div>
              <p className="text-gray-400 text-sm">
                Letter
              </p>

              <p className="text-white font-bold text-3xl">
                {detectedGesture.letter}
              </p>
            </div>

            {/* CONFIDENCE */}
            <div>
              <p className="text-gray-400 text-sm mb-2">
                Confidence
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-teal-500"
                    style={{
                      width: `${Math.min(
                        confidence * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <span className="text-white font-mono text-sm">
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* HAND COUNT */}
            <div>
              <p className="text-gray-400 text-sm">
                Hands Detected
              </p>

              <p className="text-white font-bold">
                {detectedGesture.handCount}
              </p>
            </div>

            {/* GESTURE COUNT */}
            <div>
              <p className="text-gray-400 text-sm">
                Total Gestures
              </p>

              <p className="text-white font-bold">
                {gestureCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SHOW DETAILS AGAIN */}
      {!showDetails && detectedGesture && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="text-teal-500 hover:text-teal-400 text-sm"
          >
            Show gesture details
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;