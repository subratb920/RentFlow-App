import * as messageService from "../services/message.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * GET /api/messages/inbox
 */
export async function getInbox(req, res) {
    try {
        res.json(await messageService.getInbox(req.currentUser));
    } catch (error) {
        sendError(res, error, "Failed to load messages.");
    }
}

/**
 * GET /api/messages/contacts?propertyId=123
 */
export async function getContacts(req, res) {
    try {
        res.json(await messageService.getContacts(req.currentUser, req.query.propertyId));
    } catch (error) {
        sendError(res, error, "Failed to load contacts.");
    }
}

/**
 * GET /api/messages/direct?propertyId=123&userId=456
 */
export async function getDirectMessages(req, res) {
    try {
        res.json(await messageService.getDirectMessages(
            req.currentUser,
            req.query.propertyId,
            req.query.userId
        ));
    } catch (error) {
        sendError(res, error, "Failed to load messages.");
    }
}

/**
 * POST /api/messages/direct
 */
export async function sendDirectMessage(req, res) {
    try {
        const message = await messageService.sendDirectMessage(req.currentUser, req.body);

        res.status(201).json(message);
    } catch (error) {
        sendError(res, error, "Failed to send message.");
    }
}

/**
 * GET /api/messages/broadcasts?propertyId=123
 */
export async function getBroadcasts(req, res) {
    try {
        res.json(await messageService.getBroadcasts(req.currentUser, req.query.propertyId));
    } catch (error) {
        sendError(res, error, "Failed to load broadcasts.");
    }
}

/**
 * POST /api/messages/broadcasts
 */
export async function sendBroadcast(req, res) {
    try {
        await messageService.sendBroadcast(req.currentUser, req.body);

        res.status(201).json({ message: "Broadcast sent." });
    } catch (error) {
        sendError(res, error, "Failed to send broadcast.");
    }
}
