import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown as ElementDropdown } from "react-native-element-dropdown";

import FieldError from "./FieldError";

export type DropdownItem<T extends string = string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string = string> = {
  label: string;
  data: DropdownItem<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export default function Dropdown<T extends string = string>({
  label,
  data,
  value,
  onChange,
  placeholder = "Select",
  error,
  disabled = false,
}: DropdownProps<T>) {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <ElementDropdown
        style={[
          styles.dropdown,
          isFocus && styles.dropdownFocused,
          !!error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
        ]}
        disable={disabled}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        iconStyle={styles.icon}
        data={data}
        labelField="label"
        valueField="value"
        value={value}
        placeholder={placeholder}
        search={false}
        maxHeight={300}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item: DropdownItem<T>) => {
          onChange(item.value);
          setIsFocus(false);
        }}
      />

      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  dropdown: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  dropdownFocused: {
    borderColor: "#2563EB",
  },

  dropdownError: {
    borderColor: "#DC2626",
  },

  dropdownDisabled: {
    backgroundColor: "#F1F5F9",
  },

  placeholder: {
    fontSize: 16,
    color: "#94A3B8",
  },

  selectedText: {
    fontSize: 16,
    color: "#1E293B",
  },

  itemText: {
    fontSize: 16,
    color: "#1E293B",
  },

  icon: {
    width: 20,
    height: 20,
  },
});