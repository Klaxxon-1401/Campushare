import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/http';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter your campus email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.navigate('Main');
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'NOT_VERIFIED') {
        navigation.navigate('VerificationPending', { email });
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Welcome Back</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CampusShare</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Log in to your account</Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showButtonText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.state.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Log In"
          onPress={handleLogin}
          variant="primary"
          size="large"
          loading={loading}
        />

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  errorText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.state.error,
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  logoText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.primary.main,
  },
  headline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[6],
  },
  form: {
    marginBottom: spacing[4],
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing[12],
  },
  showButton: {
    position: 'absolute',
    right: spacing[3],
    top: spacing[8],
  },
  showButtonText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
  },
  forgotPasswordText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  actions: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  signupLink: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  signupText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  signupBold: {
    fontFamily: typography.fonts.bodyBold,
    color: colors.primary.main,
  },
});
