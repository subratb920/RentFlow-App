import React from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../theme/colors";

type BackButtonProps = {
    // Defaults to going back one screen
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
};

export default function BackButton({
    onPress,
    style,
}: BackButtonProps) {
    const navigation = useNavigation();

    return (
        <Pressable
            onPress={onPress ?? (() => navigation.goBack())}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                style,
            ]}
        >
            <ChevronLeft
                size={24}
                color={Colors.txtPrimary}
                strokeWidth={2.25}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: Colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,

        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    pressed: {
        backgroundColor: Colors.bg,
        transform: [{ scale: 0.94 }],
    },
});
