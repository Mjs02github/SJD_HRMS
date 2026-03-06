import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/Auth/LoginScreen';
import EmployeeDashboard from './src/screens/Dashboard/EmployeeDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Error reading token");
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  if (isLoading) {
    return null; // or a Splash screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* We will route based on authentication state late, for now we will just show Login first then Dashboard */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={EmployeeDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
