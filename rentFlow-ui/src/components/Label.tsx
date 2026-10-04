import React from "react";
import { Text, TextProps } from "react-native";

import { CS } from "../theme/cs";

export default function Label({
    style,
    children,
    ...props
}: TextProps) {
    return (
        <Text
            style={[CS.lbl, style]}
            {...props}
        >
            {children}
        </Text>
    );
}