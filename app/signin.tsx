// Sign In screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = () => {
        // Validation
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        // TODO: Implement actual sign in logic with backend
        // For now, just navigate to home
        router.replace('/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your plant health journey</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPassword}>Forgot?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={handleSignIn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Sign In */}
                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                            <Ionicons name="logo-google" size={20} color={Colors.text} />
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Guest Access */}
                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={() => router.replace('/home')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.guestButtonText}>Continue as Guest</Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/signup')}>
                                <Text style={styles.signUpLink}>Sign Up</Text>
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
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: Layout.spacing.lg,
    },
    titleContainer: {
        marginBottom: Layout.spacing.xxl,
    },
    title: {
        fontSize: Layout.fontSize.xxxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    subtitle: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    form: {
        gap: Layout.spacing.lg,
    },
    inputContainer: {
        gap: Layout.spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    forgotPassword: {
        fontSize: Layout.fontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Layout.spacing.md,
        gap: Layout.spacing.sm,
    },
    input: {
        flex: 1,
        height: Layout.inputHeight,
        fontSize: Layout.fontSize.md,
        color: Colors.text,
    },
    signInButton: {
        backgroundColor: Colors.primary,
        borderRadius: Layout.radius.md,
        height: Layout.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Layout.spacing.md,
    },
    signInButtonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.lg,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.md,
        marginVertical: Layout.spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.md,
        height: Layout.buttonHeight,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Layout.spacing.sm,
    },
    socialButtonText: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    guestButton: {
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        alignItems: 'center',
    },
    guestButtonText: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Layout.spacing.md,
    },
    signUpText: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
    },
    signUpLink: {
        fontSize: Layout.fontSize.md,
        color: Colors.primary,
        fontWeight: '600',
    },
});
