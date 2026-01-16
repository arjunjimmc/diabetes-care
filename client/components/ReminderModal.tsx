import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ReminderModalProps {
  visible: boolean;
  taskName: string;
  taskIcon: string;
  isSnoozed: boolean;
  isExpired: boolean;
  onDoNow: () => void;
  onSnooze: () => void;
  onCompleted: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function ReminderModal({
  visible,
  taskName,
  taskIcon,
  isSnoozed,
  isExpired,
  onDoNow,
  onSnooze,
  onCompleted,
  onSkip,
  onClose,
}: ReminderModalProps) {
  const { theme } = useTheme();

  const handleDoNow = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDoNow();
  };

  const handleSnooze = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSnooze();
  };

  const handleCompleted = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCompleted();
  };

  const handleSkip = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onSkip();
  };

  const renderInitialOptions = () => (
    <>
      <ThemedText type="h3" style={[styles.title, { color: theme.text }]}>
        Time for your reminder
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Ready to take care of yourself?
      </ThemedText>

      <Pressable
        style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
        onPress={handleDoNow}
      >
        <Feather name="check-circle" size={20} color="#fff" />
        <ThemedText type="h4" style={styles.buttonText}>
          Yes, I am going to do now
        </ThemedText>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton, { borderColor: theme.secondary }]}
        onPress={handleSnooze}
      >
        <Feather name="clock" size={20} color={theme.secondary} />
        <ThemedText type="h4" style={[styles.buttonTextSecondary, { color: theme.secondary }]}>
          Remind me in 5 minutes
        </ThemedText>
      </Pressable>
    </>
  );

  const renderCompletionOptions = () => (
    <>
      <ThemedText type="h3" style={[styles.title, { color: theme.text }]}>
        Have you done this?
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Your health journey matters!
      </ThemedText>

      <Pressable
        style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
        onPress={handleCompleted}
      >
        <Feather name="award" size={20} color="#fff" />
        <ThemedText type="h4" style={styles.buttonText}>
          Yes, I completed it! (+10)
        </ThemedText>
      </Pressable>

      <Pressable
        style={[styles.button, styles.dangerButton, { borderColor: theme.error }]}
        onPress={handleSkip}
      >
        <Feather name="x-circle" size={20} color={theme.error} />
        <ThemedText type="h4" style={[styles.buttonTextSecondary, { color: theme.error }]}>
          No, I will try my best tomorrow (-5)
        </ThemedText>
      </Pressable>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
            <Feather name={taskIcon as any} size={32} color={theme.primary} />
          </View>

          <ThemedText type="h4" style={[styles.taskName, { color: theme.primary }]}>
            {taskName}
          </ThemedText>

          {isSnoozed && isExpired ? renderCompletionOptions() : renderInitialOptions()}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Close
            </ThemedText>
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  taskName: {
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  title: {
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: "100%",
  },
  primaryButton: {
    marginTop: Spacing.sm,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  dangerButton: {
    borderWidth: 2,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
  },
  buttonTextSecondary: {
    fontFamily: "Nunito_700Bold",
  },
  closeButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
});
