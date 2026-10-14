"""
Run the full pipeline end-to-end with sensible defaults:
sample data -> preprocess -> train (short demo run) -> generate.

This is meant for a quick "does it all work" demo. For a real result,
use your own MIDI dataset and call train.py with more epochs directly
(see README.md).

Run:
    python run_demo.py
"""

import os
import subprocess
import sys

STEPS = [
    ("Generating sample MIDI training data", [sys.executable, "generate_sample_data.py"]),
    ("Preprocessing MIDI files into note sequences", [sys.executable, "preprocess.py"]),
    ("Training the LSTM (short demo run: 20 epochs)", [sys.executable, "train.py", "--epochs", "20"]),
]


def main():
    for label, cmd in STEPS:
        print(f"\n=== {label} ===")
        subprocess.run(cmd, check=True)

    weights_path = os.path.join("weights", "final.weights.h5")
    print("\n=== Generating new music ===")
    subprocess.run(
        [sys.executable, "generate.py", "--weights", weights_path, "--notes", "150"],
        check=True,
    )

    print("\nDone! Check output/generated_music.mid")


if __name__ == "__main__":
    main()
