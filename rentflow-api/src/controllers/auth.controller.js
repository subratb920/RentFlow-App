import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "../services/auth.service.js";

export async function register(req, res) {
    try {
        const result = await registerUser(req.body);

        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
}

export async function login(req, res) {
    try {
        const result = await loginUser(req.body);

        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({
            message: err.message,
        });
    }
}

export async function me(req, res) {
    try {
        const user = await getCurrentUser(req.user.id);

        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({
            message: err.message,
        });
    }
}