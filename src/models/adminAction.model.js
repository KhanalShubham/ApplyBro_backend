import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema(
	{
		admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		actionType: {
			type: String,
			required: true,
			enum: [
				'create-scholarship',
				'update-scholarship',
				'delete-scholarship',
				'approve-post',
				'decline-post',
				'verify-document',
				'reject-document',
				'ban-user',
				'unban-user',
				'analytics-export',
			],
		},
		targetType: {
			type: String,
			required: true,
			enum: ['scholarship', 'post', 'user', 'document', 'system'],
		},
		targetId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		targetLabel: {
			type: String,
		},
		details: {
			type: String,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	}
);

adminActionSchema.index({ actionType: 1, targetType: 1, createdAt: -1 });

const AdminAction = mongoose.model('AdminAction', adminActionSchema);

export default AdminAction;
