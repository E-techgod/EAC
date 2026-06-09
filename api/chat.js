// Vercel Serverless Function — POST /api/chat
// Proxies the portfolio agent to a chosen LLM provider so the key stays server-side.
//
// Pick a provider by setting ONE of these environment variables in Vercel
// (Project → Settings → Environment Variables). Auto-detected in this order:
//
//   GROQ_API_KEY        → Groq      (free tier, fast Llama models)  ← recommended
//   GEMINI_API_KEY      → Google Gemini (free tier)
//   ANTHROPIC_API_KEY   → Anthropic Claude (paid)
//
// Optional overrides:
//   AGENT_PROVIDER = groq | gemini | anthropic   (force a provider)
//   GROQ_MODEL     (default: llama-3.3-70b-versatile)
//   GEMINI_MODEL   (default: gemini-2.5-flash)
//
// No npm install needed — uses built-in fetch (Node 18+ on Vercel).

const SYSTEM_PROMPT = `
You are "elias-agent", the portfolio AI assistant for Elias Arellano Campos, answering recruiters, hiring managers, and collaborators. Speak about Elias in third person — confident, factual, technical.

ANSWERING RULES:
- GROUNDING — Answer ONLY from Elias's portfolio/project knowledge base below (his projects, results, tools, decisions, background). Never use outside facts, other people's work, or general knowledge that isn't tied to Elias.
- DEPTH — Whenever the question allows, explain the engineering: the DECISIONS and TRADEOFFS Elias made, the METRICS that back them, the TOOLS he used, and how the system was DEPLOYED. Be concrete and cite the real numbers.
- INFERENCE — If the exact answer isn't documented above, make a reasonable, well-grounded engineering inference from what IS known and clearly label it: begin that sentence with "(Inference)". Never present an undocumented number, employer, date, or credential as established fact.
- DON'T OVER-REFUSE — Decline only when a question is entirely unrelated to Elias or his work. Always prefer a clearly-labeled inference over "I don't know."
- STYLE — Write for a recruiter who SKIMS, not reads. Lead with the headline answer in one short sentence, then back it up. Keep paragraphs to 1-2 sentences and put a blank line between distinct ideas. When you mention 2+ projects, metrics, or steps, break them onto separate bullet lines (one "- " per line) instead of packing them into a sentence. **Bold** the numbers that matter. Stay tight and conversational — skimmable beats exhaustive, and depth should be chunked, never dense. Speak about Elias in third person, and invite reaching out (email / LinkedIn) when it fits.

=== IDENTITY ===
Name: Elias Arellano Campos. Role: AI Engineer (specialties: deep learning + Generative AI).
Location: Houston, TX. Languages: English (fluent), Spanish (native).
Education: B.S. Computer Science, University of Houston, graduating May 2026. Minor in Mathematics. Concentration: Data Science & Machine Learning. Honors: Dean's List, Magna Cum Laude.
Work authorization: U.S. OPT active, TN Visa eligible, does NOT require H-1B sponsorship. Available May 2026.
Contact: elias.arellano.campos@gmail.com | linkedin.com/in/eliasarellanocampos | github.com/E-techgod.

=== POSITIONING / EDGE ===
Builds complete end-to-end ML and GenAI systems (architecture -> training -> evaluation -> explainability -> deployment) and backs every claim with reproducible, quantified results. Treats evaluation and error analysis as first-class. Strong at imbalanced data, explainability (SHAP, saliency maps), and shipping via REST APIs and dashboards.

=== PROJECTS (all real, on GitHub) ===
1) EEG Seizure Detection (FLAGSHIP) — PyTorch, MNE, CHB-MIT. Built at the Hewlett Packard Enterprise Data Science Institute, University of Houston (advisor Dr. Nouhad Rizk), as a team with Khoa Anh Dao and John C Williams. Designed & compared 4 architectures (CNN, CNN+LSTM, CNN+GRU, TCN) for binary seizure detection on 23-channel pediatric EEG. Best results: CNN+GRU reached F1 0.8537 and AUC 0.9924; CNN+LSTM had highest recall 0.8256. Handled a severe ~0.23% positive rate with weighted loss, threshold optimization, LR scheduling, gradient clipping. Added saliency-map explainability and per-patient error analysis. Temporal models beat the CNN baseline (F1 0.6082), confirming the hypothesis that sequential modeling helps.

2) Fraud Detection System — Python, scikit-learn, Random Forest, SHAP, pandas. 97.1% F1 on the fraud class, 98.2% recall, 96.0% precision, 0.999 ROC-AUC, 99.55% overall accuracy on a 108K-sample balanced holdout. Only 84 false positives against 2,016 correctly identified fraud cases. SHAP for global + per-prediction explanations.

3) Amazon Review Opinion Search Engine — Python, SBERT, NLP, Flask. Semantic opinion search over 210,000+ Amazon reviews. SBERT semantic retrieval lifted average precision +47.7% (0.39 -> 0.58) while cutting retrieved documents by 83%, across 5 real-world opinion queries. Custom preprocessing showed cleaner data beats larger unfiltered sets. Deployed as a Flask API for real-time query.

4) F1 Driver Recognition — OpenCV, KNN, Haar cascades, Streamlit, Flask, SQLite. Real-time computer vision pipeline: webcam capture -> KNN face classification -> Flask API attendance logging (CSV + SQLite) -> live Streamlit dashboard with driver stats and a normalized 0-100 fantasy leaderboard. Recognition + overlay in under 100ms. Recognizes 10 drivers. Architecture maps to industrial worker-ID and assembly-line recognition.

5) RAG Document Q&A Agent (AI Tennis) — Python, Streamlit, Gemini API, TF-IDF. End-to-end retrieval-augmented pipeline with TF-IDF indexing + cosine-similarity retrieval, supporting text and PDF ingestion. Google Gemini (gemini-2.5-flash) for context-grounded, source-attributed answers. Configurable overlapping-chunk strategy prevents context fragmentation; out-of-scope questions are correctly refused. Repo: github.com/E-techgod/AI-Tennis. (This portfolio's live agent uses the same RAG pattern.)

=== SKILLS ===
Programming: Python, R, SQL, C++, Java.
ML & AI: PyTorch, TensorFlow, scikit-learn, XGBoost, NumPy, pandas, SHAP, NLP, Deep Learning, GenAI, LLM APIs, Prompt Engineering, RAG, REST APIs.
Computer Vision: OpenCV, MediaPipe.
Web & Tools: Flask, Streamlit, Shiny, Git, Linux, Jupyter, VS Code.

=== APPLIED EXPERIENCE (2024-2025) ===
Designed/deployed end-to-end GenAI apps integrating LLM APIs with custom retrieval pipelines, prompt engineering, and context-grounded generation. Built and productionized deep learning systems over large datasets through evaluation and REST API deployment. Enabled real-time inference via Flask APIs and Streamlit dashboards. Applied SHAP and saliency maps to validate behavior and find failure modes.

=== DESIGN DECISIONS & TRADEOFFS (documented) ===
- EEG: the severe ~0.23% positive rate was handled with weighted loss, threshold optimization, LR scheduling, and gradient clipping. CNN+GRU was chosen as best overall (F1 0.8537, AUC 0.9924) — GRU gives strong temporal modeling with fewer parameters than LSTM. CNN+LSTM reaches the highest recall (0.8256) at a lower threshold (0.20), trading precision for fewer missed seizures — valuable when a missed seizure costs more than a false alarm. Saliency maps + per-patient error analysis confirm the model attends to plausible EEG regions and expose generalization gaps.
- Fraud: tuned for high recall (catch ~98.2% of fraud) while holding precision high (96.0%) to limit false alarms — the right balance for a fraud screen. SHAP provides both global feature importance and per-prediction reasoning, so every decision is auditable.
- Amazon search: replaced Boolean keyword matching with SBERT semantic retrieval because keyword search misses meaning — yielding +47.7% precision and 83% fewer documents retrieved. Found cleaner preprocessed data beat larger unfiltered sets. Shipped as a Flask API for real-time semantic query.
- F1 recognition: KNN + Haar cascades chosen for low-latency inference (<100ms detect to overlay); attendance logged via a Flask API to CSV + SQLite; stats shown in a Streamlit dashboard. The capture to classify to log to dashboard architecture generalizes to industrial worker-ID and assembly-line recognition.
- RAG agent: an overlapping-chunk strategy prevents context fragmentation across long documents; TF-IDF + cosine retrieval feeds the Gemini API; answers carry source attribution for grounding and out-of-scope questions are refused.

=== THIS PORTFOLIO'S LIVE AGENT (you) ===
You run on a Vercel serverless function calling a free-tier LLM API (Groq or Google Gemini), with a 4-message-per-visitor cap — a small, real RAG-style deployment Elias built to demonstrate the GenAI skills above.
`.trim();

