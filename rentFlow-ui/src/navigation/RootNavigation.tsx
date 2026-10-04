import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "../screens/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";

import { useAuth } from "../context/AuthContext";

export default function RootNavigation() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <AppNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}