import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { Reward } from "@/lib/storage";

// Reward images
const rewardImages = {
  "flower-1": require("../../assets/images/rewards/flower-1.png"),
  "flower-2": require("../../assets/images/rewards/flower-2.png"),
  gem: require("../../assets/images/rewards/gem.png"),
};

interface RewardItemProps {
  reward?: Reward;
  locked?: boolean;
  lockedType?: "flower-1" | "flower-2" | "gem";
  lockedRequirement?: string;
}

const springConfig: WithSpringConfig = {
  damping: 12,
  mass: 0.4,
  stiffness: 180,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RewardItem({
  reward,
  locked = false,
  lockedType,
  lockedRequirement,
}: RewardItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageType = locked ? lockedType : reward?.type;
  const displayName = locked ? lockedRequirement : reward?.name;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          shadowColor: theme.shadowColor,
          ...Shadows.card,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.imageContainer, locked && styles.locked]}>
        {imageType ? (
          <Image
            source={rewardImages[imageType]}
            style={[styles.image, locked && styles.lockedImage]}
            resizeMode="contain"
          />
        ) : null}
        {locked ? (
          <View style={[styles.lockOverlay, { backgroundColor: theme.backgroundRoot }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ?
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText
        type="small"
        style={[
          styles.name,
          { color: locked ? theme.textSecondary : theme.text },
        ]}
        numberOfLines={2}
      >
        {displayName}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Spacing.rewardItemSize + Spacing.xl,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  imageContainer: {
    width: Spacing.rewardItemSize,
    height: Spacing.rewardItemSize,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  locked: {
    opacity: 0.4,
  },
  lockedImage: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
});
