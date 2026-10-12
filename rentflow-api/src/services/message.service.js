import mongoose from "mongoose";

import { Message } from "../models/Message.js";
import { Tenancy } from "../models/Tenancy.js";
import { Building } from "../models/Building.js";
import { Unit } from "../models/Unit.js";
import { User } from "../models/User.js";
import { getMemberProperties, getMembership } from "./membership.service.js";
import { HttpError } from "../utils/httpError.js";

const MAX_BODY_LENGTH = 1000;
const PAGE_SIZE = 200;

/**
 * People the user can message in a property, and the buildings
 * they can broadcast to.
 */
export async function getContacts(user, propertyId) {
    const membership = await getMembership(user, propertyId);
    const { property } = membership;

    const [owner, tenancies, buildings] = await Promise.all([
        User.findById(property.ownerId).select("fullName"),
        Tenancy.find({ propertyId, status: "ACTIVE", tenantUserId: { $ne: null } }),
        Building.find({ propertyId }).sort({ createdAt: 1 }),
    ]);

    const units = await Unit.find({
        _id: { $in: tenancies.map((tenancy) => tenancy.unitId) },
    }).select("unitNumber");

    const unitNumbers = new Map(units.map((unit) => [unit.id, unit.unitNumber]));
    const buildingNames = new Map(buildings.map((b) => [b.id, b.buildingName]));

    const contacts = [];

    if (!membership.isOwner && owner) {
        contacts.push({ userId: owner.id, fullName: owner.fullName, label: "Owner" });
    }

    for (const tenancy of tenancies) {
        if (tenancy.tenantUserId.equals(user._id)) continue;

        contacts.push({
            userId: tenancy.tenantUserId.toString(),
            fullName: tenancy.tenantName,
            label: `Unit ${unitNumbers.get(tenancy.unitId.toString()) ?? ""} · ${
                buildingNames.get(tenancy.buildingId.toString()) ?? ""
            }`,
        });
    }

    // Owners can broadcast to any building; tenants only to their own
    const broadcastBuildings = buildings
        .filter((b) => membership.isOwner || membership.buildingIds.includes(b.id))
        .map((b) => ({ id: b.id, buildingName: b.buildingName }));

    return {
        property: { id: property.id, propertyName: property.propertyName },
        contacts,
        broadcastBuildings,
    };
}

export async function sendDirectMessage(user, { propertyId, recipientId, body }) {
    await getMembership(user, propertyId);

    if (!mongoose.isValidObjectId(recipientId) || user._id.equals(recipientId)) {
        throw new HttpError(400, "Choose who to message.", "recipientId");
    }

    const recipient = await User.findById(recipientId);

    if (!recipient) {
        throw new HttpError(404, "This person is no longer in the property.");
    }

    // The recipient must also belong to the property
    await getMembership(recipient, propertyId).catch(() => {
        throw new HttpError(404, "This person is no longer in the property.");
    });

    const message = await Message.create({
        propertyId,
        senderId: user._id,
        kind: "DIRECT",
        recipientId,
        body: parseBody(body),
        readBy: [user._id],
    });

    return toMessage(message, user);
}

/**
 * Messages between the user and another member, oldest first.
 * Marks the other person's messages as read.
 */
