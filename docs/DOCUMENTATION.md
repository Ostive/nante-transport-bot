# Documentation Technique - Nantes Bus Assistant

## 1. Vue d'ensemble
L'application **Nantes Bus Assistant** est une interface de chat intelligente permettant aux utilisateurs d'obtenir les départs de bus en temps réel à Nantes, simplement en donnant une adresse ou un lieu.

Le projet repose sur une architecture en **3 phases successives** orchestrées par une IA.

---

## 2. Stack Technique
Technologies utilisées :
*   **Framework** : Next.js v16.1.1 (App Router)
*   **Langage** : TypeScript v5
*   **UI** : React v19.2.3, Tailwind CSS v4, Lucide React
*   **IA** : Vercel AI SDK Core (ai v6.0.3), @ai-sdk/openai v3.0.1, @ai-sdk/react v3.0.3
*   **Validation** : Zod v4.2.1

## 3. Installation & Démarrage

### Prérequis
*   Node.js (v22.19.0)
*   npm (11.6.4)

### Installation
```bash
git clone [URL_REPO]
cd nante-trasport
npm install
```

### Lancement
```bash
npm run dev
# Ouvrir http://localhost:3000 dans votre navigateur
```

---

## 4. Architecture & Flux de Données

Le système fonctionne selon un pipeline séquentiel entièrement automatisé via l'API Route (`/api/chat`).

### Phase 1 : Compréhension & Extraction (Vercel AI SDK)
L'utilisateur entre une requête en langage naturel (ex: *"Bus près de la Tour Bretagne"*).
*   **Technologie** : Vercel AI SDK v6 (`ai`, `@ai-sdk/openai`).
*   **Modèle** : GPT-4o (`openai('gpt-4o')`).
*   **Rôle** : L'IA analyse l'intention. Si une demande de transport est détectée, elle appelle l'outil interne `getBusStops` avec l'adresse extraite.
*   **Configuration** : Le tool utilise `inputSchema` (Zod) pour valider les paramètres d'entrée. AI SDK v6 gère automatiquement les appels multi-étapes sans configuration `maxSteps`.

### Phase 2 : Géocodage (OpenCage Data)
Transformation de l'adresse textuelle en coordonnées GPS précises.
*   **API** : OpenCage Data Geocoding API.
*   **Méthode** : requête HTTP GET.
*   **Format** :
    ```http
    GET https://api.opencagedata.com/geocode/v1/json?q={ADRESSE_URL}+Nantes&key={API_KEY}
    ```
*   **Pourquoi** : L'API TAN nécessite des coordonnées GPS strictes (Latitude/Longitude), elle ne comprend pas les adresses.

### Phase 3 : Données Temps Réel (TAN Open Data)
Récupération des arrêts et lignes à proximité immédiate des coordonnées.
*   **API** : Nantes Métropole / TAN Open Data.
*   **Méthode** : requête HTTP GET.
*   **Format** :
    ```http
    GET https://openv2-preprod.tan.fr/ewp/arrets.json/{LAT}/{LNG}
    ```
*   **Traitement** : Les données sont filtrées et renvoyées au frontend pour affichage.

---

## 5. Choix Techniques & UX

### Architecture Hybride Streaming vs Requête Standard
Un choix a été fait entre deux approches de l'AI SDK : **`generateText`** (classique) vs **`streamText`** (streaming).

**Au départ, l'application a été utilisée avec la fonction `generateText`.**
Avec cette approche, l'utilisateur écrivait sa demande puis attendait simplement la réponse finale, sans aucune nouvelle de l'IA durant le traitement. Il se retrouvait face à un indicateur de chargement ("spinner").

Pour pallier ce manque de feedback et rendre l'expérience plus **User Friendly**, j'ai décidé de passer au **Streaming**. Même si la requête est rapide, il est préférable d'afficher des messages de retour indiquant que le chat est en train de chercher, plutôt que de laisser l'utilisateur dans l'incertitude. Ce qui donne une interaction fluide et transparente.

C'est pourquoi ce choix a été remplacé par **`streamText`** pour offrir une expérience utilisateur supérieure :

*   **Réactivité Immédiate (UX)** : Contrairement à `generateText` qui attend la fin complète de la génération pour répondre, `streamText` envoie la réponse mot à mot. L'utilisateur "sent" l'IA travailler instantanément, effaçant l'effet d'attente.

### Charte Graphique & Identité Visuelle
L'application respecte les codes couleurs du réseau **Naolib / TAN** pour une immersion totale :
*   **Tramways** : Codes hexadécimaux officiels (L1: vert `#00A453`, L2: rouge `#E1000F`, L3: bleu `#0057B7`).
*   **Busway & Chronobus** : Couleurs distinctives (C... en orange, Busway en violet).


