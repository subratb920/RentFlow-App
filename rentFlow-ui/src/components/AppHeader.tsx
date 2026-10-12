import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import BackButton from "./BackButton";

import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";

type AppHeaderProps = {
    title: string;
    showBack?: boolean;
    rightComponent?: React.ReactNode;
};

export default function AppHeader({
    title,
    showBack = false,
    rightComponent,
}: AppHeaderProps) {

    return (
        <View style={styles.container}>

            <View style={styles.side}>

                {showBack && <BackButton />}

            </View>

            <View style={styles.center}>
                <Text
                    numberOfLines={1}
                    style={styles.title}
                >
                    {title}
                </Text>
            </View>

            <View style={styles.side}>
                {rightComponent}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
    },

    side: {
        width: 48,
        justifyContent: "center",
        alignItems: "center",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        ...Typography.title,
        color: Colors.txtPrimary,
    },

});