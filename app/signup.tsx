// Sign Up screen

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

export default function SignUpScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        // TODO: Implement actual sign up logic with backend
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Detectify to save your scans and track plant health</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

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
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
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

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={styles.signUpButton}
                            onPress={handleSignUp}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signUpButtonText}>Sign Up</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Sign Up */}
                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                            <Ionicons name="logo-google" size={20} color={Colors.text} />
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/signin')}>
                                <Text style={styles.signInLink}>Sign In</Text>
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
    label: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        color: Colors.text,
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
    signUpButton: {
        backgroundColor: Colors.primary,
        borderRadius: Layout.radius.md,
        height: Layout.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Layout.spacing.md,
    },
    signUpButtonText: {
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
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Layout.spacing.md,
    },
    signInText: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
    },
    signInLink: {
        fontSize: Layout.fontSize.md,
        color: Colors.primary,
        fontWeight: '600',
    },
});
