import React from "react";
import {
    Text,
    View,
} from "react-native";

import { HomeStyles } from "../theme/home.styles";

interface SummaryRowProps {
    label: string;
    value: string | number;
}

export default function SummaryRow({
    label,
    value,
}: SummaryRowProps) {
    return (
        <View style={HomeStyles.summaryRow}>
            <Text style={HomeStyles.summaryLabel}>
                {label}
            </Text>

            <Text style={HomeStyles.summaryValue}>
                {value}
            </Text>
        </View>
    );
}