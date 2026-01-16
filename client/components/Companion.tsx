import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const companionHappy = require("../../assets/images/companion/happy.png");
const companionEncouraging = require("../../assets/images/companion/encouraging.png");
const companionSupportive = require("../../assets/images/companion/supportive.png");

type CompanionMood = "happy" | "encouraging" | "supportive";

interface CompanionProps {
  mood: CompanionMood;
  message: string;
  size?: number;
}

const getMoodImage = (mood: CompanionMood) => {
  switch (mood) {
    case "happy":
      return companionHappy;
    case "encouraging":
      return companionEncouraging;
    case "supportive":
      return companionSupportive;
    default:
      return companionEncouraging;
  }
};

export function Companion({ mood, message, size = Spacing.companionSize }: CompanionProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={getMoodImage(mood)}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.messageContainer}>
        <ThemedText type="body" style={[styles.message, { color: theme.text }]}>
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    borderRadius: BorderRadius.full,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontFamily: "Nunito_400Regular",
  },
});
