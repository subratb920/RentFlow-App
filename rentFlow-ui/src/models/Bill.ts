export type BillType = "RENT" | "ELECTRICITY" | "WATER" | "MAINTENANCE" | "OTHER";

export type BillStatus = "UNPAID" | "PENDING_CONFIRMATION" | "PAID";

export interface Bill {
    id: string;
    tenancyId: string;
    propertyId: string;

    type: BillType;
    period: string; // YYYY-MM
    amount: number;
    dueDate: string;
    description: string;

    status: BillStatus;
    paymentMethod: "UPI" | "RAZORPAY" | "CASH" | null;
    upiReference: string;
    razorpayLinkUrl: string;
    paidAt: string | null;

    propertyName: string;
    unitNumber: string;
    tenantName: string;
}

export interface PaymentOptions {
    upiId: string;
    payeeName: string;
    razorpayEnabled: boolean;
}

export const BILL_TYPE_LABELS: Record<BillType, string> = {
    RENT: "Rent",
    ELECTRICITY: "Electricity",
    WATER: "Water",
    MAINTENANCE: "Maintenance",
    OTHER: "Other",
};

export const BILL_STATUS_DISPLAY: Record<
    BillStatus,
    { label: string; tone: "danger" | "warning" | "success" }
> = {
    UNPAID: { label: "Unpaid", tone: "danger" },
    PENDING_CONFIRMATION: { label: "Awaiting confirmation", tone: "warning" },
    PAID: { label: "Paid", tone: "success" },
};
