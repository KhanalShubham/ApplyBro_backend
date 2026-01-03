import mongoose from "mongoose";

const GuidanceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String // Markdown or HTML content for articles
    },
    type: {
        type: String,
        enum: ["article", "video", "test", "faq"],
        required: true
    },
    topic: {
        type: String,
        enum: ["IELTS", "DAAD", "SOP", "Visas", "Motivation Letter", "General"],
        default: "General"
    },
    videoUrl: String, // for videos
    fileUrl: String,  // for tests or downloadable resources
    thumbnail: String,

    // Metadata for different types
    duration: String, // e.g. "10 min"
    readTime: String,
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctOptionIndex: { type: Number },
        explanation: String,
        imageUrl: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming Admins are Users with role='admin'
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: true
    }
});

// Index for efficient filtering
GuidanceSchema.index({ type: 1, topic: 1, published: 1 });

export default mongoose.model("Guidance", GuidanceSchema);
