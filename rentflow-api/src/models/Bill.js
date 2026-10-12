import mongoose from "mongoose";

export const BILL_TYPES = ["RENT", "ELECTRICITY", "WATER", "MAINTENANCE", "OTHER"];

/**
 * A monthly charge for a tenancy. Rent bills are generated
 * automatically; the owner adds the other types.
 */
const billSchema = new mongoose.Schema(
    {
        tenancyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
        },

        type: {
            type: String,
            enum: BILL_TYPES,
            required: true,
        },

        // Billing month, "YYYY-MM"
        period: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        // PENDING_CONFIRMATION: tenant reported a UPI payment that the
        // owner has not confirmed yet
        status: {
            type: String,
            enum: ["UNPAID", "PENDING_CONFIRMATION", "PAID"],
            required: true,
            default: "UNPAID",
        },

        paymentMethod: {
            type: String,
            enum: ["UPI", "RAZORPAY", "CASH", null],
            default: null,
        },

        upiReference: {
            type: String,
            default: "",
        },

        razorpayLinkId: {
            type: String,
            default: "",
        },

        razorpayLinkUrl: {
            type: String,
            default: "",
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// One rent bill per tenancy per month
billSchema.index(
    { tenancyId: 1, period: 1 },
    { unique: true, partialFilterExpression: { type: "RENT" } }
);

billSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.razorpayLinkId;
        return ret;
    },
});

export const Bill = mongoose.model("Bill", billSchema);
