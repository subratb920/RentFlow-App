import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";
import { Spacing } from "../theme/spacing";

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

    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            <View style={styles.side}>

                {showBack && (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        hitSlop={10}
                    >
                        <ChevronLeft
                            size={26}
                            color={Colors.txtPrimary}
                        />
                    </TouchableOpacity>
                )}

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
        marginBottom: Spacing.lg,
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