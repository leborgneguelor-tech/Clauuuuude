#!/usr/bin/env python3
"""Serveur local pour la génération de voix IA de qualité (Piper TTS).

Tout fonctionne en local : aucune donnée n'est envoyée sur Internet, sauf le
téléchargement initial des modèles de voix (open-source, depuis Hugging Face).

Lancement :
    python3 server.py
puis ouvre http://localhost:5000 dans ton navigateur.
"""

import json
import subprocess
import sys
import tempfile
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 5000
BASE = Path(__file__).resolve().parent
WEB = BASE.parent  # dossier voix-ia/ (contient index.html)
MODELS_DIR = BASE / "voix"
MODELS_DIR.mkdir(exist_ok=True)

HF_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/"

# Catalogue de voix open-source (françaises + anglaises) téléchargées à la demande.
VOICES = {
    "fr_FR-siwis-medium": {
        "label": "Français — Siwis (femme, naturelle)",
        "path": "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx",
    },
    "fr_FR-upmc-medium": {
        "label": "Français — UPMC (voix claire)",
        "path": "fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx",
    },
    "fr_FR-tom-medium": {
        "label": "Français — Tom (homme)",
        "path": "fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx",
    },
    "en_US-amy-medium": {
        "label": "Anglais US — Amy (femme)",
        "path": "en/en_US/amy/medium/en_US-amy-medium.onnx",
    },
    "en_US-ryan-high": {
        "label": "Anglais US — Ryan (homme, haute qualité)",
        "path": "en/en_US/ryan/high/en_US-ryan-high.onnx",
    },
}


def model_files(voice_id):
    """Renvoie les chemins locaux (.onnx et .onnx.json) d'une voix."""
    onnx = MODELS_DIR / f"{voice_id}.onnx"
    return onnx, onnx.with_suffix(".onnx.json")


def download(url, dest):
    """Télécharge un fichier en affichant une progression simple."""
    print(f"  → téléchargement : {dest.name}")
    req = urllib.request.Request(url, headers={"User-Agent": "voix-ia"})
    with urllib.request.urlopen(req) as resp, open(dest, "wb") as out:
        out.write(resp.read())


def ensure_voice(voice_id):
    """S'assure que le modèle est présent localement, sinon le télécharge."""
    if voice_id not in VOICES:
        raise ValueError(f"Voix inconnue : {voice_id}")
    onnx, config = model_files(voice_id)
    remote = HF_BASE + VOICES[voice_id]["path"]
    if not onnx.exists():
        print(f"Première utilisation de « {VOICES[voice_id]['label']} »…")
        download(remote, onnx)
    if not config.exists():
        download(remote + ".json", config)
    return onnx


def synthesize(voice_id, text):
    """Génère un fichier WAV à partir du texte et renvoie ses octets."""
    onnx = ensure_voice(voice_id)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        out_path = Path(tmp.name)
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "piper", "-m", str(onnx), "-f", str(out_path)],
            input=text.encode("utf-8"),
            capture_output=True,
        )
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.decode("utf-8", "replace"))
        return out_path.read_bytes()
    finally:
        out_path.unlink(missing_ok=True)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path):
        path = Path(path)
        if not path.is_file():
            self.send_error(404)
            return
        data = path.read_bytes()
        ctype = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
        }.get(path.suffix, "application/octet-stream")
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/api/voices":
            self._send_json(
                200,
                {"voices": [{"id": k, "label": v["label"]} for k, v in VOICES.items()]},
            )
            return
        # Sert les fichiers statiques du dossier voix-ia/.
        rel = self.path.lstrip("/") or "index.html"
        rel = rel.split("?", 1)[0]
        target = (WEB / rel).resolve()
        if WEB in target.parents or target == WEB:
            self._send_file(target)
        else:
            self.send_error(403)

    def do_POST(self):
        if self.path != "/api/synthesize":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
            text = (payload.get("text") or "").strip()
            voice_id = payload.get("voice") or "fr_FR-siwis-medium"
            if not text:
                self._send_json(400, {"error": "Texte vide"})
                return
            wav = synthesize(voice_id, text)
        except Exception as exc:  # noqa: BLE001 - on renvoie l'erreur au client
            self._send_json(500, {"error": str(exc)})
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(wav)))
        self.send_header("Content-Disposition", 'attachment; filename="voix.wav"')
        self.end_headers()
        self.wfile.write(wav)

    def log_message(self, *args):
        pass  # silence des logs HTTP par défaut


def main():
    print("=" * 56)
    print(" 🎙️  Serveur Voix IA (qualité) — Piper TTS")
    print("=" * 56)
    print(f" Ouvre ton navigateur sur : http://localhost:{PORT}")
    print(" (Ctrl+C pour arrêter)")
    print("=" * 56)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur. À bientôt !")
        server.shutdown()


if __name__ == "__main__":
    main()
