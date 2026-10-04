import { useMemo } from "react";

export default function useFormReady(fields: unknown[]) {
    return useMemo(() => {
        return fields.every(field => {
            if (typeof field === "string") {
                return field.trim().length > 0;
            }

            if (typeof field === "number") {
                return field > 0;
            }

            return field !== null && field !== undefined;
        });
    }, [fields]);
}