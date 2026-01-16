import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

// Empty state images
const emptyHabits = require("../../assets/images/empty-states/habits.png");
const emptyRewards = require("../../assets/images/empty-states/rewards.png");

type EmptyStateType = "habits" | "rewards" | "tasks";

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  message: string;
  action?: React.ReactNode;
}

const getImage = (type: EmptyStateType): ImageSourcePropType => {
  switch (type) {
    case "habits":
      return emptyHabits;
    case "rewards":
      return emptyRewards;
    case "tasks":
      return emptyHabits;
    default:
      return emptyHabits;
  }
};

export function EmptyState({ type, title, message, action }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image source={getImage(type)} style={styles.image} resizeMode="contain" />
      <ThemedText type="h3" style={[styles.title, { color: theme.text }]}>
        {title}
      </ThemedText>
      <ThemedText type="body" style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: Spacing.xl,
  },
});
