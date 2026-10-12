import { StyleSheet } from "react-native";

import { Colors } from "./colors";
import { Typography } from "./typography";
import { Spacing } from "./spacing";

export const CS = StyleSheet.create({

    scr: {
        flex: 1,
        backgroundColor: Colors.bg,
    },

    lbl: {
        ...Typography.label,
        color: Colors.txtPrimary,
    },

    title: {
        ...Typography.title,
        color: Colors.txtPrimary,
    },

    subTitle: {
        ...Typography.subTitle,
        color: Colors.txtSecondary,
    },

    tf: {
        backgroundColor: Colors.white,

        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,

        paddingHorizontal: 16,
        paddingVertical: 16,

        color: Colors.txtPrimary,
        fontSize: 16,
    },

    // Field with a validation error
    fieldErr: {
        borderColor: Colors.danger,
    },

    errTxt: {
        color: Colors.danger,
        fontSize: 14,
        marginTop: 6,
    },

    ta: {
        backgroundColor: Colors.white,

        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,

        paddingHorizontal: 16,
        paddingVertical: 16,

        color: Colors.txtPrimary,
        fontSize: 16,

        minHeight: 110,
    },

    btn: {
        backgroundColor: Colors.primary,

        borderRadius: 12,

        paddingVertical: 18,

        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },

    btnDisable: {
        backgroundColor: Colors.disabled,

        elevation: 0,
        shadowOpacity: 0,
    },

    btnTxt: {
        ...Typography.btn,
        color: Colors.white,
    },


    dropdown: {
        backgroundColor: Colors.white,

        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,

        height: 56,
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    dropdownPlaceholder: {
        color: Colors.txtSecondary,
        fontSize: 16,
    },

    dropdownSelectedText: {
        color: Colors.txtPrimary,
        fontSize: 16,
    },

    dropdownIcon: {
        width: 20,
        height: 20,
    },

    listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
},

listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
},

listItemText: {
    ...Typography.body,
    color: Colors.txtPrimary,
    marginLeft: Spacing.md,
},

card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
},
});