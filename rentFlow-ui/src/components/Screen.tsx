import React, { ReactNode } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "./AppHeader";

type ScreenProps = {
    children: ReactNode;
    title?: string;
    showHeader?: boolean;
    showBack?: boolean;
    rightComponent?: React.ReactNode;
};

export default function Screen({
    children,
    title = "",
    showHeader = false,
    showBack = false,
    rightComponent,
}: ScreenProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>

                    {showHeader && (
                        <AppHeader
                            title={title}
                            showBack={showBack}
                            rightComponent={rightComponent}
                        />
                    )}

                    {children}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    scrollContent: {
        flexGrow: 1,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
});