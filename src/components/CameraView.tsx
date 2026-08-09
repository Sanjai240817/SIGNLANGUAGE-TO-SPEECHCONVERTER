import { useEffect, useState } from "react";
import { useMediaPipeHands, DetectedGestureResult } from "@/hooks/useMediaPipeHands";
import { Zap, Eye } from "lucide-react";

interface Props {
  isActive: boolean;
  onToggle: () => void;
  onGestureDetected?: (gesture: DetectedGestureResult) => void;
  onHandDetected?: (detected: boolean) => void;
}

const CameraView = ({ isActive, onToggle, onGestureDetected, onHandDetected }: Props) => {
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

  // Keep camera in sync with parent active state
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    if (onHandDetected) {
      onHandDetected(handDetected);
    }
  }, [handDetected, onHandDetected]);

  const handleStop = () => {
    stopCamera();
    resetGestureCount();
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
          {/* VIDEO (YOUR FACE) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[500px] object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* CANVAS OVERLAY */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Gesture Status Badge */}
          {detectedGesture && (
            <div className="absolute top-4 left-4">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-white animate-pulse" />
                <div>
                  <div className="text-white font-bold text-xl">{detectedGesture.letter}</div>
                  <div className="text-xs text-cyan-100">
                    {(detectedGesture.confidence * 100).toFixed(0)}% confident
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hand positioning guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 right-8 text-white text-xs bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
              <div className="font-semibold mb-1">Tips:</div>
              <div className="space-y-1 text-gray-200">
                <div>• Show full hand in frame</div>
                <div>• Good lighting required</div>
                <div>• Keep hand steady</div>
              </div>
            </div>
          </div>

          {/* Gesture Count Badge */}
          <div className="absolute top-4 right-4 bg-purple-600/80 backdrop-blur rounded-lg px-4 py-2">
            <div className="text-white text-sm font-medium">
              Gestures: <span className="text-2xl font-bold">{gestureCount}</span>
            </div>
          </div>

          {/* Detection state */}
          <div className="absolute bottom-4 right-4 text-white text-sm bg-black/60 px-3 py-1 rounded-lg">
            {handDetected ? 'Hand Detected' : 'No Hand Detected'}
          </div>

          {/* Confidence Bar */}
          {detectedGesture && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-100"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 backdrop-blur">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-top-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/50 backdrop-blur">
              {error}
            </div>
          )}

          {/* No hand detected message */}
          {!detectedGesture && !isLoading && isRunning && (
            <div className="absolute bottom-4 left-4 text-gray-300 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Waiting for hand detection...
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          {isRunning ? (
            <button
              onClick={() => {
                handleStop();
                onToggle();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Stop Camera
            </button>
          ) : (
            <button
              onClick={() => {
                onToggle();
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start Camera
            </button>
          )}
          
          {gestureCount > 0 && (
            <button
              onClick={resetGestureCount}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reset Count
            </button>
          )}
        </div>
      </div>

      {/* Gesture Details */}
      {showDetails && detectedGesture && (
        <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 border border-teal-500/30">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400" />
              Detected Gesture
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Letter</p>
              <p className="text-white font-bold text-2xl">{detectedGesture.letter}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-teal-500"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-white font-mono text-sm">{(confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hands Detected</p>
              <p className="text-white font-bold">{detectedGesture.handCount}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Gestures</p>
              <p className="text-white font-bold">{gestureCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;

