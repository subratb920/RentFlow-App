import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StatusChip from "./StatusChip";

import { BILL_STATUS_DISPLAY, BILL_TYPE_LABELS, Bill } from "../models/Bill";
import { Colors } from "../theme/colors";
import { formatDate, formatRupees } from "../utils/format";

type BillCardProps = {
    bill: Bill;
    // Shown on the owner side, where bills of several tenants mix
    showTenant?: boolean;
    onPress?: () => void;
    children?: React.ReactNode;
};

export default function BillCard({ bill, showTenant = false, onPress, children }: BillCardProps) {
    const status = BILL_STATUS_DISPLAY[bill.status];
    const isOverdue = bill.status === "UNPAID" && new Date(bill.dueDate) < new Date();

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.header}>
                <Text style={styles.type}>{BILL_TYPE_LABELS[bill.type]}</Text>
                <Text style={styles.amount}>{formatRupees(bill.amount)}</Text>
            </View>

            {showTenant && (
                <Text style={styles.meta}>
                    {bill.tenantName} · Unit {bill.unitNumber}
                </Text>
            )}

            {!!bill.description && (
                <Text style={styles.meta}>{bill.description}</Text>
            )}

            <View style={styles.footer}>
                <Text style={[styles.meta, isOverdue && styles.overdue]}>
                    {bill.status === "PAID" && bill.paidAt
                        ? `Paid ${formatDate(bill.paidAt)}`
                        : `${isOverdue ? "Overdue · was due" : "Due"} ${formatDate(bill.dueDate)}`}
                </Text>

                <StatusChip label={status.label} tone={status.tone} />
            </View>

            {children}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    pressed: {
        opacity: 0.7,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    type: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.txtPrimary,
    },

    amount: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.txtPrimary,
    },

    meta: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 2,
        flexShrink: 1,
        marginRight: 8,
    },

    overdue: {
        color: Colors.danger,
        fontWeight: "600",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
});
