import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { COLORS } from '../../../constants';
import { Conversation } from '../../../types';

export default function MessagesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setError('');
            const data = await api.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setError('Could not load messages. Check that the backend is running on port 3000.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-IN', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
    };

    const getOtherUserName = (conv: Conversation) => {
        if (conv.profile?.name) return conv.profile.name;
        if (conv.profile?.businessName) return conv.profile.businessName;
        return 'Unknown User';
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => router.push(`/messages/chat/${item.otherUserId}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {getOtherUserName(item).charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.userName}>{getOtherUserName(item)}</Text>
                    <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'No messages yet'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {error ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
                    <Text style={styles.emptyText}>Unable to load conversations</Text>
                    <Text style={styles.emptySubtext}>{error}</Text>
                </View>
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="message-text-outline" size={64} color={COLORS.disabled} />
                    <Text style={styles.emptyText}>No conversations yet</Text>
                    <Text style={styles.emptySubtext}>Start a conversation by reaching out to influencers</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.otherUserId}
                    renderItem={renderConversation}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
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
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    conversationContent: {
        flex: 1,
        marginLeft: 12,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    time: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
