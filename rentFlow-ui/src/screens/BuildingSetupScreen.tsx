import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import BackButton from "../components/BackButton";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";
import { createBuilding, updateBuilding } from "../api/building.api";
import { Building } from "../models/Building";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "BuildingSetup"
>;

export default function BuildingSetupScreen({
    navigation,
    route,
}: Props) {
    const {
        propertyId,
        buildingId,
        buildingName,
    } = route.params;

    // Single source of truth: direct Building model state
    const [building, setBuilding] = useState<Building>({
        propertyId,
        buildingName: "",
        numberOfFloors: 0,
        totalUnits: 0,
        unitIds: [],
    });

    const [buildingCreated, setBuildingCreated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!building.buildingName.trim()) return;

        try {
            setLoading(true);

            // Send the Building state directly to the API
            const response = await updateBuilding(
                building.id!,
                {
                    buildingName: building.buildingName,
                    numberOfFloors: building.numberOfFloors,
                    totalUnits: building.totalUnits,
                    // isConfigured: true,
                }
            );

            const returnedId = response?.id || (response as any)?._id;

            if (returnedId) {
                setBuilding((prev) => ({ ...prev, id: returnedId }));
                setBuildingCreated(true);
            }
        } catch (error: any) {
            console.error(
                "Error creating building:",
                error?.response?.data || error?.message || error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!building.buildingName.trim()) return;

        if (!buildingId) {
            console.error("Building id is missing.");
            return;
        }

        try {
            setLoading(true);

            const updatedBuilding = await updateBuilding(
                buildingId,
                {
                    buildingName: building.buildingName,
                    numberOfFloors: building.numberOfFloors,
                    totalUnits: building.totalUnits,
                }
            );

            setBuilding(updatedBuilding);
            setBuildingCreated(true);

            console.log(
                "Updated Building:",
                updatedBuilding
            );
        } catch (error: any) {
            console.error(
                "Error updating building:",
                error?.response?.data || error?.message || error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFlats = () => {
        if (!building.id) return;

        navigation.navigate("CreateUnits", {
            propertyId,
            buildingId: building.id,
            totalUnits: building.totalUnits,
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
                    Building Setup
                </Title>

                <Subtitle style={styles.subtitle}>
                    Configure this building.
                </Subtitle>

                <Label style={styles.label}>
                    Building Name
                </Label>

                <TextField
                    placeholder="Building A"
                    value={building.buildingName}
                    onChangeText={(text) =>
                        setBuilding((prev) => ({ ...prev, buildingName: text }))
                    }
                />

                <Label style={styles.label}>
                    Number of Floors
                </Label>

                <TextField
                    placeholder="5"
                    keyboardType="number-pad"
                    value={building.numberOfFloors ? String(building.numberOfFloors) : ""}
                    onChangeText={(text) =>
                        setBuilding((prev) => ({ ...prev, numberOfFloors: Number(text) || 0 }))
                    }
                />

                <Label style={styles.label}>
                    Number of Units
                </Label>

                <TextField
                    placeholder="20"
                    keyboardType="number-pad"
                    value={building.totalUnits ? String(building.totalUnits) : ""}
                    onChangeText={(text) =>
                        setBuilding((prev) => ({ ...prev, totalUnits: Number(text) || 0 }))
                    }
                />

                <Button
                    title={
                        loading
                            ? "Saving..."
                            : buildingCreated
                                ? "Update Building"
                                : "Create Building"
                    }
                    onPress={handleUpdate}
                    disabled={loading}
                    style={styles.button}
                />

                {buildingCreated && (
                    <Button
                        title="Create Flats"
                        onPress={handleCreateFlats}
                        style={styles.button}
                    />
                )}
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
        marginBottom: 30,
        lineHeight: 24,
    },

    label: {
        marginTop: 18,
        marginBottom: 8,
    },

    button: {
        marginTop: 20,
    },
});