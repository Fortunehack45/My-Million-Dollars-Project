
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, ActivityIndicator, Dimensions, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { argusSynapse } from '../../services/ArgusSynapseService';
import { ArgusSynapseService } from '../../services/ArgusSynapseService';
import { EthereumService } from '../../services/EthereumService';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { WalletTx } from '../../types';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, Copy, Check, RefreshCw,
    Send, Download, Repeat, CreditCard, ChevronDown, History,
    X, AlertCircle, Loader2,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import Toast from '../../components/Toast';

const { width } = Dimensions.get('window');
const GAS_FEE = 0.001;

// ── Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const color = status === 'CONFIRMED' ? Colors.success
        : status === 'PENDING' ? Colors.warning : Colors.error;
    return (
        <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
            <View style={[styles.badgeDot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
        </View>
    );
}

// ── Transaction Item ───────────────────────────────────────────────────
function TxItem({ tx, myAddress, onPress }: { tx: WalletTx; myAddress: string; onPress: () => void }) {
    const isSent = tx.from?.toLowerCase() === myAddress?.toLowerCase();
    const amt = Number(tx.amount);
    return (
        <TouchableOpacity style={styles.txRow} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.txIcon, isSent ? styles.txIconSend : styles.txIconReceive]}>
                {isSent
                    ? <ArrowUpRight size={16} color={Colors.zinc400} />
                    : <ArrowDownLeft size={16} color={Colors.success} />}
            </View>
            <View style={styles.txInfo}>
                <View style={styles.txInfoRow}>
                    <Text style={styles.txType}>{isSent ? 'Sent' : 'Received'} {tx.chain}</Text>
                    <StatusBadge status={tx.status} />
                </View>
                <Text style={styles.txMeta} numberOfLines={1}>
                    {isSent ? `To: ${tx.to?.slice(0, 14)}…` : `From: ${tx.from?.slice(0, 14)}…`}
                </Text>
            </View>
            <Text style={[styles.txAmt, isSent ? styles.txAmtSend : styles.txAmtReceive]}>
                {isSent ? '−' : '+'}{amt.toLocaleString(undefined, { maximumFractionDigits: 4 })}{'\n'}
                <Text style={styles.txChain}>{tx.chain}</Text>
            </Text>
        </TouchableOpacity>
    );
}

