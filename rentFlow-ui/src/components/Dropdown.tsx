import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown as ElementDropdown } from "react-native-element-dropdown";

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
};

export default function Dropdown<T extends string = string>({
  label,
  data,
  value,
  onChange,
  placeholder = "Select",
}: DropdownProps<T>) {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <ElementDropdown
        style={[
          styles.dropdown,
          isFocus && styles.dropdownFocused,
        ]}
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