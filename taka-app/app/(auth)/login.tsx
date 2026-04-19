import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { COLORS } from '../../constants';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('');
    const [isTestingBackend, setIsTestingBackend] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            router.replace('/(tabs)/discover');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestBackend = async () => {
        setIsTestingBackend(true);
        setBackendStatus(`Testing ${api.getBaseUrl()} ...`);

        try {
            const result = await api.healthCheck();
            setBackendStatus(`Backend OK: ${result.message}`);
        } catch (err: any) {
            setBackendStatus(err.message || `Could not reach ${api.getBaseUrl()}`);
        } finally {
            setIsTestingBackend(false);
        }
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
                        <Text style={styles.tagline}>Hyper-Local Influencer Marketplace</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
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
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                secureTextEntry
                                placeholderTextColor={COLORS.disabled}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, isTestingBackend && styles.buttonDisabled]}
                            onPress={handleTestBackend}
                            disabled={isTestingBackend}
                        >
                            <Text style={styles.secondaryButtonText}>
                                {isTestingBackend ? 'Testing Backend...' : 'Test Backend'}
                            </Text>
                        </TouchableOpacity>

                        {backendStatus ? <Text style={styles.backendStatus}>{backendStatus}</Text> : null}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={styles.link}>Sign Up</Text>
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
        justifyContent: 'flex-start',
        padding: 20,
        paddingBottom: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 12,
    },
    logo: {
        fontSize: 44,
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    error: {
        color: COLORS.error,
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
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
    secondaryButton: {
        borderColor: COLORS.primary,
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    backendStatus: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
        textAlign: 'center',
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
