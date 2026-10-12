import mongoose from "mongoose";

/**
 * A tenant asking an owner for access to one of their properties.
 */
const accessRequestSchema = new mongoose.Schema(
    {
        tenantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },

        message: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            required: true,
            default: "PENDING",
        },

        // The tenancy created when the request was approved
        tenancyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

accessRequestSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);
