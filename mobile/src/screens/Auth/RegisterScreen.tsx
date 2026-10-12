import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleRegister = () => {
    // TODO: Implement registration logic (never log credentials)
    navigation.navigate('OTP', { email });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.neutral.textPrimary} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.headline}>Join CampusShare</Text>
          <Text style={styles.subheadline}>Rent from verified students</Text>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Feather name="shield" size={12} color={colors.accent.main} />
            <Text style={styles.trustBadgeText}>University Verified Only</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Campus Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Student ID"
              placeholder="S1234567"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
            />

            {/* Password Strength Indicator */}
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Strength:</Text>
              <View style={styles.strengthDots}>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <View
                    key={dot}
                    style={[
                      styles.strengthDot,
                      dot <= passwordStrength && styles.strengthDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By signing up, you agree to{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },
  backArrow: {
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginRight: spacing[4],
  },
  headerTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  headline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
  },
  subheadline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[4],
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: `${colors.accent.main}1A`,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borders.radius.md,
    marginBottom: spacing[6],
  },
  trustBadgeText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.accent.main,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing[4],
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  strengthLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.neutral.textSecondary,
    marginRight: spacing[2],
  },
  strengthDots: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.border,
  },
  strengthDotActive: {
    backgroundColor: colors.accent.main,
  },
  terms: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  termsLink: {
    color: colors.primary.main,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
});
