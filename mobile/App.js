import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/Auth/LoginScreen';
import EmployeeDashboard from './src/screens/Dashboard/EmployeeDashboard';
import SelfieAttendanceScreen from './src/screens/Attendance/SelfieAttendanceScreen';
import LeaveApplicationScreen from './src/screens/Leave/LeaveApplicationScreen';
import DPRScreen from './src/screens/Tasks/DPRScreen';
import SalaryDetailsScreen from './src/screens/Payroll/SalaryDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Error reading token", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isAuthenticated ? "dark" : "light"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated Stack
          <Stack.Group>
            <Stack.Screen
              name="Dashboard"
              component={EmployeeDashboard}
              initialParams={{ onLogout: handleLogout }}
            />
            <Stack.Screen
              name="SelfieAttendance"
              component={SelfieAttendanceScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="LeaveApplication"
              component={LeaveApplicationScreen}
              options={{ title: 'Leave Application', headerShown: true }}
            />
            <Stack.Screen
              name="DPR"
              component={DPRScreen}
              options={{ title: 'Daily Progress Report', headerShown: true }}
            />
            <Stack.Screen
              name="Salary"
              component={SalaryDetailsScreen}
              options={{ title: 'Payslips', headerShown: true }}
            />
          </Stack.Group>
        ) : (
          // Unauthenticated Stack
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            initialParams={{ onLoginSuccess: handleLoginSuccess }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