export default function VaultScreen() {
    const { user } = useAuth();
    const [activeNetwork, setActiveNetwork] = useState<'ARG' | 'ETH'>('ARG');
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [balance, setBalance] = useState({ arg: 0, eth: '0.0000' });
    const [txHistory, setTxHistory] = useState<WalletTx[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
    const [copied, setCopied] = useState(false);

    // Modals
    const [activeModal, setActiveModal] = useState<'SEND' | 'RECEIVE' | 'SWAP' | 'TX_DETAIL' | null>(null);
    const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });
    const [txError, setTxError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        const arg = ArgusSynapseService.generateAddress(user.uid);
        const eth = EthereumService.generateAddress(user.uid);
        setAddresses({ arg, eth });
    }, [user?.uid]);

    useEffect(() => {
        if (!addresses.eth) return;
        setIsRefreshing(true);
        EthereumService.getBalance(addresses.eth)
            .then(b => setBalance(prev => ({ ...prev, eth: b })))
            .finally(() => setIsRefreshing(false));
    }, [addresses.eth]);

    useEffect(() => {
        if (user) setBalance(prev => ({ ...prev, arg: Math.max(0, user.points || 0) }));
    }, [user?.points]);

    useEffect(() => {
        if (!addresses.arg || !addresses.eth) return;
        const q = query(
            collection(db, 'wallet_transactions'),
            where('participants', 'array-contains-any', [addresses.arg, addresses.eth]),
            orderBy('createdAt', 'desc'),
        );
        return onSnapshot(q, snap =>
            setTxHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletTx)))
        );
    }, [addresses.arg, addresses.eth]);

    const currentAddr = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
    const truncAddr = currentAddr ? `${currentAddr.slice(0, 10)}…${currentAddr.slice(-6)}` : '—';
    const dispBal = activeNetwork === 'ARG'
        ? { amount: balance.arg, symbol: 'ARG', dec: 2, usd: (balance.arg * 0.5).toFixed(2) }
        : { amount: parseFloat(balance.eth), symbol: 'ETH', dec: 4, usd: (parseFloat(balance.eth) * 3000).toFixed(2) };
    const netTxs = txHistory.filter(tx => tx.chain === activeNetwork);

    const copyAddr = async () => {
        await Clipboard.setStringAsync(currentAddr);
        setCopied(true);
        setToast({ message: 'Address copied to clipboard.', type: 'info' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = async () => {
        setTxError('');
        const amt = parseFloat(txForm.amount);
        if (isNaN(amt) || amt <= 0) { setTxError('Enter a valid amount > 0'); return; }
        if (activeNetwork === 'ARG' && !ArgusSynapseService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid ARG address (must start with arg1)'); return;
        }
        if (activeNetwork === 'ETH' && !EthereumService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid 0x Ethereum address'); return;
        }
        if (activeNetwork === 'ARG' && balance.arg < amt + GAS_FEE) {
            setTxError(`Need ${(amt + GAS_FEE).toFixed(4)} ARG (incl. gas)`); return;
        }
        setIsProcessing(true);
        try {
            const txHash = '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18);
            await argusSynapse.transferARG({
                senderUid: user!.uid,
                senderAddress: addresses.arg,
                recipientAddress: txForm.recipient,
                amount: amt,
                gasFee: GAS_FEE,
                txHash,
            });
            setTxForm({ recipient: '', amount: '' });
            setActiveModal(null);
            setToast({ message: 'Transaction submitted to the network.', type: 'success' });
        } catch (e: any) {
            setTxError(e.message || 'Transaction failed');
            setToast({ message: e.message || 'Transaction failed', type: 'error' });
        } finally { setIsProcessing(false); }
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* ── TOP BAR ── */}
            <View style={styles.topBar}>
                <View style={styles.topBarBrand}>
                    <View style={styles.topBarIcon}>
                        <Text style={styles.topBarA}>A</Text>
                    </View>
                    <Text style={styles.topBarTitle}>Argus Vault</Text>
                </View>
                {/* Network pill */}
                <TouchableOpacity
                    style={styles.networkPill}
                    onPress={() => setActiveNetwork(n => n === 'ARG' ? 'ETH' : 'ARG')}
                >
                    <View style={[styles.networkDot, { backgroundColor: activeNetwork === 'ARG' ? Colors.maroon : '#60a5fa' }]} />
                    <Text style={styles.networkPillText}>{activeNetwork === 'ARG' ? 'Argus' : 'Ethereum'}</Text>
                    <ChevronDown size={12} color={Colors.zinc500} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }}>
                    <RefreshCw size={16} color={isRefreshing ? Colors.maroon : Colors.zinc500} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── BALANCE HERO ── */}
                <View style={styles.balanceHero}>
                    <View style={[styles.heroGlow, { backgroundColor: activeNetwork === 'ARG' ? Colors.maroon : '#3b82f6' }]} pointerEvents="none" />
                    <Text style={styles.balanceLabel}>{activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'} Balance</Text>
                    <Text style={styles.balanceUSD}>${dispBal.usd}</Text>
                    <Text style={styles.balanceToken}>
                        {dispBal.amount.toLocaleString(undefined, { minimumFractionDigits: dispBal.dec })} {dispBal.symbol}
                    </Text>

                    {/* Address row */}
                    <TouchableOpacity style={styles.addrRow} onPress={copyAddr} activeOpacity={0.7}>
                        <View style={[styles.addrDot, { backgroundColor: activeNetwork === 'ARG' ? Colors.maroon : '#60a5fa' }]} />
                        <Text style={styles.addrText}>{truncAddr}</Text>
                        {copied ? <Check size={13} color={Colors.success} /> : <Copy size={13} color={Colors.zinc600} />}
                    </TouchableOpacity>

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                        {[
                            { label: 'Send', modal: 'SEND' as const, icon: Send },
                            { label: 'Receive', modal: 'RECEIVE' as const, icon: Download },
                            { label: 'Swap', modal: 'SWAP' as const, icon: Repeat },
                        ].map(a => (
                            <TouchableOpacity
                                key={a.label}
                                style={styles.actionBtn}
                                onPress={() => setActiveModal(a.modal)}
                                activeOpacity={0.8}
                            >
                                <a.icon size={18} color={Colors.white} />
                                <Text style={styles.actionBtnLabel}>{a.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── TRANSACTION LIST ── */}
                <View style={styles.txSection}>
                    <View style={styles.txHeader}>
                        <View style={styles.txHeaderLeft}>
                            <History size={15} color={Colors.zinc600} />
                            <Text style={styles.txHeaderTitle}>Transaction History</Text>
                            {netTxs.length > 0 && (
                                <View style={styles.txCountBadge}>
                                    <Text style={styles.txCountText}>{netTxs.length}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.liveDot} />
                    </View>

                    {netTxs.length === 0 ? (
                        <View style={styles.txEmpty}>
                            <Wallet size={28} color={Colors.zinc700} />
                            <Text style={styles.txEmptyTitle}>No transactions yet</Text>
                            <Text style={styles.txEmptyText}>Your {activeNetwork} activity will appear here.</Text>
                        </View>
                    ) : (
                        netTxs.map(tx => (
                            <TxItem
                                key={tx.id}
                                tx={tx}
                                myAddress={currentAddr}
                                onPress={() => { setSelectedTx(tx); setActiveModal('TX_DETAIL'); }}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* ── MODALS ── */}
            <Modal visible={activeModal !== null} animationType="slide" transparent presentationStyle="overFullScreen">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setActiveModal(null)} />
                    <View style={styles.modalSheet}>
                        {/* Handle */}
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {activeModal === 'SEND' && `Send ${activeNetwork}`}
                                {activeModal === 'RECEIVE' && `Receive ${activeNetwork}`}
                                {activeModal === 'SWAP' && 'Swap'}
                                {activeModal === 'TX_DETAIL' && 'Transaction Details'}
                            </Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <X size={18} color={Colors.zinc400} />
                            </TouchableOpacity>
                        </View>

                        {/* SEND */}
                        {activeModal === 'SEND' && (
                            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: Spacing.lg }}>
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Recipient Address</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder={activeNetwork === 'ARG' ? 'arg1...' : '0x...'}
                                        placeholderTextColor={Colors.zinc700}
                                        value={txForm.recipient}
                                        onChangeText={t => { setTxForm(f => ({ ...f, recipient: t })); setTxError(''); }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                <View style={styles.modalField}>
                                    <View style={styles.modalFieldHeader}>
                                        <Text style={styles.modalFieldLabel}>Amount</Text>
                                        <TouchableOpacity onPress={() => setTxForm(f => ({ ...f, amount: String(Math.max(0, dispBal.amount - GAS_FEE)) }))}>
                                            <Text style={styles.maxBtn}>MAX</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        style={[styles.modalInput, styles.modalInputBig]}
                                        placeholder="0.00"
                                        placeholderTextColor={Colors.zinc700}
                                        value={txForm.amount}
                                        onChangeText={t => { setTxForm(f => ({ ...f, amount: t })); setTxError(''); }}
                                        keyboardType="decimal-pad"
                                    />
                                    <Text style={styles.availableText}>
                                        Available: {dispBal.amount.toLocaleString(undefined, { minimumFractionDigits: dispBal.dec })} {activeNetwork}
                                    </Text>
                                </View>
                                {activeNetwork === 'ARG' && (
                                    <View style={styles.gasFeeRow}>
                                        <Text style={styles.gasFeeLabel}>Gas fee</Text>
                                        <Text style={styles.gasFeeValue}>0.001 ARG</Text>
                                    </View>
                                )}
                                {txError ? (
                                    <View style={styles.txErrorBox}>
                                        <AlertCircle size={14} color={Colors.error} />
                                        <Text style={styles.txErrorText}>{txError}</Text>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={[styles.sendBtn, isProcessing && { opacity: 0.6 }]}
                                    onPress={handleSend}
                                    disabled={isProcessing}
                                >
                                    {isProcessing
                                        ? <ActivityIndicator color={Colors.white} />
                                        : <Text style={styles.sendBtnText}>Confirm & Send</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        {/* RECEIVE */}
                        {activeModal === 'RECEIVE' && (
                            <View style={styles.modalBody}>
                                <View style={styles.qrContainer}>
                                    <QRCode value={currentAddr || 'argus'} size={180} backgroundColor="white" />
                                </View>
                                <TouchableOpacity style={styles.addrCopyBox} onPress={copyAddr} activeOpacity={0.7}>
                                    <Text style={styles.addrCopyText} numberOfLines={2}>{currentAddr}</Text>
                                    <View style={styles.addrCopyBtn}>
                                        {copied ? <Check size={14} color={Colors.success} /> : <Copy size={14} color={Colors.zinc500} />}
                                        <Text style={styles.addrCopyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.receiveNote}>
                                    Only send {activeNetwork} assets to this address.
                                </Text>
                            </View>
                        )}

                        {/* SWAP */}
                        {activeModal === 'SWAP' && (
                            <View style={[styles.modalBody, styles.comingSoon]}>
                                <Repeat size={40} color={Colors.zinc700} />
                                <Text style={styles.comingSoonTitle}>DEX Audit Underway</Text>
                                <Text style={styles.comingSoonText}>
                                    The Argus DEX swap module is under security audit. Available at mainnet launch.
                                </Text>
                            </View>
                        )}

                        {/* TX DETAIL */}
                        {activeModal === 'TX_DETAIL' && selectedTx && (
                            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: Spacing.md }}>
                                <View style={styles.txDetailAmt}>
                                    <Text style={styles.txDetailAmtVal}>{Number(selectedTx.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}</Text>
                                    <Text style={styles.txDetailAmtSym}>{selectedTx.chain}</Text>
                                    <StatusBadge status={selectedTx.status} />
                                </View>
                                {[
                                    { l: 'Date', v: new Date(selectedTx.createdAt).toLocaleString() },
                                    { l: 'Network', v: selectedTx.chain === 'ARG' ? 'Argus GhostDAG' : 'Ethereum' },
                                    { l: 'Type', v: selectedTx.type || 'TRANSFER' },
                                    { l: 'Gas', v: selectedTx.gasFee ? `${selectedTx.gasFee} ARG` : '—' },
                                ].map(r => (
                                    <View key={r.l} style={styles.txDetailRow}>
                                        <Text style={styles.txDetailKey}>{r.l}</Text>
                                        <Text style={styles.txDetailVal}>{r.v}</Text>
                                    </View>
                                ))}
                                <View style={styles.txDetailHash}>
                                    <Text style={styles.txDetailKey}>Tx Hash</Text>
                                    <Text style={styles.txDetailHashVal} numberOfLines={2}>{selectedTx.txHash}</Text>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 100 },

    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.zinc900,
    },
    topBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    topBarIcon: {
        width: 28, height: 28, backgroundColor: Colors.maroonBg, borderWidth: 1,
        borderColor: Colors.maroonBorder, borderRadius: 6, justifyContent: 'center', alignItems: 'center',
    },
    topBarA: { fontSize: 16, fontWeight: '900', color: Colors.maroon },
    topBarTitle: { fontSize: 12, fontWeight: '900', color: Colors.white, letterSpacing: 1, textTransform: 'uppercase' },
    networkPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.zinc900,
        borderWidth: 1, borderColor: Colors.zinc800, borderRadius: BorderRadius.full,
    },
    networkDot: { width: 6, height: 6, borderRadius: 3 },
    networkPillText: { fontSize: 11, fontWeight: '700', color: Colors.white },

    balanceHero: {
        padding: Spacing.xl, paddingTop: Spacing.xxl,
        borderBottomWidth: 1, borderBottomColor: Colors.zinc900 + '60',
        overflow: 'hidden', gap: 8,
    },
    heroGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, opacity: 0.05 },
    balanceLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 9 },
    balanceUSD: { fontSize: 40, fontWeight: '900', color: Colors.white },
    balanceToken: { fontFamily: 'monospace', fontSize: 14, color: Colors.zinc400 },
    addrRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4,
        backgroundColor: Colors.zinc900 + '60', borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start',
    },
    addrDot: { width: 6, height: 6, borderRadius: 3 },
    addrText: { fontFamily: 'monospace', fontSize: 11, color: Colors.zinc300 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: Spacing.md },
    actionBtn: {
        flex: 1, backgroundColor: Colors.zinc800 + '90', borderWidth: 1, borderColor: Colors.zinc700,
        borderRadius: BorderRadius.lg, paddingVertical: 12, alignItems: 'center', gap: 6,
    },
    actionBtnLabel: { fontSize: 10, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },

    txSection: { padding: Spacing.xl },
    txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    txHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    txHeaderTitle: { fontSize: 12, fontWeight: '800', color: Colors.white, letterSpacing: 0.5, textTransform: 'uppercase' },
    txCountBadge: { backgroundColor: Colors.zinc800, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    txCountText: { fontSize: 9, fontWeight: '700', color: Colors.zinc400 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, opacity: 0.7 },
    txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.zinc900 + '40' },
    txIcon: { width: 40, height: 40, borderRadius: BorderRadius.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    txIconSend: { backgroundColor: Colors.zinc900, borderColor: Colors.zinc800 },
    txIconReceive: { backgroundColor: Colors.success + '10', borderColor: Colors.success + '30' },
    txInfo: { flex: 1 },
    txInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    txType: { fontSize: 13, fontWeight: '700', color: Colors.white },
    txMeta: { fontSize: 10, color: Colors.zinc600, fontFamily: 'monospace', marginTop: 2 },
    txAmt: { fontFamily: 'monospace', fontWeight: '900', fontSize: 13, textAlign: 'right' },
    txAmtSend: { color: Colors.white },
    txAmtReceive: { color: Colors.success },
    txChain: { fontSize: 9, color: Colors.zinc600 },
    txEmpty: { alignItems: 'center', gap: 12, paddingVertical: 48 },
    txEmptyTitle: { fontSize: 14, fontWeight: '800', color: Colors.white },
    txEmptyText: { fontSize: 12, color: Colors.zinc600 },

    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
    badgeDot: { width: 5, height: 5, borderRadius: 2.5 },
    badgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalSheet: {
        backgroundColor: Colors.zinc900, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        borderTopWidth: 1, borderColor: Colors.zinc800, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        maxHeight: '90%',
    },
    modalHandle: { width: 36, height: 4, backgroundColor: Colors.zinc700, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.zinc800 },
    modalTitle: { fontSize: 12, fontWeight: '900', color: Colors.white, letterSpacing: 1, textTransform: 'uppercase' },
    modalBody: { padding: Spacing.xl, flexGrow: 0 },
    modalField: { gap: 8 },
    modalFieldHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    modalFieldLabel: { ...Typography.label, color: Colors.zinc500, fontSize: 9 },
    maxBtn: { fontSize: 10, fontWeight: '700', color: Colors.maroon },
    modalInput: {
        backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 14,
        fontSize: 14, color: Colors.white, fontFamily: 'monospace',
    },
    modalInputBig: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
    availableText: { fontSize: 11, color: Colors.zinc600, textAlign: 'right' },
    gasFeeRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.background + '70', borderWidth: 1, borderColor: Colors.zinc800 + '50', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10 },
    gasFeeLabel: { fontSize: 11, color: Colors.zinc500 },
    gasFeeValue: { fontSize: 11, color: Colors.zinc300, fontFamily: 'monospace' },
    txErrorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.error + '15', borderWidth: 1, borderColor: Colors.error + '30', borderRadius: BorderRadius.md, padding: Spacing.md },
    txErrorText: { flex: 1, fontSize: 12, color: Colors.error },
    sendBtn: { backgroundColor: Colors.maroon, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center' },
    sendBtnText: { fontSize: 11, fontWeight: '900', color: Colors.white, letterSpacing: 1.5, textTransform: 'uppercase' },
    qrContainer: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignSelf: 'center', marginBottom: Spacing.lg },
    addrCopyBox: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 8 },
    addrCopyText: { fontFamily: 'monospace', fontSize: 11, color: Colors.zinc400 },
    addrCopyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    addrCopyBtnText: { fontSize: 10, fontWeight: '700', color: Colors.zinc500, textTransform: 'uppercase', letterSpacing: 0.5 },
    receiveNote: { fontSize: 11, color: Colors.zinc600, textAlign: 'center', marginTop: 8 },
    comingSoon: { alignItems: 'center', gap: 16, paddingVertical: 32 },
    comingSoonTitle: { fontSize: 16, fontWeight: '800', color: Colors.white },
    comingSoonText: { fontSize: 12, color: Colors.zinc500, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
    txDetailAmt: { alignItems: 'center', gap: 8, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.zinc800 },
    txDetailAmtVal: { fontSize: 36, fontWeight: '900', color: Colors.white },
    txDetailAmtSym: { fontSize: 14, color: Colors.zinc500 },
    txDetailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    txDetailKey: { fontSize: 11, fontWeight: '700', color: Colors.zinc500, textTransform: 'uppercase', letterSpacing: 0.5 },
    txDetailVal: { fontSize: 12, color: Colors.zinc200 },
    txDetailHash: { gap: 4 },
    txDetailHashVal: { fontSize: 10, fontFamily: 'monospace', color: Colors.zinc600 },
});
