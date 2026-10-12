import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { colors, borders } from '../theme';
import { RootStackParamList, MainTabParamList } from './types';

// Auth screens
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { OTPScreen } from '../screens/Auth/OTPScreen';
import { VerificationPendingScreen } from '../screens/Auth/VerificationPendingScreen';

// Main tab screens
import { HomeFeedScreen } from '../screens/Home/HomeFeedScreen';
import { BookingsScreen } from '../screens/Booking/BookingsScreen';
import { ReturnsScreen } from '../screens/Returns/ReturnsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// Stack feature screens
import { SearchResultsScreen } from '../screens/Home/SearchResultsScreen';
import { ItemDetailScreen } from '../screens/Item/ItemDetailScreen';
import { CreateListingScreen } from '../screens/Listing/CreateListingScreen';
import { MyListingsScreen } from '../screens/Listing/MyListingsScreen';
import { BookingRequestScreen } from '../screens/Booking/BookingRequestScreen';
import { BookingDetailScreen } from '../screens/Booking/BookingDetailScreen';
// Week 7–9 screens
import { PaymentScreen } from '../screens/Payment/PaymentScreen';
import { PhotoCaptureScreen } from '../screens/Handover/PhotoCaptureScreen';
import { HandoverScreen } from '../screens/Handover/HandoverScreen';
import { ConversationsScreen } from '../screens/Messages/ConversationsScreen';
import { ChatScreen } from '../screens/Messages/ChatScreen';
import { ReviewsScreen } from '../screens/Reviews/ReviewsScreen';
import { DisputesScreen } from '../screens/Disputes/DisputesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Bookings: 'package',
  Create: 'plus',
  Returns: 'camera',
  Profile: 'user',
};

/** Raised circular button used for the centre "Create" tab. */
const CreateTabButton: React.FC<BottomTabBarButtonProps> = ({ onPress, accessibilityState }) => (
  <TouchableOpacity
    style={styles.createButton}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityState={accessibilityState}
  >
    <Feather name="plus" size={26} color={colors.primary.contrast} />
  </TouchableOpacity>
);

/** Never rendered — the Create tab intercepts the press to open the wizard. */
const CreatePlaceholder = () => <View />;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => (
          <Feather
            name={TAB_ICONS[route.name as keyof MainTabParamList]}
            size={focused ? size + 1 : size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen
        name="Create"
        component={CreatePlaceholder}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <CreateTabButton {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('CreateListing', {});
          },
        })}
      />
      <Tab.Screen name="Returns" component={ReturnsScreen} options={{ tabBarLabel: 'Returns' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />

        {/* Main app */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Feature screens */}
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="CreateListing" component={CreateListingScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="BookingRequest" component={BookingRequestScreen} />
        <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />

        {/* Week 7–9 screens */}
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PhotoCapture" component={PhotoCaptureScreen} />
        <Stack.Screen name="Handover" component={HandoverScreen} />
        <Stack.Screen name="Conversations" component={ConversationsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Disputes" component={DisputesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    backgroundColor: colors.neutral.surface,
  },
  tabLabel: {
    fontSize: 11,
  },
  createButton: {
    top: -14,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
