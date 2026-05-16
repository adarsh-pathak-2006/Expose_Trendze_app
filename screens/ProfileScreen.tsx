import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { APP_VERSION, SUPPORT_EMAIL } from '../constants/app';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export function ProfileScreen() {
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);

  async function contactSupport() {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Expose%20Trendze%20Support`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Mail app unavailable', `Please contact ${SUPPORT_EMAIL} manually.`);
      return;
    }

    await Linking.openURL(url);
  }

  const initials = profile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScreenShell>
      <SectionTitle title="Profile" subtitle="Your account details are managed by the ET team." />

      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials ?? 'ET'}</Text>
        </View>
        <Text style={styles.name}>{profile?.fullName ?? 'Customer'}</Text>
        <Text style={styles.email}>{profile?.email ?? 'No email found'}</Text>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="Phone" value={profile?.phone ?? 'Not provided'} />
        <InfoRow label="Company" value={profile?.companyName ?? 'Not provided'} />
        <InfoRow label="Country" value={profile?.country ?? 'Not provided'} />
        <InfoRow label="App Version" value={APP_VERSION} />
      </View>

      <PrimaryButton onPress={contactSupport} variant="secondary">
        Contact Support
      </PrimaryButton>
      <PrimaryButton onPress={logout} variant="destructive">
        Logout
      </PrimaryButton>
    </ScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 24,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 24,
    textTransform: 'uppercase',
  },
  email: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  infoRow: {
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
});
