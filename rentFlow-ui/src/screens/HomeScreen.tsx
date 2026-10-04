import React, { useState } from "react";
import { Alert, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import Avatar from "../components/Avatar";
import Heading from "../components/Heading";
import HomeCard from "../components/HomeCard";
import Screen from "../components/Screen";
import SubHeading from "../components/SubHeading";
import SummaryRow from "../components/SummaryRow";

import { useAuth } from "../context/AuthContext";

import { RootStackParamList } from "../navigation/navigationTypes";

import { HomeStyles } from "../theme/home.styles";
import { getProperties } from "../api/property.api";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen({
  navigation,
}: Props) {

  const { user } = useAuth();

  const [hasProperties, setHasProperties] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      async function loadProperties() {
        try {
          const properties = await getProperties();
          setHasProperties(properties.length > 0);
        } catch (error) {
          console.error(error);
        }
      }

      loadProperties();
    }, [])
  );

  const handleCardPress = (callback?: () => void) => {

    if (!hasProperties) {

      Alert.alert(
        "No Property Found",
        "Looks like you haven't added a property yet. We'll take you to the property creation screen to get started.",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate("CreateProperty"),
          },
        ],
      );

      return;
    }

    callback?.();
  };

  return (
    <Screen
      showHeader
      title="Home"
      rightComponent={
        <Avatar
          name={user?.fullName}
          onPress={() =>
            navigation.navigate("Profile")
          }
        />
      }
    >
      <View style={HomeStyles.container}>

        <Heading style={HomeStyles.greeting}>
          Welcome back,
        </Heading>

        <SubHeading style={HomeStyles.userName}>
          {user?.fullName}
        </SubHeading>

        <HomeCard
          name="dashboard"
          title="Dashboard"
          onPress={() => handleCardPress(() => navigation.navigate("Dashboard"))}
        >
          <SummaryRow label="Properties" value={2} />
          <SummaryRow label="Active Tenants" value={18} />
          <SummaryRow label="Pending Rent" value="₹45,000" />
          <SummaryRow label="Utility Bills" value="5 Pending" />
        </HomeCard>

        <HomeCard
          name="properties"
          title="Properties"
          onPress={() => handleCardPress(() => navigation.navigate("PropertySetup"))}
        >
          <SummaryRow label="Total Properties" value={2} />
          <SummaryRow label="Buildings" value={4} />
          <SummaryRow label="Total Units" value={38} />
          <SummaryRow label="Occupied" value="95%" />
        </HomeCard>

        <HomeCard
          name="tenants"
          title="Tenants"
          onPress={() => handleCardPress(() => navigation.navigate("Dashboard"))}
        >
          <SummaryRow label="Active Tenants" value={18} />
          <SummaryRow label="Vacant Units" value={2} />
          <SummaryRow label="New This Month" value={3} />
          <SummaryRow label="Lease Expiring" value={2} />
        </HomeCard>

        <HomeCard
          name="rent"
          title="Rent"
          onPress={() => handleCardPress()}
        >
          <SummaryRow label="Rent Collected" value="₹2.75 L" />
          <SummaryRow label="Pending Rent" value="₹45,000" />
          <SummaryRow label="Overdue" value="₹18,000" />
          <SummaryRow label="Collection Rate" value="94%" />
        </HomeCard>

        <HomeCard
          name="utilities"
          title="Utilities"
          onPress={() => handleCardPress()}
        >
          <SummaryRow label="Pending Bills" value={5} />
          <SummaryRow label="Paid Bills" value={37} />
          <SummaryRow label="This Month" value="₹18,240" />
          <SummaryRow label="Due Today" value={1} />
        </HomeCard>

      </View>
    </Screen>
  );
}