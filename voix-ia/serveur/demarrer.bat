@echo off
REM Demarre la version "qualite" de Voix IA (Windows).
REM Cree un environnement Python isole, installe Piper, puis lance le serveur.
cd /d "%~dp0"

if not exist ".venv" (
  echo Creation de l'environnement Python...
  python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installation / mise a jour de Piper TTS...
python -m pip install --quiet --upgrade pip
python -m pip install --quiet -r requirements.txt

echo Lancement du serveur...
python server.py
pause
