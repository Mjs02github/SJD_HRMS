import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, LogOut, Clock, Calendar, CheckCircle } from 'lucide-react-native';

export default function EmployeeDashboard({ route }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const dataStr = await AsyncStorage.getItem('userData');
                if (dataStr) {
                    setUserData(JSON.parse(dataStr));
                }
            } catch (error) {
                console.error("Error loading user data", error);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        // Calling the function we passed from App.js stack init
        if (route.params?.onLogout) {
            route.params.onLogout();
        }
    };

    const markAttendanceIn = () => {
        // Normally this would trigger GPS checking, selfie taking, then API post
        alert('Attendance IN logic will trigger camera and GPS');
    };

    if (!userData) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header Profile */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{userData.name}</Text>
                        <Text style={styles.empCode}>Code: {userData.emp_code}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <LogOut color="#EF4444" size={20} />
                    </TouchableOpacity>
                </View>

                {/* GPS Tracking Indicator */}
                <View style={styles.trackerBadge}>
                    <MapPin color="#10B981" size={16} />
                    <Text style={styles.trackerText}>GPS Tracking is currently OFF</Text>
                </View>

                {/* Quick Actions (Attendance) */}
                <View style={styles.actionCard}>
                    <Text style={styles.cardTitle}>Daily Attendance</Text>
                    <Text style={styles.cardSubtitle}>Mark your presence to start your shift.</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.primaryButton, { flex: 1, marginRight: 10 }]}
                            onPress={markAttendanceIn}
                        >
                            <CheckCircle color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Check IN</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton]}
                        >
                            <LogOut color="#64748B" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.secondaryButtonText}>Check OUT</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dashboard Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Calendar color="#38BDF8" size={24} style={{ marginBottom: 8 }} />
                        <Text style={styles.statNum}>22</Text>
                        <Text style={styles.statLabel}>Days Present</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Clock color="#F59E0B" size={24} style={{ marginBottom: 8 }} />
                        <Text style={styles.statNum}>1</Text>
                        <Text style={styles.statLabel}>Leaves Pending</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        padding: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    greeting: {
        fontSize: 16,
        color: '#64748B',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    empCode: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 2,
    },
    logoutBtn: {
        padding: 10,
        backgroundColor: '#FEE2E2',
        borderRadius: 50,
    },
    trackerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    trackerText: {
        color: '#065F46',
        fontWeight: '600',
        marginLeft: 8,
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#38BDF8',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#475569',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statNum: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    }
});
