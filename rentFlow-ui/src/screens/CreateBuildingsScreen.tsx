import React, { useCallback, useState } from "react";
import {
  Alert,
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

import { RootStackParamList } from "../navigation/navigationTypes";
import { Building } from "../models/Building";
import { createBuilding, getBuildingsByProperty } from "../api/building.api";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CreateBuildings"
>;

export default function CreateBuildingsScreen({
  navigation,
  route,
}: Props) {
  const { propertyId } = route.params;

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const { submitting: adding, runSubmit } = useSingleSubmit();

  const loadBuildings = async () => {
    try {
      setLoading(true);

      const response = await getBuildingsByProperty(
        propertyId
      );

      setBuildings(response);
    } catch (error) {
      console.error(
        "Failed to load buildings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Configured buildings (with units) open their units; others
  // open Building Setup first.
  const openBuilding = (building: Building) => {
    if (building.totalUnits > 0) {
      navigation.navigate("CreateUnits", {
        propertyId,
        buildingId: building.id!,
      });
      return;
    }

    navigation.navigate("BuildingSetup", {
      propertyId,
      buildingId: building.id!,
      buildingName: building.buildingName,
    });
  };

  const handleAddBuilding = () => runSubmit(async () => {
    try {
      const building = await createBuilding({
        propertyId,
        buildingName: `Building ${buildings.length + 1}`,
      });

      navigation.navigate("BuildingSetup", {
        propertyId,
        buildingId: building.id!,
        buildingName: building.buildingName,
      });
    } catch (error) {
      Alert.alert(
        "Could Not Add Building",
        getApiError(error, "Please try again.").message
      );
    }
  });

  useFocusEffect(
    useCallback(() => {
      loadBuildings();
    }, [propertyId])
  );

  return (
    <Screen>
      <View style={styles.container}>

        <Title style={styles.title}>
          Buildings
        </Title>

        <Subtitle style={styles.subtitle}>
          Tap a building to configure it.
        </Subtitle>

        {loading ? (
          <Text style={styles.status}>
            Loading buildings...
          </Text>
        ) : buildings.length === 0 ? (
          <Text style={styles.status}>
            No buildings found.
          </Text>
        ) : (
          buildings.map((building) => (
            <Pressable
              key={building.id}
              style={styles.card}
              onPress={() => openBuilding(building)}
            >
              <Text style={styles.name}>
                🏢 {building.buildingName}
              </Text>

              <Text style={styles.status}>
                {building.totalUnits > 0
                  ? "✅ Configured"
                  : "⚪ Not Configured"}
              </Text>
            </Pressable>
          ))
        )}

        <Button
          title={adding ? "Adding..." : "Add Building"}
          onPress={handleAddBuilding}
          disabled={loading || adding}
          style={styles.button}
        />

        <Button
          title="Continue"
          onPress={() =>
            navigation.navigate("Dashboard")
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
    paddingTop: 12,
    paddingBottom: 40,
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

  status: {
    fontSize: 14,
    color: "#6B7280",
  },

  button: {
    marginTop: 20,
  },
});