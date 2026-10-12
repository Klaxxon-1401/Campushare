import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/ui';

interface OTPScreenProps {
  navigation: any;
  route: any;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      // Focus next input (would need refs for actual implementation)
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    try {
      // TODO: Implement OTP verification logic (never log OTP codes)
      navigation.navigate('VerificationPending');
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(900);
    // TODO: Implement resend OTP logic (never log user emails)
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.neutral.textPrimary} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Email</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Feather name="mail" size={32} color={colors.primary.contrast} />
        </View>

        {/* Headlines */}
        <Text style={styles.headline}>Check your email</Text>
        <Text style={styles.subheadline}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOTPChange(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timer}>
          Code expires in {formatTimer(timer)}
        </Text>

        {/* Resend Link */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={timer > 0}
        >
          <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          title="Verify"
          onPress={handleVerify}
          variant="primary"
          size="large"
          loading={loading}
          disabled={otp.join('').length !== 6}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  headline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 20,
  },
  email: {
    fontFamily: typography.fonts.bodyBold,
    color: colors.neutral.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: borders.width.medium,
    borderColor: colors.neutral.border,
    borderRadius: borders.radius.md,
    textAlign: 'center',
    fontSize: typography.sizes.h3,
    fontFamily: typography.fonts.bodyBold,
    color: colors.neutral.textPrimary,
  },
  otpInputFilled: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    color: colors.primary.contrast,
  },
  timer: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[4],
  },
  resendLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  resendLinkDisabled: {
    color: colors.neutral.textMuted,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
});
