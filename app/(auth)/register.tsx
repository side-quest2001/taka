import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, ROLES } from '../../constants';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'business' | 'personal' | 'influencer'>('personal');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Profile fields based on role
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');

    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let profileData: any = {};

            if (role === ROLES.BUSINESS) {
                profileData = {
                    businessName: businessName || email.split('@')[0],
                    category: category || 'Other',
                    address: '',
                    description: '',
                    phone: '',
                };
            } else if (role === ROLES.INFLUENCER) {
                profileData = {
                    name: name || email.split('@')[0],
                    bio: '',
                    niches: 'Lifestyle',
                    followerCount: 0,
                    hourlyRate: 0,
                };
            } else {
                profileData = {
                    name: name || email.split('@')[0],
                    phone: '',
                };
            }

            await register(email, password, role, profileData);
            router.replace('/(tabs)/discover');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const RoleCard = ({ value, label, description }: any) => {
        const iconName = value === ROLES.BUSINESS
            ? 'storefront'
            : value === ROLES.INFLUENCER
                ? 'star-circle'
                : 'account-circle';

        return (
            <TouchableOpacity
                style={[styles.roleCard, role === value && styles.roleCardSelected]}
                onPress={() => setRole(value)}
            >
                <MaterialCommunityIcons
                    name={iconName}
                    size={28}
                    color={role === value ? COLORS.primary : COLORS.textSecondary}
                    style={styles.roleIcon}
                />
                <View style={styles.roleInfo}>
                    <Text style={[styles.roleLabel, role === value && styles.roleLabelSelected]}>{label}</Text>
                    <Text style={styles.roleDesc}>{description}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>TAKA</Text>
                    <Text style={styles.tagline}>Create Your Account</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Join TAKA</Text>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <Text style={styles.sectionTitle}>I want to join as:</Text>
                    <View style={styles.rolesContainer}>
                        <RoleCard
                            value="business"
                            label="Business"
                            description="Find influencers for marketing"
                        />
                        <RoleCard
                            value="influencer"
                            label="Influencer"
                            description="Get collaboration opportunities"
                        />
                        <RoleCard
                            value="personal"
                            label="Personal"
                            description="Discover local businesses"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={COLORS.disabled}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            secureTextEntry
                            placeholderTextColor={COLORS.disabled}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry
                            placeholderTextColor={COLORS.disabled}
                        />
                    </View>

                    {role === 'influencer' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Your Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={COLORS.disabled}
                            />
                        </View>
                    )}

                    {role === 'business' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Business Name</Text>
                            <TextInput
                                style={styles.input}
                                value={businessName}
                                onChangeText={setBusinessName}
                                placeholder="Enter business name"
                                placeholderTextColor={COLORS.disabled}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 12,
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    error: {
        color: COLORS.error,
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    rolesContainer: {
        marginBottom: 20,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    roleCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F0FF',
    },
    roleIcon: { marginRight: 16 },
    roleInfo: {
        flex: 1,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    roleLabelSelected: {
        color: COLORS.primary,
    },
    roleDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    link: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
