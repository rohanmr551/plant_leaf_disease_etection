// Layout constants for consistent spacing and sizing

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
    // Screen dimensions
    window: {
        width,
        height,
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    // Border radius
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },

    // Icon sizes
    iconSize: {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
        xxl: 64,
    },

    // Common dimensions
    buttonHeight: 56,
    inputHeight: 48,
    headerHeight: 60,
    tabBarHeight: 80,
};

export const isSmallDevice = width < 375;
