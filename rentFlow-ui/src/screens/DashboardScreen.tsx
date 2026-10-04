import React from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Dashboard"
>;

export default function DashboardScreen({
  navigation,
}: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <Title style={styles.title}>
          Dashboard
        </Title>

        <Subtitle style={styles.subtitle}>
          🎉 Property setup completed successfully.
        </Subtitle>

        <Button
          title="Add Another Property"
          onPress={() =>
            navigation.navigate("CreateProperty")
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
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },

  button: {
    marginTop: 20,
  },
});