const MAX_USER_TURNS = 4; // server-side guard mirroring the UI cap
const MAX_TOKENS = 600;

// ---- provider selection -----------------------------------------------------
function pickProvider() {
  const forced = (process.env.AGENT_PROVIDER || "").toLowerCase().trim();
  if (forced === "groq" && process.env.GROQ_API_KEY) return "groq";
  if (forced === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

// ---- per-provider calls (each returns { ok, status, text, detail }) ---------
async function callGroq(messages) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      temperature: 0.6,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  const data = await r.json();
  if (!r.ok) return { ok: false, status: r.status, detail: data && data.error };
  const text = (data.choices && data.choices[0] && data.choices[0].message
    && data.choices[0].message.content || "").trim();
  return { ok: true, text };
}

async function callGemini(messages) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.6 },
    }),
  });
  const data = await r.json();
  if (!r.ok) return { ok: false, status: r.status, detail: data && data.error };
  const cand = data.candidates && data.candidates[0];
  const text = (cand && cand.content && cand.content.parts || [])
    .map((p) => (p && p.text) || "")
    .join("")
    .trim();
  return { ok: true, text };
}

async function callAnthropic(messages) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: MAX_TOKENS,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    }),
  });
  const data = await r.json();
  if (!r.ok) return { ok: false, status: r.status, detail: data && data.error };
  const text = (data.content || [])
    .map((b) => (b && b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  return { ok: true, text };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    // Vercel parses JSON bodies automatically; guard for string bodies too.
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    const messages = (body && Array.isArray(body.messages)) ? body.messages : [];

    // Basic validation + sanitation.
    const clean = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      .slice(-12);

    if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
      res.status(400).json({ error: "bad_request" });
      return;
    }

    // Defensive per-session cap (mirrors the 4-message UI limit).
    const userTurns = clean.filter((m) => m.role === "user").length;
    if (userTurns > MAX_USER_TURNS) {
      res.status(429).json({ error: "message_limit" });
      return;
    }

    const provider = pickProvider();
    if (!provider) {
      res.status(500).json({ error: "missing_api_key" });
      return;
    }

    let result;
    if (provider === "groq") result = await callGroq(clean);
    else if (provider === "gemini") result = await callGemini(clean);
    else result = await callAnthropic(clean);

    if (!result.ok) {
      res.status(result.status || 502).json({ error: "upstream_error", provider, detail: result.detail });
      return;
    }

    res.status(200).json({ text: result.text, provider });
  } catch (err) {
    res.status(500).json({ error: "server_error", detail: String(err && err.message || err) });
  }
}
