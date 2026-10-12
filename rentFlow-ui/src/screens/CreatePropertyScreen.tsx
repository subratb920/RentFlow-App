import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import TextArea from "../components/TextArea";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";

import { PROPERTY_TYPES } from "../constants/propertyTypes";
import useFormReady from "../hooks/useFormReady";
import { RootStackParamList } from "../navigation/navigationTypes";
import { createProperty, CreatePropertyRequest } from "../api/property.api";
import { useProperty } from "../context/PropertyContext";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CreateProperty"
>;

export default function CreatePropertyScreen({
  navigation,
}: Props) {
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [numberOfBuildings, setNumberOfBuildings] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [address, setAddress] = useState("");
  const { submitting, runSubmit } = useSingleSubmit();

  const selectedPropertyType = PROPERTY_TYPES.find(
    (type) => type.value === propertyType
  );

  const nextStep = selectedPropertyType?.nextStep;

  const { addProperty, setSelectedProperty } = useProperty();

  const requiresBuildings =
    nextStep === "createBuildings";

  const requiresUnits =
    nextStep === "createUnits" ||
    nextStep === "createOfficeUnits";

  const isFormValid = useFormReady([
    propertyName,
    propertyType,

    ...(requiresBuildings
      ? [Number(numberOfBuildings)]
      : []),

    ...(requiresUnits
      ? [Number(numberOfFloors), Number(numberOfUnits)]
      : []),
  ]);

  const handleSave = () => runSubmit(async () => {
    if (!isFormValid) return;

    const property: CreatePropertyRequest = {
      propertyName: propertyName.trim(),
      propertyType,
      address: address.trim(),

      totalBuildings: requiresBuildings
        ? Number(numberOfBuildings)
        : 1,

      totalUnits: requiresUnits
        ? Number(numberOfUnits)
        : 0,

      numberOfFloors: requiresUnits
        ? Number(numberOfFloors)
        : 0,

      buildingIds: [],
    };

    try {
      const createdProperty = await createProperty(property);

      addProperty(createdProperty);
      setSelectedProperty(createdProperty);

      // replace() so Back from the next step can't return to this
      // already-submitted form and create the property twice.
      switch (nextStep) {
        case "createBuildings":
          navigation.replace("CreateBuildings", {
            propertyId: createdProperty.id!,
            totalBuildings: createdProperty.totalBuildings,
            currentBuilding: 1,
          });
          break;

        // Office units have no separate screen yet; they are set up
        // through the same units flow as other single buildings.
        case "createUnits":
        case "createOfficeUnits":
          navigation.replace("CreateUnits", {
            propertyId: createdProperty.id!,
            buildingId: createdProperty.buildingIds[0],
          });
          break;

        default:
          navigation.replace("Dashboard");
      }
    } catch (error) {
      console.error("Create Property Failed:", error);

      Alert.alert(
        "Could Not Create Property",
        getApiError(error, "Please try again.").message
      );
    }
  });

  return (
    <Screen>
      <View style={styles.container}>

        <Title style={styles.title}>
          Add Property
        </Title>

        <Subtitle style={styles.subtitle}>
          Create a property to add buildings, units,
          tenants, rent and monthly bills.
        </Subtitle>

        <Label style={styles.label}>
          Property Name
        </Label>

        <TextField
          placeholder="Green Residency"
          value={propertyName}
          onChangeText={setPropertyName}
        />

        <Dropdown
          label="Property Type"
          placeholder="Select Property Type"
          value={propertyType}
          data={PROPERTY_TYPES}
          onChange={setPropertyType}
        />

        {requiresBuildings && (
          <>
            <Label style={styles.label}>
              Number of Buildings
            </Label>

            <TextField
              placeholder="2"
              keyboardType="number-pad"
              value={numberOfBuildings}
              onChangeText={setNumberOfBuildings}
            />
          </>
        )}

        {requiresUnits && (
          <>
            <Label style={styles.label}>
              Number of Floors
            </Label>

            <TextField
              placeholder="4"
              keyboardType="number-pad"
              value={numberOfFloors}
              onChangeText={setNumberOfFloors}
            />

            <Label style={styles.label}>
              Number of Units
            </Label>

            <TextField
              placeholder="12"
              keyboardType="number-pad"
              value={numberOfUnits}
              onChangeText={setNumberOfUnits}
            />
          </>
        )}

        <Label style={styles.label}>
          Address
        </Label>

        <TextArea
          placeholder="Enter property address"
          value={address}
          onChangeText={setAddress}
        />

        <Button
          title={submitting ? "Saving..." : "Continue"}
          onPress={handleSave}
          disabled={!isFormValid || submitting}
          style={styles.button}
        />
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
    marginTop: 40,
  },
});