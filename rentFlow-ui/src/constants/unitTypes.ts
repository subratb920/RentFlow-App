import { DropdownItem } from "../components/Dropdown";

// Keep in sync with UNIT_TYPES in rentflow-api/src/models/Unit.js
export const UNIT_TYPES: DropdownItem[] = [
    { label: "Studio", value: "Studio" },
    { label: "1 RK", value: "1 RK" },
    { label: "1 BHK", value: "1 BHK" },
    { label: "2 BHK", value: "2 BHK" },
    { label: "3 BHK", value: "3 BHK" },
    { label: "4 BHK", value: "4 BHK" },
    { label: "5 BHK", value: "5 BHK" },
    { label: "Duplex", value: "Duplex" },
    { label: "Penthouse", value: "Penthouse" },
];
