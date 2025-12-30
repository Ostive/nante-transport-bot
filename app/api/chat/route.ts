import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { findBusStops } from "../../lib/tan-service";

// Autorise des durées d'exécution plus longues (30s) :
// 1. OpenAI (compréhension) -> 2. OpenCage (Géocodage) -> 3. TAN API (Arrêts) -> 4. OpenAI (Réponse)
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;
        const model = process.env.AI_MODEL || "gpt-4o";

        if (!messages || !Array.isArray(messages)) {
            throw new Error('Messages array is required');
        }

        const sanitizedMessages = messages.map((m: any) => ({
            ...m,
            content: m.content || ""
        }));

        const coreMessages = sanitizedMessages.map((m: any) => ({
            role: m.role,
            content: m.content
        }));

        const result = streamText({
            model: openai(model),
            system: `Vous êtes l'assistant intelligent du réseau de transports TAN (Nantes Métropole).
Votre objectif est d'aider les utilisateurs à localiser les arrêts de bus et tramway à proximité.

RÈGLES DE COMPORTEMENT :

1. DÉCLENCHEMENT DE LA RECHERCHE
   Dès qu'un utilisateur mentionne un lieu ou une adresse, vous DEVEZ appeler l'outil 'getBusStops'. Ne demandez pas de confirmation, lancez la recherche directement.

2. FORÇAGE DE L'OUTIL
   Même si l'adresse a déjà été cherchée plus tôt, appelez l'outil À NOUVEAU. L'utilisateur a besoin de voir le widget visuel à chaque demande.

3. SÉQUENCE OBLIGATOIRE (TEXTE AVANT OUTIL)
   Vous devez IMPÉRATIVEMENT commencer par une phrase de texte (ex: "Je regarde les bus passant au [Adresse]...") AVANT de générer l'appel à l'outil 'getBusStops'. Ne lancez jamais l'outil sans cette introduction textuelle.

4. PRÉSENTATION
   L'interface affiche un widget spécial pour les arrêts. Ne listez pas tous les détails (lignes, horaires) dans votre texte, sauf si nécessaire.

5. CONVERSATION GENERAL
   Si l'utilisateur dit "Bonjour", "Merci" ou change de sujet, ne répétez pas le contexte des arrêts précédents. Répondez simplement au nouveau message.
   Si la demande n'est pas claire, demandez des précisions.

6. TON
   Restez courtois, concis et serviable.`,
            messages: coreMessages,
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

        return (result as any).toUIMessageStreamResponse();
    } catch (e: any) {
        console.error("API Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
