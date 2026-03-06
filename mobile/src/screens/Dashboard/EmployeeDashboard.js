import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmployeeDashboard() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.badge}>Live GPS Tracking Active</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
    },
    badge: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        fontSize: 12,
        fontWeight: '600',
    }
});
