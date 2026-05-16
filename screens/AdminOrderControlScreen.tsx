import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionTitle } from '../components/SectionTitle';
import { StatusBadge } from '../components/StatusBadge';
import { ORDER_STAGES } from '../constants/app';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { useOrdersStore } from '../store/ordersStore';
import type { RootStackParamList } from '../types/navigation';
import { formatDateTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminOrderControl'>;

export function AdminOrderControlScreen({ route }: Props) {
  const { width } = useWindowDimensions();
  const fetchAll = useOrdersStore((state) => state.fetchAll);
  const isLoading = useOrdersStore((state) => state.isLoading);
  const isUpdating = useOrdersStore((state) => state.isUpdating);
  const getOrderById = useOrdersStore((state) => state.getOrderById);
  const updateStage = useOrdersStore((state) => state.updateStage);

  const order = useOrdersStore((state) => state.getOrderById(route.params.orderId));
  const [stageNote, setStageNote] = useState('');
  const compact = width < 420;

  useEffect(() => {
    if (!order) {
      fetchAll();
    }
  }, [fetchAll, order]);

  if (!order) {
    return (
      <ScreenShell>
        <Text style={styles.placeholder}>Loading order...</Text>
      </ScreenShell>
    );
  }

  const currentOrder = order;

  async function handleStageSelect(stageNumber: number) {
    try {
      await updateStage(currentOrder.id, stageNumber, stageNote.trim() || undefined);
      const updatedOrder = getOrderById(currentOrder.id);
      setStageNote('');
      Alert.alert(
        'Stage updated',
        `${updatedOrder?.orderNumber ?? currentOrder.orderNumber} is now set to ${ORDER_STAGES[stageNumber - 1]}.`,
      );
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <ScreenShell onRefresh={fetchAll} refreshing={isLoading}>
      <SectionTitle title="Admin Order Control" subtitle="This screen controls what the customer sees in live tracking." />

      <View style={styles.heroCard}>
        <Text style={styles.orderCode}>{currentOrder.orderNumber}</Text>
        <StatusBadge label={currentOrder.status} />
        <Text style={styles.meta}>Last updated {formatDateTime(currentOrder.updatedAt ?? currentOrder.placedAt)}</Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.label}>Admin note for the selected stage</Text>
        <TextInput
          multiline
          onChangeText={setStageNote}
          placeholder="Optional note shown on the customer timeline"
          placeholderTextColor={COLORS.textSecondary}
          style={styles.textArea}
          value={stageNote}
        />
      </View>

      <View style={styles.stageStack}>
        {ORDER_STAGES.map((stage, index) => {
          const stageNumber = index + 1;
          const active = currentOrder.stages.some((item) => item.stageNumber === stageNumber && item.isCompleted);

          return (
            <Pressable
              disabled={isUpdating}
              key={stage}
              onPress={() => handleStageSelect(stageNumber)}
              style={[styles.stageRow, active && styles.stageRowActive, compact && styles.stageRowCompact]}
            >
              <View style={styles.stageNumber}>
                <Text style={[styles.stageNumberText, active && styles.stageNumberTextActive]}>{stageNumber}</Text>
              </View>
              <View style={styles.stageCopy}>
                <Text style={[styles.stageTitle, active && styles.stageTitleActive]}>{stage}</Text>
                <Text style={styles.stageHint}>
                  {isUpdating ? 'Updating...' : 'Tap to make this the visible customer stage'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 14,
    marginTop: SPACING.xl,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  orderCode: {
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    fontSize: 16,
  },
  meta: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  textArea: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 14,
    minHeight: 92,
    textAlignVertical: 'top',
  },
  stageStack: {
    gap: SPACING.sm,
  },
  stageRow: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  stageRowCompact: {
    alignItems: 'flex-start',
  },
  stageRowActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(195, 0, 47, 0.08)',
  },
  stageNumber: {
    alignItems: 'center',
    borderColor: COLORS.textSecondary,
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stageNumberText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
  },
  stageNumberTextActive: {
    color: COLORS.accent,
  },
  stageCopy: {
    flex: 1,
    gap: SPACING.xs,
  },
  stageTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
  stageTitleActive: {
    color: COLORS.accent,
  },
  stageHint: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
});
