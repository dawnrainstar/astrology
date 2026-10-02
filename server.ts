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

// Personalized Daily Horoscope AI Endpoint
app.post("/api/divination/daily-horoscope", async (req, res) => {
  try {
    const {
      birthDate,
      birthTime,
      birthPlace,
      targetDate,
      focusArea,
      userName,
      userTier
    } = req.body;

    if (!birthDate) {
      return res.status(400).json({ error: "Birth date is required for generating a personalized daily horoscope." });
    }

    const ai = getGenAI();

    // Helper to calculate Sun Sign
    const parseBirth = (bDate: string) => {
      const parts = bDate.split("-");
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const y = parseInt(parts[0], 10);
        
        let sign = "Aries";
        if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) sign = "Aries";
        else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) sign = "Taurus";
        else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) sign = "Gemini";
        else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) sign = "Cancer";
        else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) sign = "Leo";
        else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) sign = "Virgo";
        else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) sign = "Libra";
        else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) sign = "Scorpio";
        else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) sign = "Sagittarius";
        else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) sign = "Capricorn";
        else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) sign = "Aquarius";
        else sign = "Pisces";

        const elements: Record<string, string> = {
          Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
          Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
          Gemini: "Air", Libra: "Air", Aquarius: "Air",
          Cancer: "Water", Scorpio: "Water", Pisces: "Water"
        };

        return {
          sign,
          element: elements[sign] || "Ether",
          month: m,
          day: d,
          year: y
        };
      }
      return { sign: "Aries", element: "Fire", month: 1, day: 1, year: 2000 };
    };

    const natal = parseBirth(birthDate);
    const forecastDate = targetDate || new Date().toISOString().split("T")[0];

    const prompt = `You are a Revered Celestial Astrologer, Master of the Hermetic Zodiac, and Cosmic Guide.
A seeker has requested their personalized Daily Astrological Forecast & Horoscope.

SEEKER NATAL PROFILE:
- Seeker Name: ${userName || "Seeker"}
- Birth Date: ${birthDate}
- Birth Time: ${birthTime || "Not specified (approx. solar noon)"}
- Birth Place: ${birthPlace || "Earth"}
- Primary Sun Sign: ${natal.sign}
- Dominant Natal Element: ${natal.element}
- Account Tier: ${userTier || "Seeker"}

FORECAST PARAMETERS:
- Forecast Date: ${forecastDate}
- Core Focus Area: ${focusArea || "Holistic Cosmic Forecast"}

Generate a rich, deeply personalized, uplifting, and actionable daily horoscope forecast.
Organize the reading with elegant markdown formatting, using clear evocative headers and bullet points:

1. **🌟 Cosmic Atmosphere & Celestial Transits Today**
   - Synthesize the major cosmic weather active for ${forecastDate}, detailing how current planetary transits interact specifically with the seeker's ${natal.sign} Sun and ${natal.element} element.

2. **🔮 Personalized Astrological Forecast for ${natal.sign}**
   - Direct, intuitive, and profound guidance written specifically for this seeker based on their birth date.
   - Address their current life path, interpersonal dynamics, emotional landscape, and subconscious currents.
   ${focusArea && focusArea !== "Holistic Cosmic Forecast" ? `- Special deep dive into the chosen focus realm: **${focusArea}**.` : ""}

3. **✨ Cosmic Energy Meters & Daily Vibrations**
   Provide an energetic calibration for today in percentage format (e.g. 88%):
   - **Love & Sacred Connection**: [Score %] - [Brief 1-sentence intuitive note]
   - **Ambition, Career & Abundance**: [Score %] - [Brief 1-sentence intuitive note]
   - **Intuition, Magic & Spiritual Clarity**: [Score %] - [Brief 1-sentence intuitive note]
   - **Vitality, Health & Prana**: [Score %] - [Brief 1-sentence intuitive note]

4. **🪐 Celestial Correspondences & Lucky Alignments**
   - **Power Color for Today**: (e.g. Deep Amethyst, Solar Gold, Emerald Velvet) with its esoteric meaning
   - **Lucky Numbers**: (e.g. 7, 21, 33)
   - **Talismanic Gemstone / Crystal**: (e.g. Lapis Lazuli, Moonstone, Carnelian)
   - **Ruling Planetary Current**: (e.g. Venus in harmonious trine, Mars empowering fortitude)
   - **Optimal Cosmic Window (Golden Hour)**: (e.g. 10:30 AM - 12:00 PM / Twilight 7:15 PM) for important discussions, creative work, or ritual

5. **🕯️ Daily Celestial Affirmation & Planetary Mantram**
   - A poetic 2-line chant or decree for the seeker to ground their energy today.

Maintain an elevated, wise, compassionate, and mystical tone. Be specific, insightful, and practical.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({
      forecast: response.text,
      natal: {
        sign: natal.sign,
        element: natal.element,
        birthDate,
        birthTime,
        birthPlace,
        targetDate: forecastDate
      }
    });
  } catch (err: any) {
    console.error("Error generating Daily Horoscope:", err);
    res.status(500).json({ error: err.message || "Failed to generate Daily Horoscope." });
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

// OmniOracle AI Chat & Support Assistant Endpoint
app.post("/api/oracle/chat", async (req, res) => {
  try {
    const { messages, userContext, supportPhone } = req.body;
    const ai = getGenAI();

    const phoneContact = supportPhone || "+1 (555) 792-7478";
    const isPaidSubscriber = userContext?.isPaidSubscriber || userContext?.tier === 'creator' || userContext?.tier === 'premium' || userContext?.tier === 'founder';

    const systemInstruction = `You are the OmniOracle Divine Intelligence Guide & Support Assistant.
