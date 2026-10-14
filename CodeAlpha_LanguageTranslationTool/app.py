"""
Language Translation Tool
CodeAlpha Internship - Artificial Intelligence Domain - Task 1

A Flask web application that lets a user enter text, choose a source
and target language, and get the translated text back using the
Google Translate engine (via the deep-translator library, which
talks to the free public Google Translate endpoint -- no paid API
key required).

Run:
    pip install -r requirements.txt
    python app.py

Then open http://127.0.0.1:5000 in your browser.
"""

from flask import Flask, render_template, request, jsonify
from deep_translator import GoogleTranslator
import requests
from deep_translator.exceptions import LanguageNotSupportedException

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Supported languages
# ---------------------------------------------------------------------------
# deep_translator can give us the live list of languages Google Translate
# supports, as a {name: code} dict. We fetch it once at startup and reuse it
# so the app doesn't hit the network on every page load.
try:
    SUPPORTED_LANGUAGES = GoogleTranslator().get_supported_languages(as_dict=True)
except Exception:
    # Fallback list in case there's no internet access when the app starts.
    # The app will still run; the dropdown will just use this smaller list.
    SUPPORTED_LANGUAGES = {
        "english": "en", "spanish": "es", "french": "fr", "german": "de",
        "hindi": "hi", "italian": "it", "japanese": "ja", "korean": "ko",
        "portuguese": "pt", "russian": "ru", "chinese (simplified)": "zh-CN",
        "arabic": "ar", "bengali": "bn", "urdu": "ur", "turkish": "tr",
        "dutch": "nl", "greek": "el", "polish": "pl", "swedish": "sv",
        "vietnamese": "vi", "thai": "th", "indonesian": "id",
    }


def language_choices():
    """Return a sorted list of (code, display_name) tuples for the UI."""
    choices = [(code, name.title()) for name, code in SUPPORTED_LANGUAGES.items()]
    choices.sort(key=lambda pair: pair[1])
    return choices


@app.route("/")
def index():
    return render_template(
        "index.html",
        languages=language_choices(),
    )


@app.route("/api/translate", methods=["POST"])
def translate():
    """
    JSON body:
        {
            "text": "Hello world",
            "source": "auto",   # or a language code like "en"
            "target": "fr"
        }
    Returns:
        { "translated_text": "..." }  on success
        { "error": "..." }            on failure
    """
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    source = data.get("source") or "auto"
    target = data.get("target") or "en"

    if not text:
        return jsonify({"error": "Please enter some text to translate."}), 400

    if len(text) > 4500:
        # deep_translator / Google Translate has a request-size limit.
        return jsonify({"error": "Text is too long (max 4500 characters)."}), 400

    try:
        # First try Google Translate through deep-translator.
        translated = GoogleTranslator(source=source, target=target).translate(text)
        if translated:
            return jsonify({"translated_text": translated})
        raise ValueError("Empty response from Google Translate.")
    except LanguageNotSupportedException:
        return jsonify({"error": "One of the selected languages is not supported."}), 400
    except Exception as google_error:
        # Google may temporarily rate-limit repeated requests. In that case,
        # use MyMemory as a free fallback so the project can still be tested.
        # MyMemory needs an explicit source language, so fallback is skipped
        # when the user selected automatic language detection.
        if source != "auto":
            try:
                url = "https://api.mymemory.translated.net/get"
                response = requests.get(
                    url,
                    params={"q": text, "langpair": f"{source}|{target}"},
                    timeout=15,
                )
                response.raise_for_status()
                result = response.json()
                translated = result.get("responseData", {}).get("translatedText")
                if translated:
                    return jsonify({"translated_text": translated})
            except Exception:
                pass

        return jsonify({
            "error": (
                "Google Translate is temporarily rate-limited. "
                "Please wait and try again, or select a source language "
                "instead of automatic detection. Details: " + str(google_error)
            )
        }), 503


if __name__ == "__main__":
    app.run(debug=True)
