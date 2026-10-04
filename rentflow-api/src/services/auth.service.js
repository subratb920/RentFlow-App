import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    createUser,
    findUserByEmail,
    findUserById,
} from "../repositories/user.repository.js";

import { env } from "../config/env.js";

export async function registerUser(data) {
    const { fullName, email, password, role  } = data;

    if (!fullName || !email || !password || !role) {
        throw new Error("All fields are required.");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
        fullName,
        email,
        role,
        password: hashedPassword,
    });

    // const token = jwt.sign(
    //     {
    //         id: user._id,
    //     },
    //     env.JWT_SECRET,
    //     {
    //         expiresIn: "7d",
    //     }
    // );

    return {
        message: "Registration successful."
    };
}

// ---------------- LOGIN ----------------

export async function loginUser(data) {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error("Email and password are required.");
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password.");
    }

    const token = jwt.sign(
        {
            id: user._id,
        },
        env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        },
    };
}

export async function getCurrentUser(userId) {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
}