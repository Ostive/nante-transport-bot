
import { z } from "zod";

export interface TanLine {
    numLigne: string;
    typeLigne: string;
}

export interface TanStop {
    codeLieu: string;
    libelle: string;
    distance: string;
    ligne: TanLine[];
}

export interface ToolResult {
    found: boolean;
    address?: string;
    stops?: TanStop[];
    error?: string;
}

export async function findBusStops(address: string): Promise<ToolResult> {
    console.log("[TanService] Recherche:", address);
    const apiKey = process.env.OPENCAGE_API_KEY;

    if (!apiKey) {
        console.error("Clé API OpenCage manquante");
        return { found: false, error: "Configuration serveur incomplète" };
    }

    try {
        // 1. Geocoding
        // Ajout explicite de "Nantes France" pour sécuriser la recherche
        const query = `${address} Nantes France`;
        const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&language=fr&limit=1`;

        const geoRes = await fetch(geoUrl);

        // Gestion propre des erreurs HTTP
        if (!geoRes.ok) {
            throw new Error(`Erreur OpenCage: ${geoRes.statusText}`);
        }

        const geo = await geoRes.json();

        if (!geo.results?.[0]) {
            return { found: false };
        }

        const { lat, lng } = geo.results[0].geometry;
        const formatted = geo.results[0].formatted; // Adresse formatée propre

        // 2. Bus Stops (TAN API)
        // Utilisation de l'API temps réel
        // Note: L'URL est hardcodée sur la preprod comme dans le code original, 
        // mais idéalement devrait être une variable d'env.
        const tanUrl = `https://openv2-preprod.tan.fr/ewp/arrets.json/${lat}/${lng}`;

        const tanRes = await fetch(tanUrl);

        if (!tanRes.ok) {
            throw new Error(`Erreur TAN API: ${tanRes.statusText}`);
        }

        const tanData = await tanRes.json();

        // Validation basique des données
        const stops: TanStop[] = Array.isArray(tanData) ? tanData.slice(0, 5) : [];

        return {
            found: true,
            address: formatted,
            stops
        };

    } catch (error: any) {
        console.error("[TanService] Error:", error);
        return { found: false, error: error.message || "Erreur technique" };
    }
}
