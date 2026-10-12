import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useLiveRefresh from "../hooks/useLiveRefresh";
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
import { getOwnerRequests } from "../api/tenancy.api";
import { getInbox } from "../api/message.api";
import ActionCard from "../components/ActionCard";
import { MessagesSquare } from "lucide-react-native";
import { Property } from "../models/Property";
import Button from "../components/Button";
import { Colors } from "../theme/colors";

// Shown for figures whose modules (tenants, rent, utilities)
// are not built yet
const NOT_AVAILABLE = "—";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export default function HomeScreen({
  navigation,
}: Props) {

  const { user } = useAuth();

  // null while the first load is in progress
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Live: new access requests and messages show up while open
  useLiveRefresh(async () => {
    try {
      const [propertyList, requests, inbox] = await Promise.all([
        getProperties(),
        getOwnerRequests(),
        getInbox(),
      ]);

      setProperties(propertyList);
      setPendingRequests(requests.length);
      setUnreadMessages(inbox.totalUnread);
    } catch (error) {
      console.error(error);
    }
  }, 10000);

  const hasProperties = !!properties && properties.length > 0;

  const totalBuildings = (properties ?? []).reduce(
    (sum, property) => sum + property.totalBuildings,
    0
  );

  const totalUnits = (properties ?? []).reduce(
    (sum, property) => sum + property.totalUnits,
    0
  );

  const propertyCount = properties ? properties.length : NOT_AVAILABLE;

  const assignedTenants = properties
    ? properties.reduce((sum, property) => sum + (property.tenantCount ?? 0), 0)
    : NOT_AVAILABLE;

  const handleCardPress = (callback?: () => void) => {
    // Ignore taps until we know whether properties exist
    if (properties === null) return;

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

        {properties !== null && !hasProperties && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No properties yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first property to start setting up
              buildings and units.
            </Text>

            <Button
              title="Add Property"
              onPress={() => navigation.navigate("CreateProperty")}
              style={styles.emptyButton}
            />
          </View>
        )}

        {hasProperties && (
          <ActionCard
            title={unreadMessages > 0 ? `Messages · ${unreadMessages} new` : "Messages"}
            subtitle="Tenant messages and broadcasts"
            icon={<MessagesSquare size={22} color={Colors.txtPrimary} />}
            onPress={() => navigation.navigate("Inbox")}
          />
        )}

        <HomeCard
          name="dashboard"
          title="Dashboard"
          onPress={() => handleCardPress(() => navigation.navigate("Dashboard"))}
        >
          <SummaryRow label="Properties" value={propertyCount} />
          <SummaryRow label="Assigned Tenants" value={assignedTenants} />
          <SummaryRow label="Pending Rent" value={NOT_AVAILABLE} />
          <SummaryRow label="Utility Bills" value={NOT_AVAILABLE} />
        </HomeCard>

        <HomeCard
          name="properties"
          title="Properties"
          onPress={() => handleCardPress(() => navigation.navigate("PropertySetup"))}
        >
          <SummaryRow label="Total Properties" value={propertyCount} />
          <SummaryRow label="Buildings" value={properties ? totalBuildings : NOT_AVAILABLE} />
          <SummaryRow label="Total Units" value={properties ? totalUnits : NOT_AVAILABLE} />
          <SummaryRow label="Occupied" value={NOT_AVAILABLE} />
        </HomeCard>

        <HomeCard
          name="tenants"
          title="Tenants"
          onPress={() => handleCardPress(() => navigation.navigate("TenantRequests"))}
        >
          <SummaryRow
            label="Pending Requests"
            value={pendingRequests ?? NOT_AVAILABLE}
          />
          <SummaryRow label="Assigned Tenants" value={assignedTenants} />
          <SummaryRow label="Vacant Units" value={NOT_AVAILABLE} />
          <SummaryRow label="Lease Expiring" value={NOT_AVAILABLE} />
        </HomeCard>

        <HomeCard
          name="rent"
          title="Rent"
          onPress={() => handleCardPress()}
        >
          <SummaryRow label="Rent Collected" value={NOT_AVAILABLE} />
          <SummaryRow label="Pending Rent" value={NOT_AVAILABLE} />
          <SummaryRow label="Overdue" value={NOT_AVAILABLE} />
          <SummaryRow label="Collection Rate" value={NOT_AVAILABLE} />
        </HomeCard>

        <HomeCard
          name="utilities"
          title="Utilities"
          onPress={() => handleCardPress()}
        >
          <SummaryRow label="Pending Bills" value={NOT_AVAILABLE} />
          <SummaryRow label="Paid Bills" value={NOT_AVAILABLE} />
          <SummaryRow label="This Month" value={NOT_AVAILABLE} />
          <SummaryRow label="Due Today" value={NOT_AVAILABLE} />
        </HomeCard>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.txtPrimary,
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 15,
    color: Colors.txtSecondary,
    lineHeight: 22,
  },

  emptyButton: {
    marginTop: 16,
  },
});
