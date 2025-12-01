// Home screen - Main dashboard

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { StorageService } from '../services/storage';
import { DiseaseResult } from '../types/disease';
import ScanHistoryItem from '../components/ScanHistoryItem';

export default function HomePage() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState<DiseaseResult[]>([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    const scans = await StorageService.getRecentScans(3);
    setRecentScans(scans);
  };

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to scan plants');
      return;
    }
    router.push('/camera');
  };

  const handleGalleryPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Gallery permission is required to upload images');
      return;
    }

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

  const handleScanPress = (scan: DiseaseResult) => {
    router.push({
      pathname: '/results',
      params: { scanId: scan.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.appName}>Detectify 🌿</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Plant Disease Detection</Text>
          <Text style={styles.heroSubtitle}>
            Identify plant diseases instantly with AI-powered analysis
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Scan Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCameraPress}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="camera" size={32} color={Colors.textLight} />
            </View>
            <Text style={styles.primaryButtonText}>Scan Plant</Text>
            <Text style={styles.primaryButtonSubtext}>Use camera to detect disease</Text>
          </TouchableOpacity>

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGalleryPress}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryIconContainer}>
              <Ionicons name="images" size={24} color={Colors.primary} />
            </View>
            <View style={styles.secondaryButtonTextContainer}>
              <Text style={styles.secondaryButtonText}>Upload from Gallery</Text>
              <Text style={styles.secondaryButtonSubtext}>Choose existing photo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentScans.map((scan) => (
              <ScanHistoryItem
                key={scan.id}
                scan={scan}
                onPress={() => handleScanPress(scan)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {recentScans.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyStateText}>No scans yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by scanning a plant leaf to detect diseases
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.lg,
  },
  greeting: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  heroSection: {
    marginBottom: Layout.spacing.xl,
  },
  heroTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  heroSubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: Layout.spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  primaryButtonText: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: Layout.spacing.xs,
  },
  primaryButtonSubtext: {
    fontSize: Layout.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gradientLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  secondaryButtonTextContainer: {
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  secondaryButtonSubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  recentSection: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xxl,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
});
