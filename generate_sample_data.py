"""
Generate Sample Training Data
CodeAlpha Internship - AI Domain - Task 3: Music Generation with AI

Creates a small set of simple MIDI files (scales, arpeggios, a chord
progression) so the whole pipeline -- preprocess -> train -> generate --
can be run end-to-end immediately, without needing to download an
external dataset first.

These toy files are enough to prove every part of the pipeline works.
For musically interesting output, replace the files in
data/sample_midi/ with a real dataset (see README.md) before training.

Run:
    python generate_sample_data.py
"""

import os

from music21 import chord, duration, note, stream

OUT_DIR = "data/sample_midi"

SCALES = {
    "c_major_scale": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
    "a_minor_scale": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3"],
    "g_major_scale": ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4", "F#4", "E4", "D4", "C4", "B3", "A3", "G3"],
}

ARPEGGIOS = {
    "c_major_arpeggio": [["C4", "E4", "G4"], ["E4", "G4", "C5"], ["G4", "C5", "E5"], ["C5", "G4", "E4"]],
    "g_major_arpeggio": [["G3", "B3", "D4"], ["B3", "D4", "G4"], ["D4", "G4", "B4"], ["G4", "D4", "B3"]],
    "a_minor_arpeggio": [["A3", "C4", "E4"], ["C4", "E4", "A4"], ["E4", "A4", "C5"], ["A4", "E4", "C4"]],
}

CHORD_PROGRESSION = {
    # A classic I - V - vi - IV progression in C major, repeated.
    "pop_progression": [
        ["C4", "E4", "G4"],
        ["G3", "B3", "D4"],
        ["A3", "C4", "E4"],
        ["F3", "A3", "C4"],
    ],
}


def build_melody(pitches, note_length=0.5, reps=6):
    s = stream.Stream()
    for _ in range(reps):
        for pitch_name in pitches:
            n = note.Note(pitch_name)
            n.duration = duration.Duration(note_length)
            s.append(n)
    return s


def build_chord_progression(chords_list, chord_length=1.0, reps=8):
    s = stream.Stream()
    for _ in range(reps):
        for pitches in chords_list:
            c = chord.Chord(pitches)
            c.duration = duration.Duration(chord_length)
            s.append(c)
    return s


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    for name, pitches in SCALES.items():
        path = os.path.join(OUT_DIR, f"{name}.mid")
        build_melody(pitches).write("midi", fp=path)
        print(f"Wrote {path}")

    for name, chords_list in ARPEGGIOS.items():
        path = os.path.join(OUT_DIR, f"{name}.mid")
        build_chord_progression(chords_list, chord_length=0.5).write("midi", fp=path)
        print(f"Wrote {path}")

    for name, chords_list in CHORD_PROGRESSION.items():
        path = os.path.join(OUT_DIR, f"{name}.mid")
        build_chord_progression(chords_list, chord_length=1.0).write("midi", fp=path)
        print(f"Wrote {path}")

    print(f"\nDone. {len(SCALES) + len(ARPEGGIOS) + len(CHORD_PROGRESSION)} sample MIDI files "
          f"are in '{OUT_DIR}/'.")
    print("Next: python preprocess.py   (or just run train.py directly)")


if __name__ == "__main__":
    main()
