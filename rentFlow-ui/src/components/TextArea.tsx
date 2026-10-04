import React from "react";
import { TextInput, TextInputProps } from "react-native";

import { CS } from "../theme/cs";
import { Colors } from "../theme/colors";

export default function TextArea({
    style,
    ...props
}: TextInputProps) {
    return (
        <TextInput
            style={[CS.ta, style]}
            multiline
            textAlignVertical="top"
            placeholderTextColor={Colors.placeholder}
            {...props}
        />
    );
}