import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Institutional-grade Haptic Service
 * Provides consistent, high-fidelity tactile feedback across the application.
 */
class HapticService {
    private isHapticsSupported = Platform.OS !== 'web';

    async light() {
        if (!this.isHapticsSupported) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    async medium() {
        if (!this.isHapticsSupported) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    async heavy() {
        if (!this.isHapticsSupported) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    async success() {
        if (!this.isHapticsSupported) return;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    async warning() {
        if (!this.isHapticsSupported) return;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    async error() {
        if (!this.isHapticsSupported) return;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    async selection() {
        if (!this.isHapticsSupported) return;
        await Haptics.selectionAsync();
    }

    /**
     * Custom sequence for premium interactions (e.g. successful block validation)
     */
    async premiumSuccess() {
        if (!this.isHapticsSupported) return;
        await this.light();
        setTimeout(() => this.success(), 100);
    }
}

export const haptics = new HapticService();
export default haptics;
