import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Subtitle from "../../components/SubHeading";
import Label from "../../components/Label";
import TextField from "../../components/TextField";
import FieldError from "../../components/FieldError";
import Button from "../../components/Button";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { OwnerSearchResult } from "../../models/Tenancy";
import { findOwner, requestAccess } from "../../api/tenant.api";
import { getApiError } from "../../api/apiError";
import useSingleSubmit from "../../hooks/useSingleSubmit";
import { Colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "FindOwner">;

/**
 * Tenant finds their owner by name and phone number, then requests
 * access to the property they live in.
 */
export default function FindOwnerScreen({ navigation }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [result, setResult] = useState<OwnerSearchResult | null>(null);
    const [error, setError] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();

    const canSearch =
        name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10;

    const handleSearch = () => runSubmit(async () => {
        if (!canSearch) return;

        try {
            setError("");
            setResult(await findOwner(name.trim(), phone.trim()));
        } catch (searchError) {
            setResult(null);
            setError(getApiError(searchError, "Could not find this owner.").message);
        }
    });

    const confirmRequest = (property: OwnerSearchResult["properties"][number]) => {
        if (!result) return;

        Alert.alert(
            "Request Access?",
            `${result.owner.fullName} will be asked to add you to ${property.propertyName}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Send Request",
                    onPress: () => runSubmit(async () => {
                        try {
                            await requestAccess(result.owner.id, property.id);

                            Alert.alert(
                                "Request Sent",
                                "You'll see the property once your owner approves."
                            );

                            navigation.goBack();
                        } catch (requestError) {
                            Alert.alert(
                                "Could Not Send Request",
                                getApiError(requestError, "Please try again.").message
                            );
                        }
                    }),
                },
            ]
        );
    };

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Find Your Owner</Title>

                <Subtitle style={styles.subtitle}>
                    Enter your owner's name and the phone number they registered with.
                </Subtitle>

                <Label style={styles.label}>Owner Name</Label>
                <TextField
                    placeholder="Ravi Kumar"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        setError("");
                    }}
                />

                <Label style={styles.label}>Owner Phone Number</Label>
                <TextField
                    placeholder="98765 43210"
                    value={phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => {
                        setPhone(text);
                        setError("");
                    }}
                />

                <FieldError message={error} />

                <Button
                    title={submitting ? "Searching..." : "Search"}
                    onPress={handleSearch}
                    disabled={submitting || !canSearch}
                    style={styles.button}
                />

                {result && (
                    <>
                        <Text style={styles.sectionTitle}>
                            {result.owner.fullName}'s Properties
                        </Text>

                        {result.properties.length === 0 ? (
                            <Text style={styles.empty}>
                                This owner has no properties yet.
                            </Text>
                        ) : (
                            <>
                                <Text style={styles.hint}>
                                    Tap the property you live in.
                                </Text>

                                {result.properties.map((property) => (
                                    <Pressable
                                        key={property.id}
                                        style={({ pressed }) => [
                                            styles.card,
                                            pressed && styles.cardPressed,
                                        ]}
                                        onPress={() => confirmRequest(property)}
                                    >
                                        <Text style={styles.propertyName}>
                                            🏢 {property.propertyName}
                                        </Text>

                                        <Text style={styles.propertyMeta}>
                                            {[property.propertyType, property.address]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </Text>
                                    </Pressable>
                                ))}
                            </>
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
        marginBottom: 8,
    },

    subtitle: {
        marginBottom: 12,
        lineHeight: 24,
    },

    label: {
        marginTop: 18,
        marginBottom: 8,
    },

    button: {
        marginTop: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 32,
        marginBottom: 4,
    },

    hint: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginBottom: 12,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
        marginTop: 8,
    },

    card: {
        padding: 18,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    cardPressed: {
        opacity: 0.6,
    },

    propertyName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtPrimary,
        marginBottom: 4,
    },

    propertyMeta: {
        fontSize: 14,
        color: Colors.txtSecondary,
    },
});
