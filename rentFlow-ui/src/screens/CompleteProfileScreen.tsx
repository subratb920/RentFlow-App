import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import FieldError from "../components/FieldError";
import Button from "../components/Button";

import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/navigationTypes";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { Colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "CompleteProfile">;

/**
 * Google doesn't share phone numbers, so new Google users add one
 * here before their account is created.
 */
export default function CompleteProfileScreen({ navigation, route }: Props) {
    const { signupToken, email } = route.params;
    const { completeGoogleSignup } = useAuth();

    const [fullName, setFullName] = useState(route.params.fullName);
    const [phone, setPhone] = useState("");
    const [serverError, setServerError] = useState<{ field?: string; message: string } | null>(null);

    const { submitting, runSubmit } = useSingleSubmit();

    const fieldError = (field: string) =>
        serverError?.field === field ? serverError.message : undefined;

    const isValid = !!fullName.trim() && !!phone.trim();

    const handleSubmit = () => runSubmit(async () => {
        if (!isValid) return;

        try {
            // On success the app switches to the signed-in screens
            await completeGoogleSignup({
                signupToken,
                fullName: fullName.trim(),
                phone: phone.trim(),
            });
        } catch (error) {
            const apiError = getApiError(error, "Could not create your account.");

            if (apiError.field) {
                setServerError(apiError);
                return;
            }

            Alert.alert("Sign Up Failed", apiError.message, [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        }
    });

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Complete Your Profile</Title>

                <Subtitle style={styles.subtitle}>
                    One last step. Add your phone number so owners and tenants
                    can find you.
                </Subtitle>

                <Label style={styles.label}>Google Account</Label>
                <Text style={styles.email}>{email}</Text>

                <Label style={styles.label}>Full Name</Label>
                <TextField
                    placeholder="John Doe"
                    value={fullName}
                    maxLength={100}
                    hasError={!!fieldError("fullName")}
                    onChangeText={(text) => {
                        setFullName(text);
                        setServerError(null);
                    }}
                />
                <FieldError message={fieldError("fullName")} />

                <Label style={styles.label}>Phone Number</Label>
                <TextField
                    placeholder="98765 43210"
                    value={phone}
                    keyboardType="phone-pad"
                    hasError={!!fieldError("phone")}
                    onChangeText={(text) => {
                        setPhone(text);
                        setServerError(null);
                    }}
                />
                <FieldError message={fieldError("phone")} />

                <Button
                    title={submitting ? "Creating account..." : "Continue"}
                    onPress={handleSubmit}
                    disabled={submitting || !isValid}
                    style={styles.button}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
        paddingBottom: 40,
    },

    title: {
        marginBottom: 8,
    },

    subtitle: {
        marginBottom: 24,
        lineHeight: 24,
    },

    label: {
        marginTop: 4,
        marginBottom: 8,
    },

    email: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtPrimary,
        marginBottom: 16,
    },

    button: {
        marginTop: 28,
    },
});
