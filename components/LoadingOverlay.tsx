// Loading overlay component

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export default function LoadingOverlay({ visible, message = 'Analyzing...' }: LoadingOverlayProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.radius.lg,
        padding: Layout.spacing.xl,
        alignItems: 'center',
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    message: {
        marginTop: Layout.spacing.md,
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        fontWeight: '600',
    },
});
