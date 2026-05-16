import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants/theme';
import type { OrderStage } from '../types/order';
import { alpha, formatDateTime } from '../utils/format';

type Props = {
  stage: OrderStage;
  isCurrent: boolean;
  isFuture: boolean;
  isLast: boolean;
};

export function TimelineStageRow({ stage, isCurrent, isFuture, isLast }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCurrent || isFuture) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isCurrent, isFuture, pulse]);

  const circleColor = isFuture ? COLORS.textSecondary : isCurrent ? COLORS.accent : COLORS.accent;
  const lineColor = isFuture ? alpha(COLORS.textSecondary, 0.5) : COLORS.accent;

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: isFuture ? 'transparent' : circleColor,
              borderColor: circleColor,
              transform: [{ scale: pulse }],
              shadowOpacity: isCurrent ? 0.45 : 0,
            },
          ]}
        >
          {!isFuture ? <MaterialCommunityIcons color={COLORS.primary} name="check" size={12} /> : null}
        </Animated.View>
        {!isLast ? (
          <View
            style={[
              styles.line,
              {
                backgroundColor: isFuture ? 'transparent' : lineColor,
                borderStyle: isFuture ? 'dashed' : 'solid',
                borderColor: lineColor,
                borderWidth: isFuture ? 1 : 0,
              },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.content}>
        <Text style={[styles.stageTitle, isFuture && styles.futureText]}>{stage.stageName}</Text>
        <Text style={styles.timestamp}>
          {stage.isCompleted ? formatDateTime(stage.completedAt) : isCurrent ? 'Current live stage' : 'Pending'}
        </Text>
        {stage.stageNote ? <Text style={styles.note}>{stage.stageNote}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rail: {
    alignItems: 'center',
    width: 24,
  },
  circle: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowRadius: 12,
    width: 20,
  },
  line: {
    flex: 1,
    marginTop: 4,
    minHeight: 44,
    width: 2,
  },
  content: {
    flex: 1,
    gap: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  stageTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
  },
  futureText: {
    color: COLORS.textSecondary,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  note: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
