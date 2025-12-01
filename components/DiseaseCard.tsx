// Disease information card component

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DiseaseResult } from '../types/disease';
import { Colors, getSeverityColor } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface DiseaseCardProps {
    result: DiseaseResult;
}

export default function DiseaseCard({ result }: DiseaseCardProps) {
    const severityColor = getSeverityColor(result.severity);

    return (
        <View style={styles.container}>
            {/* Image Preview */}
            <Image source={{ uri: result.imageUri }} style={styles.image} />

            {/* Disease Information */}
            <View style={styles.infoContainer}>
                {/* Plant Type */}
                <Text style={styles.plantType}>{result.plantType}</Text>

                {/* Disease Name */}
                <Text style={styles.diseaseName}>{result.diseaseName}</Text>

                {/* Confidence and Severity */}
                <View style={styles.metricsRow}>
                    {/* Confidence */}
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Confidence</Text>
                        <View style={styles.confidenceBar}>
                            <View
                                style={[
                                    styles.confidenceFill,
                                    { width: `${result.confidence}%`, backgroundColor: Colors.primary },
                                ]}
                            />
                        </View>
                        <Text style={styles.confidenceText}>{result.confidence.toFixed(1)}%</Text>
                    </View>

                    {/* Severity Badge */}
                    <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                        <Text style={styles.severityText}>{result.severity}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{result.description}</Text>
                </View>

                {/* Treatments */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💊 Recommended Treatments</Text>
                    {result.treatments.map((treatment, index) => (
                        <View key={index} style={styles.treatmentItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.treatmentText}>{treatment}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    image: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: Layout.spacing.lg,
    },
    plantType: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    diseaseName: {
        fontSize: Layout.fontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Layout.spacing.xs,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Layout.spacing.lg,
    },
    metricItem: {
        flex: 1,
        marginRight: Layout.spacing.md,
    },
    metricLabel: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.xs,
    },
    confidenceBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: Layout.radius.full,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        borderRadius: Layout.radius.full,
    },
    confidenceText: {
        fontSize: Layout.fontSize.md,
        fontWeight: '700',
        color: Colors.text,
        marginTop: Layout.spacing.xs,
    },
    severityBadge: {
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm,
        borderRadius: Layout.radius.full,
    },
    severityText: {
        color: Colors.textLight,
        fontWeight: '700',
        fontSize: Layout.fontSize.sm,
    },
    section: {
        marginTop: Layout.spacing.lg,
    },
    sectionTitle: {
        fontSize: Layout.fontSize.md,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    description: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    treatmentItem: {
        flexDirection: 'row',
        marginTop: Layout.spacing.sm,
    },
    bullet: {
        fontSize: Layout.fontSize.md,
        color: Colors.primary,
        marginRight: Layout.spacing.sm,
        fontWeight: 'bold',
    },
    treatmentText: {
        flex: 1,
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
