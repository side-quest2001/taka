import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { COLORS, ROLES } from '../../../constants';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setError('');
            if (user?.role === ROLES.BUSINESS) {
                const [bizData, campaignData, collabData] = await Promise.all([
                    api.getMyBusiness(),
                    api.getMyCampaigns(),
                    api.getMyCollaborations(),
                ]);
                setProfile(bizData);
                setCampaigns(campaignData);
                setCollaborations(collabData);
            } else if (user?.role === ROLES.INFLUENCER) {
                const collabData = await api.getInfluencerCollaborations();
                setCollaborations(collabData);
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
            setError('Some profile data could not be loaded. Check that the backend is running on port 3000.');
        }
    };

    const showComingSoon = (title: string) => {
        Alert.alert(title, 'This section is coming in the next build.');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout', style: 'destructive', onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = COLORS.primary }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
    );

    const getRoleLabel = () => {
        switch (user?.role) {
            case ROLES.BUSINESS: return 'Business Account';
            case ROLES.INFLUENCER: return 'Influencer Account';
            default: return 'Personal Account';
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.role === ROLES.BUSINESS
                                ? profile?.businessName?.charAt(0) || 'B'
                                : user?.role === ROLES.INFLUENCER
                                    ? 'I'
                                    : 'P'}
                        </Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.success} />
                    </View>
                </View>
                <Text style={styles.name}>
                    {user?.role === ROLES.BUSINESS ? profile?.businessName : 'User'}
                </Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{getRoleLabel()}</Text>
                </View>
            </View>

            {error ? (
                <View style={styles.errorBanner}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* Stats */}
            {user?.role === ROLES.BUSINESS && (
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{campaigns.length}</Text>
                        <Text style={styles.statLabel}>Campaigns</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{collaborations.filter(c => c.status === 'accepted').length}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>₹{(campaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0) / 1000).toFixed(1)}K</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </View>
                </View>
            )}

            {user?.role === ROLES.INFLUENCER && (
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{collaborations.filter(c => c.status === 'pending').length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{collaborations.filter(c => c.status === 'accepted').length}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{collaborations.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>
            )}

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {user?.role === ROLES.BUSINESS && (
                    <>
                        <Text style={styles.sectionTitle}>My Business</Text>
                        <MenuItem
                            icon="bullhorn"
                            title="Campaigns"
                            subtitle={`${campaigns.length} campaigns`}
                            onPress={() => showComingSoon('Campaigns')}
                        />
                        <MenuItem
                            icon="account-group"
                            title="Influencers"
                            subtitle={`${collaborations.length} connections`}
                            onPress={() => showComingSoon('Influencers')}
                        />
                        <MenuItem
                            icon="file-document"
                            title="TAKA Onboarding"
                            subtitle="Join TAKA marketing program"
                            onPress={() => router.push('/profile/onboarding')}
                            color={COLORS.secondary}
                        />
                    </>
                )}

                {user?.role === ROLES.INFLUENCER && (
                    <>
                        <Text style={styles.sectionTitle}>My Work</Text>
                        <MenuItem
                            icon="briefcase"
                            title="Collaborations"
                            subtitle={`${collaborations.length} total`}
                            onPress={() => showComingSoon('Collaborations')}
                        />
                        <MenuItem
                            icon="chart-line"
                            title="Analytics"
                            subtitle="View your performance"
                            onPress={() => showComingSoon('Analytics')}
                        />
                        <MenuItem
                            icon="pencil"
                            title="Edit Profile"
                            subtitle="Update your details"
                            onPress={() => showComingSoon('Edit Profile')}
                            color={COLORS.secondary}
                        />
                    </>
                )}

                {user?.role === ROLES.PERSONAL && (
                    <>
                        <Text style={styles.sectionTitle}>Discover</Text>
                        <MenuItem
                            icon="heart"
                            title="Saved"
                            subtitle="Your favorite businesses"
                            onPress={() => showComingSoon('Saved')}
                        />
                        <MenuItem
                            icon="history"
                            title="History"
                            subtitle="Recently viewed"
                            onPress={() => showComingSoon('History')}
                        />
                    </>
                )}

                <Text style={styles.sectionTitle}>Account</Text>
                <MenuItem
                    icon="cog"
                    title="Settings"
                    onPress={() => showComingSoon('Settings')}
                />
                <MenuItem
                    icon="help-circle"
                    title="Help & Support"
                    onPress={() => showComingSoon('Help & Support')}
                />
                <MenuItem
                    icon="logout"
                    title="Logout"
                    onPress={handleLogout}
                    color={COLORS.error}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.surface,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 2,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 16,
    },
    roleBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
    },
    roleText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 16,
        marginTop: 1,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '12',
        margin: 16,
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        flex: 1,
        color: COLORS.error,
        fontSize: 13,
        marginLeft: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    menuContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: 12,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    menuSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
