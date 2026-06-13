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

## 🚀 Aller plus loin (qualité « studio » + export fichier)

La Web Speech API est gratuite et illimitée, mais ses voix dépendent du système.
Pour une qualité supérieure et l'export de fichiers audio, on peut brancher un
**modèle open-source local** comme :

- **Piper** — léger, rapide, tourne même sur petit matériel
- **Kokoro** — excellent rapport qualité / poids
- **Coqui XTTS / Chatterbox** — haute qualité + clonage de voix (nécessite un GPU)

Ces solutions restent **gratuites et illimitées** : c'est ta machine qui fait le calcul.
