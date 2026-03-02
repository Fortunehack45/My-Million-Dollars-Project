
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Image as ImageIcon, Lock, Sparkles } from 'lucide-react-native';

const NFT_ITEMS = [
    { id: 1, name: 'Genesis Node #001', rarity: 'LEGENDARY', color: Colors.maroon, edition: '1/1' },
    { id: 2, name: 'Argus Sentinel #042', rarity: 'EPIC', color: '#a855f7', edition: '1/50' },
    { id: 3, name: 'Protocol Warden #117', rarity: 'RARE', color: '#3b82f6', edition: '1/200' },
    { id: 4, name: 'Ghost Block #289', rarity: 'UNCOMMON', color: '#10b981', edition: '1/500' },
];

const RARITY_COLORS: Record<string, string> = {
    LEGENDARY: '#f59e0b',
    EPIC: '#a855f7',
    RARE: '#3b82f6',
    UNCOMMON: '#10b981',
};

export default function NFTScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.headerIconBox}>
                        <ImageIcon size={18} color={Colors.maroon} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Argus Genesis Collection</Text>
                        <View style={styles.headerSub}>
                            <View style={styles.subDot} />
                            <Text style={styles.headerSubText}>TGE_LOCKED · CLAIM AT MAINNET LAUNCH</Text>
                        </View>
                    </View>
                </View>

                {/* ── COMING SOON BANNER ── */}
                <View style={styles.banner}>
                    <View style={styles.bannerGlow} pointerEvents="none" />
                    <Lock size={20} color={Colors.maroon} />
                    <View>
                        <Text style={styles.bannerTitle}>NFT Claims Open at TGE</Text>
                        <Text style={styles.bannerText}>
                            Genesis NFTs are awarded based on your node rank and ARG mined during the Genesis Epoch.
                        </Text>
                    </View>
                </View>

                {/* ── NFT PREVIEW GRID ── */}
                <Text style={styles.sectionTitle}>Genesis Collection Preview</Text>
                <View style={styles.grid}>
                    {NFT_ITEMS.map(nft => (
                        <TouchableOpacity key={nft.id} style={styles.nftCard} activeOpacity={0.85}>
                            {/* NFT Art Placeholder */}
                            <View style={[styles.nftArt, { borderColor: nft.color + '40' }]}>
                                <View style={[styles.nftArtInner, { backgroundColor: nft.color + '15' }]}>
                                    <Text style={styles.nftArtText}>A</Text>
                                </View>
                                <View style={styles.nftLockOverlay}>
                                    <Lock size={16} color={Colors.zinc600} />
                                </View>
                            </View>
                            {/* Rarity badge */}
                            <View style={[styles.rarityBadge, { backgroundColor: (RARITY_COLORS[nft.rarity] || '#fff') + '20', borderColor: (RARITY_COLORS[nft.rarity] || '#fff') + '40' }]}>
                                <Sparkles size={8} color={RARITY_COLORS[nft.rarity] || Colors.white} />
                                <Text style={[styles.rarityText, { color: RARITY_COLORS[nft.rarity] || Colors.white }]}>
                                    {nft.rarity}
                                </Text>
                            </View>
                            <Text style={styles.nftName} numberOfLines={1}>{nft.name}</Text>
                            <View style={styles.nftFooter}>
                                <Text style={styles.nftEdition}>{nft.edition}</Text>
                                <View style={styles.tgeBadge}>
                                    <Text style={styles.tgeText}>TGE</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── HOW TO EARN ── */}
                <View style={styles.earnSection}>
                    <Text style={styles.earnTitle}>How to Earn Genesis NFTs</Text>
                    {[
                        { step: '01', text: 'Mine ARG continuously during the Genesis Epoch' },
                        { step: '02', text: 'Refer verified nodes to boost your rank score' },
                        { step: '03', text: 'Complete social tasks for bonus points' },
                        { step: '04', text: 'Hold your rank until TGE to claim your NFT tier' },
                    ].map(e => (
                        <View key={e.step} style={styles.earnStep}>
                            <View style={styles.earnStepNum}>
                                <Text style={styles.earnStepNumText}>{e.step}</Text>
                            </View>
                            <Text style={styles.earnStepText}>{e.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 100 },

    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    headerIconBox: {
        width: 40, height: 40, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 13, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    subDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.maroon },
    headerSubText: { ...Typography.label, color: Colors.zinc500, fontSize: 7 },

    banner: {
        flexDirection: 'row', gap: 14, alignItems: 'flex-start',
        backgroundColor: Colors.maroonBg, borderWidth: 1, borderColor: Colors.maroonBorder,
        borderRadius: BorderRadius.xl, padding: Spacing.xl, overflow: 'hidden',
    },
    bannerGlow: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, backgroundColor: Colors.maroon, opacity: 0.06, borderRadius: 50 },
    bannerTitle: { fontSize: 14, fontWeight: '800', color: Colors.white, marginBottom: 4 },
    bannerText: { fontSize: 12, color: Colors.zinc400, lineHeight: 18, flex: 1 },

    sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.zinc500, letterSpacing: 1.5, textTransform: 'uppercase' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    nftCard: {
        width: '47%', backgroundColor: Colors.surface, borderWidth: 1,
        borderColor: Colors.zinc800 + '80', borderRadius: BorderRadius.xl, padding: Spacing.md, gap: 8,
    },
    nftArt: {
        width: '100%', aspectRatio: 1, borderRadius: BorderRadius.lg,
        borderWidth: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    },
    nftArtInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    nftArtText: { fontSize: 52, fontWeight: '900', color: Colors.white, opacity: 0.15 },
    nftLockOverlay: { position: 'absolute', top: 8, right: 8 },
    rarityBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, borderWidth: 1, alignSelf: 'flex-start',
    },
    rarityText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    nftName: { fontSize: 11, fontWeight: '800', color: Colors.white },
    nftFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nftEdition: { fontSize: 9, fontFamily: 'monospace', color: Colors.zinc600 },
    tgeBadge: { backgroundColor: Colors.zinc900, borderWidth: 1, borderColor: Colors.zinc700, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    tgeText: { fontSize: 8, fontWeight: '700', color: Colors.zinc500, letterSpacing: 0.5 },

    earnSection: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800 + '80', borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.lg },
    earnTitle: { fontSize: 12, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
    earnStep: { flexDirection: 'row', gap: 14, alignItems: 'center' },
    earnStepNum: {
        width: 28, height: 28, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.md,
        justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    earnStepNumText: { fontSize: 9, fontFamily: 'monospace', fontWeight: '900', color: Colors.maroon },
    earnStepText: { flex: 1, fontSize: 12, color: Colors.zinc400, lineHeight: 18 },
});