### Gestion de l'Affichage (Le Widget Bus)
Un défi a été la gestion des arrêts desservis par **beaucoup de lignes** (ex: Commerce).
*   **Problème** : Une liste de 10+ lignes cassait la mise en page mobile.
*   **Solution Retenue** : **"Inline Expansion" (Accordéon)**.
    *   Par défaut, seules les **4 premières lignes** sont visibles.
    *   Un badge interactif **`+ X`** indique les lignes masquées.
    *   Au clic, la carte se déploie verticalement pour révéler l'intégralité des correspondances.
    *   Cela garantit une interface propre sans sacrifier l'accès à l'information.

---

## 6. Configuration & Installation

### Variables d'Environnement (.env)
Le projet nécessite les clés suivantes pour fonctionner. Vous pouvez les obtenir ici :

*   **OpenAI API Key** : [Obtenir une clé sur platform.openai.com](https://platform.openai.com/api-keys)
*   **OpenCage API Key** : [Obtenir une clé sur opencagedata.com](https://opencagedata.com/dashboard#geocoding)

```bash
# Clé OpenAI pour l'intelligence du chat (Modèle gpt-4o)
OPENAI_API_KEY=sk-...

# Clé OpenCage Data pour le géocodage (Adresse -> GPS)
OPENCAGE_API_KEY=...

# Modèle utilisé (Défaut : gpt-4o)
AI_MODEL=gpt-4o
```

## 7. Gestion des Erreurs

L'application implémente une gestion robuste des erreurs à plusieurs niveaux pour garantir une expérience utilisateur fluide même en cas de problème.

### 7.1. Architecture de Gestion des Erreurs

#### Niveau 1 : Validation des Clés API (Démarrage)
**Fichier** : `app/lib/tan-service.ts` (ligne 25-30)

```typescript
if (!apiKey) {
    console.error("Clé API OpenCage manquante");
    return { found: false, error: "Configuration serveur incomplète" };
}
```

**Comportement** :
- Vérification immédiate de la présence de `OPENCAGE_API_KEY`
- Retour d'une erreur explicite si la clé est absente
- Empêche les appels API inutiles

#### Niveau 2 : Erreurs HTTP des APIs Externes
**Fichier** : `app/lib/tan-service.ts` (lignes 40-43, 62-64)

**OpenCage Geocoding API** :
```typescript
if (!geoRes.ok) {
    throw new Error(`Erreur OpenCage: ${geoRes.statusText}`);
}
```

**TAN Open Data API** :
```typescript
if (!tanRes.ok) {
    throw new Error(`Erreur TAN API: ${tanRes.statusText}`);
}
```

**Comportement** :
- Détection des codes HTTP d'erreur (4xx, 5xx)
- Messages d'erreur spécifiques selon l'API défaillante
- Propagation de l'erreur vers le catch global

#### Niveau 3 : Adresse Introuvable
**Fichier** : `app/lib/tan-service.ts` (lignes 47-49)

```typescript
if (!geo.results?.[0]) {
    return { found: false };
}
```

**Comportement** :
- Retour gracieux sans erreur technique
- L'IA interprète `found: false` et reformule pour l'utilisateur
- Exemple de message : *"Désolé, je n'ai pas trouvé cette adresse à Nantes."*

#### Niveau 4 : Catch Global du Service
**Fichier** : `app/lib/tan-service.ts` (lignes 77-80)

```typescript
catch (error: any) {
    console.error("[TanService] Error:", error);
    return { found: false, error: error.message || "Erreur technique" };
}
```

**Comportement** :
- Capture toutes les erreurs non gérées (réseau, parsing JSON, etc.)
- Log serveur pour le debugging
- Retour d'un message générique à l'utilisateur

#### Niveau 5 : Erreurs de l'API Route
**Fichier** : `app/api/chat/route.ts` (lignes 57-60)

```typescript
catch (e: any) {
    console.error("API Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
}
```

**Comportement** :
- Capture les erreurs de l'AI SDK ou du parsing des messages
- Retour HTTP 500 avec détails de l'erreur
- Empêche le crash complet de l'application

### 7.2. Affichage des Erreurs (Frontend)

**Fichier** : `app/components/ChatInterface.tsx` (lignes 143-148)

```typescript
if (p.output && !p.output.found) {
    return (
        <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {p.output.error || "Aucun arrêt trouvé à cette adresse."}
        </div>
    );
}
```

**Design UX** :
- Badge rouge clair (`bg-red-50`) avec texte rouge (`text-red-600`)
- Message d'erreur personnalisé ou fallback générique
- Intégré dans le flux de conversation (pas de popup intrusive)

### 7.3. Cas d'Erreurs Gérés

| Cas d'Erreur | Détection | Message Utilisateur | Action Recommandée |
|--------------|-----------|---------------------|-------------------|
| **Clé API manquante** | Démarrage service | "Configuration serveur incomplète" | Vérifier `.env` |
| **API OpenCage down** | HTTP error | "Erreur OpenCage: [statusText]" | Réessayer plus tard |
| **API TAN down** | HTTP error | "Erreur TAN API: [statusText]" | Réessayer plus tard |
| **Adresse invalide** | Pas de résultats | "Aucun arrêt trouvé à cette adresse" | Reformuler la requête |
| **Erreur réseau** | Timeout/Fetch fail | "Erreur technique" | Vérifier connexion |
| **Parsing JSON** | Exception | "Erreur technique" | Vérifier format API |
| **AI SDK error** | Exception route | HTTP 500 + message | Vérifier logs serveur |

### 7.4. Logging & Debugging

Tous les logs sont préfixés pour faciliter le debugging :

```bash
[TanService] Recherche: Tour Bretagne
[TanService] Error: Erreur OpenCage: 401 Unauthorized
API Error: Invalid API key
```

**Console serveur** : Tous les `console.error()` apparaissent dans les logs Next.js.

### 7.5. Timeout & Durée Maximale

**Fichier** : `app/api/chat/route.ts` (ligne 7)

```typescript
export const maxDuration = 30;
```

- Limite de **30 secondes** pour l'exécution de la route API
- Empêche les requêtes bloquées indéfiniment
- Valeur adaptée aux appels séquentiels (OpenCage + TAN + AI)

---

## 8. Notes Techniques Importantes

### Compatibilité AI SDK v6
Le projet utilise AI SDK v6 qui présente quelques différences par rapport aux versions précédentes :

*   **`streamText` (Backend)** :
    *   Utilise `inputSchema` au lieu de `parameters` pour définir les outils
    *   Le paramètre `maxSteps` n'existe plus - la gestion multi-étapes est automatique
    *   Les outils doivent retourner des objets JSON sérialisables

*   **`useChat` (Frontend)** :
    *   L'endpoint par défaut est `/api/chat` (pas besoin de le spécifier)
    *   Les `initialMessages` sont gérés via `useEffect` plutôt que dans la config du hook
    *   Le hook retourne directement les messages avec leur structure `parts` pour les tool calls

### Structure des Outils
```typescript
tools: {
  getBusStops: tool({
    description: "Description de l'outil",
    inputSchema: z.object({
      address: z.string().describe("Description du paramètre")
    }),
    execute: async ({ address }: { address: string }) => {
      return await findBusStops(address);
    }
  })
}
```

---

## 9. Guide de Maintenance & Modification

Si vous devez modifier le projet, voici où trouver les éléments clés :

*   **Modifier le comportement de l'IA (Prompt)** :
    *   Fichier : `app/api/chat/route.ts`
    *   Action : Cherchez la propriété `system: ...` dans l'appel `streamText`. C'est ici que vous pouvez changer le ton, les règles ou les exemples.

*   **Changer les couleurs des lignes de bus** :
    *   Fichier : `app/components/BusStopsWidget.tsx`
    *   Action : Modifiez la fonction `getLineColor`. Elle contient le mapping Hexadécimal pour toutes les lignes (Trams, Busway, Chrono...).

*   **Ajuster la logique de recherche (API Flow)** :
    *   Fichier : `app/lib/tan-service.ts` la fonction `findBusStops`.
    *   Action : C'est ici que sont faits les appels à OpenCage et TAN.

*   **Modifier la définition des outils IA** :
    *   Fichier : `app/api/chat/route.ts`
    *   Action : Cherchez la section `tools:` dans l'appel `streamText`. Utilisez `inputSchema` (Zod) pour définir les paramètres.

*   **Modifier le design du Chat (Bulles, Ombres)** :
    *   Fichier : `app/components/ChatInterface.tsx`
    *   Action : Les classes Tailwind pour les bulles (couleurs, rounded, shadow) sont dans le map des messages.


## 10. Choix du Modèle AI (OpenAI GPT-4o)

Le choix du modèle **OpenAI GPT-4o** s'est imposé naturellement : c'est le modèle le plus populaire et le plus documenté actuellement. Sa facilité d'intégration avec le Vercel AI SDK et le fait qu'il soit recommandé dans la majorité des tutoriels Next.js en ont fait le choix logique pour ce projet.


## 11. Organisation du Code : Pattern Service (`lib/tan-service.ts`)

Initialement implémentée de manière monolithique au sein du fichier `app/api/chat/route.ts`, la logique d'interrogation des APIs (OpenCage et TAN) a été refactorisée vers un service dédié : `app/lib/tan-service.ts`.

Cette décision architecturale vise à respecter les bonnes pratiques de développement (Clean Code) :

*   **Séparation des Responsabilités (Separation of Concerns)** : Le contrôleur `route.ts` se concentre uniquement sur l'orchestration de l'IA, tandis que le service `tan-service.ts` encapsule la complexité technique des appels externes.
*   **Maintenabilité** : En découplant la logique métier de la couche API, on facilite les évolutions futures (exemple : modification des endpoints) sans impacter le flux conversationnel.
*   **Lisibilité** : Cette structure modulaire allège le code principal et facilite la collaboration techniques.

---


---


