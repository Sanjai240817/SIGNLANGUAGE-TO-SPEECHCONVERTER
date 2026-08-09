import os
import pickle
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# =========================================================
# SETTINGS
# =========================================================

DATA_FILE = "data/asl_landmarks.csv"
MODEL_FILE = "data/asl_model.pkl"

# =========================================================
# LOAD DATA
# =========================================================

print("Loading ASL landmark dataset...")

df = pd.read_csv(DATA_FILE)

print("Dataset shape:", df.shape)

# Label column
y = df["label"]

# Everything except label is a feature
X = df.drop(columns=["label"])

# Remove unnecessary columns if present
X = X.select_dtypes(include=["number"])

print("Features:", X.shape[1])
print("Classes:", sorted(y.unique()))

# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

# =========================================================
# RANDOM FOREST MODEL
# =========================================================

print("\nTraining Random Forest...")

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# =========================================================
# EVALUATION
# =========================================================

print("\nTesting model...")

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\n===================================")
print("MODEL ACCURACY")
print("===================================")
print(f"{accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, predictions))

# =========================================================
# SAVE MODEL
# =========================================================

os.makedirs("data", exist_ok=True)

with open(MODEL_FILE, "wb") as f:
    pickle.dump(model, f)

print("\n===================================")
print("MODEL SAVED")
print("===================================")
print(MODEL_FILE)