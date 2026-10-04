import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },

        buildingName: {
            type: String,
            required: true,
            trim: true,
        },

        numberOfFloors: {
            type: Number,
            required: true,
            min: 0,
        },

        totalUnits: {
            type: Number,
            required: true,
            min: 0,
        },

        unitIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Unit",
            },
        ],
    },
    {
        timestamps: true,
    }
);

buildingSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Building = mongoose.model("Building", buildingSchema);
