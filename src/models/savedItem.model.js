import mongoose from "mongoose";

const SavedItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    itemType: {
        type: String,
        enum: ["scholarship", "article", "video", "test", "post"], // Added 'post' as per existing UI
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemRef'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for dynamic reference based on itemType
// Note: This requires capital letters for models usually, but we'll map them carefully or use manual lookups if needed.
// For now, simple ID storage is sufficient as per plan.

// Prevent duplicate saves
SavedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export default mongoose.model("SavedItem", SavedItemSchema);
