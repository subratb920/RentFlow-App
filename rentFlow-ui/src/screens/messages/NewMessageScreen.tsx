import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Megaphone } from "lucide-react-native";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Subtitle from "../../components/SubHeading";
import Dropdown from "../../components/Dropdown";
import FieldError from "../../components/FieldError";
import Avatar from "../../components/Avatar";
import ActionCard from "../../components/ActionCard";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { BroadcastSummary, Contacts } from "../../models/Message";
import { getContacts, getInbox } from "../../api/message.api";
import { getApiError } from "../../api/apiError";
import { Colors } from "../../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "NewMessage">;

/**
 * Pick someone in the property to message, or broadcast to everyone.
 */
export default function NewMessageScreen({ navigation }: Props) {
    const [properties, setProperties] = useState<BroadcastSummary[] | null>(null);
    const [propertyId, setPropertyId] = useState("");
    const [contacts, setContacts] = useState<Contacts | null>(null);
    const [error, setError] = useState("");

    // The inbox lists every property the user belongs to
    useEffect(() => {
        getInbox()
            .then((inbox) => {
                setProperties(inbox.broadcasts);
                setPropertyId(inbox.broadcasts[0]?.propertyId ?? "");
            })
            .catch((loadError) =>
                setError(getApiError(loadError, "Could not load properties.").message)
            );
    }, []);

    useEffect(() => {
        if (!propertyId) return;

        setContacts(null);

        getContacts(propertyId)
            .then(setContacts)
            .catch((loadError) =>
                setError(getApiError(loadError, "Could not load contacts.").message)
            );
    }, [propertyId]);

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>New Message</Title>

                <Subtitle style={styles.subtitle}>
                    Message someone directly, or broadcast to everyone.
                </Subtitle>

                {error ? (
                    <FieldError message={error} />
                ) : !properties ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        {properties.length > 1 && (
                            <Dropdown
                                label="Property"
                                value={propertyId}
                                data={properties.map((property) => ({
                                    label: property.propertyName,
                                    value: property.propertyId,
                                }))}
                                onChange={setPropertyId}
                            />
                        )}

                        {!contacts ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <>
                                <ActionCard
                                    title="Broadcast"
                                    subtitle="To the whole property or one building"
                                    icon={<Megaphone size={22} color={Colors.txtPrimary} />}
                                    onPress={() =>
                                        navigation.replace("Broadcasts", {
                                            propertyId,
                                            propertyName: contacts.property.propertyName,
                                        })
                                    }
                                />

                                <Text style={styles.sectionTitle}>People</Text>

                                {contacts.contacts.length === 0 ? (
                                    <Text style={styles.empty}>
                                        No one else has joined this property yet.
                                    </Text>
                                ) : (
                                    contacts.contacts.map((contact) => (
                                        <Pressable
                                            key={contact.userId}
                                            style={({ pressed }) => [
                                                styles.row,
                                                pressed && styles.pressed,
                                            ]}
                                            onPress={() =>
                                                navigation.replace("Chat", {
                                                    propertyId,
                                                    userId: contact.userId,
                                                    name: contact.fullName,
                                                })
                                            }
                                        >
                                            <Avatar name={contact.fullName} size={42} />

                                            <View style={styles.rowText}>
                                                <Text style={styles.name}>{contact.fullName}</Text>
                                                <Text style={styles.label}>{contact.label}</Text>
                                            </View>
                                        </Pressable>
                                    ))
                                )}
                            </>
                        )}
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

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 16,
        marginBottom: 10,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        marginBottom: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    pressed: {
        opacity: 0.7,
    },

    rowText: {
        marginLeft: 12,
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtPrimary,
    },

    label: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 2,
    },
});
