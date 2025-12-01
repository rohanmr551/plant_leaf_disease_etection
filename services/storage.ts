// Local storage service using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiseaseResult, ScanHistory } from '../types/disease';

const STORAGE_KEY = '@detectify_scan_history';

export const StorageService = {
    /**
     * Save a new scan to history
     */
    async saveScan(scanData: DiseaseResult): Promise<void> {
        try {
            const existingData = await this.getAllScans();
            const updatedScans = [scanData, ...existingData];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScans));
        } catch (error) {
            console.error('Error saving scan:', error);
            throw error;
        }
    },

    /**
     * Retrieve all scans from history
     */
    async getAllScans(): Promise<DiseaseResult[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('Error retrieving scans:', error);
            return [];
        }
    },

    /**
     * Get a single scan by ID
     */
    async getScanById(id: string): Promise<DiseaseResult | null> {
        try {
            const scans = await this.getAllScans();
            return scans.find(scan => scan.id === id) || null;
        } catch (error) {
            console.error('Error retrieving scan:', error);
            return null;
        }
    },

    /**
     * Delete a scan from history
     */
    async deleteScan(id: string): Promise<void> {
        try {
            const scans = await this.getAllScans();
            const updatedScans = scans.filter(scan => scan.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScans));
        } catch (error) {
            console.error('Error deleting scan:', error);
            throw error;
        }
    },

    /**
     * Clear all scan history
     */
    async clearHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing history:', error);
            throw error;
        }
    },

    /**
     * Get recent scans (limit to n items)
     */
    async getRecentScans(limit: number = 3): Promise<DiseaseResult[]> {
        try {
            const scans = await this.getAllScans();
            return scans.slice(0, limit);
        } catch (error) {
            console.error('Error retrieving recent scans:', error);
            return [];
        }
    },
};
