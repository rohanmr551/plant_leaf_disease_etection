// Color palette for the plant disease detection app

export const Colors = {
    // Primary colors - Green theme for plants
    primary: '#22C55E',
    primaryDark: '#16A34A',
    primaryLight: '#86EFAC',

    // Background colors
    background: '#F8FAFC',
    backgroundDark: '#0F172A',
    surface: '#FFFFFF',
    surfaceDark: '#1E293B',

    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#F1F5F9',

    // Severity colors
    healthy: '#22C55E',
    mild: '#EAB308',
    moderate: '#F97316',
    severe: '#EF4444',

    // UI colors
    border: '#E2E8F0',
    borderDark: '#334155',
    shadow: '#00000015',

    // Accent colors
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#06B6D4',

    // Gradients
    gradientStart: '#22C55E',
    gradientEnd: '#16A34A',
    gradientLight: '#ECFDF5',
};

export const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
        case 'healthy':
            return Colors.healthy;
        case 'mild':
            return Colors.mild;
        case 'moderate':
            return Colors.moderate;
        case 'severe':
            return Colors.severe;
        default:
            return Colors.textSecondary;
    }
};
