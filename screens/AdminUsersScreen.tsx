import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { TextField } from '../components/TextField';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { createManagedUser } from '../services/admin';
import type { AppRole } from '../types/order';

type FormState = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  country: string;
};

const emptyForm: FormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  companyName: '',
  country: '',
};

export function AdminUsersScreen() {
  const [role, setRole] = useState<AppRole>('customer');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing details', 'Full name, email, and password are required.');
      return false;
    }

    if (form.password.trim().length < 6) {
      Alert.alert('Weak password', 'Use a password with at least 6 characters.');
      return false;
    }

    if (role === 'customer' && !form.companyName.trim()) {
      Alert.alert('Company required', 'Customers should include a company name.');
      return false;
    }

    return true;
  }

  async function handleCreateUser() {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createManagedUser({
        role,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        companyName: role === 'customer' ? form.companyName.trim() || undefined : undefined,
        country: role === 'customer' ? form.country.trim() || undefined : undefined,
      });

      setForm(emptyForm);
      Alert.alert(
        'User created',
        `${created.email} was created as a ${created.role}. They can now sign in from the ${created.role} login tab.`,
      );
    } catch (error) {
      Alert.alert('Unable to create user', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenShell>
      <SectionTitle
        title="User Management"
        subtitle="Create new customer and admin accounts directly from the admin panel."
      />

      <View style={styles.variantRow}>
        {(['customer', 'admin'] as const).map((option) => {
          const active = option === role;

          return (
            <Pressable
              key={option}
              onPress={() => setRole(option)}
              style={[styles.variantChip, active && styles.variantChipActive]}
            >
              <Text style={[styles.variantLabel, active && styles.variantLabelActive]}>
                {option === 'customer' ? 'Create Customer' : 'Create Admin'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formCard}>
        <TextField
          label="Full Name"
          onChangeText={(value) => updateField('fullName', value)}
          placeholder="Enter full name"
          value={form.fullName}
        />
        <TextField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateField('email', value)}
          placeholder="name@example.com"
          value={form.email}
        />
        <TextField
          label="Password"
          onChangeText={(value) => updateField('password', value)}
          placeholder="Set a temporary password"
          secureTextEntry
          value={form.password}
        />
        <TextField
          label="Phone"
          onChangeText={(value) => updateField('phone', value)}
          placeholder="Optional phone number"
          value={form.phone}
        />

        {role === 'customer' ? (
          <>
            <TextField
              label="Company Name"
              onChangeText={(value) => updateField('companyName', value)}
              placeholder="Customer company"
              value={form.companyName}
            />
            <TextField
              label="Country"
              onChangeText={(value) => updateField('country', value)}
              placeholder="Customer country"
              value={form.country}
            />
          </>
        ) : null}

        <PrimaryButton disabled={isSubmitting} onPress={handleCreateUser}>
          {isSubmitting ? 'Creating User...' : role === 'customer' ? 'Create Customer' : 'Create Admin'}
        </PrimaryButton>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>How this works</Text>
        <Text style={styles.noteBody}>
          The admin panel calls a secure Supabase Edge Function, which creates the auth account and ensures the
          matching admin or customer profile exists in your database.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  variantRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  variantChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
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
  formCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  noteCard: {
    backgroundColor: 'rgba(200, 151, 58, 0.08)',
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  noteTitle: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  noteBody: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
