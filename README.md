# Nantes Bus Assistant 🚍🤖

> **Test Technique** : Assistant Intelligent pour les transports en commun de Nantes.

Une application Next.js 16 infusée à l'IA permettant de trouver les arrêts de bus et tramways à proximité grâce à une conversation naturelle.

![Demo](https://via.placeholder.com/800x400.png?text=Nantes+Bus+Assistant+Demo)

## ✨ Fonctionnalités Clés

*   🗣️ **Chat en Langage Naturel** : Parlez à l'IA ("Bus pour Tour Bretagne").
*   📍 **Géolocalisation Intelligente** : Conversion d'adresses en coordonnées GPS (OpenCage).
*   ⏱️ **Temps Réel** : Données officielles du réseau TAN / Naolib Nantes.
*   🎨 **Design Premium** : UI Glassmorphism moderne, respectant la charte graphique officielle Naolib (Couleurs Tram/Bus).
*   📱 **Mobile First** : Composant "Widget" avec accordéon intelligent pour gérer les arrêts complexes.

## 🚀 Démarrage Rapide

### 1. Installation

```bash
git clone [URL_REPO]
cd nante-trasport
npm install
```

### 2. Configuration

Copiez le fichier `.env.example` en `.env` et remplissez vos clés API :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos clés :

```env
OPENAI_API_KEY=sk-...
OPENCAGE_API_KEY=...
AI_MODEL=gpt-4o
```

**⚠️ Important** : Le fichier `.env` contient des clés sensibles et ne doit jamais être commité dans git.

(Voir [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) pour obtenir les clés).

### 3. Lancer

```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000).

---

## 📚 Documentation Complète

Pour tout savoir sur l'architecture, les choix techniques, les APIs utilisées et le guide de maintenance, consultez la documentation détaillée ici :

👉 **[LIRE LA DOCUMENTATION TECHNIQUE](./docs/DOCUMENTATION.md)**

---

## 🛠️ Stack Technique

*   **Next.js 16.1** (App Router)
*   **TypeScript 5**
*   **React 19** & **Tailwind CSS 4**
*   **Vercel AI SDK 6.0** (OpenAI GPT-4o)
*   **Node.js v22.19.0**

---

