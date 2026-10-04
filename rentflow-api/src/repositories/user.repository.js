import { User } from "../models/User.js";

export async function findUserByEmail(email) {
    return User.findOne({ email });
}

export async function createUser(userData) {
    return User.create(userData);
}

export async function findUserById(id) {
    return User.findById(id);
}