export async function getDirectMessages(user, propertyId, otherUserId) {
    await getMembership(user, propertyId);

    if (!mongoose.isValidObjectId(otherUserId)) {
        throw new HttpError(400, "Invalid user id.");
    }

    const messages = await Message.find({
        propertyId,
        kind: "DIRECT",
        $or: [
            { senderId: user._id, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: user._id },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE);

    await Message.updateMany(
        {
            propertyId,
            kind: "DIRECT",
            senderId: otherUserId,
            recipientId: user._id,
            readBy: { $ne: user._id },
        },
        { $addToSet: { readBy: user._id } }
    );

    const other = await User.findById(otherUserId).select("fullName");

    return {
        otherUser: { id: otherUserId, fullName: other?.fullName ?? "" },
        messages: messages.reverse().map((m) => toMessage(m, user)),
    };
}

export async function sendBroadcast(user, { propertyId, scope, buildingId, body }) {
    const membership = await getMembership(user, propertyId);

    if (scope !== "PROPERTY" && scope !== "BUILDING") {
        throw new HttpError(400, "Choose who to broadcast to.", "scope");
    }

    if (scope === "BUILDING") {
        const building = mongoose.isValidObjectId(buildingId)
            ? await Building.findOne({ _id: buildingId, propertyId })
            : null;

        const allowed =
            building &&
            (membership.isOwner || membership.buildingIds.includes(building.id));

        if (!allowed) {
            throw new HttpError(400, "Choose your building.", "buildingId");
        }
    }

    const message = await Message.create({
        propertyId,
        senderId: user._id,
        kind: "BROADCAST",
        scope,
        buildingId: scope === "BUILDING" ? buildingId : null,
        body: parseBody(body),
        readBy: [user._id],
    });

    return message;
}

/**
 * Broadcasts the user can see in a property, newest first. Marks
 * them as read.
 */
export async function getBroadcasts(user, propertyId) {
    const membership = await getMembership(user, propertyId);
    const filter = broadcastFilter(membership);

    const messages = await Message.find(filter)
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE);

    await Message.updateMany(
        { ...filter, readBy: { $ne: user._id } },
        { $addToSet: { readBy: user._id } }
    );

    const [senders, buildings] = await Promise.all([
        User.find({ _id: { $in: messages.map((m) => m.senderId) } }).select(
            "fullName role"
        ),
        Building.find({ propertyId }).select("buildingName"),
    ]);

    const senderById = new Map(senders.map((s) => [s.id, s]));
    const buildingNames = new Map(buildings.map((b) => [b.id, b.buildingName]));

    return messages.map((message) => {
        const sender = senderById.get(message.senderId.toString());

        return {
            ...toMessage(message, user),
            senderName: sender?.fullName ?? "",
            senderRole: sender?.role ?? "",
            scope: message.scope,
            buildingName: message.buildingId
                ? buildingNames.get(message.buildingId.toString()) ?? ""
                : "",
        };
    });
}

/**
 * Conversations and per-property broadcast summaries, with unread counts.
 */
export async function getInbox(user) {
    const properties = await getMemberProperties(user);
    const propertyIds = properties.map((p) => p._id);
    const propertyNames = new Map(properties.map((p) => [p.id, p.propertyName]));

    const broadcastSummaries = await Promise.all(
        properties.map(async (property) => {
            const membership = await getMembership(user, property.id);
            const filter = broadcastFilter(membership);

            const [latest, unread] = await Promise.all([
                Message.findOne(filter).sort({ createdAt: -1 }),
                Message.countDocuments({ ...filter, readBy: { $ne: user._id } }),
            ]);

            return {
                propertyId: property.id,
                propertyName: property.propertyName,
                latest: latest
                    ? { body: latest.body, createdAt: latest.createdAt }
                    : null,
                unreadCount: unread,
            };
        })
    );

    const directMessages = await Message.find({
        kind: "DIRECT",
        propertyId: { $in: propertyIds },
        $or: [{ senderId: user._id }, { recipientId: user._id }],
    })
        .sort({ createdAt: -1 })
        .limit(1000);

    // Group by property + other person; messages are newest first
    const conversations = new Map();

    for (const message of directMessages) {
        const isMine = message.senderId.equals(user._id);
        const otherId = (isMine ? message.recipientId : message.senderId).toString();
        const key = `${message.propertyId}:${otherId}`;

        if (!conversations.has(key)) {
            conversations.set(key, {
                propertyId: message.propertyId.toString(),
                propertyName: propertyNames.get(message.propertyId.toString()) ?? "",
                otherUserId: otherId,
                lastMessage: {
                    body: message.body,
                    createdAt: message.createdAt,
                    isMine,
                },
                unreadCount: 0,
            });
        }

        if (!isMine && !message.readBy.some((id) => id.equals(user._id))) {
            conversations.get(key).unreadCount += 1;
        }
    }

    const others = await User.find({
        _id: { $in: [...conversations.values()].map((c) => c.otherUserId) },
    }).select("fullName role");

    const otherById = new Map(others.map((o) => [o.id, o]));

    const conversationList = [...conversations.values()].map(({ otherUserId, ...rest }) => ({
        ...rest,
        otherUser: {
            id: otherUserId,
            fullName: otherById.get(otherUserId)?.fullName ?? "",
            role: otherById.get(otherUserId)?.role ?? "",
        },
    }));

    const totalUnread =
        broadcastSummaries.reduce((sum, b) => sum + b.unreadCount, 0) +
        conversationList.reduce((sum, c) => sum + c.unreadCount, 0);

    return {
        broadcasts: broadcastSummaries,
        conversations: conversationList,
        totalUnread,
    };
}

// Owners see every broadcast; tenants see property-wide ones and
// those for their buildings.
function broadcastFilter(membership) {
    const base = { propertyId: membership.property._id, kind: "BROADCAST" };

    if (membership.isOwner) {
        return base;
    }

    return {
        ...base,
        $or: [
            { scope: "PROPERTY" },
            { scope: "BUILDING", buildingId: { $in: membership.buildingIds } },
        ],
    };
}

function toMessage(message, user) {
    return {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        isMine: message.senderId.equals(user._id),
    };
}

function parseBody(value) {
    const body = String(value ?? "").trim();

    if (!body) {
        throw new HttpError(400, "Write a message.", "body");
    }

    if (body.length > MAX_BODY_LENGTH) {
        throw new HttpError(
            400,
            `Messages must be ${MAX_BODY_LENGTH} characters or fewer.`,
            "body"
        );
    }

    return body;
}
