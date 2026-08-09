// ASL Sign Language gesture mappings
// Maps finger positions and hand configurations to letters/words

export interface SignGesture {
  name: string;
  description: string;
  handShape: string;
  fingerPositions: {
    thumb: 'extended' | 'folded' | 'across';
    index: 'extended' | 'folded' | 'bent';
    middle: 'extended' | 'folded' | 'bent';
    ring: 'extended' | 'folded' | 'bent';
    pinky: 'extended' | 'folded' | 'bent';
  };
}

export const ASL_ALPHABET: Record<string, SignGesture> = {
  A: {
    name: 'A',
    description: 'Fist with thumb on the side',
    handShape: '✊',
    fingerPositions: {
      thumb: 'across',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  B: {
    name: 'B',
    description: 'Flat hand with thumb folded',
    handShape: '🖐️',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'extended',
      pinky: 'extended',
    },
  },
  C: {
    name: 'C',
    description: 'Curved hand forming C shape',
    handShape: '🤏',
    fingerPositions: {
      thumb: 'extended',
      index: 'bent',
      middle: 'bent',
      ring: 'bent',
      pinky: 'bent',
    },
  },
  D: {
    name: 'D',
    description: 'Index up, others form circle with thumb',
    handShape: '☝️',
    fingerPositions: {
      thumb: 'across',
      index: 'extended',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  E: {
    name: 'E',
    description: 'All fingers bent into palm, thumb across',
    handShape: '🤜',
    fingerPositions: {
      thumb: 'across',
      index: 'bent',
      middle: 'bent',
      ring: 'bent',
      pinky: 'bent',
    },
  },
  F: {
    name: 'F',
    description: 'Index and thumb form circle, others extended',
    handShape: '👌',
    fingerPositions: {
      thumb: 'across',
      index: 'bent',
      middle: 'extended',
      ring: 'extended',
      pinky: 'extended',
    },
  },
  G: {
    name: 'G',
    description: 'Index and thumb pointing, others folded',
    handShape: '👉',
    fingerPositions: {
      thumb: 'extended',
      index: 'extended',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  H: {
    name: 'H',
    description: 'Index and middle extended horizontally',
    handShape: '✌️',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  I: {
    name: 'I',
    description: 'Pinky extended, others folded',
    handShape: '🤙',
    fingerPositions: {
      thumb: 'folded',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'extended',
    },
  },
  K: {
    name: 'K',
    description: 'Index and middle up in V, thumb between',
    handShape: '✌️',
    fingerPositions: {
      thumb: 'extended',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  L: {
    name: 'L',
    description: 'L shape with thumb and index',
    handShape: '👆',
    fingerPositions: {
      thumb: 'extended',
      index: 'extended',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  M: {
    name: 'M',
    description: 'Thumb under three folded fingers',
    handShape: '✊',
    fingerPositions: {
      thumb: 'folded',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  N: {
    name: 'N',
    description: 'Thumb under two folded fingers',
    handShape: '✊',
    fingerPositions: {
      thumb: 'across',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  O: {
    name: 'O',
    description: 'All fingers form O shape',
    handShape: '👌',
    fingerPositions: {
      thumb: 'across',
      index: 'bent',
      middle: 'bent',
      ring: 'bent',
      pinky: 'bent',
    },
  },
  P: {
    name: 'P',
    description: 'K hand shape pointing down',
    handShape: '🤞',
    fingerPositions: {
      thumb: 'extended',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  Q: {
    name: 'Q',
    description: 'G hand shape pointing down',
    handShape: '👇',
    fingerPositions: {
      thumb: 'extended',
      index: 'extended',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  R: {
    name: 'R',
    description: 'Index and middle crossed',
    handShape: '🤞',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  S: {
    name: 'S',
    description: 'Fist with thumb over fingers',
    handShape: '✊',
    fingerPositions: {
      thumb: 'across',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  T: {
    name: 'T',
    description: 'Thumb between index and middle',
    handShape: '👊',
    fingerPositions: {
      thumb: 'across',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  U: {
    name: 'U',
    description: 'Index and middle together, pointing up',
    handShape: '✌️',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  V: {
    name: 'V',
    description: 'Peace sign - index and middle extended',
    handShape: '✌️',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  W: {
    name: 'W',
    description: 'Three fingers extended',
    handShape: '🖖',
    fingerPositions: {
      thumb: 'folded',
      index: 'extended',
      middle: 'extended',
      ring: 'extended',
      pinky: 'folded',
    },
  },
  X: {
    name: 'X',
    description: 'Index bent like a hook',
    handShape: '☝️',
    fingerPositions: {
      thumb: 'across',
      index: 'bent',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
  Y: {
    name: 'Y',
    description: 'Thumb and pinky extended (hang loose)',
    handShape: '🤙',
    fingerPositions: {
      thumb: 'extended',
      index: 'folded',
      middle: 'folded',
      ring: 'folded',
      pinky: 'extended',
    },
  },
  Z: {
    name: 'Z',
    description: 'Draw Z in air with index finger',
    handShape: '☝️',
    fingerPositions: {
      thumb: 'across',
      index: 'extended',
      middle: 'folded',
      ring: 'folded',
      pinky: 'folded',
    },
  },
};

export const COMMON_PHRASES: Record<string, { phrase: string; description: string; emoji: string }> = {
  'THUMBS_UP': { phrase: 'Yes / Good / OK', description: 'Agreement or approval', emoji: '👍' },
  'THUMBS_DOWN': { phrase: 'No / Bad', description: 'Disagreement', emoji: '👎' },
  'WAVE': { phrase: 'Hello / Goodbye', description: 'Greeting', emoji: '👋' },
  'OPEN_PALM': { phrase: 'Stop / Wait / Five', description: 'Pause or number five', emoji: '✋' },
  'POINTING': { phrase: 'Look / There', description: 'Direction', emoji: '👉' },
  'PEACE': { phrase: 'Peace / Victory', description: 'Peace sign', emoji: '✌️' },
  'ROCK_ON': { phrase: 'Rock on / Cool', description: 'Excitement', emoji: '🤘' },
  'OK_SIGN': { phrase: 'OK / Perfect', description: 'Agreement', emoji: '👌' },
  'FIST': { phrase: 'Power / Solidarity', description: 'Strength', emoji: '✊' },
  'I_LOVE_YOU': { phrase: 'I Love You', description: 'ASL sign for love', emoji: '🤟' },
  'CALL_ME': { phrase: 'Call me', description: 'Phone gesture', emoji: '🤙' },
};

// Landmark indices
const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_DIP = 11;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_DIP = 15;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_DIP = 19;
const PINKY_TIP = 20;

export interface GestureResult {
  gesture: string;
  confidence: number;
  fingerStates: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

// Enhanced gesture detection with confidence scoring
export const detectGestureFromLandmarks = (landmarks: any[]): GestureResult | null => {
  if (!landmarks || landmarks.length < 21) return null;

  // Calculate distances and angles for more accurate detection
  const getDistance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Helper to check if finger is extended with confidence
  const isFingerExtended = (tipIdx: number, pipIdx: number, mcpIdx: number): boolean => {
    const tipToMcp = landmarks[tipIdx].y - landmarks[mcpIdx].y;
    const pipToMcp = landmarks[pipIdx].y - landmarks[mcpIdx].y;
    // Finger is extended if tip is above pip which is above mcp
    return tipToMcp < pipToMcp * 0.7;
  };

  // Check thumb extension (horizontal for right hand)
  const isThumbExtended = (): boolean => {
    const thumbTipX = landmarks[THUMB_TIP].x;
    const thumbMcpX = landmarks[THUMB_MCP].x;
    const indexMcpX = landmarks[INDEX_MCP].x;
    // Thumb is extended if it's significantly away from index base
    return Math.abs(thumbTipX - indexMcpX) > Math.abs(thumbMcpX - indexMcpX) * 0.5;
  };

  const thumbUp = isThumbExtended();
  const indexUp = isFingerExtended(INDEX_TIP, INDEX_PIP, INDEX_MCP);
  const middleUp = isFingerExtended(MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringUp = isFingerExtended(RING_TIP, RING_PIP, RING_MCP);
  const pinkyUp = isFingerExtended(PINKY_TIP, PINKY_PIP, PINKY_MCP);

  const fingerStates = {
    thumb: thumbUp,
    index: indexUp,
    middle: middleUp,
    ring: ringUp,
    pinky: pinkyUp,
  };

  const extendedCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

  let gesture: string | null = null;
  let confidence = 0.8;

  // Thumbs up - only thumb extended
  if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
    // Check if thumb is pointing up
    if (landmarks[THUMB_TIP].y < landmarks[THUMB_MCP].y) {
      gesture = 'THUMBS_UP';
      confidence = 0.95;
    }
  }

  // Open palm / Five - all fingers extended
  if (thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
    gesture = 'OPEN_PALM';
    confidence = 0.95;
  }

  // Peace / V sign - index and middle extended
  if (!thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) {
    gesture = 'V';
    confidence = 0.9;
  }

  // L shape - thumb and index extended
  if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) {
    gesture = 'L';
    confidence = 0.88;
  }

  // I love you - thumb, index, pinky extended
  if (thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) {
    gesture = 'I_LOVE_YOU';
    confidence = 0.92;
  }

  // Pointing / D - only index extended
  if (!thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) {
    gesture = 'D';
    confidence = 0.85;
  }

  // Fist / A - no fingers extended
  if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
    gesture = 'A';
    confidence = 0.85;
  }

  // Three fingers / W
  if (!thumbUp && indexUp && middleUp && ringUp && !pinkyUp) {
    gesture = 'W';
    confidence = 0.88;
  }

  // Four fingers / B
  if (!thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
    gesture = 'B';
    confidence = 0.9;
  }

  // Y sign - thumb and pinky only
  if (thumbUp && !indexUp && !middleUp && !ringUp && pinkyUp) {
    gesture = 'Y';
    confidence = 0.92;
  }

  // I sign - pinky only
  if (!thumbUp && !indexUp && !middleUp && !ringUp && pinkyUp) {
    gesture = 'I';
    confidence = 0.85;
  }

  // F sign - three fingers extended with thumb and index touching
  if (thumbUp && !indexUp && middleUp && ringUp && pinkyUp) {
    gesture = 'F';
    confidence = 0.82;
  }

  // K/H sign - thumb, index, middle extended
  if (thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) {
    gesture = 'K';
    confidence = 0.8;
  }

  // Rock on / Metal
  if (!thumbUp && indexUp && !middleUp && !ringUp && pinkyUp) {
    gesture = 'ROCK_ON';
    confidence = 0.88;
  }

  if (!gesture) return null;

  return {
    gesture,
    confidence,
    fingerStates,
  };
};

export const gestureToSpeech: Record<string, string> = {
  'THUMBS_UP': 'Thumbs up! Yes, that\'s great!',
  'THUMBS_DOWN': 'Thumbs down. No.',
  'OPEN_PALM': 'Open palm. Hello! or Stop.',
  'V': 'V sign. Peace or Victory!',
  'L': 'L shape. L for Look.',
  'I_LOVE_YOU': 'I Love You!',
  'D': 'Letter D. Pointing.',
  'A': 'Letter A. Fist.',
  'W': 'Letter W. Three fingers.',
  'B': 'Letter B. Four fingers.',
  'Y': 'Letter Y. Hang loose, call me!',
  'I': 'Letter I. Pinky up.',
  'F': 'Letter F.',
  'K': 'Letter K.',
  'ROCK_ON': 'Rock on! Metal!',
};

export const getGestureDescription = (gesture: string): string => {
  return gestureToSpeech[gesture] || gesture;
};

export const getGestureEmoji = (gesture: string): string => {
  const emojiMap: Record<string, string> = {
    'THUMBS_UP': '👍',
    'THUMBS_DOWN': '👎',
    'OPEN_PALM': '✋',
    'V': '✌️',
    'L': '👆',
    'I_LOVE_YOU': '🤟',
    'D': '☝️',
    'A': '✊',
    'W': '🖖',
    'B': '🖐️',
    'Y': '🤙',
    'I': '🤙',
    'F': '👌',
    'K': '✌️',
    'ROCK_ON': '🤘',
  };
  return emojiMap[gesture] || '👋';
};
