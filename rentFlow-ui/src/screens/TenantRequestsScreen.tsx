import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Button from "../components/Button";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { OwnerAccessRequest } from "../models/Tenancy";
import { getOwnerRequests, rejectRequest } from "../api/tenancy.api";
import { getApiError } from "../api/apiError";
import { Colors } from "../theme/colors";
import { formatDate } from "../utils/format";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "TenantRequests"
>;

/**
 * Tenants asking the owner for access to a property.
 */
export default function TenantRequestsScreen({ navigation }: Props) {
    const [requests, setRequests] = useState<OwnerAccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");
            setRequests(await getOwnerRequests());
        } catch (loadError) {
            setError(getApiError(loadError, "Could not load requests.").message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const approve = (request: OwnerAccessRequest) => {
        navigation.navigate("AssignTenant", {
            propertyId: request.propertyId,
            request: {
                id: request.id,
                tenantName: request.tenant.fullName,
                tenantEmail: request.tenant.email,
                tenantPhone: request.tenant.phone,
            },
        });
    };

    const decline = (request: OwnerAccessRequest) => {
        Alert.alert(
            "Decline Request?",
            `${request.tenant.fullName} will not get access to ${request.propertyName}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Decline",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await rejectRequest(request.id);
                            loadRequests();
                        } catch (rejectError) {
                            Alert.alert(
                                "Error",
                                getApiError(rejectError, "Could not decline this request.").message
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Tenant Requests</Title>

                <Subtitle style={styles.subtitle}>
                    Tenants asking to join your properties.
                </Subtitle>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : error ? (
                    <FieldError message={error} />
                ) : requests.length === 0 ? (
                    <Text style={styles.empty}>No pending requests.</Text>
                ) : (
                    requests.map((request) => (
                        <View key={request.id} style={styles.card}>
                            <Text style={styles.name}>{request.tenant.fullName}</Text>

                            <Text style={styles.meta}>
                                wants to join {request.propertyName}
                            </Text>

                            <Text style={styles.meta}>
                                {[request.tenant.phone, request.tenant.email]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </Text>

                            {!!request.message && (
                                <Text style={styles.message}>"{request.message}"</Text>
                            )}

                            <Text style={styles.date}>
                                Requested {formatDate(request.createdAt)}
                            </Text>

                            <View style={styles.actions}>
                                <Button
                                    title="Approve"
                                    onPress={() => approve(request)}
                                    style={styles.action}
                                />

                                <Button
                                    title="Decline"
                                    onPress={() => decline(request)}
                                    style={[styles.action, styles.decline]}
                                />
                            </View>
                        </View>
                    ))
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

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    card: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    name: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginBottom: 4,
    },

    meta: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 2,
    },

    message: {
        fontSize: 14,
        color: Colors.txtPrimary,
        fontStyle: "italic",
        marginTop: 8,
    },

    date: {
        fontSize: 12,
        color: Colors.txtSecondary,
        marginTop: 8,
    },

    actions: {
        flexDirection: "row",
        marginTop: 14,
    },

    action: {
        flex: 1,
        paddingVertical: 12,
    },

    decline: {
        marginLeft: 10,
        backgroundColor: Colors.danger,
    },
});
