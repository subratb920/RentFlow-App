import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

type AvatarProps = {
    name?: string;
    size?: number;
    onPress?: () => void;
};

export default function Avatar({
    name = "",
    size = 40,
    onPress,
}: AvatarProps) {

    const initials = name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        {
                            fontSize: size * 0.4,
                        },
                    ]}
                >
                    {initials || "U"}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },

    text: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
});