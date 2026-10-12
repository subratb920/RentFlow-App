import { useCallback, useRef, useState } from "react";

/**
 * Runs an async submit at most once at a time. The ref blocks a
 * second tap that arrives before React re-renders with
 * `submitting = true`; the state drives the button's UI.
 */
export default function useSingleSubmit() {
    const [submitting, setSubmitting] = useState(false);
    const inFlight = useRef(false);

    const runSubmit = useCallback(
        async (task: () => Promise<void>) => {
            if (inFlight.current) return;

            inFlight.current = true;
            setSubmitting(true);

            try {
                await task();
            } finally {
                inFlight.current = false;
                setSubmitting(false);
            }
        },
        []
    );

    return { submitting, runSubmit };
}
