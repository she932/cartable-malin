// Cette fonction tourne sur le serveur (jamais dans le téléphone des gens).
// C'est ici, et seulement ici, que la clé secrète est utilisée.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "Aucune image reçue" });
  }

  const prompt = `Tu lis une photo de liste de fournitures scolaires (souvent organisée par matière).
Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown, au format exact :
{"items":[{"name":"nom de l'article au singulier","quantity":1,"format":"précisions utiles (pages, taille, couleur, pointe...) ou chaîne vide","category":"une valeur parmi Écriture, Cahiers & Papier, Classement, Dessin & Coloriage, Outils & Mesure, Cartable & Rangement, Autres","subject":"matière associée si visible sur la liste, sinon chaîne vide"}]}
Si une quantité n'est pas précisée, mets 1. Ignore le texte qui n'est pas un article (titres, consignes, noms d'école).`;

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
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erreur du service de lecture" });
    }

    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "La liste n'a pas été reconnue correctement. Réessaie avec une photo plus nette." });
  }
}
