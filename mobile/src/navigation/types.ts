import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Auth flow
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  OTP: { email: string };
  VerificationPending: undefined;
  // Main app
  Main: undefined;
  // Feature screens
  SearchResults: { initialQuery?: string } | undefined;
  ItemDetail: { itemId: string };
  CreateListing: { itemId?: string } | undefined;
  MyListings: undefined;
  BookingRequest: { itemId: string };
  BookingDetail: { bookingId: string };
  // Week 7+: payments, handover, trust & messaging
  Payment: { bookingId: string };
  PhotoCapture: { bookingId: string; stage: 'before' | 'after' };
  Handover: { bookingId: string };
  Reviews: { bookingId?: string } | undefined;
  Disputes: undefined;
  Conversations: undefined;
  Chat: { conversationId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Create: undefined;
  Returns: undefined;
  Profile: undefined;
};

export type StackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
