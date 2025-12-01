// Landing/Welcome screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function LandingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Background Gradient */}
            <View style={styles.gradientBackground}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="leaf" size={80} color={Colors.textLight} />
                    </View>

                    <Text style={styles.appName}>Detectify</Text>
                    <Text style={styles.tagline}>AI-Powered Plant Disease Detection</Text>

                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Ionicons name="camera" size={24} color={Colors.textLight} />
                            <Text style={styles.featureText}>Instant Scanning</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="analytics" size={24} color={Colors.textLight} />
                            <Text style={styles.featureText}>AI Analysis</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="medical" size={24} color={Colors.textLight} />
                            <Text style={styles.featureText}>Treatment Tips</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={() => router.push('/signup')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signUpButtonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => router.push('/signin')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.push('/home')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.skipButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    gradientBackground: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.xl,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Layout.spacing.xl,
    },
    appName: {
        fontSize: 56,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginBottom: Layout.spacing.sm,
    },
    tagline: {
        fontSize: Layout.fontSize.lg,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: Layout.spacing.xxl,
    },
    featuresContainer: {
        flexDirection: 'row',
        gap: Layout.spacing.xl,
        marginTop: Layout.spacing.xl,
    },
    featureItem: {
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    featureText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textLight,
        fontWeight: '600',
    },
    actionsContainer: {
        padding: Layout.spacing.xl,
        gap: Layout.spacing.md,
    },
    signUpButton: {
        backgroundColor: Colors.textLight,
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signUpButtonText: {
        color: Colors.primary,
        fontSize: Layout.fontSize.lg,
        fontWeight: '700',
    },
    signInButton: {
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        alignItems: 'center',
    },
    signInButtonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: Layout.spacing.sm,
        alignItems: 'center',
    },
    skipButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: Layout.fontSize.sm,
        fontWeight: '500',
    },
});
