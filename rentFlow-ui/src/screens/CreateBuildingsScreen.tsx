import React, { useCallback, useState } from "react";
import {
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
import { Building } from "../models/Building";
import { getBuildingsByProperty } from "../api/building.api";

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

  const loadBuildings = async () => {
    try {
      setLoading(true);

      const response = await getBuildingsByProperty(
        propertyId
      );

      console.log("Buildings:", response);

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

  useFocusEffect(
    useCallback(() => {
      loadBuildings();
    }, [propertyId])
  );

  return (
    <Screen>
      <View style={styles.container}>
        <BackButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

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
              onPress={() =>
                navigation.navigate("BuildingSetup", {
                  propertyId,
                  buildingId: building.id!,
                  buildingName:
                    building.buildingName,
                })
              }
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

  status: {
    fontSize: 14,
    color: "#6B7280",
  },

  button: {
    marginTop: 20,
  },
});