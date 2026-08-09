/**
 * ASL (American Sign Language) Alphabet Dataset
 * Defines hand configurations and characteristics for each letter A-Z
 * Based on standard ASL finger spelling conventions
 */

export interface ASLLetterConfig {
  letter: string;
  description: string;
  // Finger states: 0 = folded, 1 = extended
  fingerConfig: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
  // Expected spatial characteristics
  spatial: {
    thumbToIndexDistance?: 'close' | 'far'; // How close thumb is to index finger
    fingerSpacing?: 'tight' | 'loose'; // How close fingers are to each other
    palmOrientation?: 'up' | 'down' | 'side'; // Palm facing direction
    handOrientation?: 'vertical' | 'horizontal'; // Overall hand tilt
  };
  // Confidence boost modifiers
  confidenceBoost: number; // Additional confidence when matched
}

export const ASL_ALPHABET: Record<string, ASLLetterConfig> = {
  A: {
    letter: 'A',
    description: 'Closed fist with thumb on side',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.10,
  },
  B: {
    letter: 'B',
    description: 'All fingers extended, thumb closed',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: true,
      pinky: true,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  C: {
    letter: 'C',
    description: 'Curved hand shape, thumb and fingers forming C',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: true,
      ring: true,
      pinky: true,
    },
    spatial: {
      thumbToIndexDistance: 'far',
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.11,
  },
  D: {
    letter: 'D',
    description: 'Index finger extended, others folded',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  E: {
    letter: 'E',
    description: 'All fingers slightly bent, partially folded',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.08,
  },
  F: {
    letter: 'F',
    description: 'Thumb and index form circle, other fingers extended',
    fingerConfig: {
      thumb: true,
      index: false,
      middle: true,
      ring: true,
      pinky: true,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'loose',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.09,
  },
  G: {
    letter: 'G',
    description: 'Thumb and index extended horizontally, others folded',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'far',
      fingerSpacing: 'tight',
      palmOrientation: 'side',
      handOrientation: 'horizontal',
    },
    confidenceBoost: 0.11,
  },
  H: {
    letter: 'H',
    description: 'Index and middle extended and together, others folded',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.10,
  },
  I: {
    letter: 'I',
    description: 'Only pinky extended',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: true,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  J: {
    letter: 'J',
    description: 'Pinky extended and curved, forming J shape',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: true,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
      handOrientation: 'vertical',
    },
    confidenceBoost: 0.10,
  },
  K: {
    letter: 'K',
    description: 'Thumb extended, index and middle extended, ring and pinky folded',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.11,
  },
  L: {
    letter: 'L',
    description: 'Thumb and index extended vertically, others folded',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'far',
      fingerSpacing: 'tight',
      palmOrientation: 'side',
      handOrientation: 'vertical',
    },
    confidenceBoost: 0.11,
  },
  M: {
    letter: 'M',
    description: 'Three fingers extended (index, middle, ring), thumb folded',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: true,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.09,
  },
  N: {
    letter: 'N',
    description: 'Two fingers extended (index and middle), thumb folded',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.09,
  },
  O: {
    letter: 'O',
    description: 'Curved hand, all fingers together forming O shape',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.12,
  },
  P: {
    letter: 'P',
    description: 'Similar to K but with different orientation/angle',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.08,
  },
  Q: {
    letter: 'Q',
    description: 'Similar to O with thumb extended',
    fingerConfig: {
      thumb: true,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.08,
  },
  R: {
    letter: 'R',
    description: 'Index and middle extended and crossed',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.09,
  },
  S: {
    letter: 'S',
    description: 'Closed fist, all fingers folded',
    fingerConfig: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.10,
  },
  T: {
    letter: 'T',
    description: 'Closed fist with thumb between index and middle',
    fingerConfig: {
      thumb: true,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'close',
      fingerSpacing: 'tight',
      palmOrientation: 'down',
    },
    confidenceBoost: 0.10,
  },
  U: {
    letter: 'U',
    description: 'Index and middle extended and together, touching',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'tight',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  V: {
    letter: 'V',
    description: 'Index and middle extended and separated',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  W: {
    letter: 'W',
    description: 'Index, middle, and ring extended',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: true,
      ring: true,
      pinky: false,
    },
    spatial: {
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.12,
  },
  X: {
    letter: 'X',
    description: 'Index and pinky extended, others folded',
    fingerConfig: {
      thumb: false,
      index: true,
      middle: false,
      ring: false,
      pinky: true,
    },
    spatial: {
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.08,
  },
  Y: {
    letter: 'Y',
    description: 'Thumb and pinky extended, others folded',
    fingerConfig: {
      thumb: true,
      index: false,
      middle: false,
      ring: false,
      pinky: true,
    },
    spatial: {
      thumbToIndexDistance: 'far',
      fingerSpacing: 'loose',
      palmOrientation: 'side',
    },
    confidenceBoost: 0.11,
  },
  Z: {
    letter: 'Z',
    description: 'Index and middle extended with special positioning',
    fingerConfig: {
      thumb: true,
      index: true,
      middle: true,
      ring: false,
      pinky: false,
    },
    spatial: {
      thumbToIndexDistance: 'far',
      fingerSpacing: 'loose',
      palmOrientation: 'side',
      handOrientation: 'horizontal',
    },
    confidenceBoost: 0.09,
  },
};

/**
 * Get ASL letter configuration
 */
export function getASLConfig(letter: string): ASLLetterConfig | null {
  return ASL_ALPHABET[letter] || null;
}

/**
 * Get all ASL letters
 */
export function getAllASLLetters(): string[] {
  return Object.keys(ASL_ALPHABET);
}

/**
 * Validate if a hand configuration matches an ASL letter
 */
export function validateASLMatch(
  letter: string,
  fingerConfig: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  }
): number {
  const aslConfig = getASLConfig(letter);
  if (!aslConfig) return 0;

  // Count matching fingers
  const expected = aslConfig.fingerConfig;
  let matchCount = 0;
  let totalCount = 0;

  for (const finger of ['thumb', 'index', 'middle', 'ring', 'pinky'] as const) {
    totalCount++;
    if (expected[finger] === fingerConfig[finger]) {
      matchCount++;
    }
  }

  // Return match percentage with confidence boost
  const matchPercentage = matchCount / totalCount;
  return matchPercentage;
}
