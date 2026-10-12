import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Subtitle from "../../components/SubHeading";
import Button from "../../components/Button";
import TextArea from "../../components/TextArea";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import FieldError from "../../components/FieldError";
import StatusChip from "../../components/StatusChip";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { Broadcast, Contacts } from "../../models/Message";
import { getBroadcasts, getContacts, sendBroadcast } from "../../api/message.api";
import { getApiError } from "../../api/apiError";
import useSingleSubmit from "../../hooks/useSingleSubmit";
import { Colors } from "../../theme/colors";
import { formatMessageTime } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Broadcasts">;

const PROPERTY_SCOPE = "PROPERTY";

/**
 * Broadcasts in a property, newest first, with a composer that sends
 * to the whole property or one building.
 */
export default function BroadcastsScreen({ route }: Props) {
    const { propertyId, propertyName } = route.params;

    const [broadcasts, setBroadcasts] = useState<Broadcast[] | null>(null);
    const [contacts, setContacts] = useState<Contacts | null>(null);
    const [error, setError] = useState("");

    // "PROPERTY" or a building id
    const [audience, setAudience] = useState(PROPERTY_SCOPE);
    const [draft, setDraft] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();

    const loadBroadcasts = useCallback(async () => {
        try {
            const [list, contactInfo] = await Promise.all([
                getBroadcasts(propertyId),
                getContacts(propertyId),
            ]);

            setBroadcasts(list);
            setContacts(contactInfo);
            setError("");
        } catch (loadError) {
            setError(getApiError(loadError, "Could not load broadcasts.").message);
        }
    }, [propertyId]);

    useFocusEffect(
        useCallback(() => {
            loadBroadcasts();
        }, [loadBroadcasts])
    );

    const audienceOptions: DropdownItem[] = [
        { label: `Everyone in ${propertyName}`, value: PROPERTY_SCOPE },
        ...(contacts?.broadcastBuildings ?? []).map((building) => ({
            label: `Only ${building.buildingName}`,
            value: building.id,
        })),
    ];

    const handleSend = () => runSubmit(async () => {
        const body = draft.trim();

        if (!body) return;

        try {
            const isProperty = audience === PROPERTY_SCOPE;

            await sendBroadcast(
                propertyId,
                isProperty ? "PROPERTY" : "BUILDING",
                isProperty ? null : audience,
                body
            );

            setDraft("");
            await loadBroadcasts();
        } catch (sendError) {
            Alert.alert(
                "Broadcast Not Sent",
                getApiError(sendError, "Please try again.").message
            );
        }
    });

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Broadcasts</Title>

                <Subtitle style={styles.subtitle}>{propertyName}</Subtitle>

                <View style={styles.composer}>
                    <Dropdown
                        label="Send to"
                        value={audience}
                        data={audienceOptions}
                        onChange={setAudience}
                    />

                    <TextArea
                        placeholder="Write a message for everyone…"
                        value={draft}
                        onChangeText={setDraft}
                        maxLength={1000}
                        style={styles.textArea}
                    />

                    <Button
                        title={submitting ? "Sending..." : "Broadcast"}
                        onPress={handleSend}
                        disabled={submitting || !draft.trim()}
                        style={styles.sendButton}
                    />
                </View>

                {error ? (
                    <FieldError message={error} />
                ) : broadcasts === null ? (
                    <ActivityIndicator size="large" />
                ) : broadcasts.length === 0 ? (
                    <Text style={styles.empty}>No broadcasts yet.</Text>
                ) : (
                    broadcasts.map((broadcast) => (
                        <View key={broadcast.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sender} numberOfLines={1}>
                                    {broadcast.isMine ? "You" : broadcast.senderName}
                                    {broadcast.senderRole === "OWNER" ? " · Owner" : ""}
                                </Text>

                                <StatusChip
                                    label={
                                        broadcast.scope === "BUILDING"
                                            ? broadcast.buildingName
                                            : "Everyone"
                                    }
                                />
                            </View>

                            <Text style={styles.body}>{broadcast.body}</Text>

                            <Text style={styles.time}>
                                {formatMessageTime(broadcast.createdAt)}
                            </Text>
                        </View>
                    ))
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
        marginBottom: 20,
    },

    composer: {
        padding: 16,
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    textArea: {
        minHeight: 90,
    },

    sendButton: {
        marginTop: 14,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    card: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    sender: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.txtPrimary,
        flexShrink: 1,
        marginRight: 8,
    },

    body: {
        fontSize: 16,
        color: Colors.txtPrimary,
        lineHeight: 23,
    },

    time: {
        fontSize: 12,
        color: Colors.txtSecondary,
        marginTop: 8,
    },
});
