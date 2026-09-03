const Event = require('../models/eventModel');
const {
    parsePosterImage,
    findSimilarEvents,
    generateRAGResponse,
    generateEmbedding,
} = require('../services/aiService');

/**
 * @desc    Extract event details from an uploaded poster image
 * @route   POST /api/ai/parse-poster
 * @access  Private (Admin / SuperAdmin / Coordinator)
 */
const parsePoster = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a poster image file.' });
        }

        const parsedData = await parsePosterImage(req.file.buffer, req.file.mimetype);
        res.status(200).json({
            success: true,
            data: parsedData,
        });
    } catch (error) {
        console.error('Error in parsePoster controller:', error.message);
        res.status(500).json({
            message: error.message || 'Failed to process event poster with AI.',
        });
    }
};

/**
 * @desc    Campus RAG Event Concierge chat endpoint
 * @route   POST /api/ai/chat
 * @access  Public / Authenticated
 */
const chatConcierge = async (req, res) => {
    try {
        const { message, history, college } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        // Safely extract string representation for college
        let collegeName = '';
        if (typeof college === 'string') {
            collegeName = college.trim();
        } else if (college && typeof college === 'object') {
            collegeName = (college.name || college.collegeName || '').toString().trim();
        }

        // Build query for relevant campus events
        let query = {};
        if (collegeName) {
            const escapedCollege = collegeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query = {
                $or: [
                    { visibility: 'public' },
                    {
                        college: { $regex: new RegExp(`^\\s*${escapedCollege}\\s*$`, 'i') },
                        visibility: 'private',
                    },
                ],
            };
        } else {
            query = { visibility: 'public' };
        }

        // Include embedding field in query results
        const events = await Event.find(query).select('+embedding').lean();

        // Retrieve the most relevant events via semantic similarity / lexical matching
        const relevantEvents = await findSimilarEvents(message, events, 4);

        // Generate grounded AI response
        const ragResult = await generateRAGResponse(message, relevantEvents, history);

        res.status(200).json({
            success: true,
            reply: ragResult.reply,
            matchedEvents: ragResult.matchedEvents,
        });
    } catch (error) {
        console.error('Error in chatConcierge controller:', error);
        res.status(500).json({
            message: error.message || 'Failed to generate AI concierge response.',
        });
    }
};

/**
 * @desc    Sync / Backfill embeddings for all events missing them
 * @route   POST /api/ai/sync-embeddings
 * @access  Private (Admin / SuperAdmin)
 */
const syncEmbeddings = async (req, res) => {
    try {
        const eventsWithoutEmbeddings = await Event.find({
            $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
        });

        let updatedCount = 0;
        for (const event of eventsWithoutEmbeddings) {
            const contentToEmbed = `${event.title}. Category: ${event.category}. College: ${event.college}. Description: ${event.description}`;
            const vector = await generateEmbedding(contentToEmbed);
            if (vector && vector.length > 0) {
                event.embedding = vector;
                await event.save();
                updatedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully synchronized embeddings for ${updatedCount} events.`,
            totalFound: eventsWithoutEmbeddings.length,
            updatedCount,
        });
    } catch (error) {
        console.error('Error in syncEmbeddings controller:', error);
        res.status(500).json({ message: error.message || 'Failed to sync embeddings.' });
    }
};

module.exports = {
    parsePoster,
    chatConcierge,
    syncEmbeddings,
};
