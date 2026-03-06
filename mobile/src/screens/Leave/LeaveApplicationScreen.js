import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';

export default function LeaveApplicationScreen({ navigation }) {
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitLeave = () => {
        if (!startDate || !endDate || !reason) {
            Alert.alert('Error', 'Please fill all the details');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert('Success', 'Leave application submitted for HR approval.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Apply for Leave</Text>
                <Text style={styles.subtitle}>Submit your time-off request</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Leave Type</Text>
                <View style={styles.typeSelectorRow}>
                    {['Sick Leave', 'Casual Leave', 'Paid Leave'].map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.typePill, leaveType === type && styles.typePillActive]}
                            onPress={() => setLeaveType(type)}
                        >
                            <Text style={[styles.typeText, leaveType === type && styles.typeTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.dateRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>From Date</Text>
                        <View style={styles.inputWrapper}>
                            <Calendar color="#64748B" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>To Date</Text>
                        <View style={styles.inputWrapper}>
                            <Calendar color="#64748B" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                        </View>
                    </View>
                </View>

                <Text style={styles.label}>Reason for Leave</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Briefly explain your reason..."
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={submitLeave}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historyCard}>
                <Text style={styles.historyTitle}>Recent Requests</Text>
                <View style={styles.historyItem}>
                    <View>
                        <Text style={styles.historyType}>Casual Leave (1 Day)</Text>
                        <Text style={styles.historyDate}>12 Feb 2026</Text>
                    </View>
                    <View style={styles.badgeApproved}>
                        <Text style={styles.badgeApprovedText}>Approved</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    header: {
        marginTop: 40,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 12,
    },
    typeSelectorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    typePill: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    typePillActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    typeText: {
        color: '#64748B',
        fontWeight: '500',
    },
    typeTextActive: {
        color: '#2563EB',
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        flex: 1,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        paddingLeft: 40,
        fontSize: 15,
        color: '#0F172A',
    },
    textArea: {
        paddingLeft: 12,
        minHeight: 100,
    },
    submitBtn: {
        backgroundColor: '#38BDF8',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    historyCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 40,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    historyType: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    historyDate: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 4,
    },
    badgeApproved: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeApprovedText: {
        color: '#166534',
        fontSize: 12,
        fontWeight: '600',
    }
});
