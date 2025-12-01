import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { DiseaseDetectionService } from '../services/diseaseDetection';
import { StorageService } from '../services/storage';
import { DiseaseResult } from '../types/disease';
import DiseaseCard from '../components/DiseaseCard';
import LoadingOverlay from '../components/LoadingOverlay';

export default function ResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [result, setResult] = useState<DiseaseResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadResult();
    }, []);

    const loadResult = async () => {
        try {
            // Check if we're viewing an existing scan
            if (params.scanId && typeof params.scanId === 'string') {
                const existingScan = await StorageService.getScanById(params.scanId);
                if (existingScan) {
                    setResult(existingScan);
                    setSaved(true);
                }
                setLoading(false);
                return;
            }

            // Analyze new image
            if (params.imageUri && typeof params.imageUri === 'string') {
                const response = await DiseaseDetectionService.analyzePlantImage(params.imageUri);

                if (response.success && response.data) {
                    setResult(response.data);
                } else {
                    Alert.alert('Error', response.error || 'Failed to analyze image');
                    router.back();
                }
            }
        } catch (error) {
            console.error('Error loading result:', error);
            Alert.alert('Error', 'Failed to load results');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result || saved) return;

        try {
            await StorageService.saveScan(result);
            setSaved(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Scan saved to history');
        } catch (error) {
            console.error('Error saving scan:', error);
            Alert.alert('Error', 'Failed to save scan');
        }
    };

    const handleScanAnother = () => {
        router.push('/');
    };

    if (loading) {
        return <LoadingOverlay visible={loading} message="Analyzing plant..." />;
    }

    if (!result) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detection Results</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Disease Card */}
                <DiseaseCard result={result} />

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {!saved && (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="bookmark" size={20} color={Colors.textLight} />
                            <Text style={styles.saveButtonText}>Save to History</Text>
                        </TouchableOpacity>
                    )}

                    {saved && (
                        <View style={styles.savedIndicator}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                            <Text style={styles.savedText}>Saved to History</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.scanAnotherButton}
                        onPress={handleScanAnother}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="camera" size={20} color={Colors.primary} />
                        <Text style={styles.scanAnotherButtonText}>Scan Another Plant</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={Colors.info} />
                    <Text style={styles.infoText}>
                        This analysis is AI-powered and should be used as a guide. For critical decisions,
                        please consult with agricultural experts.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Layout.fontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
    },
    actionsContainer: {
        marginTop: Layout.spacing.lg,
        gap: Layout.spacing.md,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    saveButtonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    savedIndicator: {
        backgroundColor: Colors.gradientLight,
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        borderWidth: 1,
        borderColor: Colors.success,
    },
    savedText: {
        color: Colors.success,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    scanAnotherButton: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.md,
        paddingVertical: Layout.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    scanAnotherButtonText: {
        color: Colors.primary,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.md,
        padding: Layout.spacing.lg,
        marginTop: Layout.spacing.lg,
        flexDirection: 'row',
        gap: Layout.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: Colors.info,
    },
    infoText: {
        flex: 1,
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
