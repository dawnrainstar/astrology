import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Tarot AI Reading Endpoint
app.post("/api/divination/tarot", async (req, res) => {
  try {
    const { question, spreadName, cards } = req.body;
    const ai = getGenAI();

    const prompt = `You are a wise, deeply intuitive, and compassionate Tarot Master & Hermetic Scholar.
A seeker has approached you with a question/intention: "${question || "General Guidance & Insight"}".
Spread selected: ${spreadName}.

The cards drawn in position order are:
${cards
  .map(
    (c: any, index: number) =>
      `Position ${index + 1} (${c.positionLabel}): ${c.name} (${c.isReversed ? "Reversed" : "Upright"})\n- Keywords: ${c.keywords?.join(", ")}\n- Element: ${c.element}\n- Context: ${c.isReversed ? c.meaningReversed : c.meaningUpright}`
  )
  .join("\n\n")}

Please provide a deep, evocative, and transformative Tarot reading structured as follows:
1. **Essence of the Reading**: A poetic overview of the dominant energetic themes and elemental balances.
2. **Card-by-Card Position Analysis**: Detailed interpretation of each card in its specific placement, explaining how the card's arcana, suit, and position reveal hidden dynamics.
3. **Synthesis & Inter-Card Alchemy**: How the cards dialogue with each other (e.g. elemental conflicts/harmonies, Major Arcana soul lessons).
4. **Actionable Wisdom & Reflection**: Clear, practical guidance, daily ritual practices, or contemplative questions for the seeker.

Speak in a captivating, respectful, and mystically grounded tone. Keep formatting markdown-rich.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ reading: response.text });
  } catch (err: any) {
    console.error("Error generating Tarot reading:", err);
    res.status(500).json({ error: err.message || "Failed to generate Tarot reading." });
  }
});

// I-Ching AI Reading Endpoint
app.post("/api/divination/iching", async (req, res) => {
  try {
    const { question, primaryHexagram, changingLines, transformedHexagram } = req.body;
    const ai = getGenAI();

    const prompt = `You are an ancient Sage of the I-Ching (The Book of Changes).
A seeker asks: "${question || "Guidance on my present flow and future change"}".

Primary Hexagram #${primaryHexagram.number}: ${primaryHexagram.name} (${primaryHexagram.chineseName} - ${primaryHexagram.englishName})
- Trigrams: Upper ${primaryHexagram.upperTrigram} (${primaryHexagram.upperSymbol}), Lower ${primaryHexagram.lowerTrigram} (${primaryHexagram.lowerSymbol})
- Traditional Judgment Summary: ${primaryHexagram.judgment}
- Image/Symbolism: ${primaryHexagram.image}

Changing Lines: ${changingLines.length > 0 ? changingLines.map((l: number) => `Line ${l}`).join(", ") : "None (Static Hexagram)"}

${
  transformedHexagram
    ? `Transformed Resultant Hexagram #${transformedHexagram.number}: ${transformedHexagram.name} (${transformedHexagram.chineseName} - ${transformedHexagram.englishName})
- Judgment Summary: ${transformedHexagram.judgment}`
    : ""
}

Provide a comprehensive I-Ching divination reading:
1. **The Present Condition (Primary Hexagram)**: Deep breakdown of the current situation, elemental trigram dynamics, and the core Judgment.
2. **The Dynamics of Change (Changing Lines)**: Detailed insight into each changing line drawn, explaining what attitudes or forces are in flux.
3. **The Emerging Horizon (Future Transformation)**: What outcome or future state is manifesting through this transformation.
4. **Taoist Advice for Harmony**: Philosophical and practical counsel on how to yield, act, or cultivate inner clarity right now.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
      },
    });

    res.json({ reading: response.text });
  } catch (err: any) {
    console.error("Error generating I-Ching reading:", err);
    res.status(500).json({ error: err.message || "Failed to generate I-Ching reading." });
  }
});

