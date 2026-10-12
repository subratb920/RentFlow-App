import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Subtitle from "../../components/SubHeading";
import Label from "../../components/Label";
import TextField from "../../components/TextField";
import FieldError from "../../components/FieldError";
import Button from "../../components/Button";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { joinWithInviteCode } from "../../api/tenant.api";
import { getApiError } from "../../api/apiError";
import useSingleSubmit from "../../hooks/useSingleSubmit";

type Props = NativeStackScreenProps<RootStackParamList, "JoinProperty">;

export default function JoinPropertyScreen({ navigation }: Props) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();

    // "RF-" plus six characters, dashes and spaces optional
    const isComplete = code.replace(/[^a-z0-9]/gi, "").length >= 6;

    const handleJoin = () => runSubmit(async () => {
        if (!isComplete) return;

        try {
            await joinWithInviteCode(code);

            Alert.alert("Welcome Home", "You can now see your property.");

            navigation.goBack();
        } catch (joinError) {
            setError(getApiError(joinError, "Could not join with this code.").message);
        }
    });

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Join with Invite Code</Title>

                <Subtitle style={styles.subtitle}>
                    Enter the code your owner shared with you.
                </Subtitle>

                <Label style={styles.label}>Invite Code</Label>

                <TextField
                    placeholder="RF-7K2Q9M"
                    value={code}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={12}
                    hasError={!!error}
                    onChangeText={(text) => {
                        setCode(text);
                        setError("");
                    }}
                />

                <FieldError message={error} />

                <Button
                    title={submitting ? "Joining..." : "Join Property"}
                    onPress={handleJoin}
                    disabled={submitting || !isComplete}
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
        marginBottom: 8,
    },

    button: {
        marginTop: 24,
    },
});
