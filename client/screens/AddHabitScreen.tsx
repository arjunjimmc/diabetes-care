import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { addHabit, type Habit } from "@/lib/storage";

const ICONS = [
  { name: "heart", label: "Medicine" },
  { name: "droplet", label: "Water" },
  { name: "coffee", label: "Meal" },
  { name: "activity", label: "Sugar" },
  { name: "zap", label: "Exercise" },
  { name: "moon", label: "Sleep" },
  { name: "sun", label: "Morning" },
  { name: "star", label: "Custom" },
];

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("heart");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a name for your habit.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: name.trim(),
        icon: selectedIcon,
        time: selectedTime,
        enabled: true,
        frequency: "daily",
      };

      await addHabit(newHabit);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save habit. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name Input */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Habit Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.taskPending,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Take morning medicine"
          placeholderTextColor={theme.textSecondary}
          autoFocus
        />
      </View>

      {/* Icon Selection */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Icon
        </ThemedText>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <Pressable
              key={icon.name}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedIcon(icon.name);
              }}
              style={[
                styles.iconButton,
                {
                  backgroundColor:
                    selectedIcon === icon.name
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    selectedIcon === icon.name
                      ? theme.primary
                      : theme.taskPending,
                },
              ]}
            >
              <Feather
                name={icon.name as any}
                size={24}
                color={
                  selectedIcon === icon.name
                    ? theme.backgroundDefault
                    : theme.textSecondary
                }
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.label, { color: theme.text }]}>
          Reminder Time
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeScroll}
          contentContainerStyle={styles.timeScrollContent}
        >
          {TIMES.map((time) => (
            <Pressable
              key={time}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTime(time);
              }}
              style={[
                styles.timeButton,
                {
                  backgroundColor:
                    selectedTime === time
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    selectedTime === time ? theme.primary : theme.taskPending,
                },
              ]}
            >
              <ThemedText
                type="body"
                style={{
                  color:
                    selectedTime === time
                      ? theme.backgroundDefault
                      : theme.text,
                  fontFamily: "Nunito_700Bold",
                }}
              >
                {time}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Add Habit"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timeScroll: {
    marginHorizontal: -Spacing.lg,
  },
  timeScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  timeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
