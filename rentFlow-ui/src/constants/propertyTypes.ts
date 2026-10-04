export const PROPERTY_TYPES = [
    {
        label: "Residential Complex",
        value: "Residential Complex",
        nextStep: "createBuildings",
        managementType: "complex",
    },
    {
        label: "Residential Building",
        value: "Residential Building",
        nextStep: "createUnits",
        managementType: "building",
    },
    {
        label: "Independent House",
        value: "Independent House",
        nextStep: "dashboard",
        managementType: "building",
    },
    {
        label: "Villa",
        value: "Villa",
        nextStep: "dashboard",
        managementType: "building",
    },
    {
        label: "Commercial Building",
        value: "Commercial Building",
        nextStep: "createUnits",
        managementType: "building",
    },
    {
        label: "Office Building",
        value: "Office Building",
        nextStep: "createOfficeUnits",
        managementType: "building",
    },
    {
        label: "Industrial Property",
        value: "Industrial Property",
        nextStep: "dashboard",
        managementType: "building",
    },
    {
        label: "Hostel / PG",
        value: "Hostel / PG",
        nextStep: "createUnits",
        managementType: "building",
    },
    {
        label: "Mixed Use",
        value: "Mixed Use",
        nextStep: "dashboard",
        managementType: "complex",
    },
    {
        label: "Other",
        value: "Other",
        nextStep: "dashboard",
        managementType: "building",
    },
];