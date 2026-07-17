import React, { useState, useRef, useEffect } from "react";
import { Camera, Plus, X, Trash2, Users, ShoppingCart, Loader2, Check, Pencil, Sparkles, AlertCircle, ChevronRight, Tag, FileText } from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
--------------------------------------------------------------- */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const CATEGORIES = [
  "Écriture",
  "Cahiers & Papier",
  "Classement",
  "Dessin & Coloriage",
  "Outils & Mesure",
  "Cartable & Rangement",
  "Autres",
];

const CHILD_COLORS = [
  "#E86A5C", // rouge cahier
  "#4C8BF5", // bleu
  "#3F9142", // vert
  "#A75FD1", // violet
  "#F0A93B", // jaune/orange
  "#2FB6C4", // turquoise
];

const STORES = ["Carrefour", "Cultura", "Bureau Vallée"];

const CATALOG = [
  { kw: ["cahier"], label: "Cahiers", category: "Cahiers & Papier", prices: [1.1, 1.4, 1.0] },
  { kw: ["copie double", "feuille simple", "feuillet"], label: "Copies / feuilles", category: "Cahiers & Papier", prices: [1.5, 1.8, 1.3] },
  { kw: ["protège-cahier", "protege cahier", "protège cahier"], label: "Protège-cahiers", category: "Cahiers & Papier", prices: [0.9, 1.1, 0.8] },
  { kw: ["classeur"], label: "Classeurs", category: "Classement", prices: [3.5, 4.5, 3.0] },
  { kw: ["chemise"], label: "Chemises cartonnées", category: "Classement", prices: [0.6, 0.8, 0.5] },
  { kw: ["intercalaire"], label: "Intercalaires", category: "Classement", prices: [2.0, 2.5, 1.8] },
  { kw: ["pochette plastique", "pochette perforée", "pochettes transparentes"], label: "Pochettes plastique", category: "Classement", prices: [4.0, 4.5, 3.5] },
  { kw: ["trieur", "porte-vues", "porte vues"], label: "Trieur / porte-vues", category: "Classement", prices: [5.0, 6.5, 4.5] },
  { kw: ["stylo plume"], label: "Stylo plume", category: "Écriture", prices: [6.0, 8.0, 5.5] },
  { kw: ["stylo", "bic"], label: "Stylos", category: "Écriture", prices: [3.0, 3.5, 2.5] },
  { kw: ["crayon à papier", "crayon a papier", "crayon hb", "crayon gris"], label: "Crayons à papier", category: "Écriture", prices: [1.5, 2.0, 1.2] },
  { kw: ["crayon de couleur", "crayons de couleur"], label: "Crayons de couleur", category: "Dessin & Coloriage", prices: [3.5, 4.5, 3.0] },
  { kw: ["feutre coloriage", "feutres de coloriage"], label: "Feutres de coloriage", category: "Dessin & Coloriage", prices: [4.0, 5.0, 3.5] },
  { kw: ["feutre ardoise", "velleda"], label: "Feutres ardoise", category: "Écriture", prices: [2.5, 3.0, 2.2] },
  { kw: ["surligneur"], label: "Surligneurs", category: "Écriture", prices: [3.0, 3.8, 2.5] },
  { kw: ["gomme"], label: "Gommes", category: "Écriture", prices: [0.6, 0.8, 0.5] },
  { kw: ["taille-crayon", "taille crayon"], label: "Taille-crayons", category: "Écriture", prices: [1.0, 1.3, 0.8] },
  { kw: ["règle", "regle"], label: "Règles", category: "Outils & Mesure", prices: [1.0, 1.3, 0.8] },
  { kw: ["équerre", "equerre"], label: "Équerres", category: "Outils & Mesure", prices: [1.5, 2.0, 1.2] },
  { kw: ["compas"], label: "Compas", category: "Outils & Mesure", prices: [3.5, 4.5, 3.0] },
  { kw: ["colle"], label: "Colle en bâton", category: "Outils & Mesure", prices: [1.5, 1.8, 1.2] },
  { kw: ["ciseaux"], label: "Ciseaux", category: "Outils & Mesure", prices: [2.5, 3.0, 2.0] },
  { kw: ["calculatrice"], label: "Calculatrice", category: "Outils & Mesure", prices: [8.0, 12.0, 7.0] },
  { kw: ["trousse"], label: "Trousse", category: "Cartable & Rangement", prices: [6.0, 9.0, 5.0] },
  { kw: ["cartable", "sac à dos", "sac a dos"], label: "Cartable / sac à dos", category: "Cartable & Rangement", prices: [25.0, 35.0, 22.0] },
  { kw: ["agenda", "cahier de texte"], label: "Agenda", category: "Cahiers & Papier", prices: [4.0, 6.0, 3.5] },
  { kw: ["blouse", "tablier"], label: "Blouse / tablier", category: "Cartable & Rangement", prices: [8.0, 10.0, 7.0] },
  { kw: ["mouchoir"], label: "Boîte de mouchoirs", category: "Autres", prices: [1.2, 1.4, 1.0] },
  { kw: ["ardoise"], label: "Ardoise", category: "Écriture", prices: [3.0, 3.5, 2.5] },
];
const FALLBACK_PRICES = [2.0, 2.4, 1.8];

