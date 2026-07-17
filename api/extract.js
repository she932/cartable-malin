// Cette fonction tourne sur le serveur (jamais dans le téléphone des gens).
// C'est ici, et seulement ici, que la clé secrète est utilisée.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // On accepte maintenant plusieurs fichiers d'un coup : photos et/ou PDF
  // Format attendu : { files: [{ data: "base64...", mediaType: "image/jpeg" }, ...] }
  const { files } = req.body || {};
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }
  if (files.length > 10) {
    return res.status(400).json({ error: "10 fichiers maximum par envoi" });
  }

  const contentBlocks = files.map((f) => {
    if (f.mediaType === "application/pdf") {
      return { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data } };
    }
    return { type: "image", source: { type: "base64", media_type: f.mediaType || "image/jpeg", data: f.data } };
  });

  const prompt = `Tu reçois ${files.length > 1 ? `${files.length} documents/photos` : "un document ou une photo"} contenant une ou plusieurs listes de fournitures scolaires (souvent organisées par matière).

Ce sont parfois des captures d'écran (photo d'un écran de téléphone ou d'ordinateur, ou export PDF d'un site) : lis-les avec la même attention qu'une photo papier, même si le contraste est faible, le texte petit, l'image penchée, floue, ou compressée.

Si plusieurs documents sont fournis, traite-les comme UNE SEULE liste globale : lis chacun attentivement, puis fusionne les résultats en regroupant les articles identiques (même nom, même format) en additionnant leurs quantités, plutôt que de les lister en double.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown, au format exact :
{"items":[{"name":"nom de l'article au singulier","quantity":1,"format":"précisions utiles (pages, taille, couleur, pointe...) ou chaîne vide","category":"une valeur parmi Écriture, Cahiers & Papier, Classement, Dessin & Coloriage, Outils & Mesure, Cartable & Rangement, Autres","subject":"matière associée si visible sur la liste, sinon chaîne vide"}]}

Si une quantité n'est pas précisée, mets 1. Ignore le texte qui n'est pas un article (titres, consignes, noms d'école, logos).
Si un des documents est illisible ou ne contient aucune liste de fournitures, ignore-le simplement plutôt que de faire échouer toute la réponse.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [...contentBlocks, { type: "text", text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Erreur du service de lecture" });
    }

    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("extract.js error:", err);
    return res.status(500).json({ error: "La liste n'a pas été reconnue correctement. Réessaie avec une photo plus nette." });
  }
}
