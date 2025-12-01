// History screen - View all past scans

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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { StorageService } from '../services/storage';
import { DiseaseResult } from '../types/disease';
import ScanHistoryItem from '../components/ScanHistoryItem';

export default function HistoryScreen() {
    const router = useRouter();
    const [scans, setScans] = useState<DiseaseResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScans();
    }, []);

    const loadScans = async () => {
        try {
            const allScans = await StorageService.getAllScans();
            setScans(allScans);
        } catch (error) {
            console.error('Error loading scans:', error);
            Alert.alert('Error', 'Failed to load scan history');
        } finally {
            setLoading(false);
        }
    };

    const handleScanPress = (scan: DiseaseResult) => {
        router.push({
            pathname: '/results',
            params: { scanId: scan.id },
        });
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to delete all scan history? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await StorageService.clearHistory();
                            setScans([]);
                            Alert.alert('Success', 'History cleared');
                        } catch (error) {
                            console.error('Error clearing history:', error);
                            Alert.alert('Error', 'Failed to clear history');
                        }
                    },
                },
            ]
        );
    };

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
                <Text style={styles.headerTitle}>Scan History</Text>
                {scans.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearHistory}
                    >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                )}
                {scans.length === 0 && <View style={styles.placeholder} />}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : scans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="folder-open-outline" size={80} color={Colors.border} />
                    <Text style={styles.emptyTitle}>No Scans Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Your scan history will appear here
                    </Text>
                    <TouchableOpacity
                        style={styles.startScanButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.startScanButtonText}>Start Scanning</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.countText}>
                        {scans.length} {scans.length === 1 ? 'scan' : 'scans'}
                    </Text>

                    {scans.map((scan) => (
                        <ScanHistoryItem
                            key={scan.id}
                            scan={scan}
                            onPress={() => handleScanPress(scan)}
                        />
                    ))}
                </ScrollView>
            )}
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
    clearButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Layout.spacing.xl,
    },
    emptyTitle: {
        fontSize: Layout.fontSize.xl,
        fontWeight: '700',
        color: Colors.text,
        marginTop: Layout.spacing.lg,
    },
    emptySubtitle: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        marginTop: Layout.spacing.sm,
        textAlign: 'center',
    },
    startScanButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Layout.spacing.xl,
        paddingVertical: Layout.spacing.md,
        borderRadius: Layout.radius.md,
        marginTop: Layout.spacing.xl,
    },
    startScanButtonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
    },
    countText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.md,
        fontWeight: '600',
    },
});
