import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import BillCard from "../../components/BillCard";
import FieldError from "../../components/FieldError";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { Bill } from "../../models/Bill";
import { getTenantBills } from "../../api/bill.api";
import { getApiError } from "../../api/apiError";
import { Colors } from "../../theme/colors";
import { formatPeriod, formatRupees } from "../../utils/format";
import { groupBillsByPeriod, totalDue } from "../../utils/bills";

type Props = NativeStackScreenProps<RootStackParamList, "TenantBills">;

/**
 * Every rent and utility bill for the tenant, month by month.
 */
export default function TenantBillsScreen({ navigation }: Props) {
    const [bills, setBills] = useState<Bill[] | null>(null);
    const [error, setError] = useState("");

    useFocusEffect(
        useCallback(() => {
            getTenantBills()
                .then((list) => {
                    setBills(list);
                    setError("");
                })
                .catch((loadError) =>
                    setError(getApiError(loadError, "Could not load bills.").message)
                );
        }, [])
    );

    const due = bills ? totalDue(bills) : 0;
    const awaiting = bills?.filter((b) => b.status === "PENDING_CONFIRMATION").length ?? 0;

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Bills & Rent</Title>

                {error ? (
                    <FieldError message={error} />
                ) : !bills ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        <View style={styles.summary}>
                            <Text style={styles.summaryLabel}>Total due</Text>
                            <Text style={[styles.summaryValue, due > 0 && styles.dueValue]}>
                                {formatRupees(due)}
                            </Text>

                            {awaiting > 0 && (
                                <Text style={styles.summaryNote}>
                                    {awaiting} payment{awaiting > 1 ? "s" : ""} awaiting owner confirmation
                                </Text>
                            )}
                        </View>

                        {bills.length === 0 ? (
                            <Text style={styles.empty}>
                                No bills yet. Rent bills appear from your move-in month.
                            </Text>
                        ) : (
                            groupBillsByPeriod(bills).map((group) => (
                                <View key={group.period}>
                                    <Text style={styles.month}>{formatPeriod(group.period)}</Text>

                                    {group.bills.map((bill) => (
                                        <BillCard
                                            key={bill.id}
                                            bill={bill}
                                            onPress={() =>
                                                navigation.navigate("BillDetail", { billId: bill.id })
                                            }
                                        />
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
        padding: 20,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#D9E5F2",
        backgroundColor: Colors.white,
    },

    summaryLabel: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    summaryValue: {
        fontSize: 30,
        fontWeight: "800",
        color: Colors.success,
        marginTop: 4,
    },

    dueValue: {
        color: Colors.txtPrimary,
    },

    summaryNote: {
        fontSize: 13,
        color: "#92400E",
        marginTop: 6,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
        marginTop: 16,
        lineHeight: 22,
    },

    month: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.txtSecondary,
        marginTop: 20,
        marginBottom: 10,
    },
});
