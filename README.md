🎵 Music Generation with AI

CodeAlpha Internship — Artificial Intelligence Domain — Task 3

An LSTM-based deep learning project that learns patterns from MIDI music and generates new note sequences, which are converted into playable MIDI files.

Features

- MIDI music preprocessing using "music21"
- LSTM-based music generation using TensorFlow and Keras
- Model training with saved checkpoints
- Generates new MIDI files using trained weights

Technologies Used

- Python
- TensorFlow and Keras
- LSTM (Recurrent Neural Network)
- music21
- NumPy

Project Structure

- "generate_sample_data.py" — Creates sample MIDI data
- "preprocess.py" — Processes MIDI files into note sequences
- "model.py" — Defines the LSTM model
- "train.py" — Trains the model and saves weights
- "generate.py" — Generates new MIDI music
- "run_demo.py" — Runs the complete pipeline
- "requirements.txt" — Lists dependencies
- "data/" — Contains training data and note mappings
- "weights/" — Contains trained model weights
- "output/" — Stores generated MIDI files

Run the Project

Install the dependencies:

pip install -r requirements.txt

Generate music using the trained model:

python generate.py --weights weights/final.weights.h5 --notes 200

The generated MIDI files are saved in the "output/" folder.

Internship

CodeAlpha Internship — AI Domain — Task 3: Music Generation with AI