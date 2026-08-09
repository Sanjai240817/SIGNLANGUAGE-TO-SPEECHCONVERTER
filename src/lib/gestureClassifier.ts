import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

const MODEL_URL = "/models/asl_model.onnx";

export const ASL_LABELS = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S",
  "T", "U", "V", "W", "X", "Y"
];

// Minimum confidence required
export const CONFIDENCE_THRESHOLD = 0.20;


// ============================================================
// LOAD MODEL
// ============================================================

export async function loadASLModel() {

  if (session) {
    return session;
  }

  try {

    console.log("Loading ASL ONNX model...");

    ort.env.wasm.wasmPaths =
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";

    session = await ort.InferenceSession.create(
      MODEL_URL,
      {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      }
    );

    console.log("✅ ASL ONNX model loaded");
    console.log("ONNX input:", session.inputNames);
    console.log("ONNX outputs:", session.outputNames);

    return session;

  } catch (error) {

    console.error(
      "❌ Failed to load ASL model:",
      error
    );

    session = null;

    throw error;
  }
}


// ============================================================
// PREDICT GESTURE
// ============================================================

export async function predictASL(
  landmarks: number[]
): Promise<{
  letter: string;
  confidence: number;
}> {
  if (landmarks.length !== 63) {
    throw new Error(
      `Expected 63 landmark values, received ${landmarks.length}`
    );
  }

  const model = await loadASLModel();

  const inputName = model.inputNames[0];

  const inputTensor = new ort.Tensor(
    "float32",
    Float32Array.from(landmarks),
    [1, 63]
  );

  const results = await model.run({
    [inputName]: inputTensor,
  });

  console.log(
    "ONNX outputs:",
    model.outputNames
  );

  // ----------------------------------------------------------
  // Find probabilities output
  // ----------------------------------------------------------

  const probabilityName =
    model.outputNames.find(
      (name) =>
        name.toLowerCase().includes("prob")
    ) ?? model.outputNames[1];

  const labelName =
    model.outputNames.find(
      (name) =>
        name.toLowerCase().includes("label")
    ) ?? model.outputNames[0];

  const probabilityOutput =
    results[probabilityName];

  const labelOutput =
    results[labelName];

  console.log(
    "Probability output:",
    probabilityOutput
  );

  console.log(
    "Label output:",
    labelOutput
  );

  // ----------------------------------------------------------
  // Extract probability data
  // ----------------------------------------------------------

  let probabilities: number[] = [];

  if (
    probabilityOutput &&
    "data" in probabilityOutput
  ) {
    probabilities = Array.from(
      probabilityOutput.data as
        Float32Array
    );
  }

  console.log(
    "Probability count:",
    probabilities.length
  );

  console.log(
    "Probabilities:",
    probabilities
  );

  // ----------------------------------------------------------
  // Find highest probability
  // ----------------------------------------------------------

  if (probabilities.length === 0) {
    throw new Error(
      "ONNX probabilities output is empty"
    );
  }

  let bestIndex = 0;

  for (
    let i = 1;
    i < probabilities.length;
    i++
  ) {
    if (
      probabilities[i] >
      probabilities[bestIndex]
    ) {
      bestIndex = i;
    }
  }

  const bestProbability =
    probabilities[bestIndex];

  const letter =
    ASL_LABELS[bestIndex] ?? "?";

  // ----------------------------------------------------------
  // TOP 3 PREDICTIONS
  // ----------------------------------------------------------

  const ranked = probabilities
    .map((probability, index) => ({
      letter:
        ASL_LABELS[index] ?? "?",
      probability,
    }))
    .sort(
      (a, b) =>
        b.probability -
        a.probability
    )
    .slice(0, 3);

  console.log(
    "🏆 TOP 3 ASL PREDICTIONS:",
    ranked
  );

  console.log(
    `🤖 ASL Prediction: ${letter}`
  );

  console.log(
    `🎯 Confidence: ${(bestProbability * 100).toFixed(2)}%`
  );

  return {
    letter,
    confidence: bestProbability,
  };
}