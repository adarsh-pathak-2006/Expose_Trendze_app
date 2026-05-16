import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../constants/theme';
import { AnimatedEntrance } from './AnimatedEntrance';

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
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? SPACING.md : SPACING.lg;
  const constrainedWidth = Math.min(width - horizontalPadding * 2, 960);

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: horizontalPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl tintColor={COLORS.accent} refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
    >
      <AnimatedEntrance delay={30} distance={10} duration={420} style={{ alignSelf: 'center', maxWidth: constrainedWidth }}>
        {children}
      </AnimatedEntrance>
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, { paddingHorizontal: horizontalPadding }]}>
      <AnimatedEntrance delay={30} distance={10} duration={420} style={{ alignSelf: 'center', maxWidth: constrainedWidth }}>
        {children}
      </AnimatedEntrance>
    </View>
  );

  return (
    <LinearGradient colors={['#FFF8F8', COLORS.primary, '#F8F8F8']} style={styles.gradient}>
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
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
    gap: SPACING.lg,
    width: '100%',
  },
  staticContent: {
    flex: 1,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
    width: '100%',
  },
});
