import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MessagesSquare, PencilLine, ReceiptIndianRupee, UserPlus } from "lucide-react-native";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import ActionCard from "../components/ActionCard";
import StatusChip from "../components/StatusChip";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Property } from "../models/Property";
import { Tenancy, TenancyStatus } from "../models/Tenancy";
import { getProperties } from "../api/property.api";
import { deleteTenancy, getTenancies } from "../api/tenancy.api";
import { getApiError } from "../api/apiError";
import useLiveRefresh from "../hooks/useLiveRefresh";
import { Colors } from "../theme/colors";
import { formatDate, formatRupees } from "../utils/format";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "PropertyDetail"
>;

const TENANCY_STATUS: Record<
    TenancyStatus,
    { label: string; tone: "warning" | "success" | "danger" }
> = {
    INVITED: { label: "Invited", tone: "warning" },
    ACTIVE: { label: "Active", tone: "success" },
    DECLINED: { label: "Declined", tone: "danger" },
};

/**
 * Shown once a property has at least one configured unit: the owner
 * can edit the property and units, or assign tenants.
 */
export default function PropertyDetailScreen({
    navigation,
    route,
}: Props) {
    const { propertyId } = route.params;

    const [property, setProperty] = useState<Property | null>(null);
    const [tenancies, setTenancies] = useState<Tenancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProperty = async () => {
        try {
            const [properties, tenancyList] = await Promise.all([
                getProperties(),
                getTenancies(propertyId),
            ]);

            setProperty(
                properties.find((item) => item.id === propertyId) ?? null
            );
            setTenancies(tenancyList);
            setError("");
        } catch (loadError) {
            // Keep showing the last data if a background refresh fails
            if (!property) {
                setError(
                    getApiError(loadError, "Could not load this property.").message
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Live: invites flip to Active as soon as the tenant accepts
    useLiveRefresh(loadProperty);

    const confirmRemove = (tenancy: Tenancy) => {
        Alert.alert(
            "Remove Tenant?",
            `${tenancy.tenantName} will be removed from Unit ${tenancy.unitNumber}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTenancy(tenancy.id);
                            loadProperty();
                        } catch (removeError) {
                            Alert.alert(
                                "Error",
                                getApiError(
                                    removeError,
                                    "Could not remove this tenant."
                                ).message
                            );
                        }
                    },
                },
            ]
        );
    };

    if (loading && !property) {
        return (
            <Screen>
                <ActivityIndicator size="large" style={styles.loader} />
            </Screen>
        );
    }

    if (error || !property) {
        return (
            <Screen>
                <View style={styles.container}>
                    <FieldError message={error || "Property not found."} />
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>
                    {property.propertyName}
                </Title>

                <Subtitle style={styles.subtitle}>
                    {[property.propertyType, property.address]
                        .filter(Boolean)
                        .join(" · ")}
                </Subtitle>

                <View style={styles.stats}>
                    <Stat label="Buildings" value={property.totalBuildings} />
                    <Stat label="Units" value={property.totalUnits} />
                    <Stat label="Configured" value={property.configuredUnits ?? 0} />
                    <Stat
                        label="Tenants"
                        value={tenancies.filter((t) => t.status === "ACTIVE").length}
                    />
                </View>

                <ActionCard
                    title="Edit Property & Units"
                    subtitle="Update details, buildings and units"
                    icon={<PencilLine size={22} color={Colors.txtPrimary} />}
                    onPress={() =>
                        navigation.navigate("EditProperty", { propertyId })
                    }
                />

                <ActionCard
                    title="Assign Tenant"
                    subtitle="Invite a tenant to a configured unit"
                    icon={<UserPlus size={22} color={Colors.txtPrimary} />}
                    onPress={() =>
                        navigation.navigate("AssignTenant", { propertyId })
                    }
                />

                <ActionCard
                    title="Bills & Payments"
                    subtitle="Rent, utility bills and payment confirmations"
                    icon={<ReceiptIndianRupee size={22} color={Colors.txtPrimary} />}
                    onPress={() =>
                        navigation.navigate("OwnerBills", { propertyId })
                    }
                />

                <ActionCard
                    title="Broadcast to Tenants"
                    subtitle="Send an announcement to the property or a building"
                    icon={<MessagesSquare size={22} color={Colors.txtPrimary} />}
                    onPress={() =>
                        navigation.navigate("Broadcasts", {
                            propertyId,
                            propertyName: property.propertyName,
                        })
                    }
                />

                <Text style={styles.sectionTitle}>Tenants</Text>

                {tenancies.length === 0 ? (
                    <Text style={styles.empty}>
                        No tenants yet. Assign a tenant to get started.
                    </Text>
                ) : (
                    tenancies.map((tenancy) => (
                        <View key={tenancy.id} style={styles.tenantCard}>
                            <View style={styles.tenantHeader}>
                                <Text style={styles.tenantName}>
                                    {tenancy.tenantName}
                                </Text>

                                <StatusChip
                                    label={TENANCY_STATUS[tenancy.status].label}
                                    tone={TENANCY_STATUS[tenancy.status].tone}
                                />
                            </View>

                            <Text style={styles.tenantMeta}>
                                Unit {tenancy.unitNumber} · {tenancy.buildingName}
                            </Text>

                            <Text style={styles.tenantMeta}>
                                {formatRupees(tenancy.monthlyRent)}/month · from{" "}
                                {formatDate(tenancy.moveInDate)}
                            </Text>

                            {tenancy.status === "INVITED" && (
                                <Text style={styles.inviteText}>
                                    Waiting for {tenancy.tenantEmail} to accept in
                                    the app · invite code {tenancy.inviteCode}
                                </Text>
                            )}

                            {tenancy.status === "DECLINED" && (
                                <Text style={styles.inviteText}>
                                    The tenant declined this invitation. Remove it to
                                    free the unit.
                                </Text>
                            )}

                            <Pressable
                                onPress={() => confirmRemove(tenancy)}
                                hitSlop={8}
                                style={styles.removeLink}
                            >
                                <Text style={styles.removeText}>
                                    {tenancy.status === "ACTIVE" ? "Remove" : "Cancel invite"}
                                </Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </View>
        </Screen>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
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

    stats: {
        flexDirection: "row",
        marginBottom: 20,
        padding: 14,
        borderRadius: 16,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    stat: {
        flex: 1,
        alignItems: "center",
    },

    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.txtPrimary,
    },

    statLabel: {
        fontSize: 12,
        color: Colors.txtSecondary,
        marginTop: 2,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 16,
        marginBottom: 12,
    },

    empty: {
        fontSize: 14,
        color: Colors.txtSecondary,
    },

    tenantCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    tenantHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    tenantName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtPrimary,
        flexShrink: 1,
        marginRight: 8,
    },

    tenantMeta: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 2,
    },

    inviteText: {
        fontSize: 13,
        color: "#92400E",
        marginTop: 8,
    },

    removeLink: {
        alignSelf: "flex-start",
        marginTop: 10,
    },

    removeText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.danger,
    },
});
