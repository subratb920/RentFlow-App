import mongoose from "mongoose";

// Keep in sync with rentFlow-ui/src/constants/unitTypes.ts
export const UNIT_TYPES = [
    "Studio",
    "1 RK",
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "4 BHK",
    "5 BHK",
    "Duplex",
    "Penthouse",
];

const unitSchema = new mongoose.Schema(
    {
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
            index: true,
        },

        // Position within the building; gives skeleton units a
        // stable default name ("Unit 3") and list order.
        sequence: {
            type: Number,
            required: true,
            min: 1,
        },

        unitNumber: {
            type: String,
            trim: true,
            default: "",
        },

        // Lower-cased unitNumber, used to keep unit numbers unique
        // within a building regardless of case.
        unitNumberKey: {
            type: String,
            default: "",
        },

        // 0 = Ground floor
        floor: {
            type: Number,
            min: 0,
            default: null,
        },

        unitType: {
            type: String,
            default: "",
        },

        parkingAssigned: {
            type: Boolean,
            default: false,
        },

        parkingSpotNumber: {
            type: String,
            trim: true,
            default: "",
        },

        isConfigured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

unitSchema.index(
    { buildingId: 1, unitNumberKey: 1 },
    {
        unique: true,
        partialFilterExpression: { unitNumberKey: { $gt: "" } },
    }
);

unitSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.unitNumberKey;
        return ret;
    },
});

export const Unit = mongoose.model("Unit", unitSchema);
