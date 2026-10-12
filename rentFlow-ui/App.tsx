import { AuthProvider } from "./src/context/AuthContext";
import RootNavigation from "./src/navigation/RootNavigation";
import { PropertyProvider } from "./src/context/PropertyContext";

export default function App() {
    return (
        <AuthProvider>
            <PropertyProvider>
                <RootNavigation />
            </PropertyProvider>
        </AuthProvider>
    );
}
