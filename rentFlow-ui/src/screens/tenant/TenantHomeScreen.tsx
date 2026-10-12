import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    Mail,
    KeyRound,
    MessagesSquare,
    ReceiptIndianRupee,
    Search,
} from "lucide-react-native";

import Screen from "../../components/Screen";
import Avatar from "../../components/Avatar";
import ActionCard from "../../components/ActionCard";
import StatusChip from "../../components/StatusChip";
import FieldError from "../../components/FieldError";
import Button from "../../components/Button";

import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../navigation/navigationTypes";
import {
    AccessRequestStatus,
    Neighbour,
    PendingInvite,
    Residence,
    TenantHome,
} from "../../models/Tenancy";
import {
    acceptInvite,
    declineInvite,
    getPropertyTenants,
    getTenantHome,
} from "../../api/tenant.api";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import useSingleSubmit from "../../hooks/useSingleSubmit";
import { getInbox } from "../../api/message.api";
import { getTenantBills } from "../../api/bill.api";
import { totalDue } from "../../utils/bills";
import { getApiError } from "../../api/apiError";
import { Colors } from "../../theme/colors";
import { formatDate, formatRupees } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "TenantHome">;

const REQUEST_STATUS: Record<
    AccessRequestStatus,
    { label: string; tone: "warning" | "success" | "danger" }
> = {
    PENDING: { label: "Pending", tone: "warning" },
    APPROVED: { label: "Approved", tone: "success" },
    REJECTED: { label: "Declined", tone: "danger" },
};

/**
 * Tenant's home: the property they live in, or ways to get access.
 */
