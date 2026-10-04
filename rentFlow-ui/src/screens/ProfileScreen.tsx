import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import {
    User,
    Lock,
    LogOut,
    ChevronRight,
} from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Screen from "../components/Screen";
import Avatar from "../components/Avatar";
import Title from "../components/Heading";
import Subtitle from "../components/SubHeading";

import { RootStackParamList } from "../navigation/navigationTypes";
import { useAuth } from "../context/AuthContext";

import { Colors } from "../theme/colors";
import { Spacing } from "../theme/spacing";
import { CS } from "../theme/cs";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "Profile"
>;

export default function ProfileScreen({
    navigation,
}: Props) {

    const { user, logout } = useAuth();

    return (
        <Screen
            showHeader
            showBack
            title="Profile"
        >

            <View style={styles.profileSection}>

                <Avatar
                    name={user?.fullName}
                    size={90}
                />

                <Title style={styles.name}>
                    {user?.fullName}
                </Title>

                <Subtitle>
                    {user?.email}
                </Subtitle>

                <Subtitle>
                    {user?.role}
                </Subtitle>

            </View>

            <View style={styles.card}>

                <TouchableOpacity
                    style={CS.listItem}
                    onPress={() => {}}
                >
                    <View style={CS.listItemLeft}>
                        <User
                            size={20}
                            color={Colors.txtPrimary}
                        />

                        <Text style={CS.listItemText}>
                            Edit Profile
                        </Text>
                    </View>

                    <ChevronRight
                        size={20}
                        color={Colors.txtSecondary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={CS.listItem}
                    onPress={() => {}}
                >
                    <View style={CS.listItemLeft}>
                        <Lock
                            size={20}
                            color={Colors.txtPrimary}
                        />

                        <Text style={CS.listItemText}>
                            Change Password
                        </Text>
                    </View>

                    <ChevronRight
                        size={20}
                        color={Colors.txtSecondary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={CS.listItem}
                    onPress={logout}
                >
                    <View style={CS.listItemLeft}>
                        <LogOut
                            size={20}
                            color={Colors.danger}
                        />

                        <Text
                            style={[
                                CS.listItemText,
                                {
                                    color: Colors.danger,
                                },
                            ]}
                        >
                            Logout
                        </Text>
                    </View>
                </TouchableOpacity>

            </View>

            <Text style={styles.version}>
                Version 1.0.0
            </Text>

        </Screen>
    );
}

const styles = StyleSheet.create({

    profileSection: {
        alignItems: "center",
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },

    name: {
        marginTop: Spacing.lg,
    },

    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: Spacing.lg,
    },

    version: {
        textAlign: "center",
        marginTop: Spacing.xxl,
        color: Colors.txtSecondary,
    },

});