const { GoogleGenAI } = require('@google/genai');

const GEMINI_MODEL = 'gemini-3.6-flash';
const EMBEDDING_MODEL = 'gemini-embedding-001';

// Helper to get GoogleGenAI client if API key is configured
const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'paste_your_gemini_api_key_here') {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Calculates cosine similarity between two numeric vectors
 */
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Generates vector embedding for text using Google text-embedding-004
 */
const generateEmbedding = async (text) => {
    try {
        const ai = getAIClient();
        if (!ai) return null;

        const cleanText = (text || '').trim();
        if (!cleanText) return null;

        const response = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: cleanText,
        });

        const vector = response?.embedding?.values || response?.embeddings?.[0]?.values;
        return vector || null;
    } catch (error) {
        console.error('Error generating embedding with Gemini:', error.message);
        return null;
    }
};

/**
 * Parses an event poster or flyer image using Gemini 2.5 Flash Vision
 * and extracts structured event fields.
 */
const parsePosterImage = async (fileBuffer, mimeType = 'image/jpeg') => {
    const ai = getAIClient();
    if (!ai) {
        throw new Error('GEMINI_API_KEY is not configured in backend/.env. Please set your Gemini API key to use AI poster scanning.');
    }

    const base64Data = fileBuffer.toString('base64');

    const prompt = `You are an expert AI parser for a campus event platform named Eventro.
Analyze this event poster / flyer image with high accuracy.
Extract all event information and respond ONLY in valid JSON format matching this schema:
{
  "title": "string (Catchy, exact event title from the poster)",
  "college": "string (Hosting college, department, or student club name, or 'Campus')",
  "date": "string (Event date in YYYY-MM-DD format. If only day/month is shown, use the year 2026)",
  "category": "string (Best fit among: 'Tech', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Gaming', 'Other')",
  "visibility": "string ('public' or 'private', default 'public')",
  "isFree": "boolean (true if free entry or no registration fee mentioned; false if fee exists)",
  "price": "number (Registration fee amount as a positive number, or 0 if free)",
  "description": "string (Rich, engaging description covering: what the event is, who should attend, rules/eligibility, prizes/perks if any)",
  "tags": ["array of 3-5 relevant string keywords, e.g. 'Hackathon', 'Coding', 'Cash Prize']
}
Respond strictly with valid JSON. Do not include markdown code block tags (\`\`\`json).`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType || 'image/jpeg',
                            },
                        },
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            },
        });

        const rawText = response.text?.trim() || '{}';
        // Clean any potential markdown wrapper just in case
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return parsed;
    } catch (error) {
        console.error('Error parsing poster with Gemini Vision:', error);
        throw new Error(`Failed to parse poster: ${error.message}`);
    }
};

/**
 * Searches and ranks events using vector similarity and text matching
 */
const findSimilarEvents = async (queryText, events, limit = 5) => {
    if (!events || events.length === 0) return [];

    let queryVector = null;
    try {
        queryVector = await generateEmbedding(queryText);
    } catch (err) {
        console.warn('Embedding generation failed for query, using fallback text match:', err.message);
    }

    // If embedding was successfully generated, score events by cosine similarity
    if (queryVector) {
        const scored = events.map((event) => {
            let score = 0;
            if (event.embedding && Array.isArray(event.embedding) && event.embedding.length > 0) {
                score = cosineSimilarity(queryVector, event.embedding);
            } else {
                // Fallback lexical relevance score for events without embeddings
                const titleMatch = (event.title || '').toLowerCase().includes(queryText.toLowerCase()) ? 0.6 : 0;
                const descMatch = (event.description || '').toLowerCase().includes(queryText.toLowerCase()) ? 0.3 : 0;
                const catMatch = (event.category || '').toLowerCase().includes(queryText.toLowerCase()) ? 0.4 : 0;
                score = Math.max(titleMatch + descMatch, catMatch);
            }
            return { event, score };
        });

        scored.sort((a, b) => b.score - a.score);

        // Dynamic threshold: If the top event has a strong match (>= 0.58), only include events close to it
        const topScore = scored[0]?.score || 0;
        const filtered = scored.filter((item) => {
            if (topScore >= 0.58) {
                return item.score >= 0.58 && (topScore - item.score) <= 0.05;
            }
            return item.score >= 0.52;
        });

        const finalItems = (filtered.length > 0 ? filtered : scored.slice(0, 1)).slice(0, limit);
        return finalItems.map((item) => item.event);
    }

    // Fallback if no embedding model available (keyword matching + date recency)
    const lowerQuery = queryText.toLowerCase();
    const filtered = events.filter((e) => {
        const t = (e.title || '').toLowerCase();
        const d = (e.description || '').toLowerCase();
        const c = (e.category || '').toLowerCase();
        const col = (e.college || '').toLowerCase();
        return t.includes(lowerQuery) || d.includes(lowerQuery) || c.includes(lowerQuery) || col.includes(lowerQuery);
    });

    return (filtered.length > 0 ? filtered : events).slice(0, limit);
};

