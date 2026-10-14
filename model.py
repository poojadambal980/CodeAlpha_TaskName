"""
LSTM Network Architecture
CodeAlpha Internship - AI Domain - Task 3: Music Generation with AI

A 3-layer stacked LSTM that reads a sequence of past notes/chords and
predicts the most likely next note/chord -- the standard architecture
for note-level music generation (per the task brief: "Build a deep
learning model using RNNs (like LSTM) ... to learn music patterns").
"""

from tensorflow.keras.layers import LSTM, Activation, BatchNormalization, Dense, Dropout
from tensorflow.keras.models import Sequential


def build_model(sequence_length, n_vocab):
    """
    sequence_length : how many previous notes the model looks at
    n_vocab         : size of the note/chord vocabulary (output classes)
    """
    model = Sequential(name="music_lstm")

    model.add(LSTM(256, input_shape=(sequence_length, 1), return_sequences=True))
    model.add(Dropout(0.3))

    model.add(LSTM(512, return_sequences=True))
    model.add(Dropout(0.3))

    model.add(LSTM(256))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    model.add(Dense(256))
    model.add(Activation("relu"))
    model.add(Dropout(0.3))

    model.add(Dense(n_vocab))
    model.add(Activation("softmax"))

    model.compile(loss="categorical_crossentropy", optimizer="rmsprop")
    return model


if __name__ == "__main__":
    # Quick sanity check: build a small model and print its summary.
    m = build_model(sequence_length=50, n_vocab=40)
    m.summary()
