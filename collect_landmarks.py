import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import os
import time

print("Starting ASL Dataset Collector...")

# -----------------------------
# SETTINGS
# -----------------------------

SAMPLES_PER_LETTER = 500

LETTERS = [
    "A", "B", "C", "D", "E", "F",
    "G", "H", "I", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S",
    "T", "U", "V", "W", "X", "Y"
]

OUTPUT_FILE = "data/asl_landmarks.csv"

os.makedirs("data", exist_ok=True)

print("Data folder ready.")

# -----------------------------
# MEDIAPIPE
# -----------------------------

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

print("Starting MediaPipe...")

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

print("MediaPipe started.")

# -----------------------------
# CAMERA
# -----------------------------

print("Opening camera...")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Camera could not be opened.")
    input("Press Enter to exit...")
    exit()

print("Camera opened successfully.")

# -----------------------------
# VARIABLES
# -----------------------------

current_letter = "A"
capturing = False
count = 0

data = []

print()
print("=" * 50)
print("ASL DATASET COLLECTOR")
print("=" * 50)
print()
print("Current letter: A")
print()
print("SPACE = Start/Stop collection")
print("R     = Reset current letter")
print("ESC   = Exit")
print()
print("A-Y = Select letter")
print()

# -----------------------------
# NORMALIZE LANDMARKS
# -----------------------------

def normalize_landmarks(hand_landmarks):

    points = np.array(
        [[p.x, p.y, p.z] for p in hand_landmarks.landmark],
        dtype=np.float32
    )

    # Wrist is landmark 0
    wrist = points[0].copy()

    # Move wrist to origin
    points = points - wrist

    # Scale using middle MCP
    scale = np.linalg.norm(points[9])

    if scale < 0.000001:
        scale = 1.0

    points = points / scale

    return points.flatten()


# -----------------------------
# CAMERA LOOP
# -----------------------------

while True:

    ret, frame = cap.read()

    if not ret:
        print("Could not read camera frame.")
        break

    # Mirror image
    frame = cv2.flip(frame, 1)

    # Convert to RGB
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # MediaPipe
    results = hands.process(rgb)

    hand_detected = False

    # -------------------------
    # HAND DETECTION
    # -------------------------

    if results.multi_hand_landmarks:

        hand_detected = True

        hand = results.multi_hand_landmarks[0]

        # Draw hand
        mp_draw.draw_landmarks(
            frame,
            hand,
            mp_hands.HAND_CONNECTIONS
        )

        # Get 63 features
        features = normalize_landmarks(hand)

        # -------------------------
        # COLLECT DATA
        # -------------------------

        if capturing and count < SAMPLES_PER_LETTER:

            row = list(features)

            row.append(current_letter)

            data.append(row)

            count += 1

            # Print progress every 10 samples
            if count % 10 == 0:
                print(
                    f"{current_letter}: "
                    f"{count}/{SAMPLES_PER_LETTER}"
                )

        # Automatically stop at 200
        if count >= SAMPLES_PER_LETTER:

            capturing = False

            print()
            print(
                f"Completed {current_letter}!"
            )

            # Move to next letter
            current_index = LETTERS.index(current_letter)

            if current_index < len(LETTERS) - 1:

                current_letter = LETTERS[current_index + 1]

                count = 0

                print(
                    f"Next letter: {current_letter}"
                )

                print(
                    "Show the ASL sign and press SPACE."
                )

            else:

                print()
                print("ALL LETTERS COMPLETED!")
                break

    # -------------------------
    # UI
    # -------------------------

    cv2.rectangle(
        frame,
        (10, 10),
        (500, 145),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        frame,
        f"LETTER: {current_letter}",
        (25, 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (0, 255, 255),
        2
    )

    cv2.putText(
        frame,
        f"SAMPLES: {count}/{SAMPLES_PER_LETTER}",
        (25, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    status = "COLLECTING" if capturing else "PAUSED"

    cv2.putText(
        frame,
        status,
        (25, 115),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0) if capturing else (0, 165, 255),
        2
    )

    if hand_detected:

        cv2.putText(
            frame,
            "HAND DETECTED",
            (20, frame.shape[0] - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

    else:

        cv2.putText(
            frame,
            "NO HAND",
            (20, frame.shape[0] - 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )

    cv2.imshow(
        "ASL Dataset Collector",
        frame
    )

    # -------------------------
    # KEYBOARD
    # -------------------------

    key = cv2.waitKey(1) & 0xFF

    # ESC
    if key == 27:

        print("Exiting...")

        break

    # SPACE
    elif key == 32:

        capturing = not capturing

        if capturing:

            print(
                f"Started collecting {current_letter}"
            )

        else:

            print(
                f"Paused {current_letter}"
            )

    # R
    elif key == ord("r"):

        print(
            f"Resetting {current_letter}"
        )

        # Remove current letter
        data = [
            row
            for row in data
            if row[-1] != current_letter
        ]

        count = 0
        capturing = False

    # -------------------------
    # LETTER SELECTION
    # -------------------------

    elif chr(key).upper() in LETTERS:

        selected = chr(key).upper()

        current_letter = selected

        count = sum(
            1
            for row in data
            if row[-1] == current_letter
        )

        capturing = False

        print()
        print(
            f"Selected letter: {current_letter}"
        )

        print(
            f"Existing samples: {count}"
        )


# -----------------------------
# CLEANUP
# -----------------------------

print("Closing camera...")

cap.release()

cv2.destroyAllWindows()

hands.close()

# -----------------------------
# SAVE DATA
# -----------------------------

if len(data) > 0:

    columns = [
        f"f{i}"
        for i in range(63)
    ]

    columns.append("label")

    df = pd.DataFrame(
        data,
        columns=columns
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print()
    print("=" * 50)
    print("DATA SAVED SUCCESSFULLY")
    print("=" * 50)
    print()
    print(
        "Total samples:",
        len(df)
    )

    print()
    print(
        df["label"].value_counts().sort_index()
    )

    print()
    print(
        "File:",
        OUTPUT_FILE
    )

else:

    print()
    print("No samples were collected.")

input("\nPress Enter to close...")