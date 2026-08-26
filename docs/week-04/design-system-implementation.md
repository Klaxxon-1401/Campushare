# Design System Implementation Guide

> **Week 4 deliverable** · How to implement `design/design.md` in React Native/Expo
> **Reference:** `design/design.md` for tokens, `docs/week-04/hi-fi-mockups.md` for screen specs

---

## 1. Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── Icon.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── SafeAreaView.tsx
│   └── features/
│       ├── ItemCard.tsx
│       ├── CategoryChips.tsx
│       ├── SearchBar.tsx
│       └── VerificationBadge.tsx
├── screens/
│   ├── Auth/
│   │   ├── WelcomeScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── OTPScreen.tsx
│   ├── Home/
│   │   └── HomeFeedScreen.tsx
│   ├── Item/
│   │   └── ItemDetailScreen.tsx
│   ├── Booking/
│   │   └── BookingFlowScreen.tsx
│   ├── Listing/
│   │   └── ListingWizardScreen.tsx
│   ├── Returns/
│   │   └── ReturnsScreen.tsx
│   └── Profile/
│       └── ProfileScreen.tsx
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── borders.ts
│   └── index.ts
├── hooks/
│   ├── useTheme.ts
│   └── useAuth.ts
├── navigation/
│   └── AppNavigator.tsx
└── App.tsx
```

---

## 2. Theme Implementation

### 2.1 Colors (`src/theme/colors.ts`)

```typescript
export const colors = {
  // Primary (Hindustan Orange)
  primary: {
    main: '#E67E22',
    light: '#F39C12',
    dark: '#D35400',
    contrast: '#FFFFFF',
  },
  
  // Accent (Verification Green)
  accent: {
    main: '#27AE60',
    light: '#2ECC71',
    muted: '#A9DFBF',
    contrast: '#FFFFFF',
  },
  
  // Neutral
  neutral: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    border: '#E8E5E0',
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textMuted: '#BDC3C7',
  },
  
  // State
  state: {
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },
  
  // Functional
  functional: {
    disabled: '#BDC3C7',
    placeholder: '#BDC3C7',
    focus: '#E67E22',
  },
} as const;

export type ColorToken = keyof typeof colors;
```

### 2.2 Typography (`src/theme/typography.ts`)

```typescript
import { Platform } from 'react-native';

export const typography = {
  // Font families
  fonts: {
    display: Platform.select({
      ios: 'PlayfairDisplay-Bold',
      android: 'PlayfairDisplay-Bold',
      default: 'Georgia',
    }),
    body: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'System',
    }),
    bodyBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'System',
    }),
    utility: Platform.select({
      ios: 'JetBrainsMono-Regular',
      android: 'JetBrainsMono-Regular',
      default: 'monospace',
    }),
  },
  
  // Font sizes
  sizes: {
    hero: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    bodyLarge: 16,
    body: 14,
    caption: 12,
    small: 11,
    price: 18,
  },
  
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.25,
    wider: 0.3,
  },
} as const;

export type TypographyToken = keyof typeof typography;
```

### 2.3 Spacing (`src/theme/spacing.ts`)

```typescript
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpacingToken = keyof typeof spacing;
```

### 2.4 Borders (`src/theme/borders.ts`)

```typescript
export const borders = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 20,
    full: 9999,
  },
  
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 3,
  },
} as const;

export type BorderToken = keyof typeof borders;
```

### 2.5 Theme Index (`src/theme/index.ts`)

```typescript
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { borders } from './borders';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borders } from './borders';

export const theme = {
  colors,
  typography,
  spacing,
  borders,
} as const;

export type Theme = typeof theme;
```

---

## 3. Component Implementation

### 3.1 Button (`src/components/ui/Button.tsx`)

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.primary.contrast : colors.primary.main}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borders.radius.md,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.neutral.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.primary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: borders.width.thin,
    borderColor: colors.primary.main,
  },
  
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: spacing[3],
  },
  medium: {
    height: 44,
    paddingHorizontal: spacing[4],
  },
  large: {
    height: 48,
    paddingHorizontal: spacing[4],
    width: '100%',
  },
  
  // States
  disabled: {
    backgroundColor: colors.neutral.disabled,
    borderColor: colors.neutral.disabled,
  },
  
  // Text
  text: {
    ...typography.fonts.bodyBold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.contrast,
  },
  secondaryText: {
    color: colors.primary.main,
  },
  outlineText: {
    color: colors.primary.main,
  },
  smallText: {
    fontSize: typography.sizes.body,
  },
  mediumText: {
    fontSize: typography.sizes.bodyLarge,
  },
  largeText: {
    fontSize: typography.sizes.bodyLarge,
  },
  disabledText: {
    color: colors.neutral.textMuted,
  },
});
```

