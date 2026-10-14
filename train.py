"""
Training
CodeAlpha Internship - AI Domain - Task 3: Music Generation with AI

Loads (or builds) the note sequences, trains the LSTM defined in
model.py on them, and checkpoints weights after every epoch that
improves on the training loss. Also saves the note<->int vocabulary
mapping, since generate.py needs the exact same mapping to decode
predictions back into notes.

Run:
    python train.py --epochs 100 --batch-size 64
"""

import argparse
import os
import pickle

from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

from model import build_model
from preprocess import DATA_DIR, NOTES_FILE, get_notes, prepare_sequences

WEIGHTS_DIR = "weights"
MAPPING_FILE = "data/mapping.pkl"


def train(epochs=100, batch_size=64, sequence_length=None):
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "rb") as f:
            notes = pickle.load(f)
        print(f"Loaded {len(notes)} cached notes from {NOTES_FILE}")
    else:
        notes = get_notes(DATA_DIR, NOTES_FILE)

    if sequence_length:
        X, y, note_to_int, n_vocab, seq_len = prepare_sequences(notes, sequence_length)
    else:
        X, y, note_to_int, n_vocab, seq_len = prepare_sequences(notes)

    print(f"Vocabulary size: {n_vocab} unique notes/chords")
    print(f"Training patterns: {X.shape[0]}")

    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MAPPING_FILE), exist_ok=True)
    with open(MAPPING_FILE, "wb") as f:
        pickle.dump(
            {"note_to_int": note_to_int, "n_vocab": n_vocab, "sequence_length": seq_len},
            f,
        )

    model = build_model(seq_len, n_vocab)
    model.summary()

    checkpoint = ModelCheckpoint(
        os.path.join(WEIGHTS_DIR, "best.weights.h5"),
        monitor="loss",
        verbose=1,
        save_best_only=True,
        save_weights_only=True,
        mode="min",
    )
    early_stop = EarlyStopping(monitor="loss", patience=15, restore_best_weights=True)

    model.fit(
        X, y,
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[checkpoint, early_stop],
    )

    final_path = os.path.join(WEIGHTS_DIR, "final.weights.h5")
    model.save_weights(final_path)
    print(f"\nTraining complete.")
    print(f"  Best weights:  {os.path.join(WEIGHTS_DIR, 'best.weights.h5')}")
    print(f"  Final weights: {final_path}")
    print(f"Next: python generate.py --weights {final_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the music-generation LSTM.")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--sequence-length", type=int, default=None,
                         help="Override the default sequence length from preprocess.py")
    args = parser.parse_args()

    train(epochs=args.epochs, batch_size=args.batch_size, sequence_length=args.sequence_length)
