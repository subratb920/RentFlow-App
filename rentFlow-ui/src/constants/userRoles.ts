import { UserRole } from "../models/User";
import { DropdownItem } from "../components/Dropdown";

export const USER_ROLES: DropdownItem<UserRole>[] = [
  {
    label: "Property Owner",
    value: UserRole.OWNER,
  },
  {
    label: "Tenant",
    value: UserRole.TENANT,
  },
];