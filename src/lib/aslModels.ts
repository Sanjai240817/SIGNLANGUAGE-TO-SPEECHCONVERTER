import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

const MODEL_URL = "/models/asl_model.onnx";

export const ASL_LABELS = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S",
  "T", "U", "V", "W", "X", "Y"
];

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
    console.log("Input:", session.inputNames);
    console.log("Output:", session.outputNames);
    console.log("Input metadata:", session.inputMetadata);
    console.log("Output metadata:", session.outputMetadata);

    return session;

  } catch (error) {
    console.error("❌ Failed to load ASL model:", error);

    session = null;
    throw error;
  }
}

// ============================================================
// PREDICT ASL
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

  console.log("ONNX results:", results);

  // ----------------------------------------------------------
  // Find probability output
  // ----------------------------------------------------------

  let probabilityOutput: any = null;

  for (const name of model.outputNames) {

    const output = results[name];

    console.log(
      "Output:",
      name,
      output
    );

    if (
      output &&
      output.data &&
      output.data.length === ASL_LABELS.length
    ) {
      probabilityOutput = output;
      break;
    }
  }

  if (!probabilityOutput) {
    throw new Error(
      "Could not find ASL probability output from ONNX model."
    );
  }

  const probabilities =
    probabilityOutput.data as Float32Array;

  // ----------------------------------------------------------
  // Find highest probability
  // ----------------------------------------------------------

  let bestIndex = 0;
  let bestValue = probabilities[0];

  for (
    let i = 1;
    i < probabilities.length;
    i++
  ) {

    if (
      probabilities[i] >
      bestValue
    ) {
      bestValue =
        probabilities[i];

      bestIndex = i;
    }
  }

  const letter =
    ASL_LABELS[bestIndex] ?? "?";

  const confidence =
    Number(bestValue);

  console.log(
    `🎯 ASL prediction: ${letter} ${(confidence * 100).toFixed(2)}%`
  );

  return {
    letter,
    confidence,
  };
}

// ============================================================
// MODEL CHECK
// ============================================================

export async function checkASLModel(): Promise<boolean> {

  try {

    const model =
      await loadASLModel();

    console.log(
      "✅ ASL model check passed"
    );

    console.log(
      "Input names:",
      model.inputNames
    );

    console.log(
      "Output names:",
      model.outputNames
    );

    return true;

  } catch (error) {

    console.error(
      "❌ ASL model check failed:",
      error
    );

    return false;
  }
}