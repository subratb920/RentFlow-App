import apiClient from "./apiClient";

import {
    Broadcast,
    BroadcastScope,
    ChatMessage,
    Contacts,
    Inbox,
} from "../models/Message";

export async function getInbox(): Promise<Inbox> {
    const response = await apiClient.get("/messages/inbox");

    return response.data;
}

export async function getContacts(propertyId: string): Promise<Contacts> {
    const response = await apiClient.get("/messages/contacts", {
        params: { propertyId },
    });

    return response.data;
}

export async function getDirectMessages(
    propertyId: string,
    userId: string
): Promise<{ otherUser: { id: string; fullName: string }; messages: ChatMessage[] }> {
    const response = await apiClient.get("/messages/direct", {
        params: { propertyId, userId },
    });

    return response.data;
}

export async function sendDirectMessage(
    propertyId: string,
    recipientId: string,
    body: string
): Promise<ChatMessage> {
    const response = await apiClient.post("/messages/direct", {
        propertyId,
        recipientId,
        body,
    });

    return response.data;
}

export async function getBroadcasts(propertyId: string): Promise<Broadcast[]> {
    const response = await apiClient.get("/messages/broadcasts", {
        params: { propertyId },
    });

    return response.data;
}

export async function sendBroadcast(
    propertyId: string,
    scope: BroadcastScope,
    buildingId: string | null,
    body: string
): Promise<void> {
    await apiClient.post("/messages/broadcasts", {
        propertyId,
        scope,
        buildingId,
        body,
    });
}
