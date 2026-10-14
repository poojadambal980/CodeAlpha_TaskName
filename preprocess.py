"""
Preprocessing
CodeAlpha Internship - AI Domain - Task 3: Music Generation with AI

Parses every MIDI file in data/sample_midi/ with music21, extracts the
flat sequence of notes and chords, and turns that into fixed-length,
normalized (X, y) training sequences the LSTM can learn from.

Run directly to just extract & cache the notes:
    python preprocess.py
It also gets called automatically by train.py.
"""

import glob
import pickle

import numpy as np
from music21 import chord, converter, instrument, note

DATA_DIR = "data/sample_midi"
NOTES_FILE = "data/notes.pkl"
SEQUENCE_LENGTH = 50


def get_notes(data_dir=DATA_DIR, notes_file=NOTES_FILE):
    """
    Walk every .mid / .midi file in data_dir and collect a single long
    list of notes/chords, in order, across all files. A Note becomes its
    pitch name (e.g. "C4"); a Chord becomes a dot-joined string of its
    normal-order pitch classes (e.g. "0.4.7") so it round-trips cleanly.
    """
    notes = []
    midi_files = sorted(glob.glob(f"{data_dir}/*.mid") + glob.glob(f"{data_dir}/*.midi"))

    if not midi_files:
        raise FileNotFoundError(
            f"No .mid/.midi files found in '{data_dir}'.\n"
            f"Run:  python generate_sample_data.py\n"
            f"...or copy your own MIDI files into '{data_dir}/' first."
        )

    for file in midi_files:
        print(f"Parsing {file} ...")
        midi = converter.parse(file)

        notes_to_parse = None
        try:
            parts = instrument.partitionByInstrument(midi)
        except Exception:
            parts = None

        if parts is not None and len(parts.parts) > 0:
            notes_to_parse = parts.parts[0].recurse()
        else:
            notes_to_parse = midi.flatten().notes

        for element in notes_to_parse:
            if isinstance(element, note.Note):
                notes.append(str(element.pitch))
            elif isinstance(element, chord.Chord):
                notes.append(".".join(str(n) for n in element.normalOrder))

    with open(notes_file, "wb") as f:
        pickle.dump(notes, f)

    print(f"Extracted {len(notes)} notes/chords from {len(midi_files)} file(s). "
          f"Saved to {notes_file}.")
    return notes


def prepare_sequences(notes, sequence_length=SEQUENCE_LENGTH):
    """
    Convert the raw notes list into:
      X : (n_patterns, sequence_length, 1) normalized integer sequences
      y : (n_patterns, n_vocab) one-hot "next note" targets
    plus the note<->int vocabulary needed to decode generated output later.
    """
    pitch_names = sorted(set(notes))
    note_to_int = {n: i for i, n in enumerate(pitch_names)}
    n_vocab = len(pitch_names)

    if len(notes) <= sequence_length:
        raise ValueError(
            f"Only {len(notes)} notes were extracted, which is not enough to build "
            f"sequences of length {sequence_length}. Add more/longer MIDI files, "
            f"or lower SEQUENCE_LENGTH in preprocess.py."
        )

    network_input, network_output = [], []
    for i in range(len(notes) - sequence_length):
        seq_in = notes[i:i + sequence_length]
        seq_out = notes[i + sequence_length]
        network_input.append([note_to_int[n] for n in seq_in])
        network_output.append(note_to_int[seq_out])

    n_patterns = len(network_input)
    X = np.reshape(network_input, (n_patterns, sequence_length, 1))
    X = X / float(n_vocab)

    from tensorflow.keras.utils import to_categorical
    y = to_categorical(network_output, num_classes=n_vocab)

    return X, y, note_to_int, n_vocab, sequence_length


if __name__ == "__main__":
    get_notes()
