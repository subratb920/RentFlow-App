import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./navigationTypes";

import AuthScreen from "../screens/AuthScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";

const Stack =
    createNativeStackNavigator<RootStackParamList>();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade",
            }}
        >
            <Stack.Screen
                name="Auth"
                component={AuthScreen}
            />

            <Stack.Screen
                name="CompleteProfile"
                component={CompleteProfileScreen}
                options={{ animation: "slide_from_right" }}
            />
        </Stack.Navigator>
    );
}