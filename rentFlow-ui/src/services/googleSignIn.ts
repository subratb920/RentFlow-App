// Google sign-in needs a native module that only exists in a development
// build, not in Expo Go. It is loaded lazily so the app still runs in
// Expo Go, where the Google button is simply hidden.

type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

let nativeModule: GoogleSignInModule | null | undefined;
let configured = false;

function loadModule(): GoogleSignInModule | null {
    if (nativeModule === undefined) {
        try {
            nativeModule = require("@react-native-google-signin/google-signin");
        } catch {
            nativeModule = null;
        }
    }

    return nativeModule ?? null;
}

function getConfiguredModule(): GoogleSignInModule {
    const google = loadModule();

    if (!google || !WEB_CLIENT_ID) {
        throw new Error("Google sign-in is not available in this build.");
    }

    if (!configured) {
        google.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
        configured = true;
    }

    return google;
}

export function isGoogleSignInAvailable(): boolean {
    return !!WEB_CLIENT_ID && !!loadModule();
}

/**
 * Shows the Google account picker and returns the ID token for the
 * API to verify, or null if the user cancelled.
 */
export async function getGoogleIdToken(): Promise<string | null> {
    const google = getConfiguredModule();

    try {
        await google.GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
        });

        const response = await google.GoogleSignin.signIn();

        if (!google.isSuccessResponse(response)) {
            return null;
        }

        if (!response.data.idToken) {
            throw new Error("Google did not return an ID token.");
        }

        return response.data.idToken;
    } catch (error) {
        if (
            google.isErrorWithCode(error) &&
            (error.code === google.statusCodes.SIGN_IN_CANCELLED ||
                error.code === google.statusCodes.IN_PROGRESS)
        ) {
            return null;
        }

        throw error;
    }
}

/**
 * Forgets the Google account so the next sign-in shows the picker.
 */
export async function googleSignOut(): Promise<void> {
    if (!isGoogleSignInAvailable()) return;

    try {
        await getConfiguredModule().GoogleSignin.signOut();
    } catch {
        // Not signed in with Google; nothing to clear
    }
}
