import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Colors } from "../theme/colors";

type ActionCardProps = {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
};

/**
 * Large tappable card for a primary path on a screen.
 */
export default function ActionCard({
    title,
    subtitle,
    icon,
    onPress,
}: ActionCardProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.icon}>{icon}</View>

            <View style={styles.text}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <ChevronRight size={22} color={Colors.txtSecondary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    pressed: {
        opacity: 0.7,
    },

    icon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.bg,
        marginRight: 14,
    },

    text: {
        flex: 1,
    },

    title: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginBottom: 2,
    },

    subtitle: {
        fontSize: 14,
        color: Colors.txtSecondary,
        lineHeight: 20,
    },
});
