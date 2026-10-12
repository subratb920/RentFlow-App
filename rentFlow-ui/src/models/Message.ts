export interface ChatMessage {
    id: string;
    body: string;
    createdAt: string;
    isMine: boolean;
}

export type BroadcastScope = "PROPERTY" | "BUILDING";

export interface Broadcast extends ChatMessage {
    senderName: string;
    senderRole: string;
    scope: BroadcastScope;
    buildingName: string;
}

export interface Conversation {
    propertyId: string;
    propertyName: string;
    otherUser: {
        id: string;
        fullName: string;
        role: string;
    };
    lastMessage: {
        body: string;
        createdAt: string;
        isMine: boolean;
    };
    unreadCount: number;
}

export interface BroadcastSummary {
    propertyId: string;
    propertyName: string;
    latest: { body: string; createdAt: string } | null;
    unreadCount: number;
}

export interface Inbox {
    broadcasts: BroadcastSummary[];
    conversations: Conversation[];
    totalUnread: number;
}

export interface Contacts {
    property: { id: string; propertyName: string };
    contacts: { userId: string; fullName: string; label: string }[];
    broadcastBuildings: { id: string; buildingName: string }[];
}
