import React from "react";
import { Text, TextProps } from "react-native";

import { CS } from "../theme/cs";

export default function SubHeading({
    style,
    children,
    ...props
}: TextProps) {
    return (
        <Text
            style={[CS.subTitle, style]}
            {...props}
        >
            {children}
        </Text>
    );
}