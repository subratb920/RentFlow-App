import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { useAuth } from "../context/AuthContext";
import Dropdown from "../components/Dropdown";
import { UserRole } from "../models/User";
import { USER_ROLES } from "../constants/userRoles";

export default function AuthScreen() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [role, setRole] = useState<UserRole>(
    UserRole.OWNER
  );

  const handleSubmit = async () => {
    try {
      if (mode === "register") {
        if (
          !fullName.trim() ||
          !email.trim() ||
          !password ||
          !confirmPassword
        ) {
          Alert.alert(
            "Validation",
            "Please fill all fields."
          );
          return;
        }

        if (password !== confirmPassword) {
          Alert.alert(
            "Validation",
            "Passwords do not match."
          );
          return;
        }

        await register({
          fullName,
          email,
          password,
          role,
        });

        // Clear the form
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole(UserRole.OWNER);

        // Switch back to Login
        setMode("login");

        Alert.alert(
          "Success",
          "Registration successful. Please login."
        );
      } else {
        if (!email.trim() || !password) {
          Alert.alert(
            "Validation",
            "Please enter email and password."
          );
          return;
        }

        await login({
          email,
          password,
        });

        Alert.alert(
          "Success",
          "Login successful."
        );
      }
    } catch (err) {
      // console.error(err);

      Alert.alert(
        "Authentication Failed",
        "Please check your credentials and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>RentFlow</Text>

        <Text style={styles.heading}>
          {mode === "login"
            ? "Welcome Back"
            : "Create Account"}
        </Text>

        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to continue managing your properties."
            : "Start managing your properties today."}
        </Text>

        {mode === "register" && (
          <>
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
            />
          </>
        )}

        <Text style={styles.label}>Email Address</Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="john@example.com"
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />

          <TouchableOpacity
            onPress={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <EyeOff
                size={20}
                color="#6B7280"
              />
            ) : (
              <Eye
                size={20}
                color="#6B7280"
              />
            )}
          </TouchableOpacity>
        </View>

        {mode === "register" && (
          <>
            <Text style={styles.label}>
              Confirm Password
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={
                  !showConfirmPassword
                }
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Confirm Password"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={20}
                    color="#6B7280"
                  />
                ) : (
                  <Eye
                    size={20}
                    color="#6B7280"
                  />
                )}
              </TouchableOpacity>
            </View>

            <Dropdown
              label="Role"
              placeholder="Select Role"
              value={role}
              data={USER_ROLES}
              onChange={setRole}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {mode === "login"
              ? "Login"
              : "Create Account"}
          </Text>
        </TouchableOpacity>

        {mode === "login" && (
          <TouchableOpacity
            style={styles.forgotPassword}
          >
            <Text style={styles.link}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            <Text style={styles.link}>
              {mode === "login"
                ? "Create Account"
                : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  brand: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },

  heading: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 36,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
  },

  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },

  button: {
    marginTop: 36,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  forgotPassword: {
    marginTop: 18,
    alignItems: "center",
  },

  footer: {
    marginTop: 40,
    alignItems: "center",
  },

  footerText: {
    color: "#6B7280",
    marginBottom: 8,
  },

  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
});