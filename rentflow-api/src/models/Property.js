import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        propertyName: {
            type: String,
            required: true,
            trim: true,
        },

        propertyType: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
            default: "",
        },

        totalBuildings: {
            type: Number,
            required: true,
            default: 0,
        },

        totalUnits: {
            type: Number,
            required: true,
            default: 0,
        },

        buildingIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Building",
            },
        ],
    },
    {
        timestamps: true,
    }
);

propertySchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        
        if (ret.ownerId) {
            ret.ownerId = ret.ownerId.toString();
        }

        delete ret._id;
        delete ret.__v;

        return ret;
    },
});

export const Property = mongoose.model(
    "Property",
    propertySchema
);