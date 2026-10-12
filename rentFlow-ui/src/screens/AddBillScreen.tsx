import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import Dropdown, { DropdownItem } from "../components/Dropdown";
import FieldError from "../components/FieldError";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";
import { BILL_TYPE_LABELS, BillType } from "../models/Bill";
import { Tenancy } from "../models/Tenancy";
import { getTenancies } from "../api/tenancy.api";
import { addBill } from "../api/bill.api";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { Colors } from "../theme/colors";
import { parseDisplayPeriod } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "AddBill">;

type UtilityType = Exclude<BillType, "RENT">;

const TYPE_OPTIONS: DropdownItem<UtilityType>[] = (
    ["ELECTRICITY", "WATER", "MAINTENANCE", "OTHER"] as UtilityType[]
).map((type) => ({ value: type, label: BILL_TYPE_LABELS[type] }));

// Current month as MM-YYYY, the most common billing month
function currentPeriod(): string {
    const now = new Date();

    return `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
}

export default function AddBillScreen({ navigation, route }: Props) {
    const { propertyId } = route.params;

    const [tenancies, setTenancies] = useState<Tenancy[] | null>(null);
    const [loadError, setLoadError] = useState("");

    const [tenancyId, setTenancyId] = useState("");
    const [type, setType] = useState<UtilityType | "">("");
    const [period, setPeriod] = useState(currentPeriod());
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [serverError, setServerError] = useState<{ field?: string; message: string } | null>(null);

    const { submitting, runSubmit } = useSingleSubmit();

    useEffect(() => {
        getTenancies(propertyId)
            .then((list) => setTenancies(list.filter((t) => t.status !== "DECLINED")))
            .catch((error) =>
                setLoadError(getApiError(error, "Could not load tenants.").message)
            );
    }, [propertyId]);

    const tenantOptions = useMemo<DropdownItem[]>(
        () =>
            (tenancies ?? []).map((tenancy) => ({
                value: tenancy.id,
                label: `${tenancy.tenantName} · Unit ${tenancy.unitNumber}`,
            })),
        [tenancies]
    );

    const parsedPeriod = parseDisplayPeriod(period);
    const parsedAmount = Number(amount);
    const isValid =
        !!tenancyId &&
        !!type &&
        !!parsedPeriod &&
        amount.trim() !== "" &&
        Number.isFinite(parsedAmount) &&
        parsedAmount > 0;

    const fieldError = (field: string) =>
        serverError?.field === field ? serverError.message : undefined;

    const handleSave = () => runSubmit(async () => {
        if (!isValid || !type || !parsedPeriod) return;

        try {
            await addBill({
                tenancyId,
                type,
                period: parsedPeriod,
                amount: parsedAmount,
                description: description.trim(),
            });

            Alert.alert("Bill Added", "The tenant can now see and pay this bill.");

            navigation.goBack();
        } catch (error) {
            const apiError = getApiError(error, "Could not add this bill.");

            if (apiError.field) {
                setServerError(apiError);
            } else {
                Alert.alert("Error", apiError.message);
            }
        }
    });

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Add Utility Bill</Title>

                <Subtitle style={styles.subtitle}>
                    Electricity, water, maintenance or other charges. Rent bills are
                    created automatically.
                </Subtitle>

                {loadError ? (
                    <FieldError message={loadError} />
                ) : !tenancies ? (
                    <ActivityIndicator size="large" />
                ) : tenancies.length === 0 ? (
                    <Text style={styles.notice}>Assign a tenant before adding bills.</Text>
                ) : (
                    <>
                        <Dropdown
                            label="Tenant *"
                            placeholder="Select Tenant"
                            value={tenancyId}
                            data={tenantOptions}
                            error={fieldError("tenancyId")}
                            onChange={(value) => {
                                setTenancyId(value);
                                setServerError(null);
                            }}
                        />

                        <Dropdown
                            label="Bill Type *"
                            placeholder="Select Type"
                            value={type}
                            data={TYPE_OPTIONS}
                            error={fieldError("type")}
                            onChange={(value) => {
                                setType(value);
                                setServerError(null);
                            }}
                        />

                        <Label style={styles.label}>Billing Month *</Label>
                        <TextField
                            placeholder="MM-YYYY"
                            value={period}
                            keyboardType="numbers-and-punctuation"
                            maxLength={7}
                            hasError={!parsedPeriod || !!fieldError("period")}
                            onChangeText={(text) => {
                                setPeriod(text);
                                setServerError(null);
                            }}
                        />
                        <FieldError
                            message={
                                fieldError("period") ||
                                (!parsedPeriod ? "Enter the month as MM-YYYY." : undefined)
                            }
                        />

                        <Label style={styles.label}>Amount (₹) *</Label>
                        <TextField
                            placeholder="1250"
                            value={amount}
                            keyboardType="decimal-pad"
                            hasError={!!fieldError("amount")}
                            onChangeText={(text) => {
                                setAmount(text);
                                setServerError(null);
                            }}
                        />
                        <FieldError message={fieldError("amount")} />

                        <Label style={styles.label}>Details</Label>
                        <TextField
                            placeholder="e.g. Meter reading 1234–1310"
                            value={description}
                            maxLength={200}
                            onChangeText={setDescription}
                        />

                        <Button
                            title={submitting ? "Saving..." : "Add Bill"}
                            onPress={handleSave}
                            disabled={submitting || !isValid}
                            style={styles.button}
                        />
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
        marginBottom: 8,
    },

    subtitle: {
        marginBottom: 24,
        lineHeight: 24,
    },

    notice: {
        fontSize: 15,
        color: "#92400E",
    },

    label: {
        marginTop: 4,
        marginBottom: 8,
    },

    button: {
        marginTop: 28,
    },
});
