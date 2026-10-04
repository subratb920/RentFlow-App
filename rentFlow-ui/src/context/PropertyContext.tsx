import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

import { Property } from "../models/Property";

export interface PropertyContextType {
    properties: Property[];
    selectedProperty: Property | null;

    setSelectedProperty: (
        property: Property | null
    ) => void;

    refreshProperties: () => Promise<void>;

    addProperty: (property: Property) => void;

    updateProperty: (
        updatedProperty: Property
    ) => void;

    clearSelectedProperty: () => void;
}

const PropertyContext = createContext<
    PropertyContextType | undefined
>(undefined);

interface PropertyProviderProps {
    children: ReactNode;
}

export function PropertyProvider({
    children,
}: PropertyProviderProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] =
        useState<Property | null>(null);

    const refreshProperties = async () => {
        // Will implement when we connect to the API
    };

    const addProperty = (property: Property) => {
        setProperties((previousProperties) => [
            ...previousProperties,
            property,
        ]);
    };

    const updateProperty = (
        updatedProperty: Property
    ) => {
        setProperties((previousProperties) =>
            previousProperties.map(
                (property) =>
                    property.id === updatedProperty.id
                        ? updatedProperty
                        : property
            )
        );

        if (
            selectedProperty?.id ===
            updatedProperty.id
        ) {
            setSelectedProperty(updatedProperty);
        }
    };

    const clearSelectedProperty = () => {
        setSelectedProperty(null);
    };

    return (
        <PropertyContext.Provider
            value={{
                properties,
                selectedProperty,
                setSelectedProperty,
                refreshProperties,
                addProperty,
                updateProperty,
                clearSelectedProperty,
            }}
        >
            {children}
        </PropertyContext.Provider>
    );
}

export function useProperty() {
    const context = useContext(PropertyContext);

    if (!context) {
        throw new Error(
            "useProperty must be used within a PropertyProvider"
        );
    }

    return context;
}