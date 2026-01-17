import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Pressable, Alert, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";

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

const QUICK_TIMES = [
  { label: "Morning", time: "07:00" },
  { label: "Noon", time: "12:00" },
  { label: "Evening", time: "18:00" },
  { label: "Night", time: "21:00" },
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (date) {
      setPickerDate(date);
      setSelectedTime(formatTime(date));
    }
  };

  const confirmTime = () => {
    setSelectedTime(formatTime(pickerDate));
    setShowTimePicker(false);
  };

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
        
        {/* Selected Time Display */}
        <Pressable
          style={[
            styles.timeDisplay,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowTimePicker(true);
          }}
        >
          <Feather name="clock" size={24} color={theme.primary} />
          <ThemedText type="h2" style={{ color: theme.primary, fontFamily: "Nunito_700Bold" }}>
            {selectedTime}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Tap to change
          </ThemedText>
        </Pressable>

        {/* Quick Time Options */}
        <View style={styles.quickTimeRow}>
          {QUICK_TIMES.map((qt) => (
            <Pressable
              key={qt.time}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTime(qt.time);
                const [h, m] = qt.time.split(":").map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                setPickerDate(d);
              }}
              style={[
                styles.quickTimeButton,
                {
                  backgroundColor:
                    selectedTime === qt.time
                      ? theme.primary
                      : theme.backgroundDefault,
                  borderColor:
                    selectedTime === qt.time ? theme.primary : theme.taskPending,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color:
                    selectedTime === qt.time
                      ? theme.backgroundDefault
                      : theme.text,
                  fontFamily: "Nunito_700Bold",
                }}
              >
                {qt.label}
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  color:
                    selectedTime === qt.time
                      ? theme.backgroundDefault
                      : theme.textSecondary,
                }}
              >
                {qt.time}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Time Picker Modal for iOS */}
      {Platform.OS === "ios" && showTimePicker ? (
        <Modal transparent animationType="slide" visible={showTimePicker}>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setShowTimePicker(false)}>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    Cancel
                  </ThemedText>
                </Pressable>
                <ThemedText type="h4" style={{ color: theme.text }}>
                  Select Time
                </ThemedText>
                <Pressable onPress={confirmTime}>
                  <ThemedText type="body" style={{ color: theme.primary, fontFamily: "Nunito_700Bold" }}>
                    Done
                  </ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Time Picker for Android */}
      {Platform.OS === "android" && showTimePicker ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      ) : null}

      {/* Time Picker Modal for Web */}
      {Platform.OS === "web" && showTimePicker ? (
        <Modal transparent animationType="fade" visible={showTimePicker}>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setShowTimePicker(false)}>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    Cancel
                  </ThemedText>
                </Pressable>
                <ThemedText type="h4" style={{ color: theme.text }}>
                  Select Time
                </ThemedText>
                <Pressable onPress={confirmTime}>
                  <ThemedText type="body" style={{ color: theme.primary, fontFamily: "Nunito_700Bold" }}>
                    Done
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.webTimePickerContainer}>
                <View style={styles.webTimeInputRow}>
                  <View style={styles.webTimeColumn}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                      Hour
                    </ThemedText>
                    <View style={[styles.webTimeInputWrapper, { borderColor: theme.primary }]}>
                      <TextInput
                        style={[styles.webTimeInput, { color: theme.text }]}
                        value={pickerDate.getHours().toString().padStart(2, "0")}
                        onChangeText={(text) => {
                          const h = parseInt(text, 10);
                          if (!isNaN(h) && h >= 0 && h <= 23) {
                            const d = new Date(pickerDate);
                            d.setHours(h);
                            setPickerDate(d);
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>
                  <ThemedText type="h2" style={{ color: theme.text, marginHorizontal: Spacing.md }}>
                    :
                  </ThemedText>
                  <View style={styles.webTimeColumn}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                      Minute
                    </ThemedText>
                    <View style={[styles.webTimeInputWrapper, { borderColor: theme.primary }]}>
                      <TextInput
                        style={[styles.webTimeInput, { color: theme.text }]}
                        value={pickerDate.getMinutes().toString().padStart(2, "0")}
                        onChangeText={(text) => {
                          const m = parseInt(text, 10);
                          if (!isNaN(m) && m >= 0 && m <= 59) {
                            const d = new Date(pickerDate);
                            d.setMinutes(m);
                            setPickerDate(d);
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.webQuickMinutes}>
                  {[0, 15, 30, 45].map((min) => (
                    <Pressable
                      key={min}
                      style={[
                        styles.webQuickMinuteButton,
                        {
                          backgroundColor:
                            pickerDate.getMinutes() === min ? theme.primary : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => {
                        const d = new Date(pickerDate);
                        d.setMinutes(min);
                        setPickerDate(d);
                      }}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color: pickerDate.getMinutes() === min ? "#fff" : theme.text,
                          fontFamily: "Nunito_700Bold",
                        }}
                      >
                        :{min.toString().padStart(2, "0")}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

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
  timeDisplay: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  quickTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickTimeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  picker: {
    height: 200,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  webTimePickerContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  webTimeInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: Spacing.xl,
  },
  webTimeColumn: {
    alignItems: "center",
  },
  webTimeInputWrapper: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    width: 80,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  webTimeInput: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  webQuickMinutes: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  webQuickMinuteButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
