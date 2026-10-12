import React from "react";
import { Text } from "react-native";

import { CS } from "../theme/cs";

type FieldErrorProps = {
    message?: string;
};

/**
 * Validation message shown under a form field; renders nothing
 * when there is no error.
 */
export default function FieldError({ message }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return <Text style={CS.errTxt}>{message}</Text>;
}
