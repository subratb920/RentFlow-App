import mongoose from "mongoose";

/**
 * A tenant's occupancy of a unit. Created by the owner (as an
 * invitation) or by approving a tenant's access request.
 */
const tenancySchema = new mongoose.Schema(
    {
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
            index: true,
        },

        buildingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Building",
            required: true,
        },

        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
            index: true,
        },

        tenantName: {
            type: String,
            required: true,
            trim: true,
        },

        // Used to link the invitation to a tenant account
        tenantEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        tenantPhone: {
            type: String,
            trim: true,
            default: "",
        },

        moveInDate: {
            type: Date,
            required: true,
        },

        monthlyRent: {
            type: Number,
            required: true,
            min: 0,
        },

        // Set once a tenant account is linked (by email or code)
        tenantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // Shared by the owner so the tenant can join with a code
        inviteCode: {
            type: String,
            required: true,
            unique: true,
        },

        // INVITED until the tenant accepts (ACTIVE) or declines
        status: {
            type: String,
            enum: ["INVITED", "ACTIVE", "DECLINED"],
            required: true,
            default: "INVITED",
        },
    },
    {
        timestamps: true,
    }
);

tenancySchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Tenancy = mongoose.model("Tenancy", tenancySchema);
