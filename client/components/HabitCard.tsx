import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { Habit } from "@/lib/storage";

interface HabitCardProps {
  habit: Habit;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onPress: (habit: Habit) => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitCard({ habit, onToggleEnabled, onPress }: HabitCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handleToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleEnabled(habit.id, value);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(habit)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          shadowColor: theme.shadowColor,
          ...Shadows.card,
        },
        animatedStyle,
      ]}
      testID={`habit-card-${habit.id}`}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather
          name={habit.icon as any}
          size={22}
          color={habit.enabled ? theme.primary : theme.textSecondary}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText
          type="h4"
          style={[
            styles.name,
            { color: habit.enabled ? theme.text : theme.textSecondary },
          ]}
        >
          {habit.name}
        </ThemedText>
        <ThemedText type="small" style={[styles.time, { color: theme.textSecondary }]}>
          {habit.time} • {habit.frequency}
        </ThemedText>
      </View>

      {/* Toggle */}
      <Switch
        value={habit.enabled}
        onValueChange={handleToggle}
        trackColor={{ false: theme.taskPending, true: theme.primary }}
        thumbColor={theme.backgroundDefault}
        ios_backgroundColor={theme.taskPending}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: "Nunito_700Bold",
  },
  time: {
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },
});
