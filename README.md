# Nantes Bus Assistant 🚍🤖

> **Test Technique** : Assistant Intelligent pour les transports en commun de Nantes.

Une application Next.js 16 avec IA permettant de trouver les arrêts de bus et tramways à proximité grâce à une conversation naturelle.

## ✨ Fonctionnalités Clés

*   🗣️ **Chat en Langage Naturel** : Conversation avec l'IA ("Arrêts à Gare Sud")
*   📍 **Géolocalisation Intelligente** : Conversion automatique d'adresses en coordonnées GPS (OpenCage)
*   ⏱️ **Temps Réel** : Données officielles du réseau TAN / Naolib Nantes
*   🎨 **Design Premium** : UI moderne respectant la charte graphique Naolib (couleurs officielles Tram/Bus)
*   📱 **Mobile First** : Widget responsive avec accordéon intelligent pour les arrêts complexes
*   🔄 **Streaming AI** : Réponses en temps réel avec AI SDK v6
*   ✨ **UX Optimisée** : Message de bienvenue, séparateurs visuels, gestion automatique des widgets multiples

## 🚀 Démarrage Rapide

### 1. Installation

```bash
git clone [https://github.com/Ostive/nante-transport-bot.git]
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

*   **Next.js 16.1.1** (App Router)
*   **TypeScript 5**
*   **React 19.2.3** & **Tailwind CSS 4**
*   **Vercel AI SDK 6.0.5** (`ai`, `@ai-sdk/openai@3.0.2`, `@ai-sdk/react@3.0.5`)
*   **OpenAI GPT-4o**
*   **Zod 4.2.1** (validation)
*   **Node.js v22.19.0**

## 🎯 Fonctionnalités AI SDK v6

L'application utilise AI SDK v6 avec :
*   **Backend** : `streamText`, `toUIMessageStreamResponse()`, `convertToModelMessages()`, `tool`
*   **Frontend** : `useChat` avec `DefaultChatTransport`, `sendMessage({ text })`
*   **Rendu** : Messages via `message.parts` (text et tool-getBusStops)
*   **États d'outils** : `input-streaming`, `input-available`, `output-available`, `output-error`

---

