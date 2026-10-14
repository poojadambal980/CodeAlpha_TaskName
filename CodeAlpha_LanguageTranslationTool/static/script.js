const sourceText = document.getElementById("source-text");
const outputText = document.getElementById("output-text");
const sourceLang = document.getElementById("source-lang");
const targetLang = document.getElementById("target-lang");
const translateBtn = document.getElementById("translate-btn");
const swapBtn = document.getElementById("swap-btn");
const clearBtn = document.getElementById("clear-btn");
const copyBtn = document.getElementById("copy-btn");
const speakSourceBtn = document.getElementById("speak-source");
const speakTargetBtn = document.getElementById("speak-target");
const charCount = document.getElementById("char-count");
const statusMsg = document.getElementById("status-msg");

const MAX_CHARS = 4500;

// ---- Character counter ----
sourceText.addEventListener("input", () => {
  charCount.textContent = `${sourceText.value.length} / ${MAX_CHARS}`;
});

// ---- Translate ----
async function translateText() {
  const text = sourceText.value.trim();
  if (!text) {
    setStatus("Enter some text first.", "error");
    return;
  }

  setStatus("Translating...", "");
  translateBtn.disabled = true;
  outputText.value = "";

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        source: sourceLang.value,
        target: targetLang.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Something went wrong.", "error");
      return;
    }

    outputText.value = data.translated_text;
    setStatus("Translated ✓", "success");
  } catch (err) {
    setStatus("Network error. Is the server running?", "error");
  } finally {
    translateBtn.disabled = false;
  }
}

function setStatus(message, type) {
  statusMsg.textContent = message;
  statusMsg.className = type || "";
}

translateBtn.addEventListener("click", translateText);

// Allow Ctrl+Enter / Cmd+Enter to translate from the textarea
sourceText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    translateText();
  }
});

// ---- Swap languages ----
swapBtn.addEventListener("click", () => {
  if (sourceLang.value === "auto") {
    setStatus("Pick a specific source language to swap.", "error");
    return;
  }
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  const tempText = sourceText.value;
  sourceText.value = outputText.value;
  outputText.value = tempText;
  charCount.textContent = `${sourceText.value.length} / ${MAX_CHARS}`;
});

// ---- Clear ----
clearBtn.addEventListener("click", () => {
  sourceText.value = "";
  outputText.value = "";
  charCount.textContent = `0 / ${MAX_CHARS}`;
  setStatus("", "");
  sourceText.focus();
});

// ---- Copy translated text ----
copyBtn.addEventListener("click", async () => {
  if (!outputText.value) return;
  try {
    await navigator.clipboard.writeText(outputText.value);
    setStatus("Copied to clipboard ✓", "success");
  } catch {
    outputText.select();
    document.execCommand("copy");
    setStatus("Copied to clipboard ✓", "success");
  }
});

// ---- Text-to-speech (uses the browser's built-in Web Speech API) ----
function speak(text, langCode) {
  if (!text) return;
  if (!("speechSynthesis" in window)) {
    setStatus("Text-to-speech isn't supported in this browser.", "error");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  if (langCode && langCode !== "auto") utterance.lang = langCode;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

speakSourceBtn.addEventListener("click", () => speak(sourceText.value, sourceLang.value));
speakTargetBtn.addEventListener("click", () => speak(outputText.value, targetLang.value));
