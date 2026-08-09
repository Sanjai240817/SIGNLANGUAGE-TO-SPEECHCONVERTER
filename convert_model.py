import os
import pickle
import numpy as np

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType


# =========================================================
# FILE PATHS
# =========================================================

INPUT_MODEL = "data/asl_model.pkl"
OUTPUT_MODEL = "data/asl_model.onnx"


# =========================================================
# LOAD TRAINED RANDOM FOREST
# =========================================================

print("Loading trained Random Forest...")

with open(INPUT_MODEL, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully.")
print("Model type:", type(model).__name__)


# =========================================================
# CHECK MODEL
# =========================================================

if not hasattr(model, "predict"):
    raise RuntimeError("The loaded file is not a valid sklearn model.")


# Your model was trained using 63 landmark features
initial_type = [
    ("float_input", FloatTensorType([None, 63]))
]


# =========================================================
# CONVERT TO ONNX
# =========================================================

print("Converting Random Forest to ONNX...")

onnx_model = convert_sklearn(
    model,
    initial_types=initial_type,
    target_opset=12,
    options={id(model): {"zipmap": False}}
)
# =========================================================
# SAVE ONNX
# =========================================================

os.makedirs("data", exist_ok=True)

with open(OUTPUT_MODEL, "wb") as f:
    f.write(onnx_model.SerializeToString())


print()
print("========================================")
print("ONNX CONVERSION SUCCESSFUL")
print("========================================")
print("Output:", OUTPUT_MODEL)
print("Size:", os.path.getsize(OUTPUT_MODEL), "bytes")
print("========================================")