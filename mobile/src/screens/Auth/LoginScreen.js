import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Replace with your machine's local IP or domain if testing on physical device.
// 10.0.2.2 is the special alias to your host loopback interface for Android Emulator.
const API_URL = 'http://10.0.2.2:5000/api';

export default function LoginScreen({ navigation, route }) {
    const [empCode, setEmpCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // We are assuming the parent navigator passes a function to update global auth state
    // If not using a global Context, passing an explicit callback works for small apps.
    // In a robust app, we would use a Context Provider wrapping the NavigationContainer.

    const handleLogin = async () => {
        if (!empCode || !password) {
            Alert.alert("Error", "Please enter both Employee ID and Password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/employee-login`, {
                emp_code: empCode,
                password: password
            });

            if (response.data.success) {
                // Save token and user details
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));

                // Use the callback from route.params to tell App.js we are logged in
                if (route.params?.onLoginSuccess) {
                    route.params.onLoginSuccess();
                } else {
                    // Fallback if no callback provided, just navigate (though Stack reset might be better)
                    navigation.replace('Dashboard');
                }
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Could not connect to the server";
            Alert.alert("Login Failed", msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.formContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>SJD HRMS</Text>
                    <Text style={styles.subtitle}>Field Employee Login</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Employee ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. SJD-001"
                        placeholderTextColor="#94A3B8"
                        value={empCode}
                        onChangeText={setEmpCode}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    Contact HR if you have forgotten your password.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    formContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#38BDF8',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#F8FAFC',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 8,
        padding: 14,
        color: '#F8FAFC',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#38BDF8',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#0EA5E9',
        opacity: 0.7,
    },
    buttonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        color: '#64748B',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 13,
    }
});