You have two distinct, strictly defined responsibilities:

1. DEDICATED AI DIVINATION SCHOLAR & READING ADVISOR (HANDLES ALL DIVINATION QUESTIONS):
- YOU (THE AI) ANSWER ALL DIVINATION QUESTIONS.
- Provide comprehensive, deeply intuitive, and hermetically grounded answers for:
  * Tarot readings (all 78 cards, Major & Minor Arcana, suits, Rider-Waite symbolism, upright vs reversed meanings, spreads).
  * I-Ching (all 64 hexagrams, changing lines, upper and lower trigrams, Taoist philosophy).
  * Elder Futhark runes (24 staves + Wyrd, phonetic meanings, aettir, deities, upright and merkstave polarities).
  * Astrology & Daily Horoscopes (natal charts, Sun/Moon/Rising signs, transits, planets, houses, aspects).
  * Pythagorean Numerology (Life Path, Expression, Soul Urge, Personal Year).
  * Obsidian Scrying Mirror visions and Sacred Sigils (Kameas, Rose Cross, sacred geometry).
- If the seeker asks about their recent readings, refer directly to their saved journal context.
- CRITICAL BOUNDARY: The creator Dawn Milazzo does NOT answer divination or reading questions by phone. If a seeker asks if they can call Dawn to interpret a card or reading, politely clarify that phone support is strictly for billing/account questions, and that YOU (the AI Oracle) are the dedicated master scholar built specifically to answer any and all divination questions 24/7 right here in this chat!

2. BILLING, REFUNDS, & SUBSCRIBER PHONE SUPPORT:
- SUBSCRIBER-ONLY PHONE POLICY:
  * Phone support with Dawn Milazzo (${phoneContact}) is an exclusive perk strictly for ACTIVE PAID SUBSCRIBERS (Premium $10/mo, Founder $99 Lifetime, or Creator).
  * Free tier users cannot call; they must have an active paid subscription to access the direct phone line.
  * DAWN ONLY ANSWERS BILLING QUESTIONS & REFUND ASSISTANCE BY PHONE (NO DIVINATION QUESTIONS).
- REFUNDS POLICY (CRITICAL MANDATE):
  * ALL REFUND REQUESTS ARE 100% UNCONDITIONALLY GRANTED WITH ZERO FRICTION.
  * If a user asks for a refund or has any billing issue, immediately and warmly reassure them: "Your refund request is approved and fully granted."
  * Explain that the refund is processed back to their original payment method (PayPal or Credit/Debit Card) typically within 3-5 business days.
  * If they are a paid subscriber and want to discuss their billing or refund over the phone, they can call Dawn directly at: ${phoneContact}.
  * If they are not a paid subscriber, explain that refunds are handled automatically right here with 100% approval.

CURRENT SEEKER CONTEXT:
- Seeker Name: ${userContext?.name || "Seeker"}
- Email: ${userContext?.email || "Guest"}
- Plan / Status: ${userContext?.tier === 'creator' ? 'Oracle Keeper 👑 (Creator)' : userContext?.tier === 'premium' ? '✨ Premium Subscriber ($10/mo)' : userContext?.tier === 'founder' ? '🌟 Founder Tier' : 'Free Tier'}
- Paid Subscriber Status: ${isPaidSubscriber ? "YES (Has phone support access for billing/refunds)" : "NO (Free seeker - phone line locked to paid subscribers)"}
- Recent Readings from Seeker's Journal:
${userContext?.recentReadings && userContext.recentReadings.length > 0 ? JSON.stringify(userContext.recentReadings, null, 2) : "No saved readings yet."}

Tone: Wise, compassionate, respectful, mystically grounded for divination, warm and prompt for billing, with crystal-clear boundaries regarding phone support. Format with clean markdown.`;

    const chatContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Error in Oracle AI Chat:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with Oracle AI." });
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
