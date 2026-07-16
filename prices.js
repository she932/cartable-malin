// Cette fonction tourne sur le serveur (jamais dans le téléphone des gens).
// C'est ici, et seulement ici, que la clé secrète est utilisée.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { items, stores } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(200).json({ prices: [] });
  }

  const storeNames = Array.isArray(stores) && stores.length ? stores : ["Carrefour", "Cultura", "Bureau Vallée"];
  const list = items.map((it) => `${it.i}. ${it.name}${it.format ? " (" + it.format + ")" : ""}`).join("\n");
  const prompt = `Tu compares des prix de fournitures scolaires en France pour ces enseignes : ${storeNames.join(", ")}.
Voici la liste des articles (index. nom) :
${list}

Cherche sur le web une estimation de prix unitaire actuelle et réaliste pour chaque article, pour chacune des ${storeNames.length} enseignes, en euros.
Réponds UNIQUEMENT avec un JSON valide, sans texte avant/après, sans balises markdown, au format exact :
{"prices":[{"i":0,"p":[prixEnseigne1,prixEnseigne2,prixEnseigne3]}, ...]}
L'ordre des prix dans "p" doit correspondre à l'ordre des enseignes donné plus haut. Si un prix précis n'est pas trouvable, donne ta meilleure estimation réaliste plutôt que de l'omettre. Réponds pour tous les index de la liste.`;

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
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Recherche de prix impossible" });
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
    return res.status(500).json({ error: "Recherche de prix impossible pour le moment." });
  }
}
