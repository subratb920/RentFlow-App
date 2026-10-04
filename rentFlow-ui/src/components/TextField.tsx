import React from "react";
import { TextInput, TextInputProps } from "react-native";

import { CS } from "../theme/cs";
import { Colors } from "../theme/colors";

export default function TextField({
    style,
    ...props
}: TextInputProps) {
    return (
        <TextInput
            style={[CS.tf, style]}
            placeholderTextColor={Colors.placeholder}
            {...props}
        />
    );
}