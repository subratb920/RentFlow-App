import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./navigationTypes";

import TenantHomeScreen from "../screens/tenant/TenantHomeScreen";
import JoinPropertyScreen from "../screens/tenant/JoinPropertyScreen";
import FindOwnerScreen from "../screens/tenant/FindOwnerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TenantBillsScreen from "../screens/tenant/TenantBillsScreen";
import BillDetailScreen from "../screens/tenant/BillDetailScreen";
import InboxScreen from "../screens/messages/InboxScreen";
import ChatScreen from "../screens/messages/ChatScreen";
import BroadcastsScreen from "../screens/messages/BroadcastsScreen";
import NewMessageScreen from "../screens/messages/NewMessageScreen";

const Stack =
    createNativeStackNavigator<RootStackParamList>();

/**
 * Screens available to tenant accounts.
 */
export default function TenantNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="TenantHome"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen
                name="TenantHome"
                component={TenantHomeScreen}
            />

            <Stack.Screen
                name="JoinProperty"
                component={JoinPropertyScreen}
            />

            <Stack.Screen
                name="FindOwner"
                component={FindOwnerScreen}
            />

            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Stack.Screen name="TenantBills" component={TenantBillsScreen} />
            <Stack.Screen name="BillDetail" component={BillDetailScreen} />

            <Stack.Screen name="Inbox" component={InboxScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Broadcasts" component={BroadcastsScreen} />
            <Stack.Screen name="NewMessage" component={NewMessageScreen} />
        </Stack.Navigator>
    );
}
