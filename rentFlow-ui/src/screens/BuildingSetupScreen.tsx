import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import Button from "../components/Button";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { getBuildingById, updateBuilding } from "../api/building.api";
import { Building } from "../models/Building";
import { getApiError } from "../api/apiError";
import useFormReady from "../hooks/useFormReady";
import useSingleSubmit from "../hooks/useSingleSubmit";

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
        buildingName: buildingName ?? "",
        numberOfFloors: 0,
        totalUnits: 0,
        unitIds: [],
    });

    // A building counts as configured once it has units,
    // matching the status shown on the Buildings list.
    const [isConfigured, setIsConfigured] = useState(false);
    const [fetching, setFetching] = useState(!!buildingId);
    const [loadFailed, setLoadFailed] = useState(false);
    const { submitting: saving, runSubmit } = useSingleSubmit();
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<"buildingName" | "numberOfFloors" | "totalUnits", string>>
    >({});

    const isFormReady = useFormReady([
        building.buildingName,
        building.numberOfFloors,
    ]);

    const updateField = <K extends "buildingName" | "numberOfFloors" | "totalUnits">(
        field: K,
        value: Building[K]
    ) => {
        setBuilding((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    useEffect(() => {
        if (!buildingId) return;

        const loadBuilding = async () => {
            try {
                setFetching(true);

                const response = await getBuildingById(buildingId);

                setBuilding(response);
                setIsConfigured(response.totalUnits > 0);
                setLoadFailed(false);
            } catch (error: any) {
                console.error(
                    "Error loading building:",
                    error?.response?.data || error?.message || error
                );

                setLoadFailed(true);

                Alert.alert(
                    "Error",
                    "Could not load this building. Please try again."
                );
            } finally {
                setFetching(false);
            }
        };

        loadBuilding();
    }, [buildingId]);

    const handleUpdate = () => runSubmit(async () => {
        if (!isFormReady) return;

        if (!buildingId) {
            Alert.alert("Error", "Building id is missing.");
            return;
        }

        try {
            const updatedBuilding = await updateBuilding(
                buildingId,
                {
                    buildingName: building.buildingName.trim(),
                    numberOfFloors: building.numberOfFloors,
                    totalUnits: building.totalUnits,
                }
            );

            setBuilding(updatedBuilding);
            setIsConfigured(updatedBuilding.totalUnits > 0);

            Alert.alert(
                "Building Saved",
                `${updatedBuilding.buildingName} has been saved.`
            );
        } catch (error) {
            const apiError = getApiError(
                error,
                "Could not save this building. Please try again."
            );

            if (
                apiError.field === "buildingName" ||
                apiError.field === "numberOfFloors" ||
                apiError.field === "totalUnits"
            ) {
                setFieldErrors({ [apiError.field]: apiError.message });
            } else {
                Alert.alert("Error", apiError.message);
            }
        }
    });

    const handleCreateUnits = () => {
        if (!building.id) return;

        // Opened from this building's Units list: return to it rather
        // than stacking a second copy.
        const routes = navigation.getState().routes;
        const previous = routes[routes.length - 2];

        if (
            previous?.name === "CreateUnits" &&
            (previous.params as RootStackParamList["CreateUnits"])
                ?.buildingId === building.id
        ) {
            navigation.goBack();
            return;
        }

        navigation.navigate("CreateUnits", {
            propertyId,
            buildingId: building.id,
        });
    };

    return (
        <Screen>
            <View style={styles.container}>

                <Title style={styles.title}>
                    Building Setup
                </Title>

                <Subtitle style={styles.subtitle}>
                    Configure this building.
                </Subtitle>

                {fetching ? (
                    <ActivityIndicator size="large" />
                ) : (
                <>
                <Label style={styles.label}>
                    Building Name *
                </Label>

                <TextField
                    placeholder="Building A"
                    value={building.buildingName}
                    hasError={!!fieldErrors.buildingName}
                    maxLength={60}
                    onChangeText={(text) =>
                        updateField("buildingName", text)
                    }
                />

                <FieldError message={fieldErrors.buildingName} />

                <Label style={styles.label}>
                    Number of Floors *
                </Label>

                <TextField
                    placeholder="5"
                    keyboardType="number-pad"
                    value={building.numberOfFloors ? String(building.numberOfFloors) : ""}
                    hasError={!!fieldErrors.numberOfFloors}
                    onChangeText={(text) =>
                        updateField("numberOfFloors", Number(text) || 0)
                    }
                />

                <FieldError message={fieldErrors.numberOfFloors} />

                <Label style={styles.label}>
                    Number of Units
                </Label>

                <TextField
                    placeholder="20"
                    keyboardType="number-pad"
                    value={building.totalUnits ? String(building.totalUnits) : ""}
                    hasError={!!fieldErrors.totalUnits}
                    onChangeText={(text) =>
                        updateField("totalUnits", Number(text) || 0)
                    }
                />

                <FieldError message={fieldErrors.totalUnits} />

                <Button
                    title={
                        saving
                            ? "Saving..."
                            : isConfigured
                                ? "Update Building"
                                : "Save Building"
                    }
                    onPress={handleUpdate}
                    disabled={saving || loadFailed || !isFormReady}
                    style={styles.button}
                />

                {isConfigured && (
                    <Button
                        title="Create Units"
                        onPress={handleCreateUnits}
                        style={styles.button}
                    />
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