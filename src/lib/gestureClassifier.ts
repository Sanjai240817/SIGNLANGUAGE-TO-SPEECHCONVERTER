// Gesture classification based on hand landmarks
// Uses MediaPipe hand landmarks to identify ASL letters

import { ASL_ALPHABET, validateASLMatch } from './aslDataset';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedGesture {
  letter: string;
  confidence: number;
  landmarks?: HandLandmark[];
}

// Finger indices in MediaPipe hand landmarks
const FINGER_TIPS = {
  THUMB: 4,
  INDEX: 8,
  MIDDLE: 12,
  RING: 16,
  PINKY: 20,
};

const FINGER_PIPS = {
  THUMB: 3,
  INDEX: 6,
  MIDDLE: 10,
  RING: 14,
  PINKY: 18,
};

const FINGER_MCPS = {
  THUMB: 2,
  INDEX: 5,
  MIDDLE: 9,
  RING: 13,
  PINKY: 17,
};

const PALM_CENTER = 9; // Middle MCP

/**
 * Calculate distance between two 3D points
 */
function distance3D(p1: HandLandmark, p2: HandLandmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function distance2D(p1: HandLandmark, p2: HandLandmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2)
  );
}

/**
 * Get finger extension state with degree of extension
 */
function getFingerExtensionDegree(
  landmarks: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): number {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  
  if (!tip || !pip || !mcp) return 0;
  
  // Calculate how extended the finger is (0 = fully bent, 1 = fully extended)
  const tipPipDist = distance2D(tip, pip);
  const pipMcpDist = distance2D(pip, mcp);
  const expectedExtendedDist = tipPipDist + pipMcpDist;
  
  const tipMcpDist = distance2D(tip, mcp);
  const extensionRatio = Math.min(1, tipMcpDist / (expectedExtendedDist || 0.1));
  
  return extensionRatio;
}

/**
 * Check if a finger is extended (tip above PIP joint)
 */
function isFingerExtended(
  landmarks: HandLandmark[],
  tipIndex: number,
  pipIndex: number
): boolean {
  if (!landmarks[tipIndex] || !landmarks[pipIndex]) return false;
  // Extended if tip is higher (lower Y value) than PIP
  return landmarks[tipIndex].y < landmarks[pipIndex].y - 0.01;
}

/**
 * Check if a finger is bent/folded (tip below PIP joint)
 */
function isFingerBent(
  landmarks: HandLandmark[],
  tipIndex: number,
  pipIndex: number
): boolean {
  if (!landmarks[tipIndex] || !landmarks[pipIndex]) return false;
  // Bent if tip is lower (higher Y value) than PIP
  return landmarks[tipIndex].y > landmarks[pipIndex].y + 0.01;
}

/**
 * Get finger configuration from landmarks
 */
function isFingerExtendedStrict(
  landmarks: HandLandmark[],
  tipIndex: number,
  pipIndex: number,
  mcpIndex: number
): boolean {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  const mcp = landmarks[mcpIndex];
  if (!tip || !pip || !mcp) return false;

  return (
    tip.y < pip.y - 0.01 &&
    pip.y < mcp.y - 0.01
  );
}

function isFingerFolded(
  landmarks: HandLandmark[],
  tipIndex: number,
  pipIndex: number,
  mcpIndex: number
): boolean {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  const mcp = landmarks[mcpIndex];
  if (!tip || !pip || !mcp) return false;

  return tip.y > pip.y + 0.01 && pip.y > mcp.y + 0.01;
}

function isThumbExtended(
  landmarks: HandLandmark[],
  orientation: 'left' | 'right'
): boolean {
  const thumbTip = landmarks[FINGER_TIPS.THUMB];
  const indexMCP = landmarks[FINGER_MCPS.INDEX];
  if (!thumbTip || !indexMCP) return false;

  const horizontalDist = Math.abs(thumbTip.x - indexMCP.x);
  return horizontalDist > 0.06 &&
    (orientation === 'right' ? thumbTip.x < indexMCP.x : thumbTip.x > indexMCP.x);
}

function getFingerConfig(landmarks: HandLandmark[]) {
  const orientation = getHandOrientation(landmarks);

  return {
    thumb: isThumbExtended(landmarks, orientation),
    index: isFingerExtendedStrict(landmarks, FINGER_TIPS.INDEX, FINGER_PIPS.INDEX, FINGER_MCPS.INDEX),
    middle: isFingerExtendedStrict(landmarks, FINGER_TIPS.MIDDLE, FINGER_PIPS.MIDDLE, FINGER_MCPS.MIDDLE),
    ring: isFingerExtendedStrict(landmarks, FINGER_TIPS.RING, FINGER_PIPS.RING, FINGER_MCPS.RING),
    pinky: isFingerExtendedStrict(landmarks, FINGER_TIPS.PINKY, FINGER_PIPS.PINKY, FINGER_MCPS.PINKY),
    isRingFolded: isFingerFolded(landmarks, FINGER_TIPS.RING, FINGER_PIPS.RING, FINGER_MCPS.RING),
    isPinkyFolded: isFingerFolded(landmarks, FINGER_TIPS.PINKY, FINGER_PIPS.PINKY, FINGER_MCPS.PINKY),
    orientation,
  };
}

/**
 * Get hand orientation (left or right)
 */
