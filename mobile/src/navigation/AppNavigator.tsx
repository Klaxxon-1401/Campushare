import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme';

// Auth Screens
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { OTPScreen } from '../screens/Auth/OTPScreen';
import { VerificationPendingScreen } from '../screens/Auth/VerificationPendingScreen';

// Main Screens
import { HomeFeedScreen } from '../screens/Home/HomeFeedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Messages':
              iconName = 'message-circle';
              break;
            case 'Returns':
              iconName = 'camera';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Messages" component={HomeFeedScreen} />
      <Tab.Screen name="Returns" component={HomeFeedScreen} />
      <Tab.Screen name="Profile" component={HomeFeedScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
        
        {/* Main App */}
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
