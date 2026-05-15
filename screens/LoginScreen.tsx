import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BrandHeader } from '../components/BrandHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { ADMIN_TAGLINE, APP_TAGLINE, LOGIN_VARIANTS } from '../constants/app';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import * as authService from '../services/auth';
import type { AppRole } from '../types/order';
import { hasSupabaseConfig } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const clearError = useAuthStore((state) => state.clearError);

  const [variant, setVariant] = useState<AppRole>('customer');
  const [email, setEmail] = useState(hasSupabaseConfig ? '' : 'ava.sterling@et-demo.com');
  const [password, setPassword] = useState(hasSupabaseConfig ? '' : 'demo1234');
  const [isResetting, setIsResetting] = useState(false);

  function switchVariant(nextVariant: AppRole) {
    setVariant(nextVariant);
    clearError();

    if (hasSupabaseConfig) {
      setEmail('');
      setPassword('');
      return;
    }

    if (nextVariant === 'customer') {
      setEmail('ava.sterling@et-demo.com');
      setPassword('demo1234');
    } else {
      setEmail('admin@et-demo.com');
      setPassword('admin1234');
    }
  }

  async function handleLogin() {
    clearError();
    try {
      await login(email.trim(), password, variant);
    } catch {
      return;
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter your email address first so the reset link can be sent.');
      return;
    }

    setIsResetting(true);
    try {
      await authService.requestPasswordReset(email.trim());
      Alert.alert('Reset requested', 'If this email is authorized, a reset link will be sent.');
    } catch (resetError) {
      Alert.alert('Unable to reset password', resetError instanceof Error ? resetError.message : 'Try again.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.hero}>
        <BrandHeader subtitle={variant === 'customer' ? APP_TAGLINE : ADMIN_TAGLINE} />
      </View>

      <View style={styles.formCard}>
        <View style={styles.variantRow}>
          {LOGIN_VARIANTS.map((item) => {
            const active = item === variant;
            return (
              <Pressable
                key={item}
                onPress={() => switchVariant(item)}
                style={[styles.variantChip, active && styles.variantChipActive]}
              >
                <Text style={[styles.variantLabel, active && styles.variantLabelActive]}>
                  {item === 'customer' ? 'Customer Login' : 'Admin Login'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="customer@exposetrendze.in"
          value={email}
        />
        <TextField
          label="Password"
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!hasSupabaseConfig ? (
          <Text style={styles.demoCopy}>
            Demo mode is active until Supabase credentials are added to `.env`.
            {variant === 'customer'
              ? ' Customer demo: ava.sterling@et-demo.com / demo1234'
              : ' Admin demo: admin@et-demo.com / admin1234'}
          </Text>
        ) : null}
        <PrimaryButton disabled={isSubmitting} onPress={handleLogin}>
          {isSubmitting ? 'Signing In...' : variant === 'customer' ? 'Login as Customer' : 'Login as Admin'}
        </PrimaryButton>
        <Pressable disabled={isResetting} onPress={handleResetPassword}>
          <Text style={styles.link}>{isResetting ? 'Requesting reset...' : 'Forgot Password?'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  variantRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  variantChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  variantChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  variantLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    textAlign: 'center',
  },
  variantLabelActive: {
    color: COLORS.primary,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  demoCopy: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    textAlign: 'center',
  },
});
