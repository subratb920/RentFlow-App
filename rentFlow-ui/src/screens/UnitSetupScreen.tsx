import React, { useState } from "react";
import { StyleSheet, View, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";

import Screen from "../components/Screen";
import BackButton from "../components/BackButton";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "UnitSetup"
>;

export default function UnitSetupScreen({
    navigation,
    route,
}: Props) {
    const {
        propertyId,
        buildingId,
        unitId,
        unitName,
    } = route.params;

    const [unitNumber, setUnitNumber] = useState("");
    const [floor, setFloor] = useState("");
    const [unitType, setUnitType] = useState("2 BHK");
    const [parkingAssigned, setParkingAssigned] = useState(false);
    const [parkingSpotNumber, setParkingSpotNumber] = useState("");

    const handleSave = () => {
        const unit = {
            propertyId,
            buildingId,
            unitId,
            unitNumber,
            floor,
            unitType,
            parkingAssigned,
            parkingSpotNumber:
                parkingAssigned ? parkingSpotNumber : "",
        };

        console.log("Flat:", unit);

        // TODO:
        // Save to backend

        navigation.goBack();
    };

    return (
        <Screen>
            <View style={styles.container}>
                <BackButton
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />

                <Title style={styles.title}>
                    Flat Setup
                </Title>

                <Subtitle style={styles.subtitle}>
                    Configure {unitName}
                </Subtitle>

                <Label style={styles.label}>
                    Flat Number
                </Label>

                <TextField
                    placeholder="101"
                    value={unitNumber}
                    onChangeText={setUnitNumber}
                />

                <Label style={styles.label}>
                    Floor
                </Label>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={floor}
                        onValueChange={(value) => setFloor(value)}
                    >
                        <Picker.Item label="Ground" value="Ground" />
                        <Picker.Item label="1" value="1" />
                        <Picker.Item label="2" value="2" />
                        <Picker.Item label="3" value="3" />
                        <Picker.Item label="4" value="4" />
                        <Picker.Item label="5" value="5" />
                        <Picker.Item label="6" value="6" />
                        <Picker.Item label="7" value="7" />
                        <Picker.Item label="8" value="8" />
                        <Picker.Item label="9" value="9" />
                        <Picker.Item label="10" value="10" />
                    </Picker>
                </View>

                <Label style={styles.label}>
                    Flat Type
                </Label>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={unitType}
                        onValueChange={(value) => setUnitType(value)}
                    >
                        <Picker.Item label="Studio" value="Studio" />
                        <Picker.Item label="1 RK" value="1 RK" />
                        <Picker.Item label="1 BHK" value="1 BHK" />
                        <Picker.Item label="2 BHK" value="2 BHK" />
                        <Picker.Item label="3 BHK" value="3 BHK" />
                        <Picker.Item label="4 BHK" value="4 BHK" />
                        <Picker.Item label="5 BHK" value="5 BHK" />
                        <Picker.Item label="Duplex" value="Duplex" />
                        <Picker.Item label="Penthouse" value="Penthouse" />
                    </Picker>
                </View>

                <View style={styles.switchRow}>
                    <Label>Parking Assigned</Label>

                    <Switch
                        value={parkingAssigned}
                        onValueChange={setParkingAssigned}
                    />
                </View>

                {parkingAssigned && (
                    <>
                        <Label style={styles.label}>
                            Parking Spot Number
                        </Label>

                        <TextField
                            placeholder="P-101"
                            value={parkingSpotNumber}
                            onChangeText={setParkingSpotNumber}
                        />
                    </>
                )}

                <Button
                    title="Create Flat"
                    onPress={handleSave}
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
        marginBottom: 30,
        lineHeight: 24,
    },

    label: {
        marginTop: 18,
        marginBottom: 8,
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },

    switchRow: {
        marginTop: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    button: {
        marginTop: 40,
    },
});