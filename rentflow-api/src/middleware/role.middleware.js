import { User } from "../models/User.js";

const ROLE_LABELS = {
    OWNER: "property owners",
    TENANT: "tenants",
};

/**
 * Loads the authenticated user's account into req.currentUser.
 * Must run after authenticate.
 */
export async function requireUser(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select(
            "fullName email phone role upiId"
        );

        if (!user) {
            return res.status(401).json({ message: "Account not found." });
        }

        req.currentUser = user;

        next();
    } catch (error) {
        console.error("Loading account failed:", error);

        res.status(500).json({ message: "Failed to verify account." });
    }
}

/**
 * Allows the request only for users with the given role. Must run
 * after authenticate. The role is read from the database so tokens
 * issued before roles were enforced still work.
 */
export function requireRole(role) {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).select(
                "fullName email phone role upiId"
            );

            if (!user) {
                return res.status(401).json({ message: "Account not found." });
            }

            if (user.role !== role) {
                return res.status(403).json({
                    message: `This feature is only available to ${ROLE_LABELS[role]}.`,
                });
            }

            req.currentUser = user;

            next();
        } catch (error) {
            console.error("Role check failed:", error);

            res.status(500).json({ message: "Failed to verify account." });
        }
    };
}