// Rune AI Reading Endpoint
app.post("/api/divination/runes", async (req, res) => {
  try {
    const { question, spreadName, runes } = req.body;
    const ai = getGenAI();

    const prompt = `You are a Norse Volva / Rune Master well-versed in the Elder Futhark traditions and Nordic cosmology.
Seeker's Query: "${question || "Wisdom of the Nine Realms"}".
Casting Spread: ${spreadName}.

Runes Drawn:
${runes
  .map(
    (r: any, idx: number) =>
      `Position ${idx + 1} (${r.positionLabel}): ${r.name} (${r.symbol}) - ${r.isMerkstave ? "Merkstave / Reversed" : "Upright"}
- Phonetic / Meaning: ${r.phonetic} / ${r.traditionalMeaning}
- Deities / Elements: ${r.deity} / ${r.element}`
  )
  .join("\n\n")}

Provide an authentic Elder Futhark Rune reading:
1. **Whispers of the Runes (Overview)**: Atmospheric interpretation of the cosmic wyrd surrounding the query.
2. **Anatomy of the Cast**: In-depth analysis of each rune symbol in its specific position, considering upright vs merkstave polarities.
3. **The Web of Wyrd**: How these runes interweave past threads, present actions, and fate.
4. **Runic Guidance & Shielding**: Practical council, ritual focus, or runic chant recommendation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ reading: response.text });
  } catch (err: any) {
    console.error("Error generating Rune reading:", err);
    res.status(500).json({ error: err.message || "Failed to generate Rune reading." });
  }
});

// Scrying Mirror AI Endpoint
app.post("/api/divination/scrying", async (req, res) => {
  try {
    const { intention, focalPoint, imageBase64 } = req.body;
    const ai = getGenAI();

    let contents: any = [];

    const textPrompt = `You are an AI Scrying Mirror — a deep black obsidian lens reflecting the subconscious, the unseen, and prophetic visions.
The seeker has gazes into the dark mirror with the intention: "${intention || "Show me what I need to see"}".
Focal Energy Level / Intuitive Movement: ${focalPoint || "Deep swirling mist and silver reflections"}.

Interpret the vision appearing in the obsidian depth:
1. **Vision Unveiled**: Describe a poetic, vivid, symbolic vision forming in the dark mirror (e.g. animals, celestial alignments, geometry, shadows, water currents).
2. **Hidden Meaning & Symbolic Decoder**: Unpack what each element of the vision signifies psychologically and esotericly.
3. **Prophetic Reflection**: Provide direct, intuitive, high-clarity advice addressing the seeker's deepest core question.
4. **Mirror Affirmation**: A single sacred mantra to carry forward.`;

    if (imageBase64) {
      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
        { text: textPrompt },
      ];
    } else {
      contents = textPrompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        temperature: 0.85,
      },
    });

    res.json({ reading: response.text });
  } catch (err: any) {
    console.error("Error generating Scrying reading:", err);
    res.status(500).json({ error: err.message || "Failed to generate Scrying reading." });
  }
});

// Astrology & Numerology AI Endpoint
app.post("/api/divination/astrology-numerology", async (req, res) => {
  try {
    const { birthData, numerologyData, queryType } = req.body;
    const ai = getGenAI();

    const prompt = `You are a Master Astrologer and Pythagorean Numerologist.
User Query Type: ${queryType || "Comprehensive Cosmic Portrait"}.

Birth & Chart Data:
${JSON.stringify(birthData, null, 2)}

Calculated Numerology Profile:
${JSON.stringify(numerologyData, null, 2)}

Provide a detailed, highly accurate Astrological & Numerological Analysis:
1. **The Sun, Moon & Rising Triad**: Explanation of core identity, inner emotional world, and outer persona.
2. **Planetary Rulers & House Placements**: Highlights of key planets (Venus, Mars, Jupiter, Saturn) and elemental balance (Fire, Earth, Air, Water).
3. **Numerological Blueprint**: Deep dive into the Life Path Number, Expression/Destiny Number, Soul Urge Number, and Personal Year.
4. **Cosmic Synthesis & Spiritual Purpose**: How the astrological chart and numerological numbers harmonize to reveal soul purpose and current cycle advice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
      },
    });

    res.json({ reading: response.text });
  } catch (err: any) {
    console.error("Error generating Astrology/Numerology reading:", err);
    res.status(500).json({ error: err.message || "Failed to generate Astrology/Numerology reading." });
  }
});

// Sacred Sigil AI Empowerment Endpoint
app.post("/api/divination/sigil", async (req, res) => {
  try {
    const { rawIntention, cleansedLetters, numericCode, sigilType } = req.body;
    const ai = getGenAI();

    const prompt = `You are an Esoteric Symbolist and Chaos Magic Sigil Scholar.
Raw Intention Statement: "${rawIntention}"
Cleansed Consonants / Sacred Root: "${cleansedLetters}"
Numerical Glyph Code: "${numericCode}"
Sigil Geometry Type: ${sigilType}.

Provide an empowering ritual guide for activating this newly forged Sacred Sigil:
1. **Esoteric Deconstruction**: Explain how the raw desire was condensed into sacred geometry and phonetics.
2. **Elemental & Astrological Consecration**: Suggest the ideal lunar phase, incense, candle color, or elemental symbol to charge it.
3. **Activation Meditation Protocol**: Step-by-step visualization method for embedding the sigil into the subconscious mind.
4. **Incantation of Empowerment**: A unique 3-line poetic chant or power formula tailored to this intention.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ guidance: response.text });
  } catch (err: any) {
    console.error("Error generating Sigil guidance:", err);
    res.status(500).json({ error: err.message || "Failed to generate Sigil guidance." });
  }
});

// Serve frontend assets in production / Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Divination System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
