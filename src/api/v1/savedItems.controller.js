import SavedItem from '../../models/savedItem.model.js';
import Scholarship from '../../models/scholarship.model.js';
import Guidance from '../../models/guidance.model.js';
import Post from '../../models/post.model.js';
import { logger } from '../../utils/logger.js';

export const saveItem = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;
        const userId = req.user._id;

        // Validate if item exists
        let itemExists = null;
        if (itemType === 'scholarship') {
            itemExists = await Scholarship.findById(itemId);
        } else if (['article', 'video', 'test', 'faq'].includes(itemType)) {
            itemExists = await Guidance.findById(itemId);
        } else if (itemType === 'post') {
            itemExists = await Post.findById(itemId);
        }

        if (!itemExists) {
            return res.status(404).json({
                status: 'error',
                message: 'Item not found'
            });
        }

        const saved = await SavedItem.create({
            userId,
            itemType,
            itemId
        });

        res.status(201).json({
            status: 'success',
            message: "Item saved successfully",
            data: saved
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                status: 'fail',
                message: "Item already saved"
            });
        }
        logger.error('Error saving item:', err);
        res.status(500).json({
            status: 'error',
            message: "Server error"
        });
    }
};

export const removeSavedItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        // We expect itemId to be the ID of the SavedItem document OR the original item ID?
        // The prompt says DELETE /api/saved/:itemId. Usually it's easier to pass the original item ID if the frontend doesn't track the SavedItem ID.
        // However, let's implement deletion by the ORIGINAL item ID for user convenience, 
        // BUT we must also handle if it's the SavedItem unique ID.
        // Given the prompt: "await SavedItem.findOneAndDelete({ userId: req.user.id, itemId: req.params.itemId });" 
        // This implies req.params.itemId is the ID of the content, NOT the SavedItem record ID.

        const result = await SavedItem.findOneAndDelete({
            userId: req.user._id,
            itemId: itemId
        });

        if (!result) {
            return res.status(404).json({
                status: 'fail',
                message: 'Saved item not found'
            });
        }

        res.json({
            status: 'success',
            message: "Item removed"
        });
    } catch (err) {
        logger.error('Error removing saved item:', err);
        res.status(500).json({
            status: 'error',
            message: "Server error"
        });
    }
};

export const getSavedItems = async (req, res) => {
    try {
        const items = await SavedItem.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Populate data manually or via multiple queries since refs are dynamic
        // Or we can use $lookup if we really want to be fancy, but simple parallel fetch is safer for mixed types.

        const enrichedItems = await Promise.all(items.map(async (item) => {
            let details = null;
            if (item.itemType === 'scholarship') {
                details = await Scholarship.findById(item.itemId).select('title description deadline location fundingType');
            } else if (['article', 'video', 'test', 'faq'].includes(item.itemType)) {
                details = await Guidance.findById(item.itemId).select('title description type topic thumbnail duration readTime difficulty');
            } else if (item.itemType === 'post') {
                details = await Post.findById(item.itemId).select('title content author createdAt').populate('author', 'name avatar');
            }

            return {
                ...item,
                details
            };
        }));

        // Filter out nulls (deleted items)
        const validItems = enrichedItems.filter(i => i.details);

        res.json({
            status: 'success',
            results: validItems.length,
            data: validItems
        });
    } catch (err) {
        logger.error('Error fetching saved items:', err);
        res.status(500).json({
            status: 'error',
            message: "Server error"
        });
    }
};
