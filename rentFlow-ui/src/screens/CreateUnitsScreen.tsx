import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import BackButton from "../components/BackButton";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";

import { RootStackParamList } from "../navigation/navigationTypes";

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
    totalUnits,
  } = route.params;

  const units = Array.from(
    { length: totalUnits },
    (_, index) => ({
      id: index + 1,
      name: `Unit ${index + 1}`,
      configured: false,
    })
  );

  return (
    <Screen>
      <View style={styles.container}>
        <BackButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

        <Title style={styles.title}>
          Units
        </Title>

        <Subtitle style={styles.subtitle}>
          Tap a unit to configure it.
        </Subtitle>

        <View style={styles.list}>
          {units.map((unit) => (
            <Pressable
              key={unit.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("UnitSetup", {
                  propertyId,
                  buildingId,
                  unitId: unit.id,
                  unitName: unit.name,
                })
              }
            >
              <Text style={styles.name}>
                🚪 {unit.name}
              </Text>

              <Text style={styles.status}>
                {unit.configured
                  ? "✅ Configured"
                  : "⚪ Not Configured"}
              </Text>
            </Pressable>
          ))}
        </View>
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

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  status: {
    fontSize: 14,
    color: "#6B7280",
  },
});