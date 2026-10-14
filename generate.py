"""
Generation
CodeAlpha Internship - AI Domain - Task 3: Music Generation with AI

Generates multiple new AI music sequences and saves each one as a
separate MIDI file.
"""

import argparse
import os
import pickle
import random

import numpy as np
from music21 import chord, duration, instrument, note, stream

from model import build_model

MAPPING_FILE = "data/mapping.pkl"


def load_mapping(mapping_file=MAPPING_FILE):
    with open(mapping_file, "rb") as f:
        mapping = pickle.load(f)
    return mapping["note_to_int"], mapping["n_vocab"], mapping["sequence_length"]


def generate_notes(
    model,
    note_to_int,
    n_vocab,
    sequence_length,
    n_notes=200,
    temperature=1.0
):
    int_to_note = {number: n for n, number in note_to_int.items()}

    pattern = [random.randint(0, n_vocab - 1) for _ in range(sequence_length)]
    prediction_output = []

    for _ in range(n_notes):
        prediction_input = np.reshape(
            pattern, (1, len(pattern), 1)
        ) / float(n_vocab)

        probabilities = model.predict(
            prediction_input, verbose=0
        )[0]

        if temperature != 1.0:
            probabilities = np.log(
                probabilities + 1e-9
            ) / temperature

            probabilities = np.exp(probabilities)
            probabilities = probabilities / np.sum(probabilities)

            index = np.random.choice(
                len(probabilities),
                p=probabilities
            )
        else:
            index = int(np.argmax(probabilities))

        prediction_output.append(int_to_note[index])

        pattern.append(index)
        pattern = pattern[1:]

    return prediction_output


def notes_to_midi_stream(prediction_output, note_length=0.5):
    offset = 0.0
    output_notes = []

    for item in prediction_output:

        if "." in item:
            chord_notes = []

            for pc in item.split("."):
                n = note.Note(int(pc))
                n.storedInstrument = instrument.Piano()
                chord_notes.append(n)

            new_chord = chord.Chord(chord_notes)
            new_chord.offset = offset
            new_chord.duration = duration.Duration(note_length)

            output_notes.append(new_chord)

        else:
            new_note = note.Note(item)
            new_note.offset = offset
            new_note.duration = duration.Duration(note_length)
            new_note.storedInstrument = instrument.Piano()

            output_notes.append(new_note)

        offset += note_length

    return stream.Stream(output_notes)


def generate(
    weights_path,
    output_file,
    n_notes=200,
    temperature=1.0
):
    note_to_int, n_vocab, sequence_length = load_mapping()

    model = build_model(sequence_length, n_vocab)
    model.load_weights(weights_path)

    prediction_output = generate_notes(
        model,
        note_to_int,
        n_vocab,
        sequence_length,
        n_notes=n_notes,
        temperature=temperature
    )

    midi_stream = notes_to_midi_stream(prediction_output)

    os.makedirs(
        os.path.dirname(output_file) or ".",
        exist_ok=True
    )

    midi_stream.write("midi", fp=output_file)

    print(
        f"Generated {n_notes} notes -> saved to {output_file}"
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Generate multiple new music files from a trained model."
    )

    parser.add_argument(
        "--weights",
        required=True,
        help="Path to saved .weights.h5 file"
    )

    parser.add_argument(
        "--notes",
        type=int,
        default=200,
        help="Number of notes/chords per song"
    )

    parser.add_argument(
        "--temperature",
        type=float,
        default=1.2,
        help="Higher values create more variation"
    )

    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of different music files to generate"
    )

    args = parser.parse_args()

    os.makedirs("output", exist_ok=True)

    for i in range(1, args.count + 1):

        output_file = f"output/AI_Music_{i}.mid"

        generate(
            args.weights,
            output_file,
            args.notes,
            args.temperature
        )

    print()
    print(f"Successfully generated {args.count} different AI music files!")