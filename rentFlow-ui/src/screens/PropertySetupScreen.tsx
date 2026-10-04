import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../components/Screen";
import BackButton from "../components/BackButton";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Property } from "../models/Property";
import { getProperties } from "../api/property.api";
import { PROPERTY_TYPES } from "../constants/propertyTypes";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "PropertySetup"
>;

export default function PropertySetupScreen({
    navigation,
}: Props) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProperties = async () => {
        try {
            setLoading(true);

            const response = await getProperties();

            setProperties(response);
        } catch (error) {
            console.error("Failed to load properties", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProperties();
        }, [])
    );

    const handlePropertyPress = (property: Property) => {
        const propertyType = PROPERTY_TYPES.find(
            (type) => type.value === property.propertyType
        );

        if (propertyType?.managementType === "complex") {
            navigation.navigate("CreateBuildings", {
                propertyId: property.id!,
                totalBuildings: property.totalBuildings,
                currentBuilding: 1,
            });
            // alert("Complex Property");
            return;
        }

        navigation.navigate("BuildingSetup", {
            propertyId: property.id!,
        });
    };

    return (
        <Screen>
            <View style={styles.container}>
                <BackButton
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />

                <Title style={styles.title}>
                    Properties
                </Title>

                <Subtitle style={styles.subtitle}>
                    Tap a property to continue setup.
                </Subtitle>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : properties.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No properties found.
                    </Text>
                ) : (
                    properties.map((property) => (
                        <Pressable
                            key={property.id}
                            style={styles.card}
                            onPress={() =>
                                handlePropertyPress(property)
                            }
                        >
                            <Text style={styles.name}>
                                🏢 {property.propertyName}
                            </Text>

                            <Text style={styles.type}>
                                {property.propertyType}
                            </Text>

                            <Text style={styles.status}>
                                Buildings : {property.totalBuildings}
                            </Text>

                            <Text style={styles.status}>
                                Units : {property.totalUnits}
                            </Text>
                        </Pressable>
                    ))
                )}

                <Button
                    title="Add Property"
                    onPress={() =>
                        navigation.navigate("CreateProperty")
                    }
                    style={styles.button}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },

    backButton: {
        marginBottom: 24,
    },

    title: {
        marginBottom: 8,
    },

    subtitle: {
        marginBottom: 24,
        lineHeight: 24,
    },

    card: {
        padding: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
    },

    name: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },

    type: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 8,
    },

    status: {
        fontSize: 14,
        color: "#6B7280",
    },

    emptyText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 40,
    },

    button: {
        marginTop: 20,
    },
});