/**
 * Generates a RAG response for the Campus Event Concierge
 */
const generateRAGResponse = async (userQuery, relevantEvents, chatHistory = []) => {
    const ai = getAIClient();
    if (!ai) {
        // Fallback response when GEMINI_API_KEY is not set
        const eventNames = relevantEvents.map((e) => `• **${e.title}** (${e.category}, on ${new Date(e.date).toLocaleDateString()})`).join('\n');
        return {
            reply: `Hello! I found these upcoming campus events that match your interest:\n\n${eventNames || 'No events currently matched your search.'}\n\n*(To activate live conversational answers, configure \`GEMINI_API_KEY\` in your \`backend/.env\` file).*`,
            matchedEvents: relevantEvents.map((e) => ({
                _id: e._id,
                title: e.title,
                college: e.college,
                date: e.date,
                category: e.category,
                price: e.price,
                isFree: e.isFree,
                imageUrl: e.imageUrl,
            })),
        };
    }

    // Prepare retrieved events context for the prompt
    const eventsContext = relevantEvents
        .map((e, index) => {
            return `[Event ${index + 1}]
ID: ${e._id}
Title: ${e.title}
College/Club: ${e.college}
Date: ${new Date(e.date).toDateString()}
Category: ${e.category}
Cost: ${e.isFree ? 'Free' : `₹${e.price}`}
Description: ${(e.description || '').slice(0, 300)}...
Visibility: ${e.visibility}`;
        })
        .join('\n\n');

    const systemPrompt = `You are Eventro AI, an energetic, friendly campus event concierge for the Eventro platform.
Your job is to assist students in discovering events, answering their questions regarding event dates, rules, fees, and recommending the most suitable events.

Rules:
1. Base your factual answers STRICTLY on the retrieved events context provided below.
2. If the user asks about an event topic not found in the context, politely let them know no matching campus events are currently scheduled and suggest related categories.
3. Be conversational, enthusiastic, and concise. Use bullet points or bold text where appropriate.
4. When recommending events, mention their exact title and whether they are Free or paid.
5. IMPORTANT: At the very end of your response, output a tag listing ONLY the IDs of events you recommended in your message:
   <!-- RECOMMENDED_IDS: ["id1", "id2"] -->
   If no events from the context were recommended, output: <!-- RECOMMENDED_IDS: [] -->

Retrieved Campus Events Context:
${eventsContext || 'No current events in context.'}`;

    // Format chat history
    const contents = [
        {
            role: 'user',
            parts: [{ text: systemPrompt }],
        },
        {
            role: 'model',
            parts: [{ text: "Understood! I am Eventro AI, ready to assist campus students with their events using the verified context." }],
        },
    ];

    if (Array.isArray(chatHistory)) {
        for (const msg of chatHistory.slice(-6)) {
            contents.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text || '' }],
            });
        }
    }

    contents.push({
        role: 'user',
        parts: [{ text: userQuery }],
    });

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.4,
            },
        });

        const rawReply = response.text?.trim() || "I couldn't process your request right now. Please try again!";
        let cleanReply = rawReply;
        let recommendedEvents = relevantEvents;

        const tagMatch = rawReply.match(/<!--\s*RECOMMENDED_IDS:\s*(\[.*?\])\s*-->/);
        if (tagMatch) {
            try {
                const ids = JSON.parse(tagMatch[1]);
                if (Array.isArray(ids)) {
                    recommendedEvents = relevantEvents.filter((e) => ids.includes(e._id.toString()));
                }
                cleanReply = rawReply.replace(/<!--\s*RECOMMENDED_IDS:.*?-->/g, '').trim();
            } catch (err) {
                console.warn('Error parsing recommended IDs tag:', err);
            }
        } else {
            // Fallback: only include events whose title is explicitly mentioned in the text reply
            const mentioned = relevantEvents.filter((e) =>
                rawReply.toLowerCase().includes((e.title || '').toLowerCase())
            );
            if (mentioned.length > 0) {
                recommendedEvents = mentioned;
            }
        }

        return {
            reply: cleanReply,
            matchedEvents: recommendedEvents.map((e) => ({
                _id: e._id,
                title: e.title,
                college: e.college,
                date: e.date,
                category: e.category,
                price: e.price,
                isFree: e.isFree,
                imageUrl: e.imageUrl,
            })),
        };
    } catch (error) {
        console.error('Error generating RAG response:', error);
        return {
            reply: `I ran into an issue connecting to the AI service (${error.message}). Here are the relevant events I found for you:`,
            matchedEvents: relevantEvents.map((e) => ({
                _id: e._id,
                title: e.title,
                college: e.college,
                date: e.date,
                category: e.category,
                price: e.price,
                isFree: e.isFree,
                imageUrl: e.imageUrl,
            })),
        };
    }
};

module.exports = {
    getAIClient,
    cosineSimilarity,
    generateEmbedding,
    parsePosterImage,
    findSimilarEvents,
    generateRAGResponse,
};