/* ---------------------------------------------------------------
   HELPERS
--------------------------------------------------------------- */
let _id = 0;
const uid = () => `id${++_id}_${Date.now().toString(36)}`;

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function matchCatalog(name) {
  const n = normalize(name);
  for (const entry of CATALOG) {
    if (entry.kw.some((k) => n.includes(normalize(k)))) return entry;
  }
  return null;
}

// Construit une "signature" tolérante à partir du format + du nom :
// les chiffres (ex. 96 pages) et quelques mots-clés de format sont gardés,
// le reste (mise en forme, mots de liaison) est ignoré pour éviter les faux doublons.
function formatSignature(name, format) {
  const text = normalize(`${format} ${name}`);
  const numbers = (text.match(/\d+/g) || []).sort().join(",");
  const words = text
    .replace(/\d+/g, "")
    .replace(/\bpages?\b/g, "")
    .replace(/\bgrand(e)?s?\b/g, "gc")
    .replace(/\bpetit(e)?s?\b/g, "pc")
    .replace(/\bcarreaux?\b/g, "")
    .replace(/\bseyes?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${numbers}|${words}`;
}

// Clé de regroupement : utilise le nom canonique du catalogue quand l'article
// est reconnu (ex. toutes les variantes de "cahier" tombent sur la même base),
// combiné à la signature de format tolérante ci-dessus.
function canonicalKey(name, format) {
  const catalogEntry = matchCatalog(`${name} ${format}`);
  const base = catalogEntry ? normalize(catalogEntry.label) : normalize(name);
  return `${base}::${formatSignature(name, format)}`;
}

function fileToResizedBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible"));
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve(dataUrl.split(",")[1]);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function fileToRawBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
}

async function extractItemsFromImage(files) {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: files.map((f) => ({ data: f.base64, mediaType: f.mediaType })) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Le service de lecture a répondu une erreur.");
  if (!data.items || !Array.isArray(data.items)) throw new Error("Aucun article détecté sur ces documents.");
  return data.items.filter((it) => it.name && it.name.trim());
}

async function fetchAutoPrices(groups) {
  if (groups.length === 0) return {};
  const items = groups.map((g, i) => ({ i, name: g.name, format: g.format }));
  const response = await fetch("/api/prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, stores: STORES }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Recherche de prix impossible.");
  const result = {};
  for (const entry of data.prices || []) {
    const g = groups[entry.i];
    if (g && Array.isArray(entry.p)) result[g.key] = entry.p.map((n) => Number(n) || 0);
  }
  return result;
}

function consolidate(items) {
  const map = new Map();
  for (const it of items) {
    const key = normalize(it.name) + "|" + normalize(it.format || "");
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: it.name.trim(),
        format: (it.format || "").trim(),
        category: it.category || "Autres",
        quantity: 0,
        subjects: new Set(),
      });
    }
    const entry = map.get(key);
    entry.quantity += Number(it.quantity) || 1;
    if (it.subject) entry.subjects.add(it.subject);
  }
  return Array.from(map.values()).map((e) => ({ ...e, subjects: Array.from(e.subjects) }));
}

/* ---------------------------------------------------------------
   STYLE HELPERS (Seyès paper look)
--------------------------------------------------------------- */
const paperStyle = {
  backgroundColor: "#FBFAF6",
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0px, transparent 26px, #C7DCEC 27px, #C7DCEC 28px)",
  backgroundPosition: "0 6px",
};

/* ---------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------- */
export default function App() {
  const [children, setChildren] = useState([{ id: uid(), name: "Léo", color: CHILD_COLORS[0], items: [] }]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [view, setView] = useState("scan"); // scan | family | prices
  const [addingChild, setAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingSubject, setPendingSubject] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]); // [{ base64, mediaType, name, preview }]
  const [priceOverrides, setPriceOverrides] = useState({}); // key -> [p1,p2,p3] (manual corrections)
  const [autoPrices, setAutoPrices] = useState({}); // key -> [p1,p2,p3] (fetched automatically)
  const [pricesStatus, setPricesStatus] = useState("idle"); // idle | loading | done | error
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState(null);
  const [ownedKeys, setOwnedKeys] = useState({}); // key -> true si déjà à la maison
  const fileInputRef = useRef(null);

  function toggleOwned(key) {
    setOwnedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  /* ---------- children mgmt ---------- */
  function addChild() {
    const name = newChildName.trim();
    if (!name) return;
    const color = CHILD_COLORS[children.length % CHILD_COLORS.length];
    const c = { id: uid(), name, color, items: [] };
    setChildren((prev) => [...prev, c]);
    setActiveChildId(c.id);
    setNewChildName("");
    setAddingChild(false);
  }

  function removeChild(id) {
    if (children.length <= 1) return;
    setChildren((prev) => prev.filter((c) => c.id !== id));
    if (activeChildId === id) setActiveChildId(null);
  }

  /* ---------- photo/PDF flow (sélection multiple) ---------- */
  async function onPickPhoto(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          if (file.type === "application/pdf") {
            const b64 = await fileToRawBase64(file);
            return { base64: b64, mediaType: "application/pdf", name: file.name, preview: null };
          } else {
            const b64 = await fileToResizedBase64(file);
            return { base64: b64, mediaType: "image/jpeg", name: file.name, preview: `data:image/jpeg;base64,${b64}` };
          }
        })
      );
      setPendingFiles((prev) => [...prev, ...processed]);
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  }

  function removePendingFile(idx) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function confirmScan() {
    if (pendingFiles.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const items = await extractItemsFromImage(pendingFiles);
      const subj = pendingSubject.trim();
      const scanId = uid();
      const newItems = items.map((it) => ({
        id: uid(),
        scanId,
        name: it.name.trim(),
        format: (it.format || "").trim(),
        category: CATEGORIES.includes(it.category) ? it.category : "Autres",
        quantity: Number(it.quantity) || 1,
        subject: subj || it.subject || "",
      }));
      const targetId = activeChild ? activeChild.id : children[0].id;
      setChildren((prev) =>
        prev.map((c) => {
          if (c.id !== targetId) return c;
          const merged = [...c.items];
          for (const ni of newItems) {
            const niKey = canonicalKey(ni.name, ni.format);
            const existing = merged.find((it) => canonicalKey(it.name, it.format) === niKey);
            if (existing) {
              existing.quantity += ni.quantity;
              if (ni.subject && !existing.subject.includes(ni.subject)) {
                existing.subject = existing.subject ? `${existing.subject}, ${ni.subject}` : ni.subject;
              }
            } else {
              merged.push(ni);
            }
          }
          return { ...c, items: merged };
        })
      );
      setPendingFiles([]);
      setPendingSubject("");
    } catch (err) {
      setError(err.message || "Une erreur est survenue pendant la lecture.");
      setPendingFiles([]);
    } finally {
      setLoading(false);
    }
  }

  function cancelPending() {
    setPendingFiles([]);
    setPendingSubject("");
    setError("");
  }

  function updateItem(childId, itemId, patch) {
    setChildren((prev) =>
      prev.map((c) =>
        c.id !== childId ? c : { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
      )
    );
  }

  function removeItem(childId, itemId) {
    setChildren((prev) =>
      prev.map((c) => (c.id !== childId ? c : { ...c, items: c.items.filter((it) => it.id !== itemId) }))
    );
  }

  function addManualItem(childId) {
    const newItem = { id: uid(), scanId: "manuel", name: "", format: "", category: "Autres", quantity: 1, subject: "" };
    setChildren((prev) => prev.map((c) => (c.id !== childId ? c : { ...c, items: [...c.items, newItem] })));
  }

  /* ---------- family aggregation ---------- */
  const allItemsFlat = children.flatMap((c) => c.items.map((it) => ({ ...it, childId: c.id, childName: c.name, childColor: c.color })));
  const familyGroups = (() => {
    const map = new Map();
    for (const it of allItemsFlat) {
      if (!it.name.trim()) continue;
      const key = canonicalKey(it.name, it.format || "");
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: it.name.trim(),
          format: it.format.trim(),
          category: it.category,
          quantity: 0,
          byChild: new Map(),
        });
      }
      const g = map.get(key);
      g.quantity += Number(it.quantity) || 0;
      const cur = g.byChild.get(it.childId) || { name: it.childName, color: it.childColor, qty: 0 };
      cur.qty += Number(it.quantity) || 0;
      g.byChild.set(it.childId, cur);
    }
    return Array.from(map.values()).map((g) => ({ ...g, byChild: Array.from(g.byChild.values()) }));
  })();

  const groupedByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    items: familyGroups.filter((g) => g.category === cat),
  })).filter((g) => g.items.length > 0);

  const totalArticles = familyGroups.reduce((s, g) => s + g.quantity, 0);

  /* ---------- pricing ---------- */
  const groupsSignature = familyGroups.map((g) => `${g.key}:${g.quantity}`).join("|");

  useEffect(() => {
    if (familyGroups.length === 0) return;
    const timer = setTimeout(() => {
      setPricesStatus("loading");
      fetchAutoPrices(familyGroups)
        .then((result) => {
          setAutoPrices(result);
          setPricesStatus("done");
          setPricesUpdatedAt(new Date());
        })
        .catch(() => setPricesStatus("error"));
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsSignature]);

  function getPrices(group) {
    if (priceOverrides[group.key]) return priceOverrides[group.key];
    if (autoPrices[group.key]) return autoPrices[group.key];
    const catalogEntry = matchCatalog(group.name + " " + group.format);
    return catalogEntry ? catalogEntry.prices : FALLBACK_PRICES;
  }
  function setPrice(key, storeIdx, value) {
    setPriceOverrides((prev) => {
      const base = prev[key] || getPricesByKey(key);
      const next = [...base];
      next[storeIdx] = value;
      return { ...prev, [key]: next };
    });
  }
  function getPricesByKey(key) {
    if (autoPrices[key]) return [...autoPrices[key]];
    const g = familyGroups.find((x) => x.key === key);
    if (!g) return [...FALLBACK_PRICES];
    const catalogEntry = matchCatalog(g.name + " " + g.format);
    return catalogEntry ? [...catalogEntry.prices] : [...FALLBACK_PRICES];
  }
  const storeTotals = STORES.map((_, i) =>
    familyGroups.reduce((sum, g) => sum + (ownedKeys[g.key] ? 0 : getPrices(g)[i] * g.quantity), 0)
  );
  const cheapestIdx = storeTotals.indexOf(Math.min(...storeTotals));
  const remainingArticles = familyGroups.reduce((s, g) => s + (ownedKeys[g.key] ? 0 : g.quantity), 0);
  const ownedCount = familyGroups.filter((g) => ownedKeys[g.key]).length;

  /* ---------------------------------------------------------------
     RENDER
  --------------------------------------------------------------- */
  return (
    <div className="min-h-screen w-full" style={{ background: "#EFF3F6", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        ${FONTS}
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-hand { font-family: 'Caveat', cursive; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
        .stamp {
          transform: rotate(-6deg);
          border: 3px solid #D64545;
          color: #D64545;
        }
        .child-tab { transition: all .15s ease; }
        .child-tab[data-active="true"] { transform: translateY(-2px); }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: #C7DCEC; border-radius: 10px; }
      `}</style>

      {/* HERO */}
      <header className="relative overflow-hidden" style={paperStyle}>
        <div className="absolute left-0 top-0 bottom-0 w-[3px] sm:w-1" style={{ background: "#D64545", opacity: 0.75 }} />
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-8 pl-8 sm:pl-14">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} color="#D64545" />
            <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#D64545" }}>
              Spécial rentrée
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold" style={{ color: "#24324A" }}>
            Cartable Malin
          </h1>
          <p className="mt-3 text-[15px] max-w-md" style={{ color: "#5B6B85" }}>
            Photographie les listes de fournitures, matière par matière. On regroupe tout, on compare les prix, et on
            cumule pour toute la fratrie.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 -mt-4">
        {/* CHILDREN TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-4">
          {children.map((c) => (
            <button
              key={c.id}
              data-active={c.id === activeChild.id}
              onClick={() => setActiveChildId(c.id)}
              className="child-tab flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium border"
              style={{
                background: c.id === activeChild.id ? "#fff" : "#E4EAF0",
                borderColor: c.id === activeChild.id ? c.color : "transparent",
                color: "#24324A",
                boxShadow: c.id === activeChild.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              {c.name}
              {children.length > 1 && (
                <X
                  size={13}
                  className="ml-1 opacity-40 hover:opacity-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChild(c.id);
                  }}
                />
              )}
            </button>
          ))}
          {addingChild ? (
            <div className="flex items-center gap-1 shrink-0 bg-white rounded-xl border px-2 py-1" style={{ borderColor: "#C7DCEC" }}>
              <input
                autoFocus
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChild()}
                placeholder="Prénom"
                className="text-sm outline-none w-20 px-1"
              />
              <button onClick={addChild} className="p-1 rounded-lg" style={{ background: "#3F9142" }}>
                <Check size={13} color="#fff" />
              </button>
              <button onClick={() => setAddingChild(false)} className="p-1">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingChild(true)}
              className="shrink-0 flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium border border-dashed"
              style={{ color: "#5B6B85", borderColor: "#B9C4D0" }}
            >
              <Plus size={14} /> Enfant
            </button>
          )}
        </div>

        {/* SECONDARY NAV */}
        <div className="flex gap-1 mt-4 mb-5 rounded-xl p-1" style={{ background: "#E4EAF0" }}>
          {[
            { id: "scan", label: "Scanner", icon: Camera },
            { id: "family", label: "Vue famille", icon: Users },
            { id: "prices", label: "Comparatif prix", icon: ShoppingCart },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium"
              style={{
                background: view === t.id ? "#fff" : "transparent",
                color: view === t.id ? "#24324A" : "#5B6B85",
                boxShadow: view === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ---------------- SCAN VIEW ---------------- */}
        {view === "scan" && (
          <div className="space-y-5">
            {pendingFiles.length === 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 py-10 px-4 text-center"
                style={{ borderColor: "#B9C4D0", background: "#fff" }}
              >
                <div className="rounded-full p-3" style={{ background: "#FDEDEA" }}>
                  <Camera size={26} color="#D64545" />
                </div>
                <p className="font-display font-semibold" style={{ color: "#24324A" }}>
                  Scanner une liste
                </p>
                <p className="text-sm max-w-xs" style={{ color: "#5B6B85" }}>
                  Photo, image depuis ta galerie, ou PDF — pour <b>{activeChild.name}</b>, une ou plusieurs matières à
                  la fois.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={onPickPhoto}
                />
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="rounded-2xl bg-white p-4 border" style={{ borderColor: "#C7DCEC" }}>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border" style={{ borderColor: "#E4EAF0" }}>
                      {f.preview ? (
                        <img src={f.preview} alt={f.name} className="w-full h-20 object-cover" style={{ background: "#F4F6F8" }} />
                      ) : (
                        <div className="w-full h-20 flex flex-col items-center justify-center gap-1 p-1" style={{ background: "#F4F6F8" }}>
                          <FileText size={20} color="#D64545" />
                          <span className="text-[10px] truncate w-full text-center px-1" style={{ color: "#5B6B85" }}>
                            {f.name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removePendingFile(i)}
                        className="absolute top-1 right-1 rounded-full p-0.5"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        <X size={12} color="#fff" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border-2 border-dashed flex items-center justify-center h-20"
                    style={{ borderColor: "#B9C4D0" }}
                  >
                    <Plus size={18} color="#8B97A8" />
                  </button>
                </div>
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#5B6B85" }}>
                  Étiquette (optionnel)
                </label>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <Tag size={14} color="#5B6B85" />
                  <input
                    value={pendingSubject}
                    onChange={(e) => setPendingSubject(e.target.value)}
                    placeholder="ex. Mathématiques"
                    className="flex-1 text-sm border rounded-lg px-2 py-1.5 outline-none"
                    style={{ borderColor: "#C7DCEC" }}
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 text-sm rounded-lg p-2 mb-3" style={{ background: "#FDEDEA", color: "#B23A2E" }}>
                    <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={confirmScan}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
                    style={{ background: "#24324A", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {loading
                      ? "Lecture en cours…"
                      : `Analyser ${pendingFiles.length > 1 ? `les ${pendingFiles.length} documents` : "la liste"}`}
                  </button>
                  <button onClick={cancelPending} className="rounded-lg px-4 py-2.5 text-sm font-medium border" style={{ borderColor: "#C7DCEC", color: "#5B6B85" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {pendingFiles.length === 0 && error && (
              <div className="flex items-start gap-2 text-sm rounded-lg p-3" style={{ background: "#FDEDEA", color: "#B23A2E" }}>
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {/* current child's items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-sm" style={{ color: "#24324A" }}>
                  Liste de {activeChild.name} — {activeChild.items.length} article{activeChild.items.length > 1 ? "s" : ""}
                </h3>
                <button onClick={() => addManualItem(activeChild.id)} className="text-xs font-medium flex items-center gap-1" style={{ color: "#4C8BF5" }}>
                  <Plus size={13} /> Ajouter à la main
                </button>
              </div>
              {activeChild.items.length === 0 ? (
                <p className="text-sm italic" style={{ color: "#8B97A8" }}>
                  Aucun article pour l'instant. Scanne une première liste pour commencer.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeChild.items.map((it) => (
                    <ItemRow key={it.id} item={it} onChange={(patch) => updateItem(activeChild.id, it.id, patch)} onDelete={() => removeItem(activeChild.id, it.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- FAMILY VIEW ---------------- */}
        {view === "family" && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="stamp font-hand text-lg font-bold rounded-full w-24 h-24 flex flex-col items-center justify-center shrink-0" style={{ background: "#fff" }}>
                <span className="text-2xl leading-none">{remainingArticles}</span>
                <span className="text-[11px] -mt-0.5">à acheter</span>
              </div>
              <p className="text-sm" style={{ color: "#5B6B85" }}>
                Liste consolidée pour <b>{children.map((c) => c.name).join(", ")}</b>. Les doublons entre matières et
                entre enfants sont fusionnés — un seul passage par rayon.
                {ownedCount > 0 && (
                  <>
                    {" "}
                    <span style={{ color: "#3F9142" }}>
                      {ownedCount} article{ownedCount > 1 ? "s" : ""} déjà à la maison ✓
                    </span>
                  </>
                )}
              </p>
            </div>

            {groupedByCategory.length === 0 ? (
              <EmptyFamily />
            ) : (
              <div className="space-y-6">
                {groupedByCategory.map((g) => (
                  <div key={g.category}>
                    <h3 className="font-display text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D64545" }}>
                      {g.category}
                    </h3>
                    <div className="rounded-xl bg-white border divide-y" style={{ borderColor: "#E4EAF0" }}>
                      {g.items.map((it) => {
                        const owned = !!ownedKeys[it.key];
                        return (
                          <div
                            key={it.key}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{ opacity: owned ? 0.5 : 1 }}
                          >
                            <div className="font-mono text-sm font-semibold rounded-md px-2 py-1 shrink-0" style={{ background: "#F4F6F8", color: "#24324A" }}>
                              ×{it.quantity}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-medium truncate"
                                style={{ color: "#24324A", textDecoration: owned ? "line-through" : "none" }}
                              >
                                {it.name}
                              </p>
                              {it.format && (
                                <p className="text-xs truncate" style={{ color: "#8B97A8" }}>
                                  {it.format}
                                </p>
                              )}
                            </div>
                            <div className="flex -space-x-1.5 shrink-0">
                              {it.byChild.map((bc) => (
                                <span
                                  key={bc.name}
                                  title={`${bc.name} : ${bc.qty}`}
                                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ background: bc.color }}
                                >
                                  {bc.name.charAt(0).toUpperCase()}
                                </span>
                              ))}
                            </div>
                            <label className="shrink-0 flex flex-col items-center gap-0.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={owned}
                                onChange={() => toggleOwned(it.key)}
                                className="w-5 h-5 rounded"
                                style={{ accentColor: "#3F9142" }}
                              />
                              <span className="text-[9px]" style={{ color: "#8B97A8" }}>
                                à la maison
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PRICES VIEW ---------------- */}
        {view === "prices" && (
          <div>
            {familyGroups.length === 0 ? (
              <EmptyFamily />
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {STORES.map((store, i) => (
                    <div
                      key={store}
                      className="rounded-xl p-3 text-center border relative"
                      style={{
                        background: i === cheapestIdx ? "#EAF5EC" : "#fff",
                        borderColor: i === cheapestIdx ? "#3F9142" : "#E4EAF0",
                      }}
                    >
                      {i === cheapestIdx && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-hand text-[11px] font-bold px-2 rounded-full text-white" style={{ background: "#3F9142" }}>
                          le moins cher
                        </span>
                      )}
                      <p className="text-xs font-medium mt-1" style={{ color: "#5B6B85" }}>
                        {store}
                      </p>
                      <p className="font-mono text-lg font-semibold mt-1" style={{ color: "#24324A" }}>
                        {storeTotals[i].toFixed(2)} €
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "#8B97A8" }}>
                  {pricesStatus === "loading" && (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Mise à jour automatique des prix…
                    </>
                  )}
                  {pricesStatus === "done" && pricesUpdatedAt && (
                    <>
                      <Check size={12} color="#3F9142" /> Prix estimés automatiquement (recherche web), mis à jour à{" "}
                      {pricesUpdatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} — encore
                      approximatifs, tu peux corriger un montant en le touchant.
                    </>
                  )}
                  {pricesStatus === "error" && (
                    <>
                      <AlertCircle size={12} color="#B23A2E" /> Mise à jour automatique indisponible, prix indicatifs
                      affichés en attendant — modifiables à la main.
                    </>
                  )}
                  {pricesStatus === "idle" && "Prix indicatifs en attente d'estimation automatique…"}
                </div>

                <div className="space-y-6">
                  {groupedByCategory.map((g) => (
                    <div key={g.category}>
                      <h3 className="font-display text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D64545" }}>
                        {g.category}
                      </h3>
                      <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: "#E4EAF0" }}>
                        <div className="grid grid-cols-[1fr,repeat(3,64px)] gap-1 px-3 py-1.5 text-[10px] uppercase font-semibold" style={{ color: "#8B97A8", background: "#F7F9FB" }}>
                          <span>Article ×qté</span>
                          {STORES.map((s) => (
                            <span key={s} className="text-right pr-1 truncate">
                              {s.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                        <div className="divide-y" style={{ borderColor: "#E4EAF0" }}>
                          {g.items.map((it) => {
                            const prices = getPrices(it);
                            const owned = !!ownedKeys[it.key];
                            return (
                              <div
                                key={it.key}
                                className="grid grid-cols-[1fr,repeat(3,64px)] gap-1 px-3 py-2 items-center"
                                style={{ opacity: owned ? 0.4 : 1 }}
                              >
                                <div className="min-w-0">
                                  <p
                                    className="text-sm truncate"
                                    style={{ color: "#24324A", textDecoration: owned ? "line-through" : "none" }}
                                  >
                                    {it.name} <span className="font-mono text-xs" style={{ color: "#8B97A8" }}>×{it.quantity}</span>
                                  </p>
                                </div>
                                {prices.map((p, i) => (
                                  <div key={i} className="flex items-center justify-end">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={p}
                                      disabled={owned}
                                      onChange={(e) => setPrice(it.key, i, parseFloat(e.target.value) || 0)}
                                      className="font-mono text-xs text-right w-14 rounded-md border px-1 py-1 outline-none"
                                      style={{ borderColor: i === cheapestIdx ? "#3F9142" : "#E4EAF0" }}
                                    />
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ItemRow({ item, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2" style={{ borderColor: "#E4EAF0" }}>
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
        className="font-mono text-sm w-12 text-center rounded-md border py-1 outline-none shrink-0"
        style={{ borderColor: "#E4EAF0" }}
      />
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-1.5">
        <input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Nom de l'article"
          className="text-sm rounded-md border px-2 py-1 outline-none min-w-0"
          style={{ borderColor: "#E4EAF0" }}
        />
        <input
          value={item.format}
          onChange={(e) => onChange({ format: e.target.value })}
          placeholder="Précision (format, couleur…)"
          className="text-sm rounded-md border px-2 py-1 outline-none min-w-0"
          style={{ borderColor: "#E4EAF0" }}
        />
      </div>
      <select
        value={item.category}
        onChange={(e) => onChange({ category: e.target.value })}
        className="text-xs rounded-md border py-1.5 outline-none shrink-0 max-w-[92px]"
        style={{ borderColor: "#E4EAF0", color: "#5B6B85" }}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button onClick={onDelete} className="shrink-0 p-1 opacity-50 hover:opacity-90">
        <Trash2 size={15} color="#B23A2E" />
      </button>
    </div>
  );
}

function EmptyFamily() {
  return (
    <div className="rounded-2xl border-2 border-dashed py-10 px-6 text-center" style={{ borderColor: "#B9C4D0" }}>
      <p className="text-sm" style={{ color: "#8B97A8" }}>
        Rien à afficher pour l'instant — scanne au moins une liste dans l'onglet <b>Scanner</b> pour voir apparaître
        la vue famille et le comparatif de prix.
      </p>
    </div>
  );
}
