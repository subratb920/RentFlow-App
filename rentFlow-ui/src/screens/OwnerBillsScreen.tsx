import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Button from "../components/Button";
import BillCard from "../components/BillCard";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Bill, BillStatus } from "../models/Bill";
import {
    confirmBillPayment,
    deleteBill,
    getOwnerBills,
    getPaymentSettings,
    rejectBillPayment,
} from "../api/bill.api";
import { getApiError } from "../api/apiError";
import useLiveRefresh from "../hooks/useLiveRefresh";
import { Colors } from "../theme/colors";
import { formatPeriod, formatRupees } from "../utils/format";
import { groupBillsByPeriod, totalDue } from "../utils/bills";

type Props = NativeStackScreenProps<RootStackParamList, "OwnerBills">;

type Filter = "ALL" | BillStatus;

const FILTERS: { value: Filter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PENDING_CONFIRMATION", label: "To confirm" },
    { value: "UNPAID", label: "Unpaid" },
    { value: "PAID", label: "Paid" },
];

/**
 * Rent and utility bills for one property: confirm payments,
 * record cash, add utility bills.
 */
export default function OwnerBillsScreen({ navigation, route }: Props) {
    const { propertyId } = route.params;

    const [bills, setBills] = useState<Bill[] | null>(null);
    const [upiId, setUpiId] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [error, setError] = useState("");

    const loadBills = useCallback(async () => {
        try {
            const [list, settings] = await Promise.all([
                getOwnerBills(propertyId),
                getPaymentSettings(),
            ]);

            setBills(list);
            setUpiId(settings.upiId);
            setError("");
        } catch (loadError) {
            setError(getApiError(loadError, "Could not load bills.").message);
        }
    }, [propertyId]);

    // Live: UPI payments to confirm appear without leaving the screen
    useLiveRefresh(loadBills, 10000);

    const runAction = async (action: () => Promise<unknown>, failure: string) => {
        try {
            await action();
            await loadBills();
        } catch (actionError) {
            Alert.alert("Error", getApiError(actionError, failure).message);
        }
    };

    const confirm = (bill: Bill) => {
        const isCash = bill.status === "UNPAID";

        Alert.alert(
            isCash ? "Record Payment?" : "Confirm Payment?",
            isCash
                ? `Mark ${formatRupees(bill.amount)} from ${bill.tenantName} as paid (cash or other).`
                : `Confirm you received ${formatRupees(bill.amount)} from ${bill.tenantName} (UPI ref ${bill.upiReference}).`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: isCash ? "Mark Paid" : "Confirm",
                    onPress: () => runAction(() => confirmBillPayment(bill.id), "Could not update this bill."),
                },
            ]
        );
    };

    const reject = (bill: Bill) => {
        Alert.alert(
            "Payment Not Received?",
            `The bill goes back to unpaid and ${bill.tenantName} can pay again.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Not Received",
                    style: "destructive",
                    onPress: () => runAction(() => rejectBillPayment(bill.id), "Could not update this bill."),
                },
            ]
        );
    };

    const remove = (bill: Bill) => {
        Alert.alert("Delete Bill?", "This bill will be removed for the tenant.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => runAction(() => deleteBill(bill.id), "Could not delete this bill."),
            },
        ]);
    };

    const visible = (bills ?? []).filter((bill) => filter === "ALL" || bill.status === filter);
    const toConfirm = bills?.filter((b) => b.status === "PENDING_CONFIRMATION").length ?? 0;

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Bills & Payments</Title>

                {error ? (
                    <FieldError message={error} />
                ) : !bills ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        <View style={styles.summary}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{formatRupees(totalDue(bills))}</Text>
                                <Text style={styles.summaryLabel}>Outstanding</Text>
                            </View>

                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{toConfirm}</Text>
                                <Text style={styles.summaryLabel}>To confirm</Text>
                            </View>
                        </View>

                        {upiId === "" && (
                            <Pressable onPress={() => navigation.navigate("PaymentSettings")}>
                                <Text style={styles.notice}>
                                    Add your UPI ID so tenants can pay rent from the app. Tap to set up →
                                </Text>
                            </Pressable>
                        )}

                        <Button
                            title="Add Utility Bill"
                            onPress={() => navigation.navigate("AddBill", { propertyId })}
                            style={styles.addButton}
                        />

                        <View style={styles.filters}>
                            {FILTERS.map((item) => (
                                <Pressable
                                    key={item.value}
                                    onPress={() => setFilter(item.value)}
                                    style={[styles.filter, filter === item.value && styles.filterActive]}
                                >
                                    <Text
                                        style={[
                                            styles.filterText,
                                            filter === item.value && styles.filterTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {visible.length === 0 ? (
                            <Text style={styles.empty}>
                                {bills.length === 0
                                    ? "No bills yet. Rent bills appear automatically from each tenant's move-in month."
                                    : "No bills match this filter."}
                            </Text>
                        ) : (
                            groupBillsByPeriod(visible).map((group) => (
                                <View key={group.period}>
                                    <Text style={styles.month}>{formatPeriod(group.period)}</Text>

                                    {group.bills.map((bill) => (
                                        <BillCard key={bill.id} bill={bill} showTenant>
                                            {bill.status === "PENDING_CONFIRMATION" && (
                                                <Text style={styles.reference}>
                                                    UPI ref: {bill.upiReference}
                                                </Text>
                                            )}

                                            {bill.status !== "PAID" && (
                                                <View style={styles.actions}>
                                                    <ActionLink
                                                        label={bill.status === "UNPAID" ? "Mark paid" : "Confirm"}
                                                        onPress={() => confirm(bill)}
                                                    />

                                                    {bill.status === "PENDING_CONFIRMATION" && (
                                                        <ActionLink
                                                            label="Not received"
                                                            danger
                                                            onPress={() => reject(bill)}
                                                        />
                                                    )}

                                                    {bill.type !== "RENT" && bill.status === "UNPAID" && (
                                                        <ActionLink
                                                            label="Delete"
                                                            danger
                                                            onPress={() => remove(bill)}
                                                        />
                                                    )}
                                                </View>
                                            )}
                                        </BillCard>
                                    ))}
                                </View>
                            ))
                        )}
                    </>
                )}
            </View>
        </Screen>
    );
}

function ActionLink({
    label,
    onPress,
    danger = false,
}: {
    label: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <Pressable onPress={onPress} hitSlop={8} style={styles.actionLink}>
            <Text style={[styles.actionText, danger && styles.actionDanger]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
        paddingBottom: 40,
    },

    title: {
        marginBottom: 20,
    },

    summary: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    summaryItem: {
        flex: 1,
        alignItems: "center",
    },

    summaryValue: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.txtPrimary,
    },

    summaryLabel: {
        fontSize: 13,
        color: Colors.txtSecondary,
        marginTop: 2,
    },

    notice: {
        fontSize: 14,
        color: "#92400E",
        lineHeight: 21,
        marginTop: 14,
    },

    addButton: {
        marginTop: 16,
    },

    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 18,
    },

    filter: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: Colors.white,
    },

    filterActive: {
        backgroundColor: Colors.txtPrimary,
        borderColor: Colors.txtPrimary,
    },

    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.txtPrimary,
    },

    filterTextActive: {
        color: Colors.white,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
        lineHeight: 22,
        marginTop: 12,
    },

    month: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.txtSecondary,
        marginTop: 16,
        marginBottom: 10,
    },

    reference: {
        fontSize: 13,
        color: "#92400E",
        marginTop: 8,
    },

    actions: {
        flexDirection: "row",
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },

    actionLink: {
        marginRight: 20,
    },

    actionText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2563EB",
    },

    actionDanger: {
        color: Colors.danger,
    },
});
