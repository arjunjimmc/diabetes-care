import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  WithSpringConfig,
  cancelAnimation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface TaskCardProps {
  id: string;
  name: string;
  icon: string;
  time: string;
  isCompleted: boolean;
  isSnoozed?: boolean;
  isExpired?: boolean;
  onPress: (id: string) => void;
}

const springConfig: WithSpringConfig = {
  damping: 12,
  mass: 0.5,
  stiffness: 200,
  overshootClamping: false,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({
  id,
  name,
  icon,
  time,
  isCompleted,
  isSnoozed = false,
  isExpired = false,
  onPress,
}: TaskCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, springConfig);
  }, [isCompleted]);

  useEffect(() => {
    if (isSnoozed && isExpired && !isCompleted) {
      blinkOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(blinkOpacity);
      blinkOpacity.value = 1;
    }
  }, [isSnoozed, isExpired, isCompleted]);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.95, { ...springConfig, damping: 8 }),
      withSpring(1, springConfig)
    );
    onPress(id);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const showUrgentIndicator = isSnoozed && isExpired && !isCompleted;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          shadowColor: theme.shadowColor,
          ...Shadows.card,
          borderWidth: showUrgentIndicator ? 2 : 0,
          borderColor: showUrgentIndicator ? theme.error : "transparent",
        },
        cardAnimatedStyle,
      ]}
      testID={`task-card-${id}`}
    >
      {showUrgentIndicator ? (
        <Animated.View style={[styles.urgentBadge, { backgroundColor: theme.error }, blinkStyle]}>
          <Feather name="alert-circle" size={12} color="#fff" />
        </Animated.View>
      ) : null}

      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: isCompleted ? theme.taskComplete : "transparent",
            borderColor: isCompleted ? theme.taskComplete : theme.taskPending,
          },
        ]}
      >
        <Animated.View style={checkAnimatedStyle}>
          <Feather name="check" size={20} color={theme.backgroundDefault} />
        </Animated.View>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Feather
            name={icon as any}
            size={18}
            color={isCompleted ? theme.textSecondary : theme.primary}
            style={styles.icon}
          />
          <ThemedText
            type="h4"
            style={[
              styles.name,
              {
                color: isCompleted ? theme.textSecondary : theme.text,
                textDecorationLine: isCompleted ? "line-through" : "none",
              },
            ]}
          >
            {name}
          </ThemedText>
        </View>
        <View style={styles.timeRow}>
          <ThemedText type="small" style={[styles.time, { color: theme.textSecondary }]}>
            {time}
          </ThemedText>
          {isSnoozed && !isCompleted ? (
            <View style={[styles.snoozeBadge, { backgroundColor: isExpired ? theme.error + "20" : theme.secondary + "20" }]}>
              <Feather name="clock" size={10} color={isExpired ? theme.error : theme.secondary} />
              <ThemedText
                type="small"
                style={{ color: isExpired ? theme.error : theme.secondary, fontSize: 10 }}
              >
                {isExpired ? "Overdue" : "Snoozed"}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {!isCompleted ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
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
    position: "relative",
    overflow: "visible",
  },
  urgentBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  checkbox: {
    width: Spacing.checkboxSize,
    height: Spacing.checkboxSize,
    borderRadius: BorderRadius.full,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: Spacing.sm,
  },
  name: {
    fontFamily: "Nunito_700Bold",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  time: {
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
    marginLeft: Spacing.sm + 18,
  },
  snoozeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
});
