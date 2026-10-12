import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    AppState,
    Linking,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { CreditCard, Smartphone } from "lucide-react-native";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Subtitle from "../../components/SubHeading";
import Label from "../../components/Label";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import ActionCard from "../../components/ActionCard";
import StatusChip from "../../components/StatusChip";
import FieldError from "../../components/FieldError";

import { RootStackParamList } from "../../navigation/navigationTypes";
import {
    BILL_STATUS_DISPLAY,
    BILL_TYPE_LABELS,
    Bill,
    PaymentOptions,
} from "../../models/Bill";
import {
    getPaymentOptions,
    getTenantBills,
    startRazorpayPayment,
    submitUpiPayment,
    verifyRazorpayPayment,
} from "../../api/bill.api";
import { getApiError } from "../../api/apiError";
import useSingleSubmit from "../../hooks/useSingleSubmit";
import { Colors } from "../../theme/colors";
import { formatDate, formatPeriod, formatRupees } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "BillDetail">;

function buildUpiLink(options: PaymentOptions, bill: Bill): string {
    const params = [
        `pa=${encodeURIComponent(options.upiId)}`,
        `pn=${encodeURIComponent(options.payeeName)}`,
        `am=${bill.amount.toFixed(2)}`,
        "cu=INR",
        `tn=${encodeURIComponent(`${BILL_TYPE_LABELS[bill.type]} ${formatPeriod(bill.period)}`)}`,
    ];

    return `upi://pay?${params.join("&")}`;
}

