import mongoose from "mongoose";

/**
 * A direct message between two members of a property, or a
 * broadcast to everyone in a property or one of its buildings.
 */
const messageSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        kind: {
            type: String,
            enum: ["DIRECT", "BROADCAST"],
            required: true,
        },

        // DIRECT only
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // BROADCAST only
        scope: {
            type: String,
            enum: ["PROPERTY", "BUILDING", null],
            default: null,
        },

        buildingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Building",
            default: null,
        },

        body: {
            type: String,
            required: true,
            trim: true,
        },

        // Users who have read the message (the sender counts as read)
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ propertyId: 1, kind: 1, createdAt: -1 });
messageSchema.index({ kind: 1, senderId: 1, recipientId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