export default function TenantHomeScreen({ navigation }: Props) {
    const { user } = useAuth();

    const [home, setHome] = useState<TenantHome | null>(null);
    const [neighbours, setNeighbours] = useState<Record<string, Neighbour[]>>({});
    const [unread, setUnread] = useState(0);
    const [amountDue, setAmountDue] = useState(0);
    const [error, setError] = useState("");

    const { submitting, runSubmit } = useSingleSubmit();

    const loadHome = async () => {
        try {
            const homeData = await getTenantHome();
            setHome(homeData);

            if (homeData.residences.length > 0) {
                const [inbox, bills] = await Promise.all([
                    getInbox(),
                    getTenantBills(),
                ]);

                setUnread(inbox.totalUnread);
                setAmountDue(totalDue(bills));
            }

            // Everyone living in each of the tenant's properties
            const lists = await Promise.all(
                homeData.residences.map((residence) =>
                    getPropertyTenants(residence.property.id)
                )
            );

            setNeighbours(
                Object.fromEntries(
                    homeData.residences.map((residence, index) => [
                        residence.property.id,
                        lists[index],
                    ])
                )
            );
            setError("");
        } catch (loadError) {
            // Keep the last data if a background refresh fails
            if (!home) {
                setError(getApiError(loadError, "Could not load your home.").message);
            }
        }
    };

    // Live: new invitations and messages appear while the screen is open
    const refresh = useLiveRefresh(loadHome, 8000);

    const respond = (invite: PendingInvite, accept: boolean) => runSubmit(async () => {
        try {
            if (accept) {
                await acceptInvite(invite.id);
            } else {
                await declineInvite(invite.id);
            }
        } catch (respondError) {
            Alert.alert(
                "Error",
                getApiError(respondError, "Could not update this invitation.").message
            );
        }

        await refresh();
    });

    const confirmDecline = (invite: PendingInvite) => {
        Alert.alert(
            "Decline Invitation?",
            `You won't be added to ${invite.propertyName}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Decline",
                    style: "destructive",
                    onPress: () => respond(invite, false),
                },
            ]
        );
    };

    const hasResidence = !!home && home.residences.length > 0;

    return (
        <Screen
            showHeader
            title="Home"
            rightComponent={
                <Avatar
                    name={user?.fullName}
                    onPress={() => navigation.navigate("Profile")}
                />
            }
        >
            <View style={styles.container}>
                <Text style={styles.greeting}>Welcome,</Text>
                <Text style={styles.userName}>{user?.fullName}</Text>

                {error ? (
                    <FieldError message={error} />
                ) : !home ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        {home.invites.map((invite) => (
                            <InviteCard
                                key={invite.id}
                                invite={invite}
                                disabled={submitting}
                                onAccept={() => respond(invite, true)}
                                onDecline={() => confirmDecline(invite)}
                            />
                        ))}

                        {hasResidence && (
                            <>
                                <ActionCard
                                    title={unread > 0 ? `Messages · ${unread} new` : "Messages"}
                                    subtitle="Broadcasts, your owner and neighbours"
                                    icon={<MessagesSquare size={22} color={Colors.txtPrimary} />}
                                    onPress={() => navigation.navigate("Inbox")}
                                />

                                <ActionCard
                                    title="Bills & Rent"
                                    subtitle={
                                        amountDue > 0
                                            ? `${formatRupees(amountDue)} due · tap to pay`
                                            : "All paid · view past months"
                                    }
                                    icon={<ReceiptIndianRupee size={22} color={Colors.txtPrimary} />}
                                    onPress={() => navigation.navigate("TenantBills")}
                                />
                            </>
                        )}

                        {hasResidence ? (
                            home.residences.map((residence) => (
                                <ResidenceCard
                                    key={residence.id}
                                    residence={residence}
                                    neighbours={neighbours[residence.property.id] ?? []}
                                />
                            ))
                        ) : home.invites.length > 0 ? null : (
                            <>
                                <View style={styles.emptyCard}>
                                    <Text style={styles.emptyTitle}>
                                        No property linked yet
                                    </Text>

                                    <Text style={styles.emptyText}>
                                        Join with the invite code from your owner, or
                                        find your owner and request access.
                                    </Text>
                                </View>

                                <ActionCard
                                    title="Join with Invite Code"
                                    subtitle="Enter the code your owner shared"
                                    icon={<KeyRound size={22} color={Colors.txtPrimary} />}
                                    onPress={() => navigation.navigate("JoinProperty")}
                                />

                                <ActionCard
                                    title="Find Your Owner"
                                    subtitle="Search by owner name and phone number"
                                    icon={<Search size={22} color={Colors.txtPrimary} />}
                                    onPress={() => navigation.navigate("FindOwner")}
                                />
                            </>
                        )}

                        {home.requests.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Your Requests</Text>

                                {home.requests.map((request) => (
                                    <View key={request.id} style={styles.requestRow}>
                                        <View style={styles.requestText}>
                                            <Text style={styles.requestProperty}>
                                                {request.propertyName}
                                            </Text>
                                            <Text style={styles.requestMeta}>
                                                {request.ownerName} · {formatDate(request.createdAt)}
                                            </Text>
                                        </View>

                                        <StatusChip
                                            label={REQUEST_STATUS[request.status].label}
                                            tone={REQUEST_STATUS[request.status].tone}
                                        />
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </View>
        </Screen>
    );
}

function ResidenceCard({
    residence,
    neighbours,
}: {
    residence: Residence;
    neighbours: Neighbour[];
}) {
    return (
        <>
            <View style={styles.residenceCard}>
                <Text style={styles.propertyName}>
                    {residence.property.propertyName}
                </Text>

                <Text style={styles.propertyMeta}>
                    {[residence.property.propertyType, residence.property.address]
                        .filter(Boolean)
                        .join(" · ")}
                </Text>

                <View style={styles.divider} />

                <Row label="Your Unit" value={`Unit ${residence.unitNumber} · ${residence.buildingName}`} />
                <Row label="Monthly Rent" value={formatRupees(residence.monthlyRent)} />
                <Row label="Move-in Date" value={formatDate(residence.moveInDate)} />
                <Row label="Owner" value={residence.owner.fullName} />
                {!!residence.owner.phone && (
                    <Row label="Owner Phone" value={residence.owner.phone} />
                )}
            </View>

            <Text style={styles.sectionTitle}>
                Tenants in {residence.property.propertyName}
            </Text>

            {neighbours.map((neighbour) => (
                <View key={neighbour.id} style={styles.neighbourRow}>
                    <Text style={styles.neighbourName}>
                        {neighbour.tenantName}
                        {neighbour.isYou ? " (You)" : ""}
                    </Text>

                    <Text style={styles.neighbourUnit}>
                        Unit {neighbour.unitNumber}
                    </Text>
                </View>
            ))}
        </>
    );
}

function InviteCard({
    invite,
    disabled,
    onAccept,
    onDecline,
}: {
    invite: PendingInvite;
    disabled: boolean;
    onAccept: () => void;
    onDecline: () => void;
}) {
    return (
        <View style={styles.inviteCard}>
            <View style={styles.inviteHeader}>
                <Mail size={20} color="#92400E" />
                <Text style={styles.inviteTitle}>New invitation</Text>
            </View>

            <Text style={styles.propertyName}>{invite.propertyName}</Text>
            <Text style={styles.propertyMeta}>
                {invite.ownerName} invited you
                {invite.address ? ` · ${invite.address}` : ""}
            </Text>

            <View style={styles.divider} />

            <Row label="Unit" value={`Unit ${invite.unitNumber} · ${invite.buildingName}`} />
            <Row label="Monthly Rent" value={formatRupees(invite.monthlyRent)} />
            <Row label="Move-in Date" value={formatDate(invite.moveInDate)} />

            <Button
                title="Accept"
                onPress={onAccept}
                disabled={disabled}
                style={styles.acceptButton}
            />

            <Pressable
                onPress={onDecline}
                disabled={disabled}
                hitSlop={8}
                style={styles.declineLink}
            >
                <Text style={styles.declineText}>Decline</Text>
            </Pressable>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },

    greeting: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.txtSecondary,
    },

    userName: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginBottom: 24,
    },

    emptyCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginBottom: 6,
    },

    emptyText: {
        fontSize: 15,
        color: Colors.txtSecondary,
        lineHeight: 22,
    },

    inviteCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FCD34D",
        backgroundColor: "#FFFBEB",
    },

    inviteHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    inviteTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#92400E",
        marginLeft: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    acceptButton: {
        marginTop: 16,
    },

    declineLink: {
        alignSelf: "center",
        marginTop: 14,
    },

    declineText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.danger,
    },

    residenceCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#D9E5F2",
        backgroundColor: Colors.white,
    },

    propertyName: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.txtPrimary,
    },

    propertyMeta: {
        fontSize: 14,
        color: Colors.txtSecondary,
        marginTop: 4,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 14,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },

    rowLabel: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    rowValue: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.txtPrimary,
        flexShrink: 1,
        textAlign: "right",
        marginLeft: 12,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.txtPrimary,
        marginTop: 24,
        marginBottom: 12,
    },

    neighbourRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

    neighbourName: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.txtPrimary,
    },

    neighbourUnit: {
        fontSize: 15,
        color: Colors.txtSecondary,
    },

    requestRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: Colors.white,
    },

    requestText: {
        flex: 1,
        marginRight: 8,
    },

    requestProperty: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.txtPrimary,
    },

    requestMeta: {
        fontSize: 13,
        color: Colors.txtSecondary,
        marginTop: 2,
    },
});
