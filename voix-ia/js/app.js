// Voix IA — synthèse vocale gratuite et illimitée via la Web Speech API.
// Tout s'exécute localement dans le navigateur, aucune donnée n'est envoyée.

(function () {
  "use strict";

  const synth = window.speechSynthesis;

  // --- Vérification du support navigateur ---
  if (!synth || !("SpeechSynthesisUtterance" in window)) {
    document.getElementById("unsupported").classList.remove("hidden");
    return;
  }

  // --- Références DOM ---
  const el = {
    text: document.getElementById("text"),
    charCount: document.getElementById("charCount"),
    lang: document.getElementById("lang"),
    voice: document.getElementById("voice"),
    rate: document.getElementById("rate"),
    pitch: document.getElementById("pitch"),
    volume: document.getElementById("volume"),
    rateVal: document.getElementById("rateVal"),
    pitchVal: document.getElementById("pitchVal"),
    volumeVal: document.getElementById("volumeVal"),
    play: document.getElementById("play"),
    pause: document.getElementById("pause"),
    resume: document.getElementById("resume"),
    stop: document.getElementById("stop"),
    highlight: document.getElementById("highlight"),
  };

  const STORAGE_KEY = "voix-ia-settings";
  let voices = [];

  // --- Chargement des voix (asynchrone selon les navigateurs) ---
  function loadVoices() {
    voices = synth.getVoices();
    if (!voices.length) return;
    populateLanguages();
  }

  function populateLanguages() {
    const saved = loadSettings();
    const langs = [...new Set(voices.map((v) => v.lang))].sort();

    el.lang.innerHTML = "";
    langs.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = languageLabel(lang);
      el.lang.appendChild(opt);
    });

    // Pré-sélection : langue sauvegardée, sinon français, sinon 1ère dispo.
    const preferred =
      (saved && saved.lang && langs.includes(saved.lang) && saved.lang) ||
      langs.find((l) => l.toLowerCase().startsWith("fr")) ||
      langs[0];
    el.lang.value = preferred;

    populateVoices(saved);
  }

  function populateVoices(saved) {
    const selectedLang = el.lang.value;
    const matching = voices.filter((v) => v.lang === selectedLang);

    el.voice.innerHTML = "";
    matching.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = v.name + (v.default ? " — (par défaut)" : "");
      el.voice.appendChild(opt);
    });

    if (saved && saved.voice) {
      const exists = matching.some((v) => v.name === saved.voice);
      if (exists) el.voice.value = saved.voice;
    }
  }

  // Affiche un libellé lisible pour un code langue (ex. "fr-FR" -> "Français (fr-FR)").
  function languageLabel(code) {
    try {
      const dn = new Intl.DisplayNames(["fr"], { type: "language" });
      const base = code.split("-")[0];
      const name = dn.of(base);
      if (name) {
        const label = name.charAt(0).toUpperCase() + name.slice(1);
        return `${label} (${code})`;
      }
    } catch (e) {
      /* Intl.DisplayNames non supporté : on retombe sur le code brut. */
    }
    return code;
  }

  function getSelectedVoice() {
    return voices.find((v) => v.name === el.voice.value) || null;
  }

  // --- Sauvegarde des préférences ---
  function saveSettings() {
    const settings = {
      lang: el.lang.value,
      voice: el.voice.value,
      rate: el.rate.value,
      pitch: el.pitch.value,
      volume: el.volume.value,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* localStorage indisponible (mode privé) : on ignore. */
    }
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function applySavedSliders() {
    const saved = loadSettings();
    if (!saved) return;
    if (saved.rate) el.rate.value = saved.rate;
    if (saved.pitch) el.pitch.value = saved.pitch;
    if (saved.volume) el.volume.value = saved.volume;
  }

  // --- Lecture ---
  let utterance = null;

  function speak() {
    if (synth.speaking) synth.cancel();

    const text = el.text.value.trim();
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);
    const voice = getSelectedVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = parseFloat(el.rate.value);
    utterance.pitch = parseFloat(el.pitch.value);
    utterance.volume = parseFloat(el.volume.value);

    utterance.onstart = () => setPlayingState(true);
    utterance.onend = () => {
      setPlayingState(false);
      el.highlight.textContent = "";
    };
    utterance.onerror = () => setPlayingState(false);

    // Surlignage du mot en cours de lecture.
    utterance.onboundary = (event) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        renderHighlight(text, event.charIndex, event.charLength || 0);
      }
    };

    synth.speak(utterance);
    saveSettings();
  }

  function renderHighlight(text, charIndex, charLength) {
    // Si charLength absent, on déduit le mot courant.
    let end = charIndex + charLength;
    if (!charLength) {
      const rest = text.slice(charIndex);
      const match = rest.match(/^\S+/);
      end = charIndex + (match ? match[0].length : 0);
    }
    const before = text.slice(0, charIndex);
    const word = text.slice(charIndex, end);
    const after = text.slice(end);
    el.highlight.innerHTML =
      escapeHtml(before) +
      '<span class="current">' +
      escapeHtml(word) +
      "</span>" +
      escapeHtml(after);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function setPlayingState(isPlaying) {
    el.play.disabled = isPlaying;
    el.pause.disabled = !isPlaying;
    el.resume.disabled = true;
    el.stop.disabled = !isPlaying;
  }

  // --- Évènements ---
  el.play.addEventListener("click", speak);

  el.pause.addEventListener("click", () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      el.pause.disabled = true;
      el.resume.disabled = false;
    }
  });

  el.resume.addEventListener("click", () => {
    if (synth.paused) {
      synth.resume();
      el.pause.disabled = false;
      el.resume.disabled = true;
    }
  });

  el.stop.addEventListener("click", () => {
    synth.cancel();
    setPlayingState(false);
    el.highlight.textContent = "";
  });

  el.lang.addEventListener("change", () => {
    populateVoices(null);
    saveSettings();
  });
  el.voice.addEventListener("change", saveSettings);

  // Sliders : mise à jour des valeurs affichées.
  function bindSlider(input, label) {
    const update = () => {
      label.textContent = parseFloat(input.value).toFixed(input === el.volume ? 2 : 1);
    };
    input.addEventListener("input", update);
    input.addEventListener("change", saveSettings);
    update();
  }
  bindSlider(el.rate, el.rateVal);
  bindSlider(el.pitch, el.pitchVal);
  bindSlider(el.volume, el.volumeVal);

  // Compteur de caractères.
  function updateCharCount() {
    el.charCount.textContent = el.text.value.length;
  }
  el.text.addEventListener("input", updateCharCount);

  // --- Initialisation ---
  applySavedSliders();
  updateCharCount();
  loadVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  // Sécurité : on coupe la voix si on quitte la page.
  window.addEventListener("beforeunload", () => synth.cancel());
})();
