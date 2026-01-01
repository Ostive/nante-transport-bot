import { openai } from "@ai-sdk/openai";
import { streamText, tool, convertToModelMessages, UIMessage } from "ai";
import { z } from "zod";
import { findBusStops } from "../../lib/tan-service";

// Autorise des durées d'exécution plus longues (30s) :
// 1. OpenAI (compréhension) -> 2. OpenCage (Géocodage) -> 3. TAN API (Arrêts) -> 4. OpenAI (Réponse)
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages }: { messages: UIMessage[] } = body;
        const model = process.env.AI_MODEL || "gpt-4o";

        if (!messages || !Array.isArray(messages)) {
            throw new Error('Messages array is required');
        }

        const result = streamText({
            model: openai(model),
            system: `Tu es l'assistant intelligent du réseau de transports TAN (Nantes Métropole).
Ton objectif : aider les utilisateurs à localiser les arrêts de bus et tramway à proximité.

Règles de comportement :

1. Salutations
   - Si l'utilisateur te salue explicitement (bonjour, salut, coucou, ça va), réponds brièvement de manière amicale avant de traiter sa demande
   - Sinon, passe directement à la recherche sans salutation

2. Recherche d'arrêts
   - Dès qu'un lieu ou une adresse est mentionné, appelle immédiatement l'outil 'getBusStops'
   - Ne demande jamais de confirmation, lance la recherche directement
   - Même si l'adresse a déjà été cherchée, rappelle l'outil (l'utilisateur a besoin du widget visuel)

3. Séquence obligatoire
   Pour chaque recherche, tu dois :
   a) Écrire une courte phrase d'introduction (ex: "Je cherche les arrêts à Gare Sud...")
   b) Appeler l'outil getBusStops
   Ne te contente pas de dire que tu vas chercher - appelle vraiment l'outil !

4. Présentation des résultats
   - L'interface affiche automatiquement un widget visuel avec tous les détails (arrêts, lignes, distances)
   - Tu ne dois pas lister les arrêts dans ton texte (pas de liste avec -, *, ou **)
   - Après l'appel de l'outil, reste silencieux ou dis juste une phrase très courte (ex: "Voilà !")
   - Le widget se charge de tout afficher

5. Conversation générale
   - Si l'utilisateur dit "merci" ou change de sujet, réponds simplement sans répéter le contexte précédent
   - Si la demande n'est pas claire, demande des précisions

6. Ton
   - Courtois, concis et serviable
   - Émojis avec modération pour une touche chaleureuse 😊`,
            messages: await convertToModelMessages(messages),
            tools: {
                getBusStops: tool({
                    description: "Trouver les arrêts TAN proches d'une adresse à Nantes.",
                    inputSchema: z.object({
                        address: z.string().describe("L'adresse ou nom du lieu à rechercher (ex: 'Gare Sud', 'Rue Crébillon')")
                    }),
                    execute: async (args: { address: string }) => {
                        return await findBusStops(args.address);
                    }
                })
            },

        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
