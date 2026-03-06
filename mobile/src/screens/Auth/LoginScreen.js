import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>SJD HRMS</Text>
            <Text style={styles.subtitle}>Employee Login</Text>
            {/* We will add forms here later */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#38BDF8',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
    }
});
