import React from "react";
import { TextInput, TextInputProps } from "react-native";

import { CS } from "../theme/cs";
import { Colors } from "../theme/colors";

type TextFieldProps = TextInputProps & {
    hasError?: boolean;
};

export default function TextField({
    style,
    hasError = false,
    ...props
}: TextFieldProps) {
    return (
        <TextInput
            style={[CS.tf, hasError && CS.fieldErr, style]}
            placeholderTextColor={Colors.placeholder}
            {...props}
        />
    );
}
