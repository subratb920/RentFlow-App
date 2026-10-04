import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./navigationTypes";

import AuthScreen from "../screens/AuthScreen";

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
        </Stack.Navigator>
    );
}