// Camera screen for capturing plant images

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function CameraScreen() {
    const router = useRouter();
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.permissionText}>Camera permission required</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            });

            if (photo) {
                router.push({
                    pathname: '/results',
                    params: { imageUri: photo.uri },
                });
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
        }
    };

    const handleGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            router.push({
                pathname: '/results',
                params: { imageUri: result.assets[0].uri },
            });
        }
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                enableTorch={flash === 'on'}
            >
                {/* Header */}
                <SafeAreaView style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={28} color={Colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleFlash}
                    >
                        <Ionicons
                            name={flash === 'on' ? 'flash' : 'flash-off'}
                            size={24}
                            color={Colors.textLight}
                        />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Guide Overlay */}
                <View style={styles.guideContainer}>
                    <View style={styles.guideBox}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <Text style={styles.guideText}>Position leaf within frame</Text>
                </View>

                {/* Bottom Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.galleryButton}
                        onPress={handleGallery}
                    >
                        <Ionicons name="images" size={28} color={Colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        activeOpacity={0.8}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <View style={styles.placeholder} />
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Layout.spacing.xl,
    },
    permissionText: {
        fontSize: Layout.fontSize.lg,
        color: Colors.text,
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.xl,
    },
    permissionButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Layout.spacing.xl,
        paddingVertical: Layout.spacing.md,
        borderRadius: Layout.radius.md,
    },
    permissionButtonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Layout.spacing.lg,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: 280,
        height: 280,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: Colors.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    guideText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: '600',
        marginTop: Layout.spacing.xl,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.xl,
        paddingBottom: Layout.spacing.xxl,
    },
    galleryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.primary,
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
    },
    placeholder: {
        width: 56,
    },
});
