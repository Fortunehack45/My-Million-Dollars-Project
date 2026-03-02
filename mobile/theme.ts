
// Argus Mobile Design System
export const Colors = {
    maroon: '#800000',
    maroonLight: '#a00000',
    maroonDark: '#600000',
    maroonBg: 'rgba(128, 0, 0, 0.08)',
    maroonBorder: 'rgba(128, 0, 0, 0.25)',

    // Zinc palette
    zinc900: '#18181b',
    zinc800: '#27272a',
    zinc700: '#3f3f46',
    zinc600: '#52525b',
    zinc500: '#71717a',
    zinc400: '#a1a1aa',
    zinc300: '#d4d4d8',
    zinc200: '#e4e4e7',
    zinc100: '#f4f4f5',

    // Base
    background: '#09090b',
    surface: '#0d0d10',
    surfaceHigh: '#141418',
    white: '#ffffff',
    black: '#000000',

    // Status
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
};

export const Typography = {
    displayXL: { fontSize: 48, fontWeight: '900' as const, letterSpacing: -1.5 },
    displayLG: { fontSize: 36, fontWeight: '900' as const, letterSpacing: -1 },
    displayMD: { fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5 },
    displaySM: { fontSize: 22, fontWeight: '900' as const },
    headingLG: { fontSize: 18, fontWeight: '800' as const },
    headingSM: { fontSize: 15, fontWeight: '800' as const },
    bodyLG: { fontSize: 14, fontWeight: '500' as const },
    bodySM: { fontSize: 12, fontWeight: '400' as const },
    label: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 1.5, textTransform: 'uppercase' as const },
    mono: { fontFamily: 'monospace' as const },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
};

export const Shadows = {
    maroon: {
        shadowColor: Colors.maroon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 12,
    },
};
