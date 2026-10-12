import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Switch,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { usePreventRemove } from "@react-navigation/native";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import Dropdown, { DropdownItem } from "../components/Dropdown";
import FieldError from "../components/FieldError";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Building } from "../models/Building";
import { UnitInput, getFloorLabel, getUnitDisplayName } from "../models/Unit";
import { UNIT_TYPES } from "../constants/unitTypes";
import { getBuildingById } from "../api/building.api";
import { createUnit, getUnitById, updateUnit } from "../api/unit.api";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "UnitSetup"
>;

type UnitForm = {
    unitNumber: string;
    floor: string; // dropdown value; "" until chosen
    unitType: string;
    parkingAssigned: boolean;
    parkingSpotNumber: string;
};

type UnitField = keyof UnitForm;
type UnitErrors = Partial<Record<UnitField, string>>;

const EMPTY_FORM: UnitForm = {
    unitNumber: "",
    floor: "",
    unitType: "",
    parkingAssigned: false,
    parkingSpotNumber: "",
};

// Match the API's limits
const MAX_UNIT_NUMBER_LENGTH = 20;
const MAX_PARKING_SPOT_LENGTH = 20;

function validate(form: UnitForm): UnitErrors {
    const errors: UnitErrors = {};
    const unitNumber = form.unitNumber.trim();
    const parkingSpotNumber = form.parkingSpotNumber.trim();

    if (!unitNumber) {
        errors.unitNumber = "Unit number is required.";
    } else if (unitNumber.length > MAX_UNIT_NUMBER_LENGTH) {
        errors.unitNumber = `Use ${MAX_UNIT_NUMBER_LENGTH} characters or fewer.`;
    }

    if (!form.unitType) {
        errors.unitType = "Select a unit type.";
    }

    if (form.parkingAssigned && !parkingSpotNumber) {
        errors.parkingSpotNumber = "Parking spot number is required.";
    } else if (parkingSpotNumber.length > MAX_PARKING_SPOT_LENGTH) {
        errors.parkingSpotNumber = `Use ${MAX_PARKING_SPOT_LENGTH} characters or fewer.`;
    }

    return errors;
}

function toUnitInput(form: UnitForm): UnitInput {
    return {
        unitNumber: form.unitNumber.trim(),
        floor: form.floor === "" ? null : Number(form.floor),
        unitType: form.unitType,
        parkingAssigned: form.parkingAssigned,
        parkingSpotNumber: form.parkingAssigned
            ? form.parkingSpotNumber.trim()
            : "",
    };
}

