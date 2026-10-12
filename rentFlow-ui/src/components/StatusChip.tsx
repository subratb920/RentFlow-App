import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: "#DCFCE7", fg: "#166534" },
    warning: { bg: "#FEF3C7", fg: "#92400E" },
    danger: { bg: "#FEE2E2", fg: "#991B1B" },
    neutral: { bg: "#F1F5F9", fg: "#334155" },
};

type StatusChipProps = {
    label: string;
    tone?: Tone;
};

export default function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
    const colors = TONES[tone];

    return (
        <View style={[styles.chip, { backgroundColor: colors.bg }]}>
            <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },

    text: {
        fontSize: 12,
        fontWeight: "700",
    },
});
