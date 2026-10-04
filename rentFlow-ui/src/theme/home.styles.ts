import { StyleSheet } from "react-native";

import { Colors } from "./colors";
import { Spacing } from "./spacing";
import { Typography } from "./typography";

export const HomeCardThemes = {
    dashboard: {
        backgroundColor: "#F8FAFC",
        borderColor: "#D9E5F2",
        titleColor: "#2F5D86",
    },

    properties: {
        backgroundColor: "#FCFAF5",
        borderColor: "#E9DFC6",
        titleColor: "#8A6A1F",
    },

    tenants: {
        backgroundColor: "#F6FBF8",
        borderColor: "#D8E8DE",
        titleColor: "#397154",
    },

    rent: {
        backgroundColor: "#FCF8F8",
        borderColor: "#ECDDDD",
        titleColor: "#8A5353",
    },

    utilities: {
        backgroundColor: "#F8F8FD",
        borderColor: "#E0DDF5",
        titleColor: "#625AA3",
    },
};

export const HomeStyles = StyleSheet.create({

    container: {
        paddingVertical: Spacing.lg,
    },

    greeting: {
        ...Typography.label,
        color: Colors.txtSecondary,
        marginBottom: Spacing.xs,
    },

    userName: {
        marginBottom: Spacing.xl,
    },

    card: {
        borderWidth: 1,
        borderRadius: 20,

        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,

        marginBottom: Spacing.lg,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.05,
        shadowRadius: 14,

        elevation: 3,
    },

    cardPressed: {
        transform: [
            {
                scale: 0.985,
            },
        ],
    },

    cardTitle: {
        marginBottom: Spacing.md,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginBottom: Spacing.md,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingVertical: Spacing.sm,
    },

    summaryLabel: {
        ...Typography.body,
        color: Colors.txtSecondary,
    },

    summaryValue: {
        ...Typography.body,
        color: Colors.txtPrimary,
        fontWeight: "700",
    },

});