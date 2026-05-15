import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../constants/theme';

type Props = PropsWithChildren<{
  header?: ReactNode;
  scrollable?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}>;

export function ScreenShell({
  children,
  header,
  scrollable = true,
  onRefresh,
  refreshing = false,
}: Props) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl tintColor={COLORS.accent} refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.staticContent}>{children}</View>
  );

  return (
    <LinearGradient colors={[COLORS.primary, '#11111D', COLORS.primary]} style={styles.gradient}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {header}
        {content}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});
