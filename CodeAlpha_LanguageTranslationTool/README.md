# CodeAlpha Language Translation Tool

**CodeAlpha Internship — Artificial Intelligence Domain — Task 1**

A Flask-based web application for translating text between multiple languages.

## Task Requirements Completed

- User interface for entering text.
- Source-language and target-language selection.
- Translation using Google Translate through `deep-translator`.
- Sends the entered text to the translation service.
- Displays the translated result clearly.
- Copy translated text button.
- Text-to-speech for source and translated text.
- Swap-language button.
- Clear button and character counter.
- Responsive design for desktop and mobile.

## Technologies

- Python
- Flask
- deep-translator
- requests (MyMemory fallback)
- HTML5
- CSS3
- JavaScript
- Browser Web Speech API

## Project Structure

```text
CodeAlpha_LanguageTranslationTool/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## How to Run

### 1. Open the project folder

```bash
cd CodeAlpha_LanguageTranslationTool
```

### 2. Create a virtual environment (recommended)

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the application

```bash
python app.py
```

### 5. Open in a browser

```text
http://127.0.0.1:5000
```

## Important

An internet connection is required for the translation service. If Google Translate temporarily rate-limits requests, the app automatically tries the MyMemory translation service when a specific source language is selected.

## CodeAlpha Submission

1. Upload this complete project to a GitHub repository named:
   `CodeAlpha_LanguageTranslationTool`
2. Test the application and take screenshots if required.
3. Record a short project explanation video.
4. Post the internship/project status on LinkedIn and tag CodeAlpha as required by the internship instructions.
5. Submit the GitHub repository link through the CodeAlpha submission form.

## Example

Input:
`Hello, how are you?`

Source:
`English`

Target:
`Kannada`

The application sends the text to the translation service and displays the translated result.
