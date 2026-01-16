import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PointsDisplayProps {
  totalPoints: number;
  earnedToday: number;
  lostToday: number;
  pendingRecovery: number;
}

export function PointsDisplay({
  totalPoints,
  earnedToday,
  lostToday,
  pendingRecovery,
}: PointsDisplayProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.mainPoints}>
        <Feather name="star" size={24} color={theme.secondary} />
        <ThemedText type="h2" style={[styles.pointsValue, { color: theme.text }]}>
          {totalPoints}
        </ThemedText>
        <ThemedText type="body" style={[styles.pointsLabel, { color: theme.textSecondary }]}>
          Total Points
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        {earnedToday > 0 ? (
          <View style={[styles.statBadge, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="trending-up" size={14} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary }}>
              +{earnedToday} today
            </ThemedText>
          </View>
        ) : null}

        {lostToday > 0 ? (
          <View style={[styles.statBadge, { backgroundColor: theme.error + "20" }]}>
            <Feather name="trending-down" size={14} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error }}>
              -{lostToday} today
            </ThemedText>
          </View>
        ) : null}

        {pendingRecovery > 0 ? (
          <View style={[styles.statBadge, { backgroundColor: theme.secondary + "20" }]}>
            <Feather name="rotate-ccw" size={14} color={theme.secondary} />
            <ThemedText type="small" style={{ color: theme.secondary }}>
              {pendingRecovery} recoverable
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  mainPoints: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  pointsValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 42,
    lineHeight: 50,
  },
  pointsLabel: {
    fontFamily: "Nunito_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
