import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./navigationTypes";

import HomeScreen from "../screens/HomeScreen";
import CreatePropertyScreen from "../screens/CreatePropertyScreen";
import CreateBuildingsScreen from "../screens/CreateBuildingsScreen";
import CreateUnitsScreen from "../screens/CreateUnitsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import BuildingSetupScreen from "../screens/BuildingSetupScreen";
import UnitSetupScreen from "../screens/UnitSetupScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PropertySetupScreen from "../screens/PropertySetupScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import EditPropertyScreen from "../screens/EditPropertyScreen";
import AssignTenantScreen from "../screens/AssignTenantScreen";
import TenantRequestsScreen from "../screens/TenantRequestsScreen";
import OwnerBillsScreen from "../screens/OwnerBillsScreen";
import AddBillScreen from "../screens/AddBillScreen";
import PaymentSettingsScreen from "../screens/PaymentSettingsScreen";
import InboxScreen from "../screens/messages/InboxScreen";
import ChatScreen from "../screens/messages/ChatScreen";
import BroadcastsScreen from "../screens/messages/BroadcastsScreen";
import NewMessageScreen from "../screens/messages/NewMessageScreen";

const Stack =
    createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >

            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />

            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Stack.Screen
                name="CreateProperty"
                component={CreatePropertyScreen}
            />

            <Stack.Screen
                name="PropertySetup"
                component={PropertySetupScreen}
            />

            <Stack.Screen
                name="CreateBuildings"
                component={CreateBuildingsScreen}
            />

            <Stack.Screen
                name="BuildingSetup"
                component={BuildingSetupScreen}
            />

            <Stack.Screen
                name="CreateUnits"
                component={CreateUnitsScreen}
            />

            <Stack.Screen
                name="UnitSetup"
                component={UnitSetupScreen}
            />

            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
            />

            <Stack.Screen
                name="PropertyDetail"
                component={PropertyDetailScreen}
            />

            <Stack.Screen
                name="EditProperty"
                component={EditPropertyScreen}
            />

            <Stack.Screen
                name="AssignTenant"
                component={AssignTenantScreen}
            />

            <Stack.Screen
                name="TenantRequests"
                component={TenantRequestsScreen}
            />

            <Stack.Screen name="OwnerBills" component={OwnerBillsScreen} />
            <Stack.Screen name="AddBill" component={AddBillScreen} />
            <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />

            <Stack.Screen name="Inbox" component={InboxScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Broadcasts" component={BroadcastsScreen} />
            <Stack.Screen name="NewMessage" component={NewMessageScreen} />

        </Stack.Navigator>
    );
}