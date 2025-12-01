// Type definitions for plant disease detection

export enum Severity {
    HEALTHY = 'Healthy',
    MILD = 'Mild',
    MODERATE = 'Moderate',
    SEVERE = 'Severe',
}

export enum PlantType {
    APPLE = 'Apple',
    TOMATO = 'Tomato',
    POTATO = 'Potato',
    CORN = 'Corn',
    GRAPE = 'Grape',
    UNKNOWN = 'Unknown',
}

export interface DiseaseResult {
    id: string;
    imageUri: string;
    plantType: PlantType;
    diseaseName: string;
    confidence: number; // 0-100
    severity: Severity;
    description: string;
    treatments: string[];
    timestamp: number;
}

export interface ScanHistory {
    scans: DiseaseResult[];
}

export interface AnalysisResponse {
    success: boolean;
    data?: DiseaseResult;
    error?: string;
}
