import React from "react";
import { Pressable, View } from "react-native";

import Heading from "./Heading";

import {
    HomeCardThemes,
    HomeStyles,
} from "../theme/home.styles";

export type HomeCardType =
    | "dashboard"
    | "properties"
    | "tenants"
    | "rent"
    | "utilities";

interface HomeCardProps {
    name: HomeCardType;
    title: string;
    children: React.ReactNode;
    onPress: () => void;
}

export default function HomeCard({
    name,
    title,
    children,
    onPress,
}: HomeCardProps) {

    const theme = HomeCardThemes[name];

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                HomeStyles.card,
                theme,
                pressed && HomeStyles.cardPressed,
            ]}
        >
            <Heading
                style={[
                    HomeStyles.cardTitle,
                    {
                        color: theme.titleColor,
                    },
                ]}
            >
                {title}
            </Heading>

            <View style={HomeStyles.divider} />

            {children}

        </Pressable>
    );
}