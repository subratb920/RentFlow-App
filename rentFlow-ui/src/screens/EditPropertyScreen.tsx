import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Building2 } from "lucide-react-native";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import TextArea from "../components/TextArea";
import Button from "../components/Button";
import ActionCard from "../components/ActionCard";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Property } from "../models/Property";
import { PROPERTY_TYPES } from "../constants/propertyTypes";
import { getProperties, updateProperty } from "../api/property.api";
import { getApiError } from "../api/apiError";
import useFormReady from "../hooks/useFormReady";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { Colors } from "../theme/colors";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "EditProperty"
>;

export default function EditPropertyScreen({
    navigation,
    route,
}: Props) {
    const { propertyId } = route.params;

    const [property, setProperty] = useState<Property | null>(null);
    const [propertyName, setPropertyName] = useState("");
    const [address, setAddress] = useState("");
    const [nameError, setNameError] = useState("");
    const [loadError, setLoadError] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();
    const isFormReady = useFormReady([propertyName]);

    useEffect(() => {
        const loadProperty = async () => {
            try {
                const properties = await getProperties();
                const found = properties.find((item) => item.id === propertyId);

                if (!found) {
                    setLoadError("Property not found.");
                    return;
                }

                setProperty(found);
                setPropertyName(found.propertyName);
                setAddress(found.address);
            } catch (error) {
                setLoadError(
                    getApiError(error, "Could not load this property.").message
                );
            }
        };

        loadProperty();
    }, [propertyId]);

    const handleSave = () => runSubmit(async () => {
        if (!isFormReady) return;

        try {
            const updated = await updateProperty(propertyId, {
                propertyName: propertyName.trim(),
                address: address.trim(),
            });

            setProperty((previous) =>
                previous ? { ...previous, ...updated } : previous
            );

            Alert.alert("Property Saved", `${updated.propertyName} has been saved.`);
        } catch (error) {
            const apiError = getApiError(error, "Could not save this property.");

            if (apiError.field === "propertyName") {
                setNameError(apiError.message);
            } else {
                Alert.alert("Error", apiError.message);
            }
        }
    });

    // Complexes manage several buildings; other types go straight
    // to the units of their single building.
    const openBuildingsAndUnits = () => {
        if (!property) return;

        const managementType = PROPERTY_TYPES.find(
            (type) => type.value === property.propertyType
        )?.managementType;

        if (managementType === "complex") {
            navigation.navigate("CreateBuildings", {
                propertyId,
                totalBuildings: property.totalBuildings,
                currentBuilding: 1,
            });
            return;
        }

        navigation.navigate("CreateUnits", {
            propertyId,
            buildingId: property.buildingIds[0],
        });
    };

    if (loadError) {
        return (
            <Screen>
                <View style={styles.container}>
                    <FieldError message={loadError} />
                </View>
            </Screen>
        );
    }

    if (!property) {
        return (
            <Screen>
                <ActivityIndicator size="large" style={styles.loader} />
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>
                    Edit Property
                </Title>

                <Subtitle style={styles.subtitle}>
                    {property.propertyType}
                </Subtitle>

                <Label style={styles.label}>
                    Property Name *
                </Label>

                <TextField
                    value={propertyName}
                    hasError={!!nameError}
                    maxLength={100}
                    onChangeText={(text) => {
                        setPropertyName(text);
                        setNameError("");
                    }}
                />

                <FieldError message={nameError} />

                <Label style={styles.label}>
                    Address
                </Label>

                <TextArea
                    placeholder="Enter property address"
                    value={address}
                    maxLength={500}
                    onChangeText={setAddress}
                />

                <Button
                    title={submitting ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    disabled={submitting || !isFormReady}
                    style={styles.button}
                />

                <Label style={styles.sectionLabel}>
                    Buildings & Units
                </Label>

                <ActionCard
                    title="Manage Buildings & Units"
                    subtitle="Floors, unit count and unit details"
                    icon={<Building2 size={22} color={Colors.txtPrimary} />}
                    onPress={openBuildingsAndUnits}
                />
            </View>
        </Screen>
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

    sectionLabel: {
        marginTop: 32,
        marginBottom: 12,
    },
});
