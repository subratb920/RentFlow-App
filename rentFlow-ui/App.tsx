import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "./src/screens/SplashScreen";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { useAuth } from "./src/context/AuthContext";
import RootNavigation from "./src/navigation/RootNavigation";
import { PropertyProvider } from "./src/context/PropertyContext";

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    // Temporary authentication flag.
    // Later this will come from AuthContext.
    const isAuthenticated = false;

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthProvider>
            <PropertyProvider>
                <RootNavigation />
            </PropertyProvider>
        </AuthProvider>
    );
}