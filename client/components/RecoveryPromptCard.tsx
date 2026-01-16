import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

interface RecoveryPromptCardProps {
  pendingPoints: number;
  onRecover: () => void;
  onDismiss: () => void;
}

export function RecoveryPromptCard({
  pendingPoints,
  onRecover,
  onDismiss,
}: RecoveryPromptCardProps) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleRecover = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onRecover();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.secondary + "15", borderColor: theme.secondary + "40" },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondary + "30" }]}>
          <Feather name="heart" size={20} color={theme.secondary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="h4" style={{ color: theme.text }}>
            Recover Your Points
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            You have {pendingPoints} points waiting to be recovered
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: theme.secondary }]}
        onPress={handleRecover}
      >
        <Feather name="refresh-cw" size={16} color="#fff" />
        <ThemedText type="h4" style={styles.buttonText}>
          I promise I will follow my routine
        </ThemedText>
      </Pressable>

      <Pressable style={styles.dismissButton} onPress={onDismiss}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Maybe later
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Nunito_700Bold",
  },
  dismissButton: {
    alignItems: "center",
    padding: Spacing.xs,
  },
});
