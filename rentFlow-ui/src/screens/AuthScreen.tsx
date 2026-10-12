import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Eye, EyeOff } from "lucide-react-native";

import { useAuth } from "../context/AuthContext";
import Dropdown from "../components/Dropdown";
import { UserRole } from "../models/User";
import { USER_ROLES } from "../constants/userRoles";
import { getApiError } from "../api/apiError";
import { resendVerification } from "../api/auth.api";
import useSingleSubmit from "../hooks/useSingleSubmit";
import { RootStackParamList } from "../navigation/navigationTypes";
import { isGoogleSignInAvailable } from "../services/googleSignIn";

// Hidden in Expo Go, which can't load the native Google module
const showGoogle = isGoogleSignInAvailable();

export default function AuthScreen() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Auth">>();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Development builds only: register a dummy email without verification
  const [dummyEmail, setDummyEmail] = useState(false);

  // No default: the user must pick Owner or Tenant
  const [role, setRole] = useState<UserRole | "">("");

  // Server message when the account belongs to the other role;
  // keeps Login disabled until a different role is picked.
  const [roleError, setRoleError] = useState("");

  const handleRoleChange = (value: UserRole | "") => {
    setRole(value);
    setRoleError("");
  };

  const { submitting, runSubmit } = useSingleSubmit();

  const handleSubmit = () => runSubmit(async () => {
    try {
      if (mode === "register") {
        if (
          !fullName.trim() ||
          !email.trim() ||
          !phone.trim() ||
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

        if (!role) return;

        const result = await register({
          fullName,
          email,
          phone,
          password,
          role,
          ...(__DEV__ && dummyEmail && { skipEmailVerification: true }),
        });

        // Clear the form, keeping the email for the login that follows
        setFullName("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setRole("");

        // Switch back to Login
        setMode("login");

        Alert.alert(
          result.verificationRequired ? "Check Your Email" : "Success",
          result.message
        );
      } else {
        if (!email.trim() || !password) {
          Alert.alert(
            "Validation",
            "Please enter email and password."
          );
          return;
        }

        if (!role) return;

        await login({
          email,
          password,
          role,
        });
      }
    } catch (err) {
      const apiError = getApiError(
        err,
        "Please check your details and try again."
      );

      if (apiError.field === "role") {
        setRoleError(apiError.message);
        return;
      }

      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        showVerifyEmail(apiError.message);
        return;
      }

      Alert.alert(
        mode === "login"
          ? "Login Failed"
          : "Registration Failed",
        apiError.message
      );
    }
  });

  const showVerifyEmail = (message: string) => {
    Alert.alert("Verify Your Email", message, [
      { text: "OK", style: "cancel" },
      {
        text: "Resend Email",
        onPress: async () => {
          try {
            await resendVerification(email);

            Alert.alert(
              "Email Sent",
              "Check your inbox (and spam folder) for the new link."
            );
          } catch (resendError) {
            Alert.alert(
              "Error",
              getApiError(resendError, "Could not send the email.").message
            );
          }
        },
      },
    ]);
  };

  const handleGoogle = () => runSubmit(async () => {
    if (!role) return;

    try {
      const profileStep = await loginWithGoogle(role);

      if (profileStep) {
        navigation.navigate("CompleteProfile", {
          signupToken: profileStep.signupToken,
          fullName: profileStep.profile.fullName,
          email: profileStep.profile.email,
        });
      }
    } catch (err) {
      const apiError = getApiError(
        err,
        "Google sign-in failed. Please try again."
      );

      if (apiError.field === "role") {
        setRoleError(apiError.message);
        return;
      }

      Alert.alert("Google Sign-In Failed", apiError.message);
    }
  });

  const isSubmitDisabled = submitting || !role || !!roleError;

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable so the Login button stays reachable above the keyboard */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
      >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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

        {mode === "register" && (
          <>
            <Text style={styles.label}>Phone Number</Text>

            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="98765 43210"
            />
          </>
        )}

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

          </>
        )}

        {__DEV__ && mode === "register" && (
          <TouchableOpacity
            style={styles.devOption}
            onPress={() => setDummyEmail(!dummyEmail)}
          >
            <View
              style={[
                styles.checkbox,
                dummyEmail && styles.checkboxChecked,
              ]}
            >
              {dummyEmail && <Text style={styles.checkmark}>✓</Text>}
            </View>

            <Text style={styles.devOptionText}>
              Dev: dummy email, skip verification
            </Text>
          </TouchableOpacity>
        )}

        <Dropdown
          label="Role"
          placeholder="Select Role"
          value={role}
          data={USER_ROLES}
          onChange={handleRoleChange}
          error={roleError}
        />

        <TouchableOpacity
          style={[
            styles.button,
            isSubmitDisabled && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          <Text style={styles.buttonText}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </Text>
        </TouchableOpacity>

        {showGoogle && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                isSubmitDisabled && styles.buttonDisabled,
              ]}
              onPress={handleGoogle}
              disabled={isSubmitDisabled}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </>
        )}

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
            onPress={() => {
              setRoleError("");
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );
            }}
          >
            <Text style={styles.link}>
              {mode === "login"
                ? "Create Account"
                : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flexGrow: 1,
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

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  devOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: "#D97706",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  devOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#9CA3AF",
  },

  googleButton: {
    marginTop: 20,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
    marginRight: 12,
  },

  googleText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
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