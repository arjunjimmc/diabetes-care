import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  completedCount: number;
  totalCount: number;
}

export function ProgressRing({
  progress,
  size = Spacing.progressRingSize,
  strokeWidth = 10,
  completedCount,
  totalCount,
}: ProgressRingProps) {
  const { theme } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const strokeDashoffset = circumference * (1 - progress);

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.taskPending}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <ThemedText type="h2" style={[styles.percentage, { color: theme.primary }]}>
          {percentage}%
        </ThemedText>
        <ThemedText type="small" style={[styles.count, { color: theme.textSecondary }]}>
          {completedCount}/{totalCount} done
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontFamily: "Nunito_700Bold",
  },
  count: {
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },
});
