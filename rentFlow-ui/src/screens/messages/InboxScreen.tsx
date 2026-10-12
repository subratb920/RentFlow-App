import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import { Megaphone } from "lucide-react-native";

import Screen from "../../components/Screen";
import Title from "../../components/Heading";
import Button from "../../components/Button";
import FieldError from "../../components/FieldError";
import Avatar from "../../components/Avatar";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { Inbox } from "../../models/Message";
import { getInbox } from "../../api/message.api";
import { getApiError } from "../../api/apiError";
import { Colors } from "../../theme/colors";
import { formatMessageTime } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Inbox">;

/**
 * Broadcasts per property and direct conversations, with unread counts.
 */
export default function InboxScreen({ navigation }: Props) {
    const [inbox, setInbox] = useState<Inbox | null>(null);
    const [error, setError] = useState("");

    useLiveRefresh(async () => {
        try {
            setInbox(await getInbox());
            setError("");
        } catch (loadError) {
            if (!inbox) {
                setError(getApiError(loadError, "Could not load messages.").message);
            }
        }
    });

    const showPropertyNames = (inbox?.broadcasts.length ?? 0) > 1;

    return (
        <Screen>
            <View style={styles.container}>
                <Title style={styles.title}>Messages</Title>

                {error ? (
                    <FieldError message={error} />
                ) : !inbox ? (
                    <ActivityIndicator size="large" />
                ) : inbox.broadcasts.length === 0 ? (
                    <Text style={styles.empty}>
                        Messages become available once you're part of a property.
                    </Text>
                ) : (
                    <>
                        <Button
                            title="New Message"
                            onPress={() => navigation.navigate("NewMessage")}
                            style={styles.newButton}
                        />

                        <Text style={styles.sectionTitle}>Broadcasts</Text>

                        {inbox.broadcasts.map((summary) => (
                            <Pressable
                                key={summary.propertyId}
                                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                                onPress={() =>
                                    navigation.navigate("Broadcasts", {
                                        propertyId: summary.propertyId,
                                        propertyName: summary.propertyName,
                                    })
                                }
                            >
                                <View style={styles.broadcastIcon}>
                                    <Megaphone size={20} color={Colors.txtPrimary} />
                                </View>

                                <View style={styles.rowText}>
                                    <Text style={styles.rowTitle}>
                                        {summary.propertyName}
                                    </Text>
                                    <Text style={styles.preview} numberOfLines={1}>
                                        {summary.latest?.body ?? "No broadcasts yet"}
                                    </Text>
                                </View>

                                <UnreadBadge count={summary.unreadCount} />
                            </Pressable>
                        ))}

                        <Text style={styles.sectionTitle}>Conversations</Text>

                        {inbox.conversations.length === 0 ? (
                            <Text style={styles.empty}>
                                No conversations yet. Tap New Message to start one.
                            </Text>
                        ) : (
                            inbox.conversations.map((conversation) => (
                                <Pressable
                                    key={`${conversation.propertyId}:${conversation.otherUser.id}`}
                                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                                    onPress={() =>
                                        navigation.navigate("Chat", {
                                            propertyId: conversation.propertyId,
                                            userId: conversation.otherUser.id,
                                            name: conversation.otherUser.fullName,
                                        })
                                    }
                                >
                                    <Avatar name={conversation.otherUser.fullName} size={44} />

                                    <View style={styles.rowText}>
                                        <View style={styles.rowHeader}>
                                            <Text style={styles.rowTitle} numberOfLines={1}>
                                                {conversation.otherUser.fullName}
                                                {conversation.otherUser.role === "OWNER" ? " · Owner" : ""}
                                            </Text>

                                            <Text style={styles.time}>
                                                {formatMessageTime(conversation.lastMessage.createdAt)}
                                            </Text>
                                        </View>

                                        <Text style={styles.preview} numberOfLines={1}>
                                            {conversation.lastMessage.isMine ? "You: " : ""}
                                            {conversation.lastMessage.body}
                                        </Text>

                                        {showPropertyNames && (
                                            <Text style={styles.propertyTag}>
                                                {conversation.propertyName}
                                            </Text>
                                        )}
                                    </View>

                                    <UnreadBadge count={conversation.unreadCount} />
                                </Pressable>
                            ))
                        )}
                    </>
                )}
            </View>
        </Screen>
    );
}

export function UnreadBadge({ count }: { count: number }) {
    if (count === 0) {
        return null;
    }

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
        paddingBottom: 40,
    },

    title: {
        marginBottom: 20,
    },

    newButton: {
        marginBottom: 8,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 20,
        marginBottom: 10,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
        lineHeight: 22,
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

    broadcastIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF3C7",
    },

    rowText: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    rowHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rowTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtPrimary,
        flexShrink: 1,
    },

    time: {
        fontSize: 12,
        color: Colors.txtSecondary,
        marginLeft: 8,
    },

    preview: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 3,
    },

    propertyTag: {
        fontSize: 12,
        color: Colors.txtSecondary,
        marginTop: 3,
    },

    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        paddingHorizontal: 6,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563EB",
    },

    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.white,
    },
});
