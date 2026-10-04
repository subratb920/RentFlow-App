import React from "react";
import {
    Pressable,
    Text,
    StyleProp,
    ViewStyle,
} from "react-native";

import { CS } from "../theme/cs";

type BackButtonProps = {
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export default function BackButton({
    onPress,
    style,
}: BackButtonProps) {
    return (
        <Pressable
            style={[CS.backBtn, style]}
            onPress={onPress}
        >
            <Text style={CS.backBtnTxt}>
                ← Back
            </Text>
        </Pressable>
    );
}