import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';
import { COLORS } from '../../../../constants';

export default function InfluencerDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [influencer, setInfluencer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadInfluencer();
    }, [id]);

    const loadInfluencer = async () => {
        const influencerId = Array.isArray(id) ? id[0] : id;
        const isUuid = typeof influencerId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(influencerId);

        if (!isUuid) {
            setInfluencer(null);
            setErrorMessage('This influencer link is invalid. Please open a profile from Search again.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await api.getInfluencer(influencerId);
            setInfluencer(data);
        } catch (error: any) {
            setInfluencer(null);
            setErrorMessage(error.message || 'Influencer not found');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!message.trim()) {
            Alert.alert('Message Required', 'Please add a message to introduce yourself');
            return;
        }

        setIsSending(true);
        try {
            const influencerId = Array.isArray(id) ? id[0] : id;
            await api.sendCollaboration({
                influencerId,
                message: message,
            });

            Alert.alert('Request Sent!', 'Your collaboration request has been sent to this influencer.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send request');
        } finally {
            setIsSending(false);
        }
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!influencer) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="account-alert" size={48} color={COLORS.disabled} />
                <Text style={styles.errorText}>{errorMessage || 'Influencer not found'}</Text>
                <TouchableOpacity style={styles.errorButton} onPress={() => router.replace('/(tabs)/search')}>
                    <Text style={styles.errorButtonText}>Back to Search</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{influencer.name?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.verifiedContainer}>
                    {influencer.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.surface} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{influencer.name}</Text>
                <Text style={styles.niches}>{influencer.niches}</Text>

                <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={18} color={COLORS.warning} />
                    <Text style={styles.rating}>{influencer.rating}</Text>
                    <Text style={styles.ratingText}>rating</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{formatFollowers(influencer.followerCount)}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{influencer.engagementRate}%</Text>
                    <Text style={styles.statLabel}>Engagement</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{influencer.verificationScore}</Text>
                    <Text style={styles.statLabel}>Trust Score</Text>
                </View>
            </View>

            {/* Bio */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bio}>{influencer.bio}</Text>
            </View>

            {/* Analytics */}
            {influencer.analytics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Audience Analytics</Text>
                    <View style={styles.analyticsCard}>
                        <View style={styles.analyticsRow}>
                            <View style={styles.analyticsItem}>
                                <MaterialCommunityIcons name="heart" size={20} color={COLORS.secondary} />
                                <Text style={styles.analyticsValue}>{influencer.analytics.avgLikes?.toLocaleString()}</Text>
                                <Text style={styles.analyticsLabel}>Avg Likes</Text>
                            </View>
                            <View style={styles.analyticsItem}>
                                <MaterialCommunityIcons name="comment" size={20} color={COLORS.primary} />
                                <Text style={styles.analyticsValue}>{influencer.analytics.avgComments?.toLocaleString()}</Text>
                                <Text style={styles.analyticsLabel}>Avg Comments</Text>
                            </View>
                            <View style={styles.analyticsItem}>
                                <MaterialCommunityIcons name="share" size={20} color={COLORS.success} />
                                <Text style={styles.analyticsValue}>{influencer.analytics.avgShares?.toLocaleString()}</Text>
                                <Text style={styles.analyticsLabel}>Avg Shares</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.subSectionTitle}>Top Audience Locations</Text>
                    <View style={styles.locationsContainer}>
                        {influencer.analytics.audienceDemographics && Object.entries(influencer.analytics.audienceDemographics as Record<string, number>).map(([key, value]) => (
                            <View key={key} style={styles.locationItem}>
                                <Text style={styles.locationLabel}>{key}</Text>
                                <View style={styles.locationBar}>
                                    <View style={[styles.locationFill, { width: `${value as number}%` }]} />
                                </View>
                                <Text style={styles.locationValue}>{value as number}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Pricing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingCard}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
                    <View style={styles.pricingInfo}>
                        <Text style={styles.pricingLabel}>Hourly Rate</Text>
                        <Text style={styles.pricingValue}>₹{influencer.hourlyRate?.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Connect Section */}
            {user?.role === 'business' && (
                <View style={styles.connectSection}>
                    <Text style={styles.connectTitle}>Send Collaboration Request</Text>
                    <TextInput
                        style={styles.messageInput}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Introduce yourself and describe your campaign..."
                        multiline
                        numberOfLines={4}
                        placeholderTextColor={COLORS.disabled}
                    />
                    <TouchableOpacity
                        style={[styles.connectButton, isSending && styles.buttonDisabled]}
                        onPress={handleConnect}
                        disabled={isSending}
                    >
                        <MaterialCommunityIcons name="send" size={20} color={COLORS.surface} />
                        <Text style={styles.connectButtonText}>
                            {isSending ? 'Sending...' : 'Send Request'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 12,
        textAlign: 'center',
    },
    errorButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        marginTop: 16,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    errorButtonText: {
        color: COLORS.surface,
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    profileCard: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        borderRadius: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    verifiedContainer: {
        marginTop: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    verifiedText: {
        fontSize: 12,
        color: COLORS.surface,
        fontWeight: '600',
        marginLeft: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 12,
    },
    niches: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    rating: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 6,
    },
    ratingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 16,
        marginBottom: 12,
    },
    analyticsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    analyticsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    analyticsItem: {
        alignItems: 'center',
    },
    analyticsValue: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 8,
    },
    analyticsLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    locationsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationLabel: {
        width: 50,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    locationBar: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginHorizontal: 12,
    },
    locationFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    locationValue: {
        width: 40,
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
        textAlign: 'right',
    },
    pricingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    pricingInfo: {
        marginLeft: 16,
    },
    pricingLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    pricingValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 4,
    },
    connectSection: {
        padding: 16,
        marginTop: 8,
    },
    connectTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    messageInput: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 120,
        textAlignVertical: 'top',
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    connectButtonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
