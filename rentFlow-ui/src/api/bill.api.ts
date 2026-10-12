import apiClient from "./apiClient";

import { Bill, BillType, PaymentOptions } from "../models/Bill";

// ---------------- Tenant ----------------

export async function getTenantBills(): Promise<Bill[]> {
    const response = await apiClient.get("/tenant/bills");

    return response.data;
}

export async function getPaymentOptions(billId: string): Promise<PaymentOptions> {
    const response = await apiClient.get(`/tenant/bills/${billId}/payment-options`);

    return response.data;
}

export async function submitUpiPayment(
    billId: string,
    reference: string
): Promise<Bill> {
    const response = await apiClient.post(`/tenant/bills/${billId}/upi`, {
        reference,
    });

    return response.data;
}

export async function startRazorpayPayment(billId: string): Promise<Bill> {
    const response = await apiClient.post(`/tenant/bills/${billId}/razorpay`);

    return response.data;
}

export async function verifyRazorpayPayment(billId: string): Promise<Bill> {
    const response = await apiClient.post(`/tenant/bills/${billId}/razorpay/verify`);

    return response.data;
}

// ---------------- Owner ----------------

export async function getOwnerBills(propertyId: string): Promise<Bill[]> {
    const response = await apiClient.get("/owner/bills", {
        params: { propertyId },
    });

    return response.data;
}

export async function addBill(bill: {
    tenancyId: string;
    type: Exclude<BillType, "RENT">;
    period: string;
    amount: number;
    description: string;
}): Promise<Bill> {
    const response = await apiClient.post("/owner/bills", bill);

    return response.data;
}

export async function confirmBillPayment(billId: string): Promise<Bill> {
    const response = await apiClient.post(`/owner/bills/${billId}/confirm`);

    return response.data;
}

export async function rejectBillPayment(billId: string): Promise<Bill> {
    const response = await apiClient.post(`/owner/bills/${billId}/reject`);

    return response.data;
}

export async function deleteBill(billId: string): Promise<void> {
    await apiClient.delete(`/owner/bills/${billId}`);
}

export async function getPaymentSettings(): Promise<{
    upiId: string;
    razorpayEnabled: boolean;
}> {
    const response = await apiClient.get("/owner/payment-settings");

    return response.data;
}

export async function updatePaymentSettings(upiId: string): Promise<{
    upiId: string;
    razorpayEnabled: boolean;
}> {
    const response = await apiClient.put("/owner/payment-settings", { upiId });

    return response.data;
}