export default function UnitSetupScreen({
    navigation,
    route,
}: Props) {
    const {
        buildingId,
        unitId,
    } = route.params;

    const isNewUnit = !unitId;

    const [building, setBuilding] = useState<Building | null>(null);
    const [unitName, setUnitName] = useState("New Unit");

    const [form, setForm] = useState<UnitForm>(EMPTY_FORM);
    const [savedForm, setSavedForm] = useState<UnitForm>(EMPTY_FORM);
    const [wasConfigured, setWasConfigured] = useState(false);

    const [touched, setTouched] = useState<Partial<Record<UnitField, boolean>>>({});
    const [serverErrors, setServerErrors] = useState<UnitErrors>({});

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const { submitting, runSubmit } = useSingleSubmit();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadUnit = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const [buildingResponse, unitResponse] = await Promise.all([
                    getBuildingById(buildingId),
                    unitId ? getUnitById(unitId) : Promise.resolve(null),
                ]);

                setBuilding(buildingResponse);

                if (unitResponse) {
                    const loadedForm: UnitForm = {
                        unitNumber: unitResponse.unitNumber,
                        floor: unitResponse.floor === null
                            ? ""
                            : String(unitResponse.floor),
                        unitType: unitResponse.unitType,
                        parkingAssigned: unitResponse.parkingAssigned,
                        parkingSpotNumber: unitResponse.parkingSpotNumber,
                    };

                    setForm(loadedForm);
                    setSavedForm(loadedForm);
                    setWasConfigured(unitResponse.isConfigured);
                    setUnitName(getUnitDisplayName(unitResponse));
                }
            } catch (error) {
                console.error("Failed to load unit:", error);

                setLoadError(
                    getApiError(error, "Could not load this unit.").message
                );
            } finally {
                setLoading(false);
            }
        };

        loadUnit();
    }, [buildingId, unitId]);

    // Floors run from Ground (0) to numberOfFloors - 1; none until
    // the building's floors are set.
    const floorCount = building?.numberOfFloors ?? 0;

    const floorOptions = useMemo<DropdownItem[]>(() => {
        return Array.from({ length: floorCount }, (_, floor) => ({
            label: getFloorLabel(floor),
            value: String(floor),
        }));
    }, [floorCount]);

    const errors = useMemo(() => validate(form), [form]);
    const isValid = Object.keys(errors).length === 0;

    const isDirty =
        JSON.stringify(form) !== JSON.stringify(savedForm);

    // Ask before leaving with unsaved changes (back button,
    // Android hardware back or swipe).
    usePreventRemove(
        isDirty && !saved && !submitting,
        ({ data }) => {
            Alert.alert(
                "Discard changes?",
                "You have unsaved changes to this unit.",
                [
                    { text: "Keep Editing", style: "cancel" },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => navigation.dispatch(data.action),
                    },
                ]
            );
        }
    );

    // Leave only after the save has cleared the unsaved-changes guard
    useEffect(() => {
        if (saved) {
            navigation.goBack();
        }
    }, [saved, navigation]);

    const updateField = <K extends UnitField>(
        field: K,
        value: UnitForm[K]
    ) => {
        setForm((previous) => ({ ...previous, [field]: value }));
        setTouched((previous) => ({ ...previous, [field]: true }));
        setServerErrors((previous) => ({ ...previous, [field]: undefined }));
    };

    const fieldError = (field: UnitField) =>
        serverErrors[field] ||
        (touched[field] ? errors[field] : undefined);

    const handleSave = () => runSubmit(async () => {
        if (!isValid) return;

        try {
            const input = toUnitInput(form);
            const savedUnit = unitId
                ? await updateUnit(unitId, input)
                : await createUnit(buildingId, input);

            Alert.alert(
                "Unit Saved",
                `${getUnitDisplayName(savedUnit)} has been saved.`
            );

            setSaved(true);
        } catch (error) {
            const apiError = getApiError(error, "Could not save this unit.");

            if (apiError.field && apiError.field in EMPTY_FORM) {
                setServerErrors({
                    [apiError.field as UnitField]: apiError.message,
                });
            } else {
                Alert.alert("Error", apiError.message);
            }
        }
    });

    const buttonTitle = submitting
        ? "Saving..."
        : isNewUnit
            ? "Create Unit"
            : wasConfigured
                ? "Update Unit"
                : "Save Unit";

    return (
        <Screen>
            <View style={styles.container}>

                <Title style={styles.title}>
                    Unit Setup
                </Title>

                <Subtitle style={styles.subtitle}>
                    {building
                        ? `Configure ${unitName} in ${building.buildingName}`
                        : `Configure ${unitName}`}
                </Subtitle>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : loadError ? (
                    <FieldError message={loadError} />
                ) : (
                    <>
                        <Label style={styles.label}>
                            Unit Number *
                        </Label>

                        <TextField
                            placeholder="101"
                            value={form.unitNumber}
                            hasError={!!fieldError("unitNumber")}
                            maxLength={MAX_UNIT_NUMBER_LENGTH}
                            autoCapitalize="characters"
                            onChangeText={(text) =>
                                updateField("unitNumber", text)
                            }
                        />

                        <FieldError message={fieldError("unitNumber")} />

                        <View style={styles.dropdown}>
                            <Dropdown
                                label="Floor"
                                placeholder={
                                    floorCount > 0
                                        ? "Select Floor (optional)"
                                        : "Set building floors to choose"
                                }
                                value={form.floor}
                                data={floorOptions}
                                disabled={floorCount === 0}
                                error={fieldError("floor")}
                                onChange={(value) =>
                                    updateField("floor", value)
                                }
                            />
                        </View>

                        <Dropdown
                            label="Unit Type *"
                            placeholder="Select Unit Type"
                            value={form.unitType}
                            data={UNIT_TYPES}
                            error={fieldError("unitType")}
                            onChange={(value) =>
                                updateField("unitType", value)
                            }
                        />

                        <View style={styles.switchRow}>
                            <Label>Parking Assigned</Label>

                            <Switch
                                value={form.parkingAssigned}
                                onValueChange={(value) =>
                                    updateField("parkingAssigned", value)
                                }
                            />
                        </View>

                        {form.parkingAssigned && (
                            <>
                                <Label style={styles.label}>
                                    Parking Spot Number *
                                </Label>

                                <TextField
                                    placeholder="P-101"
                                    value={form.parkingSpotNumber}
                                    hasError={!!fieldError("parkingSpotNumber")}
                                    maxLength={MAX_PARKING_SPOT_LENGTH}
                                    autoCapitalize="characters"
                                    onChangeText={(text) =>
                                        updateField("parkingSpotNumber", text)
                                    }
                                />

                                <FieldError
                                    message={fieldError("parkingSpotNumber")}
                                />
                            </>
                        )}

                        <Button
                            title={buttonTitle}
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
        marginBottom: 30,
        lineHeight: 24,
    },

    label: {
        marginTop: 18,
        marginBottom: 8,
    },

    dropdown: {
        marginTop: 18,
    },

    switchRow: {
        marginTop: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    button: {
        marginTop: 28,
    },
});
