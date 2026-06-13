#!/usr/bin/env bash
# Démarre la version "qualité" de Voix IA (macOS / Linux).
# Crée un environnement Python isolé, installe Piper, puis lance le serveur.
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Création de l'environnement Python…"
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate

echo "Installation / mise à jour de Piper TTS…"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo "Lancement du serveur…"
python3 server.py
