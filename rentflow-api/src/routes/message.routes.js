import { Router } from "express";
import {
    getBroadcasts,
    getContacts,
    getDirectMessages,
    getInbox,
    sendBroadcast,
    sendDirectMessage,
} from "../controllers/message.controller.js";

// Mounted behind authenticate + requireUser in app.js (owners and tenants)
const router = Router();

router.get("/inbox", getInbox);

router.get("/contacts", getContacts);

router.get("/direct", getDirectMessages);

router.post("/direct", sendDirectMessage);

router.get("/broadcasts", getBroadcasts);

router.post("/broadcasts", sendBroadcast);

export default router;
