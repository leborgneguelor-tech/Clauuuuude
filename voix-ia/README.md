# 🎙️ Voix IA — générateur de voix gratuit & illimité

Application web qui transforme ton texte en voix, **gratuitement et sans limite**,
directement dans ton navigateur. Aucune clé API, aucun serveur, aucune donnée envoyée
en ligne : tout fonctionne en local grâce à la **Web Speech API**.

## ✨ Fonctionnalités

- Saisie de texte libre + compteur de caractères
- Choix de la **langue** et de la **voix** (selon ce que propose ton système/navigateur)
- Réglages **vitesse**, **tonalité** et **volume**
- Lecture, **pause**, **reprise**, **stop**
- Surlignage du mot lu en temps réel
- Mémorisation automatique de tes préférences (localStorage)

## ▶️ Utilisation

Ouvre simplement `index.html` dans ton navigateur (Chrome, Edge ou Safari à jour).

Pour un rendu optimal, tu peux aussi lancer un petit serveur local :

```bash
cd voix-ia
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## 💾 Et pour télécharger l'audio en fichier ?

La Web Speech API **joue** le son mais ne fournit pas de fichier téléchargeable.
Pour enregistrer gratuitement :

- Enregistreur intégré à ton OS (macOS : Enregistrement d'écran · Windows : Xbox Game Bar)
- Logiciels libres : **Audacity** ou **OBS Studio** (captent le son du système)

## 🚀 Mode « Qualité IA » (voix naturelles + téléchargement) — gratuit aussi !

En plus du mode navigateur, l'app propose un **mode qualité** basé sur **Piper**,
un modèle de synthèse vocale open-source. Voix bien plus naturelles, et tu peux
**télécharger le résultat en fichier WAV**. C'est ta machine qui calcule, donc ça
reste 100 % gratuit et illimité.

### Installation (une seule fois)

Tu as juste besoin de **Python 3** installé sur ton ordinateur.

**macOS / Linux :**
```bash
cd voix-ia/serveur
./demarrer.sh
```

**Windows :** double-clique sur `voix-ia/serveur/demarrer.bat`
(ou lance-le depuis l'invite de commandes).

Le script crée un environnement isolé, installe Piper automatiquement, télécharge
les voix au premier usage, puis démarre le serveur.

### Utilisation

1. Lance le serveur (voir ci-dessus).
2. Ouvre **http://localhost:5000** dans ton navigateur.
3. Choisis le mode **« Qualité IA »** en haut de la page.
4. Écris ton texte, choisis une voix, clique sur **Lire**, puis **Télécharger**.

### Voix incluses

- Français : Siwis (femme), UPMC, Tom (homme)
- Anglais US : Amy (femme), Ryan (homme, haute qualité)

> Tu peux ajouter d'autres voix open-source depuis le catalogue Piper
> (https://huggingface.co/rhasspy/piper-voices) en complétant le dictionnaire
> `VOICES` dans `serveur/server.py`.
