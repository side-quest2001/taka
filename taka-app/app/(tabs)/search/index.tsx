import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { COLORS, CATEGORIES } from '../../../constants';
import { InfluencerProfile } from '../../../types';

export default function SearchScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState<InfluencerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadInfluencers();
    }, []);

    useEffect(() => {
        filterInfluencers();
    }, [searchQuery, selectedCategory, influencers]);

    const loadInfluencers = async () => {
        try {
            setError('');
            const data = await api.getInfluencers();
            setInfluencers(data);
        } catch (error) {
            console.error('Failed to load influencers:', error);
            setError('Could not load influencers. Check that the backend is running on port 3000.');
        } finally {
            setIsLoading(false);
        }
    };

    const filterInfluencers = () => {
        let filtered = [...influencers];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inf =>
                inf.name?.toLowerCase().includes(query) ||
                inf.bio?.toLowerCase().includes(query) ||
                inf.niches?.toLowerCase().includes(query)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(inf =>
                inf.niches?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        setFilteredInfluencers(filtered);
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const renderInfluencerCard = ({ item }: { item: InfluencerProfile }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/search/influencer/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.name?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.isVerified && (
                            <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.success} />
                        )}
                    </View>
                    <Text style={styles.niches}>{item.niches}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.rating}>{item.rating}</Text>
                </View>
            </View>

            <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>

            <View style={styles.cardStats}>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="account-group" size={16} color={COLORS.primary} />
                    <Text style={styles.statValue}>{formatFollowers(item.followerCount)}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="percent" size={16} color={COLORS.secondary} />
                    <Text style={styles.statValue}>{item.engagementRate}%</Text>
                    <Text style={styles.statLabel}>Engagement</Text>
                </View>
                <View style={styles.stat}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.success} />
                    <Text style={styles.statValue}>{item.verificationScore}</Text>
                    <Text style={styles.statLabel}>Trust Score</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.price}>₹{item.hourlyRate?.toLocaleString()}/hr</Text>
                <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => router.push(`/search/influencer/${item.id}`)}
                >
                    <Text style={styles.connectText}>View Profile</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search influencers..."
                        placeholderTextColor={COLORS.disabled}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Category Filter */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
                        >
                            <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Results */}
            {error ? (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.error} />
                    <Text style={styles.emptyText}>Unable to load influencers</Text>
                    <Text style={styles.emptySubtext}>{error}</Text>
                </View>
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredInfluencers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderInfluencerCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-search" size={64} color={COLORS.disabled} />
                            <Text style={styles.emptyText}>No influencers found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        backgroundColor: COLORS.surface,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    categoriesContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: COLORS.surface,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginRight: 6,
    },
    niches: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rating: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 4,
    },
    bio: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginRight: 4,
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
        padding: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
});
