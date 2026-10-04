import React from "react";
import { NavigationContainer } from "@react-navigation/native";
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

const Stack =
    createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        // <NavigationContainer>
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

            {/*
                <Stack.Screen
                    name="OfficeUnits"
                    component={CreateOfficeUnitsScreen}
                />
                */}

        </Stack.Navigator>
        // </NavigationContainer>
    );
}