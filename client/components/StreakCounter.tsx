import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { StreakData } from "@/lib/storage";

const companionHappy = require("../../assets/images/companion/happy.png");

interface StreakCounterProps {
  streaks: StreakData;
}

export function StreakCounter({ streaks }: StreakCounterProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          shadowColor: theme.shadowColor,
          ...Shadows.card,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.streakRow}>
          <View style={styles.iconContainer}>
            <Feather
              name="zap"
              size={28}
              color={streaks.currentStreak > 0 ? theme.accent : theme.textSecondary}
            />
          </View>
          <View>
            <ThemedText type="h2" style={[styles.count, { color: theme.primary }]}>
              {streaks.currentStreak}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              day streak
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText type="h4" style={{ color: theme.text }}>
              {streaks.longestStreak}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              best streak
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.taskPending }]} />
          <View style={styles.stat}>
            <ThemedText type="h4" style={{ color: theme.text }}>
              {streaks.totalCompletedDays}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              total days
            </ThemedText>
          </View>
        </View>
      </View>

      <Image source={companionHappy} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontFamily: "Nunito_700Bold",
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  stat: {
    alignItems: "flex-start",
  },
  divider: {
    width: 1,
    height: 32,
  },
  image: {
    width: 70,
    height: 70,
    marginLeft: Spacing.md,
  },
});
