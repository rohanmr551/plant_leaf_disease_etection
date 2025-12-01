// Scan history item component

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DiseaseResult } from '../types/disease';
import { Colors, getSeverityColor } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface ScanHistoryItemProps {
    scan: DiseaseResult;
    onPress: () => void;
}

export default function ScanHistoryItem({ scan, onPress }: ScanHistoryItemProps) {
    const severityColor = getSeverityColor(scan.severity);
    const date = new Date(scan.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {/* Thumbnail */}
            <Image source={{ uri: scan.imageUri }} style={styles.thumbnail} />

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.diseaseName} numberOfLines={1}>
                    {scan.diseaseName}
                </Text>
                <Text style={styles.plantType}>{scan.plantType}</Text>
                <Text style={styles.dateTime}>
                    {formattedDate} • {formattedTime}
                </Text>
            </View>

            {/* Confidence and Severity */}
            <View style={styles.metricsContainer}>
                <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                <Text style={styles.confidence}>{scan.confidence.toFixed(0)}%</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.md,
        padding: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: Layout.radius.sm,
        backgroundColor: Colors.border,
    },
    infoContainer: {
        flex: 1,
        marginLeft: Layout.spacing.md,
        justifyContent: 'center',
    },
    diseaseName: {
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },
    plantType: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.xs,
    },
    dateTime: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
    },
    metricsContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    severityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: Layout.spacing.sm,
    },
    confidence: {
        fontSize: Layout.fontSize.md,
        fontWeight: '700',
        color: Colors.text,
    },
});
