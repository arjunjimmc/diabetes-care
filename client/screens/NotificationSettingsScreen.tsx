import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Linking, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  getNotificationSettings,
  setNotificationSettings,
  getUserProfile,
  setUserProfile,
  type NotificationSettings,
} from "@/lib/storage";

const RINGTONES = [
  { id: "default", name: "Default", icon: "bell" },
  { id: "gentle", name: "Gentle Chime", icon: "music" },
  { id: "alert", name: "Health Alert", icon: "alert-circle" },
  { id: "reminder", name: "Soft Reminder", icon: "volume-2" },
  { id: "melody", name: "Calm Melody", icon: "headphones" },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const notifSettings = await getNotificationSettings();
      setSettings(notifSettings);
      
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === "granted");
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const requestNotificationPermission = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === "denied") {
      Alert.alert(
        "Permission Required",
        "To receive reminders, please enable notifications in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS !== "web") {
                try {
                  Linking.openSettings();
                } catch (e) {
                  console.error("Failed to open settings:", e);
                }
              }
            },
          },
        ]
      );
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === "granted");

    if (status === "granted") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Notifications enabled! You will now receive task reminders.");
      
      const profile = await getUserProfile();
      await setUserProfile({ ...profile, notificationsEnabled: true });
    }
  };

  const handleSelectRingtone = async (ringtoneId: string) => {
    if (!settings) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSettings = { ...settings, soundName: ringtoneId };
    setSettings(newSettings);
    await setNotificationSettings(newSettings);
  };

  const handleToggleVibration = async () => {
    if (!settings) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSettings = { ...settings, vibrate: !settings.vibrate };
    setSettings(newSettings);
    await setNotificationSettings(newSettings);
  };

  if (loading || !settings) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContent} />
      </View>
    );
  }

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
    >
      {/* Permission Section */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Permission
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          {hasPermission ? (
            <View style={styles.permissionGranted}>
              <View style={[styles.permissionIcon, { backgroundColor: theme.primary + "20" }]}>
                <Feather name="check-circle" size={24} color={theme.primary} />
              </View>
              <View style={styles.permissionContent}>
                <ThemedText type="body" style={{ color: theme.text, fontFamily: "Nunito_700Bold" }}>
                  Notifications Enabled
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  You will receive task reminders at scheduled times
                </ThemedText>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.permissionRequest}
              onPress={requestNotificationPermission}
            >
              <View style={[styles.permissionIcon, { backgroundColor: theme.accent + "20" }]}>
                <Feather name="bell-off" size={24} color={theme.accent} />
              </View>
              <View style={styles.permissionContent}>
                <ThemedText type="body" style={{ color: theme.text, fontFamily: "Nunito_700Bold" }}>
                  Enable Notifications
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Tap to allow task reminders with sound
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Background Running Info */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Background Running
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          <Pressable
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(
                "Battery Optimization",
                "To ensure reminders work properly:\n\n1. Go to Settings > Apps > Diabetes Care\n2. Select 'Battery'\n3. Choose 'Unrestricted' or disable battery optimization\n\nThis helps the app send reminders even when not in use.",
                [
                  { text: "OK" },
                  Platform.OS !== "web" ? {
                    text: "Open Settings",
                    onPress: () => {
                      try {
                        Linking.openSettings();
                      } catch (e) {
                        console.error("Failed to open settings:", e);
                      }
                    },
                  } : { text: "" },
                ].filter(btn => btn.text)
              );
            }}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="battery-charging" size={18} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={{ color: theme.text }}>
                Battery Optimization
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Tap for instructions to keep app running
              </ThemedText>
            </View>
            <Feather name="info" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Ringtone Selection */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Reminder Sound
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          {RINGTONES.map((ringtone, index) => (
            <React.Fragment key={ringtone.id}>
              <Pressable
                style={styles.ringtoneRow}
                onPress={() => handleSelectRingtone(ringtone.id)}
              >
                <View style={[styles.settingIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name={ringtone.icon as any} size={18} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <ThemedText type="body" style={{ color: theme.text }}>
                    {ringtone.name}
                  </ThemedText>
                </View>
                {settings.soundName === ringtone.id ? (
                  <View style={[styles.selectedMark, { backgroundColor: theme.primary }]}>
                    <Feather name="check" size={16} color="#fff" />
                  </View>
                ) : (
                  <View style={[styles.unselectedMark, { borderColor: theme.taskPending }]} />
                )}
              </Pressable>
              {index < RINGTONES.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: theme.backgroundSecondary }]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Vibration Toggle */}
      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Vibration
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault, ...Shadows.card }]}>
          <Pressable style={styles.settingRow} onPress={handleToggleVibration}>
            <View style={[styles.settingIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="smartphone" size={18} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <ThemedText type="body" style={{ color: theme.text }}>
                Vibrate on Reminder
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {settings.vibrate ? "Enabled" : "Disabled"}
              </ThemedText>
            </View>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: settings.vibrate ? theme.primary : theme.taskPending,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    backgroundColor: "#fff",
                    transform: [{ translateX: settings.vibrate ? 20 : 0 }],
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Info Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.primary + "15" }]}>
        <Feather name="info" size={20} color={theme.primary} />
        <ThemedText type="small" style={{ color: theme.text, flex: 1 }}>
          Reminders will sound at the scheduled time for each task. Make sure to keep the app installed for best results.
        </ThemedText>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    width: 40,
    height: 40,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
  },
  card: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  permissionGranted: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  permissionRequest: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionContent: {
    flex: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  ringtoneRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  selectedMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