### 3.2 Input (`src/components/ui/Input.tsx`)

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={containerStyles}>
        <TextInput
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.neutral.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[1],
  },
  container: {
    height: 48,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral.surface,
  },
  focused: {
    borderColor: colors.primary.main,
    borderWidth: borders.width.medium,
  },
  error: {
    borderColor: colors.state.error,
  },
  input: {
    flex: 1,
    ...typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  errorText: {
    ...typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.state.error,
    marginTop: spacing[1],
  },
  helperText: {
    ...typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    marginTop: spacing[1],
  },
});
```

### 3.3 Card (`src/components/ui/Card.tsx`)

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borders } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  default: {
    // Default shadow
  },
  elevated: {
    shadowColor: colors.neutral.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
```

### 3.4 Badge (`src/components/ui/Badge.tsx`)

```typescript
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borders.radius.pill,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  success: {
    backgroundColor: colors.accent.main,
  },
  warning: {
    backgroundColor: colors.state.warning,
  },
  error: {
    backgroundColor: colors.state.error,
  },
  
  // Sizes
  small: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  medium: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  
  // Text
  text: {
    ...typography.fonts.bodyBold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.contrast,
  },
  successText: {
    color: colors.accent.contrast,
  },
  warningText: {
    color: colors.neutral.textPrimary,
  },
  errorText: {
    color: colors.primary.contrast,
  },
  smallText: {
    fontSize: typography.sizes.small,
  },
  mediumText: {
    fontSize: typography.sizes.caption,
  },
});
```

---

## 4. Navigation Setup

### 4.1 App Navigator (`src/navigation/AppNavigator.tsx`)

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme';

// Screens
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import HomeFeedScreen from '../screens/Home/HomeFeedScreen';
import ItemDetailScreen from '../screens/Item/ItemDetailScreen';
import BookingFlowScreen from '../screens/Booking/BookingFlowScreen';
import ListingWizardScreen from '../screens/Listing/ListingWizardScreen';
import ReturnsScreen from '../screens/Returns/ReturnsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

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
            case 'Create':
              iconName = 'plus';
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
      <Tab.Screen 
        name="Create" 
        component={ListingWizardScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{
              backgroundColor: colors.primary.main,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -20,
            }}>
              <Feather name="plus" size={24} color={colors.primary.contrast} />
            </View>
          ),
        }}
      />
      <Tab.Screen name="Returns" component={ReturnsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="Booking" component={BookingFlowScreen} />
        <Stack.Screen name="Listing" component={ListingWizardScreen} />
        <Stack.Screen name="Returns" component={ReturnsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 5. Design Token Usage

### 5.1 In Components

```typescript
// Good: Use theme tokens
<View style={{
  backgroundColor: colors.primary.main,
  padding: spacing[4],
  borderRadius: borders.radius.lg,
}}>
  <Text style={{
    ...typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.primary.contrast,
  }}>
    Button Text
  </Text>
</View>

// Bad: Hardcoded values
<View style={{
  backgroundColor: '#E67E22',
  padding: 16,
  borderRadius: 12,
}}>
  <Text style={{
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  }}>
    Button Text
  </Text>
</View>
```

### 5.2 In Stylesheets

```typescript
// Good: Use theme tokens in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.background,
    padding: spacing[4],
  },
  title: {
    ...typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
  },
});

// Bad: Hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF8F5',
    padding: 16,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: '#2C3E50',
  },
});
```

---

## 6. Performance Considerations

### 6.1 Image Optimization

- Use `expo-image` for lazy loading
- Implement thumbnails for list views
- Cache images with `expo-file-system`

### 6.2 List Performance

- Use `FlatList` for item grids
- Implement `getItemLayout` for fixed-height items
- Use `React.memo` for item cards

### 6.3 Animation Performance

- Use `Animated` API for simple animations
- Use `Reanimated` for complex animations
- Implement `useNativeDriver: true`

---

*This guide provides the foundation for implementing the design system in React Native/Expo. All components follow the tokens defined in `design/design.md`.*