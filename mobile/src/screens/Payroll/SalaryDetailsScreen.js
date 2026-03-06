import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Download, IndianRupee, FileText } from 'lucide-react-native';

export default function SalaryDetailsScreen({ navigation }) {
    // Mock data for display purposes
    const salaryData = {
        month: 'February 2026',
        basic: 15000,
        hra: 6000,
        special: 3000,
        pf_deduction: 1800,
        esic_deduction: 250,
        tds: 500,
        netPay: 21450,
        gross: 24000,
        totalDeductions: 2550,
        workingDays: 28,
        presentDays: 26,
    };

    const downloadPayslip = () => {
        alert('Downloading PDF Payslip...');
    };

    const StatementRow = ({ label, amount, isDeduction = false }) => (
        <View style={styles.statementRow}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={[styles.rowAmount, isDeduction && styles.textDanger]}>
                {isDeduction ? '-' : ''}₹ {amount.toLocaleString('en-IN')}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Salary & Payslips</Text>
                <Text style={styles.subtitle}>Current cycle overview</Text>
            </View>

            {/* Net Pay Highlight Card */}
            <View style={[styles.card, styles.highlightCard]}>
                <View style={styles.highlightTop}>
                    <Text style={styles.highlightMonth}>{salaryData.month}</Text>
                    <View style={styles.badgePaid}>
                        <Text style={styles.badgePaidText}>Pro-Rated Estimate</Text>
                    </View>
                </View>
                <View style={styles.netPayWrapper}>
                    <IndianRupee color="#0F172A" size={40} />
                    <Text style={styles.netPayAmt}>{salaryData.netPay.toLocaleString('en-IN')}</Text>
                </View>
                <Text style={styles.netPayDesc}>Estimated Net Pay based on {salaryData.presentDays}/{salaryData.workingDays} days</Text>

                <TouchableOpacity style={styles.downloadBtn} onPress={downloadPayslip}>
                    <Download color="#2563EB" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.downloadText}>Download Full Payslip</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
            <View style={styles.card}>
                <StatementRow label="Basic Salary" amount={salaryData.basic} />
                <StatementRow label="House Rent Allowance" amount={salaryData.hra} />
                <StatementRow label="Special Allowance" amount={salaryData.special} />
                <View style={[styles.statementRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Gross Earnings</Text>
                    <Text style={styles.totalAmount}>₹ {salaryData.gross.toLocaleString('en-IN')}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Deductions</Text>
            <View style={styles.card}>
                <StatementRow label="Provident Fund (PF)" amount={salaryData.pf_deduction} isDeduction />
                <StatementRow label="ESIC" amount={salaryData.esic_deduction} isDeduction />
                <StatementRow label="TDS" amount={salaryData.tds} isDeduction />
                <View style={[styles.statementRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Deductions</Text>
                    <Text style={[styles.totalAmount, styles.textDanger]}>-₹ {salaryData.totalDeductions.toLocaleString('en-IN')}</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
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
    highlightCard: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        borderWidth: 1,
    },
    highlightTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    highlightMonth: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
    },
    badgePaid: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgePaidText: {
        color: '#1E3A8A',
        fontSize: 12,
        fontWeight: '600',
    },
    netPayWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    netPayAmt: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#0F172A',
        letterSpacing: -1,
    },
    netPayDesc: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 8,
        marginBottom: 20,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    downloadText: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 12,
    },
    statementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    rowLabel: {
        fontSize: 15,
        color: '#475569',
    },
    rowAmount: {
        fontSize: 15,
        fontWeight: '500',
        color: '#0F172A',
    },
    textDanger: {
        color: '#EF4444',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingTop: 16,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    }
});
