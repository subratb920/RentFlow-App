import { useCallback, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Keeps a screen up to date while it is open: loads on focus, then
 * every `intervalMs`, and again when the app returns to the foreground.
 * Skips a tick if the previous load is still running.
 */
export default function useLiveRefresh(
    load: () => Promise<unknown>,
    intervalMs = 5000
) {
    const loadRef = useRef(load);
    loadRef.current = load;

    const busy = useRef(false);

    const refresh = useCallback(async () => {
        if (busy.current) return;

        busy.current = true;

        try {
            await loadRef.current();
        } finally {
            busy.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refresh();

            const timer = setInterval(refresh, intervalMs);
            const subscription = AppState.addEventListener("change", (state) => {
                if (state === "active") refresh();
            });

            return () => {
                clearInterval(timer);
                subscription.remove();
            };
        }, [refresh, intervalMs])
    );

    return refresh;
}
