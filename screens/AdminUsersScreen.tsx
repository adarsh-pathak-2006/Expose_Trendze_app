import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { TextField } from '../components/TextField';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import {
  createManagedUser,
  deleteManagedUser,
  fetchManagedUsers,
  setManagedUserActive,
  updateManagedUser,
  type ManagedUser,
} from '../services/admin';
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
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const loadedUsers = await fetchManagedUsers();
      setUsers(loadedUsers);
    } catch (error) {
      Alert.alert('Unable to load users', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setSelectedUser(null);
    setForm(emptyForm);
    setRole('customer');
  }

  function startEditing(user: ManagedUser) {
    setSelectedUser(user);
    setRole(user.role);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      companyName: user.companyName ?? '',
      country: user.country ?? '',
    });
  }

  function validate() {
    if (!form.fullName.trim() || !form.email.trim()) {
      Alert.alert('Missing details', 'Full name and email are required.');
      return false;
    }

    if (!selectedUser && !form.password.trim()) {
      Alert.alert('Missing password', 'Set an initial password for the new user.');
      return false;
    }

    if (form.password.trim() && form.password.trim().length < 6) {
      Alert.alert('Weak password', 'Use a password with at least 6 characters.');
      return false;
    }

    if (role === 'customer' && !form.companyName.trim()) {
      Alert.alert('Company required', 'Customers should include a company name.');
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedUser) {
        await updateManagedUser({
          userId: selectedUser.userId,
          role,
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || undefined,
          companyName: role === 'customer' ? form.companyName.trim() || undefined : undefined,
          country: role === 'customer' ? form.country.trim() || undefined : undefined,
          password: form.password.trim() || undefined,
          isActive: selectedUser.isActive,
        });
        Alert.alert('User updated', `${form.email.trim().toLowerCase()} was updated successfully.`);
      } else {
        const created = await createManagedUser({
          role,
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          companyName: role === 'customer' ? form.companyName.trim() || undefined : undefined,
          country: role === 'customer' ? form.country.trim() || undefined : undefined,
        });
        Alert.alert(
          'User created',
          `${created.email} was created as a ${created.role}. They can now sign in from the ${created.role} login tab.`,
        );
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      Alert.alert('Unable to save user', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(user: ManagedUser) {
    const nextValue = !user.isActive;

    try {
      setIsSubmitting(true);
      await setManagedUserActive(user.userId, nextValue);
      await loadUsers();
    } catch (error) {
      Alert.alert('Unable to update status', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(user: ManagedUser) {
    Alert.alert(
      'Remove account',
      `Delete ${user.email}? This will remove their profile and auth access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteManagedUser(user.userId);
              if (selectedUser?.userId === user.userId) {
                resetForm();
              }
              await loadUsers();
            } catch (error) {
              Alert.alert('Unable to delete user', error instanceof Error ? error.message : 'Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  }

  const customers = useMemo(() => users.filter((user) => user.role === 'customer'), [users]);
  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users]);

  return (
    <ScreenShell onRefresh={loadUsers} refreshing={isLoading}>
      <SectionTitle
        title="User Management"
        subtitle="Create, edit, disable, or remove customer and admin accounts from one centralized screen."
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
                {option === 'customer' ? 'Customer' : 'Admin'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{selectedUser ? 'Edit Account' : 'Create Account'}</Text>
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
          label={selectedUser ? 'New Password (Optional)' : 'Password'}
          onChangeText={(value) => updateField('password', value)}
          placeholder={selectedUser ? 'Leave blank to keep current password' : 'Set a temporary password'}
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

        <View style={styles.actionRow}>
          <PrimaryButton disabled={isSubmitting} onPress={handleSubmit} style={styles.actionButton}>
            {isSubmitting ? 'Saving...' : selectedUser ? 'Save Changes' : role === 'customer' ? 'Create Customer' : 'Create Admin'}
          </PrimaryButton>
          {selectedUser ? (
            <PrimaryButton disabled={isSubmitting} onPress={resetForm} style={styles.actionButton} variant="secondary">
              Cancel Edit
            </PrimaryButton>
          ) : null}
        </View>
      </View>

      <SectionTitle title="Customers" subtitle="Accounts that can view and track their own orders." />
      <View style={styles.listStack}>
        {customers.map((user) => (
          <ManagedUserCard
            key={user.userId}
            isSubmitting={isSubmitting}
            onDelete={() => handleDelete(user)}
            onEdit={() => startEditing(user)}
            onToggleActive={() => handleToggleActive(user)}
            user={user}
          />
        ))}
      </View>

      <SectionTitle title="Admins" subtitle="Internal ET accounts with centralized control." />
      <View style={styles.listStack}>
        {admins.map((user) => (
          <ManagedUserCard
            key={user.userId}
            isSubmitting={isSubmitting}
            onDelete={() => handleDelete(user)}
            onEdit={() => startEditing(user)}
            onToggleActive={() => handleToggleActive(user)}
            user={user}
          />
        ))}
      </View>
    </ScreenShell>
  );
}

function ManagedUserCard({
  user,
  onEdit,
  onToggleActive,
  onDelete,
  isSubmitting,
}: {
  user: ManagedUser;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
}) {
  return (
    <View style={[styles.userCard, !user.isActive && styles.userCardMuted]}>
      <View style={styles.userHeader}>
        <View style={styles.userCopy}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.companyName ? <Text style={styles.userMeta}>{user.companyName}</Text> : null}
          {user.country ? <Text style={styles.userMeta}>{user.country}</Text> : null}
        </View>
        <View style={[styles.statusPill, user.isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusLabel, user.isActive ? styles.statusLabelActive : styles.statusLabelInactive]}>
            {user.isActive ? 'Active' : 'Disabled'}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <PrimaryButton disabled={isSubmitting} onPress={onEdit} style={styles.userActionButton} variant="secondary">
          Edit
        </PrimaryButton>
        <PrimaryButton
          disabled={isSubmitting}
          onPress={onToggleActive}
          style={styles.userActionButton}
          variant={user.isActive ? 'destructive' : 'primary'}
        >
          {user.isActive ? 'Disable' : 'Enable'}
        </PrimaryButton>
        <PrimaryButton disabled={isSubmitting} onPress={onDelete} style={styles.userActionButton} variant="destructive">
          Remove
        </PrimaryButton>
      </View>
    </View>
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
  formTitle: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  listStack: {
    gap: SPACING.md,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.md,
    padding: SPACING.md,
  },
  userCardMuted: {
    opacity: 0.75,
  },
  userHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  userCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  userName: {
    color: COLORS.white,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
  },
  userEmail: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  userMeta: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  userActionButton: {
    flex: 1,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  statusActive: {
    backgroundColor: 'rgba(39, 174, 96, 0.16)',
    borderColor: 'rgba(39, 174, 96, 0.4)',
    borderWidth: 1,
  },
  statusInactive: {
    backgroundColor: 'rgba(231, 76, 60, 0.16)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
    borderWidth: 1,
  },
  statusLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statusLabelActive: {
    color: COLORS.success,
  },
  statusLabelInactive: {
    color: COLORS.error,
  },
});
