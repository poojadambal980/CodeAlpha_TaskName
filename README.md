# 🎵 Music Generation with AI

**CodeAlpha Internship — Artificial Intelligence Domain — Task 3**

An LSTM (recurrent neural network) that learns patterns from MIDI music and
generates brand-new note sequences, which are then converted back into a
playable `.mid` file.

## Task Requirements Covered

| Requirement | Where it's implemented |
|---|---|
| Collect MIDI music data to train the model | `generate_sample_data.py` (bundled demo data) — swap in a real dataset, see below |
| Preprocess data into note sequences (e.g. `music21`) | `preprocess.py` |
| Build a deep learning model using RNNs (LSTM) | `model.py` |
| Train the model to learn music patterns | `train.py` |
| Convert generated sequences to MIDI, save as audio | `generate.py` |

## Project Structure

```
music-generation-ai/
├── generate_sample_data.py   # Creates small demo MIDI files (scales/arpeggios/chords)
├── preprocess.py             # Parses MIDI -> note/chord sequences (music21)
├── model.py                  # 3-layer stacked LSTM architecture (Keras)
├── train.py                  # Trains the LSTM, saves weights + vocabulary
├── generate.py                # Loads trained weights, generates a new .mid file
├── run_demo.py                # Runs the whole pipeline in one command
├── requirements.txt
├── data/
│   └── sample_midi/           # Training MIDI files go here
├── weights/                   # Saved model weights land here after training
└── output/                    # Generated .mid files land here
```

## How It Works

1. **Data collection** — `generate_sample_data.py` writes a handful of
   simple MIDI files (major/minor scales, arpeggios, a I-V-vi-IV chord
   progression) into `data/sample_midi/`. This lets the whole pipeline
   run immediately with zero setup. **For real musical results, replace
   these with an actual MIDI dataset** — see "Using a real dataset" below.

2. **Preprocessing** (`preprocess.py`) — `music21` parses each MIDI file
   and walks through it note-by-note. Each `Note` becomes its pitch name
   (`"C4"`); each `Chord` becomes a dot-joined string of pitch classes
   (`"0.4.7"`). All notes from all files are concatenated into one long
   sequence, then chopped into overlapping windows: 50 notes in ➜ 1 note
   out. Notes are integer-encoded and normalized for the network.

3. **Model** (`model.py`) — a stacked LSTM:
   `LSTM(256) → LSTM(512) → LSTM(256) → Dense(256) → Dense(n_vocab, softmax)`,
   with `Dropout` and `BatchNormalization` for regularization. It's trained
   with categorical cross-entropy to predict "what note comes next" given
   the previous 50 notes.

4. **Training** (`train.py`) — fits the model on the (X, y) sequences from
   step 2, checkpointing the best weights (lowest training loss) plus a
   final weights file. It also saves the note↔integer vocabulary mapping,
   since generation needs the *exact* same mapping to decode predictions.

5. **Generation** (`generate.py`) — seeds the model with a random valid
   starting sequence, then repeatedly: predict the next note → append it →
   drop the oldest note → repeat. The resulting sequence of notes/chords is
   converted back into a `music21` Stream and written out as a real,
   playable `.mid` file.

## Setup & Run

1. **Install Python 3.10–3.11** (TensorFlow's pinned wheel range) and create
   a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate      # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Quickest path — run everything in one command:**
   ```bash
   python run_demo.py
   ```
   This generates sample data, preprocesses it, trains for 20 demo
   epochs, and writes `output/generated_music.mid`. Open that file in
   any MIDI player, DAW, or even import it into Google's online MIDI
   player / GarageBand / VLC to listen.

3. **Or run each step yourself, with real training:**
   ```bash
   python generate_sample_data.py        # or drop your own .mid files into data/sample_midi/
   python preprocess.py
   python train.py --epochs 200 --batch-size 64
   python generate.py --weights weights/final.weights.h5 --notes 300
   ```

### Using a real dataset (recommended for good results)

The bundled sample data is intentionally tiny (a few scales/arpeggios) so
the pipeline runs instantly — the output will sound repetitive/simple,
because there isn't much to learn from. For genuinely musical output:

1. Download a public-domain / freely licensed MIDI dataset, e.g. classical
   piano collections (Bach, Chopin, etc.) — many are available from sites
   like the Classical Piano MIDI Page or the MAESTRO dataset.
2. Drop the `.mid` files into `data/sample_midi/` (or point `DATA_DIR` in
   `preprocess.py` at your own folder).
3. Delete the cached `data/notes.pkl` if it exists (so it re-parses your
   new files), then run `train.py` with more epochs (100–200) — LSTMs need
   real training time and ideally a GPU for datasets of any size.

## Tuning Generation

`generate.py --temperature` controls creativity:
- `1.0` (default) — always picks the most likely next note (safe, can repeat)
- `> 1.0` (e.g. `1.2`) — more random/creative, less predictable
- `< 1.0` (e.g. `0.7`) — more conservative, more repetitive

## Submission Checklist (per CodeAlpha instructions)

- [ ] Push this folder to a GitHub repo named `CodeAlpha_MusicGeneration`
- [ ] (Optional but recommended) train on a real dataset first so the
      demo audio actually sounds musical
- [ ] Record a short video walking through the project, the code, and
      playing the generated `.mid` file
- [ ] Post your internship status + video on LinkedIn, tagging **@CodeAlpha**
- [ ] Submit the GitHub repo link via the CodeAlpha submission form

## Possible Extensions

- Track note duration and velocity (not just pitch) for more expressive output
- Add a Flask UI to trigger generation and play the result in-browser
- Use a Transformer instead of LSTM for longer-range musical structure
- Condition generation on a chosen key/genre
