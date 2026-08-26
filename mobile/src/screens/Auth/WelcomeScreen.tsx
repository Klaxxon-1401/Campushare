import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Button } from '../../components/ui';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CampusShare</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ Verified</Text>
          </View>
        </View>

        {/* Headlines */}
        <Text style={styles.headline}>Rent from fellow students</Text>
        <Text style={styles.subheadline}>Verified. Safe. Affordable.</Text>

        {/* Illustration placeholder */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationText}>🎓</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          variant="primary"
          size="large"
        />
        
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.hero,
    color: colors.primary.main,
    marginBottom: spacing[2],
  },
  badge: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borders.radius.pill,
  },
  badgeText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.accent.contrast,
  },
  headline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subheadline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  illustration: {
    width: 200,
    height: 200,
    backgroundColor: colors.neutral.border,
    borderRadius: borders.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationText: {
    fontSize: 64,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  loginLink: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  loginText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  loginBold: {
    fontFamily: typography.fonts.bodyBold,
    color: colors.primary.main,
  },
});
