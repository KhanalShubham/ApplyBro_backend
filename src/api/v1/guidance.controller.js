import Guidance from '../../models/guidance.model.js';
import { logger } from '../../utils/logger.js';

export const getGuidance = async (req, res) => {
    try {
        const filter = { published: true };

        if (req.query.type) filter.type = req.query.type;
        if (req.query.topic && req.query.topic !== 'all') filter.topic = req.query.topic;
        if (req.query.difficulty) filter.difficulty = req.query.difficulty;

        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: "i" };
        }

        // Admin request to see all?
        // If usage is strict, we might check role. But 'published: true' is default safety.
        // We'll add a separate admin endpoint or param if needed, but the prompt implies this is public.

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const data = await Guidance.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Guidance.countDocuments(filter);

        res.json({
            status: 'success',
            results: data.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data
        });
    } catch (err) {
        logger.error('Error fetching guidance:', err);
        res.status(500).json({ status: 'error', message: "Server error" });
    }
};

export const getGuidanceDetail = async (req, res) => {
    try {
        const item = await Guidance.findById(req.params.id);
        if (!item) return res.status(404).json({ status: 'fail', message: "Not found" });

        // Count views or logical checks here if needed

        res.json({ status: 'success', data: item });
    } catch (err) {
        logger.error('Error fetching guidance detail:', err);
        res.status(500).json({ status: 'error', message: "Server error" });
    }
};

// Admin Controllers

export const createGuidance = async (req, res) => {
    try {
        const guidance = await Guidance.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json({ status: 'success', data: guidance });
    } catch (err) {
        logger.error('Error creating guidance:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

export const updateGuidance = async (req, res) => {
    try {
        const guidance = await Guidance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!guidance) return res.status(404).json({ status: 'fail', message: "Not found" });
        res.json({ status: 'success', data: guidance });
    } catch (err) {
        logger.error('Error updating guidance:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

export const deleteGuidance = async (req, res) => {
    try {
        const guidance = await Guidance.findByIdAndDelete(req.params.id);
        if (!guidance) return res.status(404).json({ status: 'fail', message: "Not found" });
        res.json({ status: 'success', message: "Guidance deleted" });
    } catch (err) {
        logger.error('Error deleting guidance:', err);
        res.status(500).json({ status: 'error', message: "Server error" });
    }
};

// Admin specific list (can see unpublished)
export const getAdminGuidance = async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.topic && req.query.topic !== 'all') filter.topic = req.query.topic;
        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: "i" };
        }

        const data = await Guidance.find(filter).sort({ createdAt: -1 });
        res.json({ status: 'success', results: data.length, data });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
