import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const companionSupportive = require("../../assets/images/companion/supportive.png");

interface RecoveryCardProps {
  missedCount: number;
  onMakeUp: () => void;
  onSkipWithGrace: () => void;
}

export function RecoveryCard({ missedCount, onMakeUp, onSkipWithGrace }: RecoveryCardProps) {
  const { theme } = useTheme();

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkipWithGrace();
  };

  const handleMakeUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMakeUp();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.accent + "15",
          borderColor: theme.accent + "40",
        },
      ]}
    >
      <View style={styles.header}>
        <Image source={companionSupportive} style={styles.companion} resizeMode="contain" />
        <View style={styles.headerText}>
          <ThemedText type="h4" style={{ color: theme.text }}>
            Missed yesterday?
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {missedCount} task{missedCount !== 1 ? "s" : ""} weren't completed - that's okay!
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" style={[styles.message, { color: theme.textSecondary }]}>
        Every day is a fresh start. You can make them up now, or skip with grace and focus on today.
      </ThemedText>

      <View style={styles.buttons}>
        <Pressable
          onPress={handleSkip}
          style={[styles.button, styles.skipButton, { borderColor: theme.accent }]}
        >
          <Feather name="heart" size={16} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            Skip with grace
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleMakeUp}
          style={[styles.button, styles.makeUpButton, { backgroundColor: theme.accent }]}
        >
          <Feather name="refresh-cw" size={16} color={theme.backgroundDefault} />
          <ThemedText type="body" style={{ color: theme.backgroundDefault }}>
            Make up now
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  companion: {
    width: 50,
    height: 50,
  },
  headerText: {
    flex: 1,
  },
  message: {
    marginBottom: Spacing.lg,
    fontFamily: "Nunito_400Regular",
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  skipButton: {
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  makeUpButton: {},
});
