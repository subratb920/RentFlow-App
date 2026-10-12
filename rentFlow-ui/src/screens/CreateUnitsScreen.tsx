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
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Button from "../components/Button";
import FieldError from "../components/FieldError";

import { RootStackParamList } from "../navigation/navigationTypes";
import { Building } from "../models/Building";
import { Unit, getFloorLabel, getUnitDisplayName } from "../models/Unit";
import { getBuildingById } from "../api/building.api";
import { getUnitsByBuilding } from "../api/unit.api";
import { getApiError } from "../api/apiError";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CreateUnits"
>;

export default function CreateUnitsScreen({
  navigation,
  route,
}: Props) {
  const {
    propertyId,
    buildingId,
  } = route.params;

  const [building, setBuilding] = useState<Building | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError("");

      const [buildingResponse, unitsResponse] = await Promise.all([
        getBuildingById(buildingId),
        getUnitsByBuilding(buildingId),
      ]);

      setBuilding(buildingResponse);
      setUnits(unitsResponse);
    } catch (loadError) {
      console.error("Failed to load units:", loadError);

      setError(
        getApiError(loadError, "Could not load units.").message
      );
    } finally {
      setLoading(false);
    }
  };

  // Reload on focus so units saved in Unit Setup show up here
  useFocusEffect(
    useCallback(() => {
      loadUnits();
    }, [buildingId])
  );

  const configuredCount = units.filter(
    (unit) => unit.isConfigured
  ).length;

  const openBuildingSetup = () => {
    navigation.navigate("BuildingSetup", {
      propertyId,
      buildingId,
    });
  };

  const openUnitSetup = (unitId: string) => {
    navigation.navigate("UnitSetup", {
      propertyId,
      buildingId,
      unitId,
    });
  };

  return (
    <Screen>
      <View style={styles.container}>

        <Title style={styles.title}>
          Units
        </Title>

        <Subtitle style={styles.subtitle}>
          {building
            ? `${building.buildingName} · ${configuredCount} of ${units.length} configured`
            : "Tap a unit to configure it."}
        </Subtitle>

        <Pressable
          onPress={openBuildingSetup}
          hitSlop={8}
          style={styles.editLink}
        >
          <Text style={styles.editLinkText}>
            Edit building details
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <>
            <FieldError message={error} />

            <Button
              title="Try Again"
              onPress={loadUnits}
              style={styles.button}
            />
          </>
        ) : units.length === 0 ? (
          <Text style={styles.status}>
            No units yet. Set the number of units in the building
            details.
          </Text>
        ) : (
          <View style={styles.list}>
            {units.map((unit) => (
              <Pressable
                key={unit.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => openUnitSetup(unit.id)}
              >
                <Text style={styles.name}>
                  🚪 {getUnitDisplayName(unit)}
                </Text>

                <Text style={styles.status}>
                  {unit.isConfigured
                    ? `✅ ${unit.unitType}${
                        unit.floor !== null
                          ? ` · ${getFloorLabel(unit.floor)}`
                          : ""
                      }`
                    : "⚪ Not Configured"}
                </Text>
              </Pressable>
            ))}
          </View>
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
    marginBottom: 8,
    lineHeight: 24,
  },

  editLink: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },

  editLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },

  list: {
    marginTop: 10,
  },

  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  cardPressed: {
    opacity: 0.6,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  status: {
    fontSize: 14,
    color: "#6B7280",
  },


  button: {
    marginTop: 20,
  },
});
