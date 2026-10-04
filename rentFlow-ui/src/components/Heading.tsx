import React from "react";
import { Text, TextProps } from "react-native";

import { CS } from "../theme/cs";

export default function Heading({
    style,
    children,
    ...props
}: TextProps) {
    return (
        <Text
            style={[CS.title, style]}
            {...props}
        >
            {children}
        </Text>
    );
}