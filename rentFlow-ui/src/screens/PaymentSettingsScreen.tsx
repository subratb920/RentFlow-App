import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";
import Label from "../components/Label";
import TextField from "../components/TextField";
import FieldError from "../components/FieldError";
import Button from "../components/Button";

import { RootStackParamList } from "../navigation/navigationTypes";
import { getPaymentSettings, updatePaymentSettings } from "../api/bill.api";
import { getApiError } from "../api/apiError";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { Colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentSettings">;

/**
 * Owner's UPI ID that tenants pay rent to.
 */
export default function PaymentSettingsScreen({ navigation }: Props) {
    const [upiId, setUpiId] = useState<string | null>(null);
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [error, setError] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();

    useEffect(() => {
        getPaymentSettings()
            .then((settings) => {
                setUpiId(settings.upiId);
                setRazorpayEnabled(settings.razorpayEnabled);
            })
            .catch((loadError) =>
                setError(getApiError(loadError, "Could not load settings.").message)
            );
    }, []);

    const handleSave = () => runSubmit(async () => {
        try {
            await updatePaymentSettings((upiId ?? "").trim());

            Alert.alert("Saved", "Tenants can now pay rent to this UPI ID.");

            navigation.goBack();
        } catch (saveError) {
            setError(getApiError(saveError, "Could not save settings.").message);
        }
    });

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Payment Settings</Title>

                <Subtitle style={styles.subtitle}>
                    Tenants pay rent and bills to this UPI ID from their UPI app.
                </Subtitle>

                {upiId === null && !error ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        <Label style={styles.label}>UPI ID</Label>

                        <TextField
                            placeholder="yourname@okaxis"
                            value={upiId ?? ""}
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasError={!!error}
                            onChangeText={(text) => {
                                setUpiId(text);
                                setError("");
                            }}
                        />

                        <FieldError message={error} />

                        <Text style={styles.note}>
                            Online card/netbanking payments via Razorpay are{" "}
                            {razorpayEnabled ? "enabled" : "not enabled yet"}.
                        </Text>

                        <Button
                            title={submitting ? "Saving..." : "Save"}
                            onPress={handleSave}
                            disabled={submitting}
                            style={styles.button}
                        />
                    </>
                )}
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
        marginBottom: 8,
    },

    note: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 16,
        lineHeight: 20,
    },

    button: {
        marginTop: 24,
    },
});
