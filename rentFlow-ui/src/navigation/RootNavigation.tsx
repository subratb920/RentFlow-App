import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "../screens/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import TenantNavigator from "./TenantNavigator";
import { UserRole } from "../models/User";

import { useAuth } from "../context/AuthContext";

export default function RootNavigation() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            {!isAuthenticated ? (
                <AuthNavigator />
            ) : user?.role === UserRole.TENANT ? (
                <TenantNavigator />
            ) : (
                <AppNavigator />
            )}
        </NavigationContainer>
    );
}