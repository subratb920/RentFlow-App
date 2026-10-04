import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import BackButton from "../components/BackButton";
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
import { Property } from "../models/Property";
import { createProperty } from "../api/property.api";
import { useProperty } from "../context/PropertyContext";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CreateProperty"
>;

export default function CreatePropertyScreen({
  navigation,
}: Props) {
  const [propertyName, setPropertyName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [numberOfBuildings, setNumberOfBuildings] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [address, setAddress] = useState("");

  const selectedPropertyType = PROPERTY_TYPES.find(
    (type) => type.value === propertyType
  );

  const nextStep = selectedPropertyType?.nextStep;

  const { addProperty, selectedProperty, setSelectedProperty } = useProperty();

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
      ? [Number(numberOfUnits)]
      : []),
  ]);

  const handleSave = async () => {
    const property: Property = {
      propertyName: propertyName.trim(),
      propertyType,
      address: address.trim(),

      totalBuildings: requiresBuildings
        ? Number(numberOfBuildings)
        : 1,

      totalUnits: requiresUnits
        ? Number(numberOfUnits)
        : 0,

      buildingIds: [],
    };

    console.log("Property:", property);

    try {
      const createdProperty = await createProperty(property);

      console.log(
    "Created Property Response:",
    JSON.stringify(createdProperty, null, 2)
);

      addProperty(createdProperty);
      setSelectedProperty(createdProperty);

      console.log("Created Property:", createdProperty);



      switch (nextStep) {
        case "createBuildings":
          navigation.navigate("CreateBuildings", {
            propertyId: createdProperty.id,
            totalBuildings: createdProperty.totalBuildings,
            currentBuilding: 1,
          });
          break;

        case "createUnits":
          navigation.navigate("CreateUnits", {
            propertyId,
            buildingId: "", // We'll need to get the buildingId from the created building later
            totalUnits: property.totalUnits,
          });
          break;

        case "createOfficeUnits":
          navigation.navigate("CreateOfficeUnits");
          break;

        default:
          navigation.navigate("Dashboard");
      }

      // Later we'll use:
      // const propertyId = createdProperty.id;
    } catch (error) {
      console.error("Create Property Failed:", error);
      return;
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <BackButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

        <Title style={styles.title}>
          Add Property
        </Title>

        <Subtitle style={styles.subtitle}>
          Create a property to add buildings, flats,
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
          title="Continue"
          onPress={handleSave}
          disabled={!isFormValid}
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

  button: {
    marginTop: 40,
  },
});