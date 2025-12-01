// Disease detection API service

import { DiseaseResult, AnalysisResponse, PlantType, Severity } from '../types/disease';

/**
 * Mock disease detection service
 * Replace this with actual API calls when backend is ready
 */
export const DiseaseDetectionService = {
    /**
     * Analyze a plant image for disease detection
     * @param imageUri - Local URI of the image to analyze
     * @returns Promise with analysis results
     */
    async analyzePlantImage(imageUri: string): Promise<AnalysisResponse> {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock response - replace with actual API call
            // Example API call structure:
            /*
            const formData = new FormData();
            formData.append('image', {
              uri: imageUri,
              type: 'image/jpeg',
              name: 'plant.jpg',
            });
      
            const response = await fetch('YOUR_API_ENDPOINT', {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
      
            const data = await response.json();
            */

            // Mock data for demonstration
            const mockDiseases = [
                {
                    plantType: PlantType.TOMATO,
                    diseaseName: 'Tomato Late Blight',
                    confidence: 92.5,
                    severity: Severity.SEVERE,
                    description: 'Late blight is a serious disease caused by the fungus-like organism Phytophthora infestans. It can rapidly destroy tomato plants.',
                    treatments: [
                        'Remove and destroy infected plants immediately',
                        'Apply copper-based fungicides',
                        'Improve air circulation around plants',
                        'Avoid overhead watering',
                        'Use resistant varieties in future plantings',
                    ],
                },
                {
                    plantType: PlantType.APPLE,
                    diseaseName: 'Apple Scab',
                    confidence: 88.3,
                    severity: Severity.MODERATE,
                    description: 'Apple scab is a fungal disease that affects apple trees, causing dark, scabby lesions on leaves and fruit.',
                    treatments: [
                        'Apply fungicides during wet weather',
                        'Rake and destroy fallen leaves',
                        'Prune to improve air circulation',
                        'Plant resistant varieties',
                    ],
                },
                {
                    plantType: PlantType.POTATO,
                    diseaseName: 'Potato Early Blight',
                    confidence: 85.7,
                    severity: Severity.MILD,
                    description: 'Early blight is a common fungal disease affecting potato plants, characterized by dark spots with concentric rings.',
                    treatments: [
                        'Apply appropriate fungicides',
                        'Practice crop rotation',
                        'Remove infected plant debris',
                        'Ensure proper spacing for air flow',
                    ],
                },
                {
                    plantType: PlantType.CORN,
                    diseaseName: 'Healthy',
                    confidence: 96.2,
                    severity: Severity.HEALTHY,
                    description: 'Your corn plant appears to be healthy with no signs of disease.',
                    treatments: [
                        'Continue regular watering schedule',
                        'Maintain proper fertilization',
                        'Monitor for any changes',
                    ],
                },
            ];

            // Randomly select a mock disease for demonstration
            const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

            const result: DiseaseResult = {
                id: Date.now().toString(),
                imageUri,
                ...randomDisease,
                timestamp: Date.now(),
            };

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('Error analyzing image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to analyze image',
            };
        }
    },

    /**
     * Get disease information by name
     * This could be used for a disease encyclopedia feature
     */
    async getDiseaseInfo(diseaseName: string): Promise<any> {
        // Placeholder for future implementation
        return null;
    },
};
