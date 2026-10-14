import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TextInputKeyPressEvent,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/http';

interface OTPScreenProps {
  navigation: any;
  route: any;
}

interface OTPInputProps {
  index: number;
  value: string;
  onChangeText: (value: string) => void;
  onKeyPress: (event: TextInputKeyPressEvent) => void;
  autoFocus?: boolean;
}

const OTPInput = forwardRef<TextInput, OTPInputProps>(
  (
    { index, value, onChangeText, onKeyPress, autoFocus },
    ref
  ) => {
    return (
      <TextInput
        ref={ref}
        style={[
          styles.otpInput,
          value && styles.otpInputFilled,
        ]}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        keyboardType="number-pad"
        maxLength={1}
        selectTextOnFocus
        autoFocus={autoFocus ?? false}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
    );
  }
);

OTPInput.displayName = 'OTPInput';

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const { verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

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
      inputRefs.current[index + 1]?.focus?.();
    }
  };

  const handleKeyPress = (index: number, event: TextInputKeyPressEvent) => {
    const key = event.nativeEvent.key;
    // Handle backspace to go to previous input
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus?.();
    }
  };

  const handlePaste = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      // Focus the last input after paste
      inputRefs.current[5]?.focus?.();
    }
  };

  const otpString = otp.join('');
  // Server enforces a 60s resend cooldown; only allow resend after that.
  const canResend = timer <= 840;

  const handleVerify = async () => {
    if (otpString.length !== 6) return;

    setError('');
    setNotice('');
    setLoading(true);
    try {
      await verifyOtp(email, otpString);
      navigation.navigate('Main');
    } catch (e) {
      const err = e as ApiError;
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    try {
      const result = await resendOtp(email);
      setTimer(900);
      setNotice('A new code is on its way.');
    } catch (e) {
      const err = e as ApiError;
      setError(err.message || 'Could not resend the code. Please try again.');
    }
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
            <OTPInput
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              index={index}
              value={digit}
              onChangeText={(value) => handleOTPChange(index, value)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timer}>
          Code expires in {formatTimer(timer)}
        </Text>

        {error ? (
          <View style={styles.messageRow}>
            <Feather name="alert-circle" size={14} color={colors.state.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

        {/* Resend Link */}
        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
          <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
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
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.state.error,
  },
  noticeText: {
    marginTop: spacing[3],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.accent.main,
  },
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