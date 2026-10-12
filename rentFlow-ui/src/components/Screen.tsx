import React, { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "./AppHeader";
import BackButton from "./BackButton";

type ScreenProps = {
    children: ReactNode;
    title?: string;
    showHeader?: boolean;
    // Defaults to showing whenever there is a screen to go back to
    showBack?: boolean;
    rightComponent?: React.ReactNode;
};

export default function Screen({
    children,
    title = "",
    showHeader = false,
    showBack,
    rightComponent,
}: ScreenProps) {
    const navigation = useNavigation();
    const canShowBack = showBack ?? navigation.canGoBack();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Fixed above the scroll area so Back is always reachable */}
            {showHeader ? (
                <View style={styles.topBar}>
                    <AppHeader
                        title={title}
                        showBack={canShowBack}
                        rightComponent={rightComponent}
                    />
                </View>
            ) : (
                canShowBack && (
                    <View style={styles.topBar}>
                        <BackButton />
                    </View>
                )
            )}

            {/* Keeps focused inputs and action buttons above the keyboard.
                "padding" on both platforms: Android runs edge-to-edge, so
                the window does not resize for the keyboard by itself. */}
            <KeyboardAvoidingView
                style={styles.safeArea}
                behavior="padding"
            >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {children}
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    topBar: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 4,
    },

    scrollContent: {
        flexGrow: 1,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
});
