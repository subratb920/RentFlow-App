import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SendHorizontal } from "lucide-react-native";

import BackButton from "../../components/BackButton";
import FieldError from "../../components/FieldError";

import { RootStackParamList } from "../../navigation/navigationTypes";
import { ChatMessage } from "../../models/Message";
import { getDirectMessages, sendDirectMessage } from "../../api/message.api";
import { getApiError } from "../../api/apiError";
import useSingleSubmit from "../../hooks/useSingleSubmit";
import { Colors } from "../../theme/colors";
import { formatMessageTime } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

// How often to check for new messages while the chat is open
const REFRESH_MS = 5000;
const MAX_LENGTH = 1000;

export default function ChatScreen({ route }: Props) {
    const { propertyId, userId, name } = route.params;

    const [messages, setMessages] = useState<ChatMessage[] | null>(null);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");

    const scrollRef = useRef<ScrollView>(null);
    const { submitting, runSubmit } = useSingleSubmit();

    const loadMessages = useCallback(async () => {
        try {
            const result = await getDirectMessages(propertyId, userId);

            setMessages(result.messages);
            setError("");
        } catch (loadError) {
            setError(getApiError(loadError, "Could not load messages.").message);
        }
    }, [propertyId, userId]);

    // Load on focus, then poll while the screen is visible
    useFocusEffect(
        useCallback(() => {
            loadMessages();

            const timer = setInterval(loadMessages, REFRESH_MS);

            return () => clearInterval(timer);
        }, [loadMessages])
    );

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
    }, [messages?.length]);

    const handleSend = () => runSubmit(async () => {
        const body = draft.trim();

        if (!body) return;

        try {
            const sent = await sendDirectMessage(propertyId, userId, body);

            setMessages((previous) => [...(previous ?? []), sent]);
            setDraft("");
        } catch (sendError) {
            Alert.alert(
                "Message Not Sent",
                getApiError(sendError, "Please try again.").message
            );
        }
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <BackButton />

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {name}
                </Text>
            </View>

            <KeyboardAvoidingView style={styles.flex} behavior="padding">
                <ScrollView
                    ref={scrollRef}
                    style={styles.flex}
                    contentContainerStyle={styles.messages}
                    keyboardShouldPersistTaps="handled"
                >
                    {error ? (
                        <FieldError message={error} />
                    ) : messages === null ? (
                        <ActivityIndicator size="large" />
                    ) : messages.length === 0 ? (
                        <Text style={styles.empty}>
                            Say hello to {name}.
                        </Text>
                    ) : (
                        messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.bubble,
                                    message.isMine ? styles.mine : styles.theirs,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.bubbleText,
                                        message.isMine && styles.mineText,
                                    ]}
                                >
                                    {message.body}
                                </Text>

                                <Text
                                    style={[
                                        styles.bubbleTime,
                                        message.isMine && styles.mineTime,
                                    ]}
                                >
                                    {formatMessageTime(message.createdAt)}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>

                <View style={styles.composer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Message"
                        placeholderTextColor={Colors.placeholder}
                        value={draft}
                        onChangeText={setDraft}
                        maxLength={MAX_LENGTH}
                        multiline
                    />

                    <Pressable
                        onPress={handleSend}
                        disabled={submitting || !draft.trim()}
                        accessibilityRole="button"
                        accessibilityLabel="Send message"
                        style={[
                            styles.sendButton,
                            (submitting || !draft.trim()) && styles.sendDisabled,
                        ]}
                    >
                        <SendHorizontal size={20} color={Colors.white} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bg,
    },

    flex: {
        flex: 1,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginLeft: 14,
    },

    messages: {
        padding: 16,
        flexGrow: 1,
    },

    empty: {
        fontSize: 15,
        color: Colors.txtSecondary,
        textAlign: "center",
        marginTop: 24,
    },

    bubble: {
        maxWidth: "80%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        marginBottom: 8,
    },

    mine: {
        alignSelf: "flex-end",
        backgroundColor: "#2563EB",
        borderBottomRightRadius: 4,
    },

    theirs: {
        alignSelf: "flex-start",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderBottomLeftRadius: 4,
    },

    bubbleText: {
        fontSize: 16,
        color: Colors.txtPrimary,
        lineHeight: 22,
    },

    mineText: {
        color: Colors.white,
    },

    bubbleTime: {
        fontSize: 11,
        color: Colors.txtSecondary,
        marginTop: 4,
        alignSelf: "flex-end",
    },

    mineTime: {
        color: "#DBEAFE",
    },

    composer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    input: {
        flex: 1,
        maxHeight: 120,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
        color: Colors.txtPrimary,
        backgroundColor: Colors.bg,
    },

    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginLeft: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563EB",
    },

    sendDisabled: {
        backgroundColor: Colors.disabled,
    },
});
