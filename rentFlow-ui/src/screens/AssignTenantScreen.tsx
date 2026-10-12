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
import { AssignableUnits, Tenancy } from "../models/Tenancy";
import {
    approveRequest,
    createTenancy,
    getAssignableUnits,
} from "../api/tenancy.api";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { Colors } from "../theme/colors";
import { parseDisplayDate } from "../utils/format";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "AssignTenant"
>;

type Field =
    | "unitId"
    | "tenantName"
    | "tenantEmail"
    | "tenantPhone"
    | "moveInDate"
    | "monthlyRent";

type Errors = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AssignTenantScreen({
    navigation,
    route,
}: Props) {
    const { propertyId, request } = route.params;

    // Approving a request: the tenant's details come from their account
    const isApproval = !!request;

    const [unitsInfo, setUnitsInfo] = useState<AssignableUnits | null>(null);
    const [loadError, setLoadError] = useState("");

    const [unitId, setUnitId] = useState("");
    const [tenantName, setTenantName] = useState(request?.tenantName ?? "");
    const [tenantEmail, setTenantEmail] = useState(request?.tenantEmail ?? "");
    const [tenantPhone, setTenantPhone] = useState(request?.tenantPhone ?? "");
    const [moveInDate, setMoveInDate] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");

    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
    const [serverErrors, setServerErrors] = useState<Errors>({});

    // Set after an invitation is created, to show the invite code
    const [invited, setInvited] = useState<Tenancy | null>(null);

    const { submitting, runSubmit } = useSingleSubmit();

    useEffect(() => {
        const loadUnits = async () => {
            try {
                setUnitsInfo(await getAssignableUnits(propertyId));
            } catch (error) {
                setLoadError(
                    getApiError(error, "Could not load units.").message
                );
            }
        };

        loadUnits();
    }, [propertyId]);

    // Units that can still take a tenant
    const unitOptions = useMemo<DropdownItem[]>(() => {
        return (unitsInfo?.units ?? [])
            .filter((unit) => !unit.isFull)
            .map((unit) => ({
                value: unit.id,
                label:
                    `Unit ${unit.unitNumber} · ${unit.buildingName}` +
                    (unitsInfo?.allowsSharedUnits && unit.tenantCount > 0
                        ? ` (${unit.tenantCount} tenant${unit.tenantCount > 1 ? "s" : ""})`
                        : ""),
            }));
    }, [unitsInfo]);

    const errors = useMemo<Errors>(() => {
        const result: Errors = {};

        if (!unitId) result.unitId = "Select a unit.";
        if (!tenantName.trim()) result.tenantName = "Tenant name is required.";

        if (!EMAIL_PATTERN.test(tenantEmail.trim())) {
            result.tenantEmail = "Enter a valid email address.";
        }

        const phoneDigits = tenantPhone.replace(/\D/g, "").length;
        if (tenantPhone.trim() && (phoneDigits < 10 || phoneDigits > 15)) {
            result.tenantPhone = "Enter a valid phone number.";
        }

        if (!parseDisplayDate(moveInDate)) {
            result.moveInDate = "Enter the date as DD-MM-YYYY.";
        }

        const rent = Number(monthlyRent);
        if (!monthlyRent.trim() || !Number.isFinite(rent) || rent < 0) {
            result.monthlyRent = "Enter the monthly rent.";
        }

        return result;
    }, [unitId, tenantName, tenantEmail, tenantPhone, moveInDate, monthlyRent]);

    const isValid = Object.keys(errors).length === 0;

    const markTouched = (field: Field) => {
        setTouched((previous) => ({ ...previous, [field]: true }));
        setServerErrors((previous) => ({ ...previous, [field]: undefined }));
    };

    const fieldError = (field: Field) =>
        serverErrors[field] || (touched[field] ? errors[field] : undefined);

    const handleSubmit = () => runSubmit(async () => {
        if (!isValid) return;

        const assignment = {
            unitId,
            moveInDate: parseDisplayDate(moveInDate)!,
            monthlyRent: Number(monthlyRent),
        };

        try {
            if (request) {
                await approveRequest(request.id, assignment);

                Alert.alert(
                    "Tenant Added",
                    `${request.tenantName} can now see this property.`
                );

                navigation.goBack();
                return;
            }

            setInvited(
                await createTenancy({
                    ...assignment,
                    tenantName: tenantName.trim(),
                    tenantEmail: tenantEmail.trim(),
                    tenantPhone: tenantPhone.trim(),
                })
            );
        } catch (error) {
            const apiError = getApiError(error, "Could not assign this tenant.");
            const field = apiError.field as Field | undefined;

            if (field) {
                setServerErrors({ [field]: apiError.message });
            } else {
                Alert.alert("Error", apiError.message);
            }
        }
    });

    if (invited) {
        return (
            <Screen>
                <View style={styles.container}>
                    <Title style={styles.title}>Tenant Invited</Title>

                    <Subtitle style={styles.subtitle}>
                        {invited.status === "ACTIVE"
                            ? `${invited.tenantName} can now see this property.`
                            : `${invited.tenantName} will see this invitation in the app after signing in as a Tenant with ${invited.tenantEmail}. They can also join with this code:`}
                    </Subtitle>

                    {invited.status === "INVITED" && (
                        <View style={styles.codeBox}>
                            <Text style={styles.codeLabel}>Invite code</Text>
                            <Text style={styles.code} selectable>
                                {invited.inviteCode}
                            </Text>
                        </View>
                    )}

                    <Button
                        title="Done"
                        onPress={() => navigation.goBack()}
                        style={styles.button}
                    />
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>
                    {isApproval ? "Approve Request" : "Assign Tenant"}
                </Title>

                <Subtitle style={styles.subtitle}>
                    {isApproval
                        ? "Choose a unit and rent for this tenant."
                        : "The tenant gets access after accepting the invitation in the app, or by using the invite code."}
                </Subtitle>

                {loadError ? (
                    <FieldError message={loadError} />
                ) : !unitsInfo ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        {unitOptions.length === 0 ? (
                            <Text style={styles.notice}>
                                All configured units already have tenants.
                                Configure more units first.
                            </Text>
                        ) : (
                            <Dropdown
                                label="Unit *"
                                placeholder="Select Unit"
                                value={unitId}
                                data={unitOptions}
                                error={fieldError("unitId")}
                                onChange={(value) => {
                                    setUnitId(value);
                                    markTouched("unitId");
                                }}
                            />
                        )}

                        <Label style={styles.label}>Tenant Name *</Label>
                        <TextField
                            placeholder="Asha Verma"
                            value={tenantName}
                            editable={!isApproval}
                            hasError={!!fieldError("tenantName")}
                            maxLength={100}
                            onChangeText={(text) => {
                                setTenantName(text);
                                markTouched("tenantName");
                            }}
                        />
                        <FieldError message={fieldError("tenantName")} />

                        <Label style={styles.label}>Email *</Label>
                        <TextField
                            placeholder="asha@example.com"
                            value={tenantEmail}
                            editable={!isApproval}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            hasError={!!fieldError("tenantEmail")}
                            onChangeText={(text) => {
                                setTenantEmail(text);
                                markTouched("tenantEmail");
                            }}
                        />
                        <FieldError message={fieldError("tenantEmail")} />

                        <Label style={styles.label}>Phone</Label>
                        <TextField
                            placeholder="98765 43210"
                            value={tenantPhone}
                            editable={!isApproval}
                            keyboardType="phone-pad"
                            hasError={!!fieldError("tenantPhone")}
                            onChangeText={(text) => {
                                setTenantPhone(text);
                                markTouched("tenantPhone");
                            }}
                        />
                        <FieldError message={fieldError("tenantPhone")} />

                        <Label style={styles.label}>Move-in Date *</Label>
                        <TextField
                            placeholder="DD-MM-YYYY"
                            value={moveInDate}
                            keyboardType="numbers-and-punctuation"
                            maxLength={10}
                            hasError={!!fieldError("moveInDate")}
                            onChangeText={(text) => {
                                setMoveInDate(text);
                                markTouched("moveInDate");
                            }}
                        />
                        <FieldError message={fieldError("moveInDate")} />

                        <Label style={styles.label}>Monthly Rent (₹) *</Label>
                        <TextField
                            placeholder="15000"
                            value={monthlyRent}
                            keyboardType="decimal-pad"
                            hasError={!!fieldError("monthlyRent")}
                            onChangeText={(text) => {
                                setMonthlyRent(text);
                                markTouched("monthlyRent");
                            }}
                        />
                        <FieldError message={fieldError("monthlyRent")} />

                        <Button
                            title={
                                submitting
                                    ? "Saving..."
                                    : isApproval
                                        ? "Approve & Assign"
                                        : "Assign Tenant"
                            }
                            onPress={handleSubmit}
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

    label: {
        marginTop: 18,
        marginBottom: 8,
    },

    notice: {
        fontSize: 15,
        color: "#92400E",
        lineHeight: 22,
        marginBottom: 8,
    },

    codeBox: {
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    codeLabel: {
        fontSize: 13,
        color: Colors.txtSecondary,
        marginBottom: 6,
    },

    code: {
        fontSize: 30,
        fontWeight: "800",
        letterSpacing: 2,
        color: Colors.txtPrimary,
    },

    button: {
        marginTop: 28,
    },
});
