import React from "react";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

import { CS } from "../theme/cs";

type ButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default function Button({
    title,
    onPress,
    disabled = false,
    style,
}: ButtonProps) {
    return (
        <Pressable
            style={[
                CS.btn,
                disabled && CS.btnDisable,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={CS.btnTxt}>
                {title}
            </Text>
        </Pressable>
    );
}