import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { COLORS, BUSINESS_CATEGORIES, BUDGET_RANGES } from '../../../constants';

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState('');
    const [marketingNeeds, setMarketingNeeds] = useState('');
    const [budget, setBudget] = useState('');

    const handleSubmit = async () => {
        if (!businessName || !ownerName || !email || !phone) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await api.submitOnboarding({
                businessName,
                ownerName,
                email,
                phone,
                category,
                marketingNeeds,
                budget,
            });

            Alert.alert(
                'Success!',
                'Your TAKA marketing onboarding request has been submitted. Our team will contact you within 24 hours.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <View>
            <Text style={styles.stepTitle}>Business Details</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput
                    style={styles.input}
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="Enter your business name"
                    placeholderTextColor={COLORS.disabled}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Owner Name *</Text>
                <TextInput
                    style={styles.input}
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.disabled}
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
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor={COLORS.disabled}
                />
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                <Text style={styles.nextButtonText}>Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.surface} />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={styles.stepTitle}>Marketing Requirements</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {BUSINESS_CATEGORIES.map((cat: string) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, category === cat && styles.chipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>What are your marketing goals?</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={marketingNeeds}
                    onChangeText={setMarketingNeeds}
                    placeholder="e.g., Increase brand awareness, drive more customers, promote new product..."
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={COLORS.disabled}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Monthly Marketing Budget</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {BUDGET_RANGES.map((range: string) => (
                        <TouchableOpacity
                            key={range}
                            style={[styles.chip, budget === range && styles.chipActive]}
                            onPress={() => setBudget(range)}
                        >
                            <Text style={[styles.chipText, budget === range && styles.chipTextActive]}>{range}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>TAKA Marketing</Text>
                        <Text style={styles.headerSubtitle}>Join our influencer marketing program</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                    <View style={styles.progressLine} />
                    <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {step === 1 ? renderStep1() : renderStep2()}
                </View>

                {/* Benefits */}
                <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>Why join TAKA Marketing?</Text>
                    <View style={styles.benefitItem}>
                        <MaterialCommunityIcons name="account-group" size={20} color={COLORS.primary} />
                        <Text style={styles.benefitText}>Access to verified local influencers</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <MaterialCommunityIcons name="chart-line" size={20} color={COLORS.primary} />
                        <Text style={styles.benefitText}>Real-time campaign analytics</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.primary} />
                        <Text style={styles.benefitText}>Escrow-based secure payments</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <MaterialCommunityIcons name="headset" size={20} color={COLORS.primary} />
                        <Text style={styles.benefitText}>Dedicated account manager</Text>
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
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
    },
    backIcon: {
        padding: 8,
    },
    headerContent: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.border,
    },
    progressDotActive: {
        backgroundColor: COLORS.primary,
    },
    progressLine: {
        width: 60,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    form: {
        backgroundColor: COLORS.surface,
        margin: 16,
        borderRadius: 16,
        padding: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 20,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    chipTextActive: {
        color: COLORS.surface,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    nextButtonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
    },
    backButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    submitButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    benefitsContainer: {
        padding: 16,
        marginTop: 8,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 12,
    },
});