export default function BillDetailScreen({ route }: Props) {
    const { billId } = route.params;

    const [bill, setBill] = useState<Bill | null>(null);
    const [options, setOptions] = useState<PaymentOptions | null>(null);
    const [error, setError] = useState("");

    const [showUpiForm, setShowUpiForm] = useState(false);
    const [reference, setReference] = useState("");
    const [referenceError, setReferenceError] = useState("");

    // Set while the tenant is on Razorpay's page, to check on return
    const awaitingRazorpay = useRef(false);

    const { submitting, runSubmit } = useSingleSubmit();

    const loadBill = useCallback(async () => {
        try {
            const [bills, paymentOptions] = await Promise.all([
                getTenantBills(),
                getPaymentOptions(billId),
            ]);

            setBill(bills.find((item) => item.id === billId) ?? null);
            setOptions(paymentOptions);
            setError("");
        } catch (loadError) {
            setError(getApiError(loadError, "Could not load this bill.").message);
        }
    }, [billId]);

    useFocusEffect(
        useCallback(() => {
            loadBill();
        }, [loadBill])
    );

    const checkRazorpay = useCallback(async () => {
        try {
            const updated = await verifyRazorpayPayment(billId);

            setBill((previous) => (previous ? { ...previous, ...updated } : previous));

            if (updated.status === "PAID") {
                awaitingRazorpay.current = false;
                Alert.alert("Payment Received", "Thank you! This bill is now paid.");
            }

            return updated.status === "PAID";
        } catch (verifyError) {
            Alert.alert("Error", getApiError(verifyError, "Could not check the payment.").message);
            return false;
        }
    }, [billId]);

    // Coming back from the browser after paying on Razorpay
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active" && awaitingRazorpay.current) {
                checkRazorpay();
            }
        });

        return () => subscription.remove();
    }, [checkRazorpay]);

    const payWithUpiApp = async () => {
        if (!bill || !options?.upiId) return;

        try {
            await Linking.openURL(buildUpiLink(options, bill));
        } catch {
            Alert.alert(
                "No UPI App Found",
                `Pay ${formatRupees(bill.amount)} to ${options.upiId} from any UPI app, then enter the transaction reference here.`
            );
        }

        setShowUpiForm(true);
    };

    const submitReference = () => runSubmit(async () => {
        try {
            const updated = await submitUpiPayment(billId, reference.trim());

            setBill((previous) => (previous ? { ...previous, ...updated } : previous));
            setShowUpiForm(false);

            Alert.alert(
                "Payment Submitted",
                "Your owner will confirm once they receive it."
            );
        } catch (submitError) {
            setReferenceError(
                getApiError(submitError, "Could not submit this payment.").message
            );
        }
    });

    const payWithRazorpay = () => runSubmit(async () => {
        try {
            const updated = await startRazorpayPayment(billId);

            setBill((previous) => (previous ? { ...previous, ...updated } : previous));

            if (updated.status === "PAID") {
                Alert.alert("Already Paid", "This bill has already been paid.");
                return;
            }

            awaitingRazorpay.current = true;
            await Linking.openURL(updated.razorpayLinkUrl);
        } catch (payError) {
            Alert.alert(
                "Could Not Start Payment",
                getApiError(payError, "Please try again.").message
            );
        }
    });

    if (error) {
        return (
            <Screen>
                <View style={styles.container}>
                    <FieldError message={error} />
                </View>
            </Screen>
        );
    }

    if (!bill || !options) {
        return (
            <Screen>
                <ActivityIndicator size="large" style={styles.loader} />
            </Screen>
        );
    }

    const status = BILL_STATUS_DISPLAY[bill.status];
    const canPay = bill.status === "UNPAID";
    const hasPaymentMethod = !!options.upiId || options.razorpayEnabled;

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>{BILL_TYPE_LABELS[bill.type]}</Title>

                <Subtitle style={styles.subtitle}>
                    {formatPeriod(bill.period)} · {bill.propertyName} · Unit {bill.unitNumber}
                </Subtitle>

                <View style={styles.amountCard}>
                    <Text style={styles.amount}>{formatRupees(bill.amount)}</Text>
                    <StatusChip label={status.label} tone={status.tone} />

                    <View style={styles.divider} />

                    <Row label="Due date" value={formatDate(bill.dueDate)} />
                    {!!bill.description && <Row label="Details" value={bill.description} />}
                    {bill.status === "PAID" && bill.paidAt && (
                        <Row label="Paid on" value={formatDate(bill.paidAt)} />
                    )}
                    {!!bill.paymentMethod && <Row label="Paid via" value={bill.paymentMethod} />}
                    {!!bill.upiReference && <Row label="UPI reference" value={bill.upiReference} />}
                </View>

                {bill.status === "PENDING_CONFIRMATION" && (
                    <Text style={styles.notice}>
                        You reported this payment. Waiting for your owner to confirm it.
                    </Text>
                )}

                {canPay && !hasPaymentMethod && (
                    <Text style={styles.notice}>
                        Your owner hasn't set up online payments yet. Please pay them
                        directly; they'll mark this bill as paid.
                    </Text>
                )}

                {canPay && hasPaymentMethod && (
                    <>
                        <Text style={styles.sectionTitle}>Pay this bill</Text>

                        {!!options.upiId && (
                            <ActionCard
                                title="Pay with UPI App"
                                subtitle={`GPay, PhonePe, Paytm… to ${options.upiId}`}
                                icon={<Smartphone size={22} color={Colors.txtPrimary} />}
                                onPress={payWithUpiApp}
                            />
                        )}

                        {options.razorpayEnabled && (
                            <ActionCard
                                title="Pay Online"
                                subtitle="Card, UPI or netbanking via Razorpay"
                                icon={<CreditCard size={22} color={Colors.txtPrimary} />}
                                onPress={payWithRazorpay}
                            />
                        )}

                        {!!bill.razorpayLinkUrl && (
                            <Button
                                title="I've paid online — check status"
                                onPress={checkRazorpay}
                                style={styles.button}
                            />
                        )}

                        {!!options.upiId && showUpiForm && (
                            <View style={styles.upiForm}>
                                <Label style={styles.label}>UPI Transaction Reference</Label>

                                <TextField
                                    placeholder="e.g. 412345678901"
                                    value={reference}
                                    autoCapitalize="characters"
                                    maxLength={30}
                                    hasError={!!referenceError}
                                    onChangeText={(text) => {
                                        setReference(text);
                                        setReferenceError("");
                                    }}
                                />

                                <FieldError message={referenceError} />

                                <Button
                                    title={submitting ? "Submitting..." : "I've Paid"}
                                    onPress={submitReference}
                                    disabled={submitting || reference.trim().length < 6}
                                    style={styles.button}
                                />
                            </View>
                        )}

                        {!!options.upiId && !showUpiForm && (
                            <Button
                                title="Already paid by UPI? Enter reference"
                                onPress={() => setShowUpiForm(true)}
                                style={[styles.button, styles.secondaryButton]}
                            />
                        )}
                    </>
                )}
            </View>
        </Screen>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        marginTop: 40,
    },

    container: {
        flex: 1,
        paddingTop: 12,
        paddingBottom: 40,
    },

    title: {
        marginBottom: 8,
    },

    subtitle: {
        marginBottom: 20,
        lineHeight: 24,
    },

    amountCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    amount: {
        fontSize: 34,
        fontWeight: "800",
        color: Colors.txtPrimary,
        marginBottom: 8,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 14,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
    },

    rowLabel: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    rowValue: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.txtPrimary,
        flexShrink: 1,
        textAlign: "right",
        marginLeft: 12,
    },

    notice: {
        fontSize: 15,
        color: "#92400E",
        lineHeight: 22,
        marginTop: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 24,
        marginBottom: 12,
    },

    upiForm: {
        marginTop: 8,
    },

    label: {
        marginTop: 8,
        marginBottom: 8,
    },

    button: {
        marginTop: 14,
    },

    secondaryButton: {
        backgroundColor: Colors.txtSecondary,
    },
});