function getHandOrientation(landmarks: HandLandmark[]): 'left' | 'right' {
  // If thumb is on the left side of the hand, it's a right hand
  const thumbX = landmarks[FINGER_TIPS.THUMB].x;
  const palmCenterX = landmarks[PALM_CENTER].x;
  return thumbX < palmCenterX ? 'right' : 'left';
}

/**
 * Count extended fingers
 */
function countExtendedFingers(config: ReturnType<typeof getFingerConfig>): number {
  return (
    (config.thumb ? 1 : 0) +
    (config.index ? 1 : 0) +
    (config.middle ? 1 : 0) +
    (config.ring ? 1 : 0) +
    (config.pinky ? 1 : 0)
  );
}

/**
 * Classify gesture based on ASL dataset with high accuracy
 */
export function classifyGesture(landmarks: HandLandmark[]): DetectedGesture {
  if (!landmarks || landmarks.length < 21) {
    return { letter: '?', confidence: 0, landmarks };
  }

  const fingerConfig = getFingerConfig(landmarks);
  const extendedCount = countExtendedFingers(fingerConfig);

  // Get extension degrees for more nuanced detection
  const indexExt = getFingerExtensionDegree(landmarks, FINGER_TIPS.INDEX, FINGER_PIPS.INDEX, FINGER_MCPS.INDEX);
  const middleExt = getFingerExtensionDegree(landmarks, FINGER_TIPS.MIDDLE, FINGER_PIPS.MIDDLE, FINGER_MCPS.MIDDLE);
  const ringExt = getFingerExtensionDegree(landmarks, FINGER_TIPS.RING, FINGER_PIPS.RING, FINGER_MCPS.RING);
  const pinkyExt = getFingerExtensionDegree(landmarks, FINGER_TIPS.PINKY, FINGER_PIPS.PINKY, FINGER_MCPS.PINKY);
  const thumbExt = getFingerExtensionDegree(landmarks, FINGER_TIPS.THUMB, FINGER_PIPS.THUMB, FINGER_MCPS.THUMB);

  // Score each ASL letter
  const letterScores: Array<{ letter: string; confidence: number; matchScore: number }> = [];

  for (const letter of Object.keys(ASL_ALPHABET)) {
    const matchScore = validateASLMatch(letter, fingerConfig);
    const aslConfig = ASL_ALPHABET[letter];

    // Base confidence from finger configuration match
    let confidence = matchScore;

    // Add extension degree matching to boost confidence
    const configExpected = aslConfig.fingerConfig;
    let extensionMatch = 0;
    let extensionTotal = 0;

    if (configExpected.index) {
      extensionTotal++;
      extensionMatch += Math.min(1, indexExt / 0.7); // Normalize to expected extended state
    } else {
      extensionTotal++;
      extensionMatch += Math.min(1, 1 - indexExt / 0.5); // Penalize if expected folded but extended
    }

    if (configExpected.middle) {
      extensionTotal++;
      extensionMatch += Math.min(1, middleExt / 0.7);
    } else {
      extensionTotal++;
      extensionMatch += Math.min(1, 1 - middleExt / 0.5);
    }

    if (configExpected.ring) {
      extensionTotal++;
      extensionMatch += Math.min(1, ringExt / 0.7);
    } else {
      extensionTotal++;
      extensionMatch += Math.min(1, 1 - ringExt / 0.5);
    }

    if (configExpected.pinky) {
      extensionTotal++;
      extensionMatch += Math.min(1, pinkyExt / 0.7);
    } else {
      extensionTotal++;
      extensionMatch += Math.min(1, 1 - pinkyExt / 0.5);
    }

    if (configExpected.thumb) {
      extensionTotal++;
      extensionMatch += Math.min(1, thumbExt / 0.7);
    } else {
      extensionTotal++;
      extensionMatch += Math.min(1, 1 - thumbExt / 0.5);
    }

    const extensionScore = extensionMatch / extensionTotal;

    // Combined confidence: 60% from configuration match, 40% from extension degree match
    confidence = matchScore * 0.6 + extensionScore * 0.4;

    // Apply confidence boost from dataset
    confidence = Math.min(0.99, confidence + aslConfig.confidenceBoost * 0.1);

    letterScores.push({
      letter,
      confidence,
      matchScore,
    });
  }

  // Sort by confidence descending
  letterScores.sort((a, b) => b.confidence - a.confidence);

  // Debug logging
  console.log('🎯 Top 3 ASL Letter Candidates:', letterScores.slice(0, 3).map(s => `${s.letter}(${(s.confidence * 100).toFixed(1)}%)`).join(', '));

  // Return best match only if confidence is high
  const bestMatch = letterScores[0];
  if (bestMatch.confidence >= 0.65) {
    return {
      letter: bestMatch.letter,
      confidence: bestMatch.confidence,
      landmarks,
    };
  }

  // Check if there's a clear winner (significant gap from second place)
  if (letterScores.length > 1 && bestMatch.confidence - letterScores[1].confidence > 0.15) {
    return {
      letter: bestMatch.letter,
      confidence: Math.max(0.65, bestMatch.confidence), // Ensure minimum confidence for high certainty
      landmarks,
    };
  }

  return {
    letter: '?',
    confidence: 0,
    landmarks,
  };
}

/**
 * Detect dominant gesture from multiple hand landmarks
 */
export function detectGestureFromHands(
  multiHandLandmarks: HandLandmark[][]
): DetectedGesture | null {
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
    return null;
  }

  // Use the first/dominant hand
  const primaryHand = multiHandLandmarks[0];
  return classifyGesture(primaryHand);
}
